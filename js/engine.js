/* =========================================================
 *  engine.js — 순수 상태머신
 *  ---------------------------------------------------------
 *  게임 로직은 전부 "데이터 + 순수 함수"로만 구성한다.
 *  이유: 멀티플레이에서 같은 state에 같은 선택을 적용하면
 *        모든 클라이언트가 반드시 같은 결과에 도달해야 한다.
 *        (전송해야 하는 것은 선택 id 하나뿐)
 * ========================================================= */
(function (global) {
  'use strict';

  var Engine = {};

  /* 직업 정의 -------------------------------------------------- */
  Engine.JOBS = {
    police: { key: 'police', icon: '👮', job: '경찰', name: '이도현', color: '#4a7cff',
              tag: '사건 수사와 범인 추적', start: 'police_1' },
    fire:   { key: 'fire',   icon: '🚒', job: '소방관', name: '강민재', color: '#ff6a3d',
              tag: '화재 · 구조 · 재난', start: 'fire_1' },
    army:   { key: 'army',   icon: '🪖', job: '군인', name: '윤태오', color: '#6f9a5a',
              tag: '훈련 · 임무 · 동료', start: 'army_1' },
    doctor: { key: 'doctor', icon: '🩺', job: '의사', name: '서하은', color: '#39b8a6',
              tag: '환자 · 응급 · 의료 판단', start: 'doctor_1' }
  };
  Engine.JOB_ORDER = ['police', 'fire', 'army', 'doctor'];

  Engine.STATS = [
    { key: 'bond',   label: '유대', icon: '🤝', desc: '친구들과 이어져 있는 정도' },
    { key: 'faith',  label: '신념', icon: '🔥', desc: '스스로 믿는 바를 지킨 정도' },
    { key: 'scar',   label: '상처', icon: '🩹', desc: '마음에 남은 흉터' },
    { key: 'memory', label: '기억', icon: '🧩', desc: '그해 여름에 대해 되찾은 조각' }
  ];

  /* 모든 루트는 같은 프롤로그(그해 여름)에서 출발한다 */
  Engine.PROLOGUE = 'pro_1';

  /* 상태 생성 -------------------------------------------------- */
  Engine.newState = function (routeKey, seatName, gender) {
    var job = Engine.JOBS[routeKey];
    if (!job) throw new Error('unknown route: ' + routeKey);
    return {
      v: 1,
      route: routeKey,
      seat: seatName || job.name,   // 멀티에서 이 좌석을 쥔 사람의 표시 이름
      gender: gender === 'f' ? 'f' : 'm',   // 초상화에만 쓴다
      scene: Engine.PROLOGUE,
      stats: { bond: 0, faith: 0, scar: 0, memory: 0 },
      flags: {},                    // 내 루트 안에서만 쓰는 플래그
      docs: [],                     // 손에 넣은 문서 id (보관함)
      world: {},                    // 네 사람이 공유하는 세계 플래그(멀티 동기화 대상)
      history: [Engine.PROLOGUE],   // 지나온 씬 id
      picked: [],                   // 고른 선택 id (리플레이 / 결산용)
      ending: null,
      done: false
    };
  };

  Engine.clone = function (state) {
    return JSON.parse(JSON.stringify(state));
  };

  /* 씬 조회 ---------------------------------------------------- */
  Engine.scene = function (state) {
    var sc = global.Story.scenes[state.scene];
    if (!sc) throw new Error('unknown scene: ' + state.scene);
    return sc;
  };

  /* 조건 판정 -------------------------------------------------- */
  // req: { flag:'x' } | { not:'x' } | { world:'y' } | { noworld:'y' }
  //      | { stat:'bond', min:3 } | { stat:'scar', max:2 } | { route:'police' }
  //      | { any:[req,...] } | { all:[req,...] }
  function test(state, req) {
    if (!req) return true;
    if (req.any) return req.any.some(function (r) { return test(state, r); });
    if (req.all) return req.all.every(function (r) { return test(state, r); });
    if (req.flag && !state.flags[req.flag]) return false;
    if (req.not && state.flags[req.not]) return false;
    if (req.world && !state.world[req.world]) return false;
    if (req.noworld && state.world[req.noworld]) return false;
    if (req.route && state.route !== req.route) return false;
    if (req.doc && (state.docs || []).indexOf(req.doc) < 0) return false;
    if (req.seenIn) {                       // 이 방에서 몇 개를 살펴봤는가
      var n = Engine.seenCount(state, req.seenIn);
      if (req.min != null && n < req.min) return false;
      if (req.max != null && n > req.max) return false;
    }
    if (req.stat) {
      var v = state.stats[req.stat] || 0;
      if (req.min != null && v < req.min) return false;
      if (req.max != null && v > req.max) return false;
    }
    return true;
  }
  Engine.test = test;

  /* 탐색 씬에서 이미 살펴본 지점 -------------------------------- */
  Engine.seenKey = function (sceneId, spotId) { return 'seen_' + sceneId + '_' + spotId; };
  Engine.seenCount = function (state, sceneId) {
    var pre = 'seen_' + sceneId + '_', n = 0;
    Object.keys(state.flags).forEach(function (k) {
      if (k.indexOf(pre) === 0 && state.flags[k]) n++;
    });
    return n;
  };

  /* 탐색 씬의 지점을 선택지로 바꾼다.
     — 이렇게 해두면 "방을 둘러보는 것"도 결국 똑같은 상태 전이라서
       저장·되감기·멀티 동기화가 전부 공짜로 따라온다. */
  function spotChoice(sc, h) {
    var set = {};
    set[Engine.seenKey(sc.id, h.id)] = true;
    if (h.set) Object.keys(h.set).forEach(function (k) { set[k] = h.set[k]; });
    return {
      id: sc.id + '#' + h.id,
      t: h.label,
      spot: h,
      to: h.to || sc.id,          // 기본은 제자리 — 방에 머문다
      add: h.add, set: set, world: h.world, doc: h.doc, req: h.req
    };
  }

  /* 지금 고를 수 있는 선택지 ------------------------------------ */
  Engine.choices = function (state) {
    var sc = Engine.scene(state);
    var out = [];

    if (sc.type === 'look') {
      (sc.hotspots || []).forEach(function (h) {
        if (state.flags[Engine.seenKey(sc.id, h.id)]) return;   // 이미 본 것
        var c = spotChoice(sc, h);
        if (test(state, c.req)) out.push({ id: c.id, index: -1, data: c, spot: h });
      });
    }

    (sc.choices || []).forEach(function (c, i) {
      if (test(state, c.req)) out.push({ id: c.id || (sc.id + ':' + i), index: i, data: c });
    });
    return out;
  };

  /* 효과 적용 -------------------------------------------------- */
  function applyEffects(state, e) {
    if (!e) return;
    if (e.add) {
      Object.keys(e.add).forEach(function (k) {
        state.stats[k] = (state.stats[k] || 0) + e.add[k];
        if (state.stats[k] < 0) state.stats[k] = 0;
      });
    }
    if (e.set) {
      Object.keys(e.set).forEach(function (k) { state.flags[k] = e.set[k]; });
    }
    if (e.world) {
      (Array.isArray(e.world) ? e.world : [e.world]).forEach(function (k) {
        state.world[k] = true;
      });
    }
    if (e.doc) {
      if (!state.docs) state.docs = [];
      (Array.isArray(e.doc) ? e.doc : [e.doc]).forEach(function (d) {
        if (state.docs.indexOf(d) < 0) state.docs.push(d);
      });
    }
  }
  Engine.applyEffects = applyEffects;

  /* 씬 진입 처리 ------------------------------------------------ */
  function enter(state, sceneId) {
    var staying = state.scene === sceneId;   // 탐색 씬에서 제자리에 머무는 경우
    state.scene = sceneId;
    var sc = global.Story.scenes[sceneId];
    if (!sc) throw new Error('unknown scene: ' + sceneId);
    if (state.history[state.history.length - 1] !== sceneId) state.history.push(sceneId);
    if (!staying) applyEffects(state, sc.onEnter);   // onEnter는 들어올 때 한 번만
    if (sc.ending) { state.ending = sc.ending; state.done = true; }
    return state;
  }

  /* 선택 적용 — 이 함수가 게임의 전부다 ------------------------- */
  Engine.apply = function (prev, choiceId) {
    var state = Engine.clone(prev);
    var opts = Engine.choices(state);
    var pick = null;
    for (var i = 0; i < opts.length; i++) if (opts[i].id === choiceId) pick = opts[i];

    if (!pick) {                     // 선택지 없는 씬 = "계속"
      var sc = Engine.scene(state);
      if (choiceId === '@next' && sc.next) return enter(state, resolve(state, sc.next));
      return state;                  // 잘못된 입력은 무시(멀티에서 안전)
    }

    state.picked.push(pick.id);
    applyEffects(state, pick.data);
    return enter(state, resolve(state, pick.data.to));
  };

  Engine.next = function (state) { return Engine.apply(state, '@next'); };

  // to: 'sceneId' | '#ending' | { if:req, then:'a', else:'b' }
  function resolve(state, to) {
    if (!to) return state.scene;
    if (typeof to === 'object') return resolve(state, test(state, to.if) ? to.then : to.else);
    if (to === '#ending') return global.Story.endingScene(state);
    if (to === '#route') return Engine.JOBS[state.route].start;
    return to;
  }

  /* 진행률 ----------------------------------------------------- */
  Engine.progress = function (state) {
    var sc = global.Story.scenes[state.scene];
    return (sc && sc.at) || 0;   // 0~1
  };

  /* 서로 다른 좌석의 상태를 합쳐 세계 플래그를 맞춘다(멀티) ----- */
  Engine.mergeWorld = function (state, worldPatch) {
    var s = Engine.clone(state);
    Object.keys(worldPatch || {}).forEach(function (k) { if (worldPatch[k]) s.world[k] = true; });
    return s;
  };

  global.Engine = Engine;
})(window);
