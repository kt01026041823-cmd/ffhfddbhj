/* =========================================================
 *  main.js — 게임 진행 컨트롤러
 *   · 혼자 플레이
 *   · 로컬 협동(한 화면 돌려가며) : 서버 없이 동작
 *   · 온라인 협동(방 코드)        : server/server.js 필요
 * ========================================================= */
(function (global) {
  'use strict';

  var $ = UI.$;

  var Game = {
    mode: 'solo',
    seats: [],        // [{name, route, state, done, ending}]
    cur: 0,
    world: {},        // 네 사람이 공유하는 세계 플래그
    party: null,      // 온라인 방 정보
    me: null          // 온라인에서 내 좌석 id
  };
  global.Game = Game;

  /* =======================================================
   *  공통 유틸
   * ===================================================== */
  function seat() { return Game.seats[Game.cur]; }
  function state() { return seat() && seat().state; }

  function newWorldKeys(before, after) {
    return Object.keys(after).filter(function (k) { return !before[k]; });
  }

  var WORLD_LABEL = {
    w_police_tip:  '👮 경찰이 넘긴 수사 정보',
    w_fire_report: '🚒 소방 출동기록 공유',
    w_army_relief: '🪖 군 병력 재난 지원',
    w_doctor_hold: '🩺 응급실 자리 확보',
    w_name_hint:   '🧩 지워진 이름의 단서'
  };

  /* =======================================================
   *  화면 이동
   * ===================================================== */
  function toTitle() {
    var ta = $('title-art');
    if (ta && global.Art && Art.scene.title) {
      ta.style.backgroundImage = 'url(' + Art.scene.title + ')';
    }
    UI.resetChapter();
    UI.hideLook();
    Ambience.stop();
    UI.mood('screen-title', 'night');
    $('btn-continue').hidden = !Save.has();
    $('dex-badge').textContent = Save.dexCount();
    UI.closeDrawer();
    UI.show('screen-title');
  }

  function toMode() { UI.mood('screen-mode', 'night'); UI.show('screen-mode'); }

  /* --- 직업/좌석 선택 화면 ------------------------------- */
  var sel = { route: null, gender: 'm' };

  /* 직업마다 한 줄씩 — 성별 고를 때 보여준다 */
  var JOB_QUOTE = {
    police: '“정의는, 반드시 지켜야 하니까.”',
    fire:   '“사람을 구하는 게 내가 살아가는 이유야.”',
    army:   '“내가 지키는 사람들, 그게 내 책임이니까.”',
    doctor: '“사람을 살리는 일, 그게 내가 선택한 길이니까.”'
  };
  var NAME_IDEAS = ['지민', '서연', '하준', '수아', '도윤', '예린'];

  var step = 1;

  function toSelect(mode) {
    Game.mode = mode;
    sel.route = null;
    sel.gender = Save.gender() || 'm';
    $('player-name').value = Save.name() || '';

    if (mode === 'solo') {
      $('seat-row').hidden = true;
      drawSoloJobs();
      drawNameChips();
      goStep(1);
    } else {
      $('select-title').textContent = '누가 누구를 맡을까요?';
      $('select-hint').innerHTML = '기기 하나를 돌려가며 순서대로 플레이합니다. <b>앞사람이 만든 흔적이 뒷사람 이야기에 실제로 등장합니다.</b>';
      ['mk-1', 'mk-2', 'mk-3'].forEach(function (id) { $(id).hidden = true; });
      $('mk-step').textContent = '함께 플레이';
      $('seat-row').hidden = false;
      $('btn-start').textContent = '이야기 시작';
      renderSeatPicker();
    }
    UI.mood('screen-select', 'summer');
    UI.show('screen-select');
  }

  /* 단계 이동 — 직업 → 성별 → 이름 */
  function goStep(n) {
    step = n;
    ['mk-1', 'mk-2', 'mk-3'].forEach(function (id, i) { $(id).hidden = (i + 1) !== n; });
    $('mk-step').textContent = 'STEP ' + n + ' / 3';
    $('btn-start').textContent = n === 3 ? '이야기 시작' : '다음 →';

    if (n === 1) {
      $('select-title').textContent = '누구의 삶을 살아볼까요?';
      $('select-hint').innerHTML = '직업마다 완전히 다른 사건이 진행됩니다. 나머지 세 사람은 이야기 속에서 만나게 됩니다.';
      $('btn-start').disabled = !sel.route;
    } else if (n === 2) {
      var j = Engine.JOBS[sel.route];
      $('select-title').textContent = j.job + ' — 어떤 모습인가요?';
      $('select-hint').textContent = '고른 모습으로 이야기 내내 등장합니다.';
      $('gender-quote').textContent = JOB_QUOTE[sel.route] || '';
      $('gfig-m').innerHTML = Cast.figure(sel.route, 'm');
      $('gfig-f').innerHTML = Cast.figure(sel.route, 'f');
      drawGender();
      $('btn-start').disabled = false;
    } else {
      $('select-title').textContent = '이름을 지어주세요';
      $('select-hint').textContent = '이야기 속 인물의 이름은 그대로지만, 이 기록은 당신의 것으로 남습니다.';
      drawSummary();
      $('btn-start').disabled = false;
    }
  }

  function drawNameChips() {
    $('name-chips').innerHTML = NAME_IDEAS.map(function (n) {
      return '<button type="button" class="chip">' + n + '</button>';
    }).join('');
  }

  function drawSummary() {
    var j = Engine.JOBS[sel.route];
    $('mk-summary').style.setProperty('--c', j.color);
    $('mk-summary').innerHTML =
      '<b>' + j.icon + ' ' + j.job + ' · ' + j.name + '</b> — ' + j.tag + '<br>' +
      '모습: <b>' + (sel.gender === 'f' ? '여자' : '남자') + '</b><br>' +
      '<span style="opacity:.8">' + (JOB_QUOTE[sel.route] || '') + '</span>';
  }

  function drawSoloJobs() {
    UI.renderJobs($('job-list'), {
      selected: sel.route,
      onPick: function (k) {
        sel.route = k;
        drawSoloJobs();
        $('btn-start').disabled = false;
        if (global.Sfx) Sfx.play('click');
      }
    });
  }

  function drawGender() {
    Array.prototype.forEach.call($('gender-pick').children, function (b) {
      b.classList.toggle('on', b.dataset.g === sel.gender);
    });
  }

  /* 이름 후보 칩 */
  $('name-chips').addEventListener('click', function (e) {
    var c = e.target.closest('.chip');
    if (!c) return;
    $('player-name').value = c.textContent;
    if (global.Sfx) Sfx.play('click');
  });

  /* 단계 뒤로 */
  $('mk-back').addEventListener('click', function () {
    if (Game.mode !== 'solo' || step === 1) { toMode(); return; }
    goStep(step - 1);
  });

  $('gender-pick').addEventListener('click', function (e) {
    var b = e.target.closest('.gcard');
    if (!b) return;
    sel.gender = b.dataset.g;
    Save.gender(sel.gender);
    drawGender();
    if (global.Sfx) Sfx.play('click');
  });

  var seatPickerWired = false;
  function renderSeatPicker() {
    var host = $('seat-list');
    host.innerHTML = '';
    for (var i = 0; i < 4; i++) {
      var row = document.createElement('div');
      row.className = 'seat';
      row.innerHTML =
        '<span class="idx">' + (i + 1) + '번</span>' +
        '<input type="text" maxlength="12" placeholder="' + (i < 2 ? '이름 (필수)' : '이름') + '" data-i="' + i + '">' +
        '<select data-i="' + i + '">' +
          '<option value="">참여 안 함</option>' +
          Engine.JOB_ORDER.map(function (k) {
            var j = Engine.JOBS[k];
            return '<option value="' + k + '">' + j.icon + ' ' + j.job + '</option>';
          }).join('') +
        '</select>' +
        '<select class="gsel" data-g="' + i + '"><option value="m">남</option><option value="f">여</option></select>';
      host.appendChild(row);
    }
    if (!seatPickerWired) {
      host.addEventListener('change', validateSeats);
      host.addEventListener('input', validateSeats);
      seatPickerWired = true;
    }
    validateSeats();
  }

  function readSeatPicker() {
    var out = [], used = {}, dup = false;
    Array.prototype.forEach.call($('seat-list').querySelectorAll('.seat'), function (row, i) {
      var name = row.querySelector('input').value.trim();
      var route = row.querySelector('select').value;
      var g = (row.querySelector('.gsel') || {}).value || 'm';
      if (!route) return;
      if (used[route]) dup = true;
      used[route] = true;
      out.push({ name: name || ('플레이어' + (i + 1)), route: route, gender: g });
    });
    return { seats: out, dup: dup };
  }

  function validateSeats() {
    var r = readSeatPicker();
    $('btn-start').disabled = !(r.seats.length >= 2 && !r.dup);
  }

  /* =======================================================
   *  게임 시작
   * ===================================================== */
  function startSolo() {
    var name = $('player-name').value.trim() || '플레이어';
    Save.name(name);
    Game.mode = 'solo';
    Game.world = {};
    Game.cur = 0;
    Game.seats = [{ name: name, route: sel.route,
                    state: Engine.newState(sel.route, name, sel.gender), done: false }];
    beginSeat();
  }

  function startHotseat() {
    var r = readSeatPicker();
    Game.mode = 'hotseat';
    Game.world = {};
    Game.cur = 0;
    Game.seats = r.seats.map(function (s) {
      return { name: s.name, route: s.route,
               state: Engine.newState(s.route, s.name, s.gender || 'm'), done: false };
    });
    beginSeat();
  }

  function beginSeat() {
    var s = seat();
    s.state.world = JSON.parse(JSON.stringify(Game.world));   // 앞사람들이 남긴 흔적을 물려받는다
    if (Game.mode === 'hotseat') {
      UI.toast('▶ <b>' + UI.esc(s.name) + '</b> 님 차례 — ' +
               Engine.JOBS[s.route].icon + ' ' + Engine.JOBS[s.route].job, 2600);
    }
    UI.show('screen-play');
    draw();
  }

  /* =======================================================
   *  진행
   * ===================================================== */
  var prevStats = null;
  var H = { onChoice: onChoice, onEnding: onEnding };

  function draw() {
    var st = state();
    var sc = Engine.scene(st);

    UI.renderHud(st, prevStats);
    prevStats = JSON.parse(JSON.stringify(st.stats));
    UI.tone(st);
    Ambience.set(sc.amb || sc.mood || 'night');

    if (sc.type === 'look') {
      UI.renderLook(st, H);
      Sfx.play('step', { volume: 0.7 });
    } else {
      UI.hideLook();
      UI.renderScene(st, H);
    }
    if (Net.isOnline()) Net.progress(st);
  }

  /* 방 안에서 무언가를 살펴봤을 때 — 방을 다시 그리지 않고 그 자리만 갱신 */
  function lookUpdate(st) {
    UI.renderHud(st, prevStats);
    prevStats = JSON.parse(JSON.stringify(st.stats));
    UI.tone(st);
    UI.refreshSpots(st, H);
    if (Net.isOnline()) Net.progress(st);
  }

  function onChoice(id) {
    GameAudio.unlock();
    var before = state();
    var beforeWorld = before.world;
    var beforeStats = before.stats;
    var beforeScene = before.scene;

    /* 이 선택이 "방 안의 한 지점"이었는지 미리 찾아둔다 */
    var spot = null;
    Engine.choices(before).forEach(function (o) { if (o.id === id && o.spot) spot = o.spot; });

    var after = Engine.apply(before, id);
    seat().state = after;

    /* 세계 플래그가 새로 생겼으면 친구들에게 흘려보낸다 */
    var fresh = newWorldKeys(beforeWorld, after.world);
    if (fresh.length) {
      fresh.forEach(function (k) { Game.world[k] = true; });
      if (Net.isOnline()) Net.world(fresh);
      var labels = fresh.map(function (k) { return WORLD_LABEL[k] || k; }).filter(Boolean);
      if (labels.length && Game.mode !== 'solo') {
        UI.toast('🔗 친구들 이야기에 남았습니다 — ' + labels.join(', '), 2600);
      }
    }

    /* 기억 조각 알림 */
    if ((after.stats.memory || 0) > (beforeStats.memory || 0)) {
      Sfx.play('find');
      UI.toast('🧩 그해 여름의 조각을 찾았다 (' + after.stats.memory + '개)');
    }

    /* 살펴본 것: 문장을 띄우고, 종이가 나왔으면 펼친다 */
    if (spot) {
      Sfx.play(spot.doc ? 'drawer' : 'click');
      UI.showObserve(spot.text || [], spot.doc ? '— 손에 쥐고 읽는다' : null);
      if (spot.doc) {
        setTimeout(function () { UI.openDoc(spot.doc, seat().state); }, 620);
        UI.toast('🗂️ 보관함에 들어왔습니다 — ' + UI.esc(Story.doc(spot.doc).title), 2600);
      }
    }

    if (Game.mode !== 'online') autoSave();

    /* 방에 머무는 경우엔 무대를 다시 그리지 않는다 */
    if (spot && after.scene === beforeScene && Engine.scene(after).type === 'look') {
      lookUpdate(after);
    } else {
      draw();
    }
  }

  /* =======================================================
   *  엔딩
   * ===================================================== */
  function onEnding(st) {
    UI.hideLook();
    UI.tone(st);
    Ambience.set(Engine.scene(st).mood || 'night', 2.4);
    Sfx.play('stamp');
    var s = seat();
    s.done = true;
    s.ending = st.ending;
    Save.markEnding(st.route, st.ending);

    var extra = '';

    /* 로컬 협동: 다음 사람 차례 안내 / 전원 완료 시 합산 결산 */
    if (Game.mode === 'hotseat') {
      var remain = Game.cur + 1 < Game.seats.length;
      $('btn-next-seat').hidden = !remain;
      if (remain) {
        var nx = Game.seats[Game.cur + 1];
        $('btn-next-seat').textContent =
          '다음 차례 — ' + nx.name + ' (' + Engine.JOBS[nx.route].job + ') →';
        extra = '<p class="note">이 선택들이 남긴 흔적은 다음 친구의 이야기에 그대로 나타납니다.</p>';
      } else {
        extra = partyHtml(Game.seats.map(function (x) { return x.state; }));
      }
    } else {
      $('btn-next-seat').hidden = true;
    }

    if (Game.mode === 'online') {
      Net.finish(st);
      extra = '<p class="note">친구들이 끝내면 네 사람 합산 결말이 여기에 나타납니다…</p>';
    }

    if (Game.mode !== 'online') autoSave();
    UI.renderEnding(st, extra);
    UI.renderDex();
  }

  function partyHtml(states) {
    var r = Story.judgeParty(states);
    return '<h4 style="margin-top:18px">네 사람 합산 — ' + UI.endingLabel(r.key) + '</h4>' +
      '<div class="grid">' + Engine.STATS.map(function (s) {
        return '<div class="cell"><b>' + r.sum[s.key] + '</b>' + s.icon + ' ' + s.label + ' 합계</div>';
      }).join('') + '</div>' +
      '<p class="note">' + (r.key === 'true'
        ? '네 사람이 각자 찾아온 조각이 하나의 이름으로 맞춰졌습니다.'
        : '합산 진엔딩 조건은 <b>전원이 각자 진엔딩에 도달</b>하는 것입니다. ' +
          '지금 각자의 결말 — ' + r.each.map(UI.endingLabel).join(' / ')) +
      '</p>';
  }

  function nextSeat() {
    Game.cur++;
    prevStats = null;
    beginSeat();
  }

  /* =======================================================
   *  저장 / 불러오기
   * ===================================================== */
  function autoSave() {
    Save.put({
      mode: Game.mode, cur: Game.cur, world: Game.world,
      seats: Game.seats.map(function (s) {
        return { name: s.name, route: s.route, state: s.state, done: s.done, ending: s.ending };
      })
    });
  }

  function loadSave() {
    var box = Save.get();
    if (!box) return;
    var p = box.payload;
    Game.mode = p.mode; Game.cur = p.cur; Game.world = p.world || {};
    Game.seats = p.seats;
    Net.offline();
    var s = seat();
    if (!s) { toTitle(); return; }
    if (s.state.done) {                       // 저장 시점이 엔딩이었다면
      UI.show('screen-play');
      onEnding(s.state);
      return;
    }
    prevStats = null;
    UI.show('screen-play');
    draw();
    UI.toast('이어하기 — ' + UI.esc(s.name) + ' (' + Engine.JOBS[s.route].job + ')');
  }

  /* =======================================================
   *  서랍: 친구들 / 기록
   * ===================================================== */
  function openParty() {
    var st = state();
    var html = '';

    if (Game.mode === 'online' && Game.party) {
      html += '<h4>같은 방의 친구들</h4>';
      Game.party.players.forEach(function (p) {
        var j = p.route ? Engine.JOBS[p.route] : null;
        html += '<div class="item"><b>' + UI.esc(p.name) + '</b> ' +
          (j ? j.icon + ' ' + j.job : '<span class="mini">직업 미정</span>') +
          '<div class="mini">' + (p.done ? '이야기 완료' : UI.esc(p.chapter || '진행 중')) + '</div>' +
          '<div class="pbar"><i style="width:' + Math.round((p.at || 0) * 100) + '%"></i></div></div>';
      });
    } else if (Game.mode === 'hotseat') {
      html += '<h4>차례</h4>';
      Game.seats.forEach(function (p, i) {
        var j = Engine.JOBS[p.route];
        html += '<div class="item"><b>' + UI.esc(p.name) + '</b> ' + j.icon + ' ' + j.job +
          (i === Game.cur ? ' <span class="mini">← 지금</span>' : '') +
          '<div class="mini">' + (p.done ? '완료 · ' + UI.endingLabel(p.ending)
                                         : (i < Game.cur ? '완료' : '대기')) + '</div>' +
          '<div class="pbar"><i style="width:' +
            Math.round(Engine.progress(p.state) * 100) + '%"></i></div></div>';
      });
    } else {
      html += '<h4>이야기 속의 세 사람</h4>';
      Engine.JOB_ORDER.filter(function (k) { return k !== st.route; }).forEach(function (k) {
        var j = Engine.JOBS[k];
        html += '<div class="item"><b>' + j.icon + ' ' + j.job + ' ' + j.name + '</b>' +
                '<div class="mini">' + j.tag + '</div></div>';
      });
      html += '<p class="mini" style="margin-top:10px">혼자 플레이에서도 세 사람은 각자의 현장에서 등장합니다. ' +
              '친구를 챙기는 선택을 하면 유대가 오르고, 그들이 가진 조각을 나눠 받습니다.</p>';
    }

    var keys = Object.keys(st.world).filter(function (k) { return st.world[k]; });
    html += '<h4>얽힌 흔적</h4>';
    html += keys.length
      ? keys.map(function (k) { return '<div class="item">' + (WORLD_LABEL[k] || k) + '</div>'; }).join('')
      : '<div class="item mini">아직 없음 — 친구에게 정보를 넘기거나 도움을 청하면 생깁니다.</div>';

    UI.openDrawer('친구들', html, Game.mode === 'online');
  }

  function openLog() {
    var st = state();
    var seen = {}, html = '<h4>지나온 장</h4>';
    st.history.forEach(function (id) {
      var sc = Story.scenes[id];
      if (!sc || !sc.chapter || seen[sc.chapter]) return;
      seen[sc.chapter] = true;
      html += '<div class="logline"><b>' + UI.esc(sc.chapter) + '</b><br>' + UI.esc(sc.place || '') + '</div>';
    });
    html += '<h4>고른 선택 ' + st.picked.length + '개</h4><div class="item mini">' +
            '유대 ' + st.stats.bond + ' · 신념 ' + st.stats.faith +
            ' · 상처 ' + st.stats.scar + ' · 기억 ' + st.stats.memory + '</div>';
    UI.openDrawer('기록', html, false);
  }

  /* =======================================================
   *  온라인 로비
   * ===================================================== */
  function toLobby() {
    Game.mode = 'online';
    $('srv-url').value = $('srv-url').value || Net.guessUrl();
    $('srv-room').value = $('srv-room').value || 'HAEWON';
    $('srv-name').value = $('srv-name').value || Save.name() || '';
    renderLobbyJobs();
    UI.mood('screen-lobby', 'night');
    UI.show('screen-lobby');
  }

  function renderLobbyJobs() {
    var taken = {};
    var mine = null;
    if (Game.party) {
      Game.party.players.forEach(function (p) {
        if (!p.route) return;
        taken[p.route] = p.name;
        if (p.id === Game.me) mine = p.route;
      });
      if (mine) delete taken[mine];
    }
    UI.renderJobs($('lobby-jobs'), {
      selected: mine, taken: taken,
      onPick: function (k) { Net.pick(k); }
    });

    var host = $('lobby-players');
    host.innerHTML = '';
    if (!Game.party) {
      host.innerHTML = '<div class="pl"><span class="dot"></span>아직 연결되지 않았습니다</div>';
      $('btn-ready').disabled = true;
      return;
    }
    Game.party.players.forEach(function (p) {
      var j = p.route ? Engine.JOBS[p.route] : null;
      host.innerHTML += '<div class="pl' + (p.ready ? ' ready' : '') + '">' +
        '<span class="dot"></span><b>' + UI.esc(p.name) + (p.id === Game.me ? ' (나)' : '') + '</b>' +
        '<span class="mini">' + (j ? j.icon + ' ' + j.job : '직업 미정') +
        (p.ready ? ' · 준비 완료' : '') + '</span></div>';
    });
    $('btn-ready').disabled = !mine;
  }

  function connectOnline() {
    var url = $('srv-url').value.trim() || Net.guessUrl();
    var room = ($('srv-room').value.trim() || 'HAEWON').toUpperCase();
    var name = $('srv-name').value.trim() || '플레이어';
    Save.name(name);
    $('conn-state').textContent = '연결 중…';
    $('conn-state').className = 'conn';

    Net.connect(url, room, name);
    Net.on('status', function (d) {
      $('conn-state').textContent = d.connected ? '연결됨 · 방 ' + room : '연결 끊김';
      $('conn-state').className = 'conn ' + (d.connected ? 'ok' : 'bad');
    });
    Net.on('error', function (m) {
      // 전송 계층 오류는 문자열, 서버가 보낸 거절 메시지는 {msg:...}
      var text = typeof m === 'string' ? m : (m && m.msg) || '알 수 없는 오류';
      if (typeof m === 'string') {
        $('conn-state').textContent = '연결 실패';
        $('conn-state').className = 'conn bad';
      }
      UI.toast('⚠ ' + UI.esc(text), 5000);
    });
    Net.on('room', function (msg) {
      Game.party = msg;
      Game.me = msg.you || Game.me;
      renderLobbyJobs();
      if (UI.drawerOpen()) openParty();
      if (msg.phase === 'play' && !seat()) startOnline();
    });
    Net.on('world', function (msg) {
      if (!seat()) return;
      seat().state = Engine.mergeWorld(seat().state, (msg.keys || []).reduce(function (o, k) {
        o[k] = true; return o;
      }, {}));
      (msg.keys || []).forEach(function (k) { Game.world[k] = true; });
      var who = msg.from ? UI.esc(msg.from) : '친구';
      var lab = (msg.keys || []).map(function (k) { return WORLD_LABEL[k] || k; }).join(', ');
      UI.toast('🔗 ' + who + '의 선택이 넘어왔습니다 — ' + lab, 3000);
      UI.renderChoices(seat().state, { onChoice: onChoice, onEnding: onEnding });
    });
    Net.on('chat', function (msg) {
      if (UI.drawerOpen() && $('drawer-title').textContent === '친구들') {
        UI.appendChat(msg.from, msg.text, msg.id === Game.me);
      } else {
        UI.toast('💬 ' + UI.esc(msg.from) + ': ' + UI.esc(msg.text), 3000);
      }
    });
    /* 서버는 각자의 최종 상태만 모아서 보내준다.
       합산 판정은 규칙이 한 곳에만 있도록 클라이언트에서 계산한다. */
    Net.on('party', function (msg) {
      var states = (msg.states || []).map(function (p) {
        return { route: p.route, stats: p.stats || {}, flags: p.flags || {}, ending: p.ending };
      });
      if (!states.length) return;
      var res = $('ending-result');
      if (res) {
        res.innerHTML += partyHtml(states) +
          '<div class="grid" style="margin-top:12px">' + states.map(function (p) {
            var j = Engine.JOBS[p.route];
            return '<div class="cell"><b>' + (j ? j.icon : '·') + '</b>' +
                   UI.esc(msg.states.filter(function (x) { return x.route === p.route; })[0].name || '') +
                   ' · ' + UI.endingLabel(p.ending) + '</div>';
          }).join('') + '</div>';
      }
      UI.toast('네 사람의 이야기가 모두 끝났습니다.', 3000);
    });
  }

  function startOnline() {
    var me = null;
    (Game.party.players || []).forEach(function (p) { if (p.id === Game.me) me = p; });
    if (!me || !me.route) { UI.toast('직업을 먼저 고르세요.'); return; }
    Game.cur = 0;
    Game.seats = [{ name: me.name, route: me.route,
                    state: Engine.newState(me.route, me.name, Save.gender() || 'm'), done: false }];
    Game.world = {};
    prevStats = null;
    UI.show('screen-play');
    draw();
    UI.toast('시작 — ' + Engine.JOBS[me.route].icon + ' ' + Engine.JOBS[me.route].job, 2400);
  }

  /* =======================================================
   *  이벤트 배선
   * ===================================================== */
  /* 버튼을 누른 뒤 포커스를 남기지 않는다 —
     그대로 두면 Space로 대사를 넘길 때 그 버튼이 다시 눌린다 */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (btn) setTimeout(function () { btn.blur(); }, 0);
  }, true);

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act],[data-mode]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    var mode = t.getAttribute('data-mode');

    if (mode === 'solo' || mode === 'hotseat') toSelect(mode);
    else if (mode === 'online') toLobby();
    else if (act === 'to-title') { Net.offline(); toTitle(); }
    else if (act === 'to-mode') toMode();
    else if (act === 'to-dex') { UI.renderDex(); UI.mood('screen-dex', 'night'); UI.show('screen-dex'); }
    else if (act === 'continue') loadSave();
  });

  $('btn-start').addEventListener('click', function () {
    if (Game.mode !== 'solo') { startHotseat(); return; }
    if (step < 3) { goStep(step + 1); if (global.Sfx) Sfx.play('click'); return; }
    if (sel.route) startSolo();
  });

  $('btn-connect').addEventListener('click', connectOnline);
  $('btn-ready').addEventListener('click', function () {
    Net.ready(true);
    UI.toast('준비 완료 — 모두 준비되면 시작합니다');
  });

  $('btn-next-seat').addEventListener('click', nextSeat);
  $('btn-party').addEventListener('click', openParty);
  $('btn-log').addEventListener('click', openLog);
  $('btn-save').addEventListener('click', function () {
    if (Game.mode === 'online') { UI.toast('온라인 방은 저장 없이 진행됩니다'); return; }
    autoSave(); UI.toast('💾 저장했습니다');
  });
  $('btn-quit').addEventListener('click', function () {
    if (Game.mode !== 'online') autoSave();
    Net.offline();
    toTitle();
  });
  $('btn-drawer-close').addEventListener('click', UI.closeDrawer);

  $('btn-docs').addEventListener('click', function () {
    UI.renderArchive(state(), function (id) { UI.openDoc(id, state()); });
  });

  $('btn-sound').addEventListener('click', function () {
    GameAudio.unlock();
    var m = GameAudio.mute();
    $('btn-sound').textContent = m ? '🔇' : '🔊';
    UI.toast(m ? '소리를 껐습니다' : '소리를 켰습니다');
  });

  $('doc-close').addEventListener('click', UI.closeDoc);
  $('doc-layer').addEventListener('click', function (e) {
    if (e.target === $('doc-layer')) UI.closeDoc();
  });
  $('btn-reset-dex').addEventListener('click', function () {
    Save.resetDex(); UI.renderDex(); UI.toast('도감을 초기화했습니다');
  });

  $('chat-send').addEventListener('click', sendChat);
  $('chat-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendChat();
  });
  function sendChat() {
    var v = $('chat-input').value.trim();
    if (!v) return;
    Net.chat(v);
    $('chat-input').value = '';
  }

  /* 본문 클릭으로 한 줄씩 넘기기 */
  $('stage').addEventListener('click', function (e) {
    if (e.target.closest('.choice')) return;
    UI.revealNext();
  });

  /* 키보드 */
  document.addEventListener('keydown', function (e) {
    if (document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key === 'Escape') {
      if (UI.closeDoc()) return;
      UI.closeDrawer(); return;
    }
    if (UI.docOpen()) { if (e.key === ' ' || e.key === 'Enter') UI.closeDoc(); return; }
    if (!$('screen-play').classList.contains('active')) return;

    var looking = !$('explore').hidden;
    if (/^[1-9]$/.test(e.key)) {
      var list = looking ? $('spots').querySelectorAll('.spot')
                         : $('choices').querySelectorAll('.choice');
      var b = list[parseInt(e.key, 10) - 1];
      if (b) b.click();
      return;
    }
    if (looking) {
      if (e.key === 'Enter' || e.key === ' ') {     // 나가기
        e.preventDefault();
        var exit = $('look-exits').querySelector('.btn');
        if (exit) exit.click();
      }
      return;
    }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); UI.revealNext(); return; }
  });

  /* 소리는 첫 클릭에서 깨운다(브라우저 정책) */
  document.addEventListener('pointerdown', function once() {
    GameAudio.unlock();
    document.removeEventListener('pointerdown', once);
  });
  UI.bindParallax();

  /* 시작 */
  toTitle();
})(window);
