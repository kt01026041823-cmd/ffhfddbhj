/* =========================================================
 *  audio.js — 절차적 사운드 (오디오 파일 0개)
 *  ---------------------------------------------------------
 *  모든 소리를 WebAudio로 그 자리에서 합성한다.
 *  · 용량이 늘지 않고, 저작권/라이선스 문제가 없고,
 *    장면 상태(상처·유대)에 따라 소리를 "연속적으로" 바꿀 수 있다.
 *
 *  구조
 *    Sfx.play('paper')        일회성 효과음
 *    Ambience.set('archive')  장면 앰비언스 (크로스페이드)
 *    Audio.tone(scar, bond)   톤 디렉터 — 마음 상태를 소리로
 * ========================================================= */
(function (global) {
  'use strict';

  var ctx = null, master = null, ambBus = null, sfxBus = null;
  var muted = false, started = false;

  function ac() {
    if (ctx) return ctx;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    ambBus = ctx.createGain(); ambBus.gain.value = 0.55; ambBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.8;  sfxBus.connect(master);
    return ctx;
  }

  /* 브라우저 자동재생 정책: 첫 사용자 입력에서 깨운다 */
  function unlock() {
    var c = ac();
    if (!c) return;
    if (c.state === 'suspended') c.resume();
    started = true;
  }

  /* ---------- 기본 재료 ---------------------------------- */
  var noiseBuf = null;
  function noise() {
    var c = ac(); if (!c) return null;
    if (!noiseBuf) {
      var len = c.sampleRate * 3;
      noiseBuf = c.createBuffer(1, len, c.sampleRate);
      var d = noiseBuf.getChannelData(0);
      var last = 0;
      for (var i = 0; i < len; i++) {
        var w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;      // 갈색 잡음에 가깝게
        d[i] = last * 3.2;
      }
    }
    var src = c.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    return src;
  }

  function env(node, peak, a, d, when) {
    var c = ac(); var t = when || c.currentTime;
    node.gain.setValueAtTime(0.0001, t);
    node.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    node.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  /* ---------- 효과음 ------------------------------------- */
  var Sfx = {};

  Sfx.play = function (name, opt) {
    if (muted) return;
    var c = ac(); if (!c) return;
    if (c.state === 'suspended') c.resume();
    var t = c.currentTime;
    opt = opt || {};
    var v = opt.volume == null ? 1 : opt.volume;

    switch (name) {

      /* 종이 넘기기 — 짧은 필터 잡음 두 번 */
      case 'paper': {
        for (var i = 0; i < 2; i++) {
          var n = noise(); if (!n) return;
          var bp = c.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.value = 2200 + Math.random() * 1800;
          bp.Q.value = 0.7;
          var g = c.createGain();
          n.connect(bp); bp.connect(g); g.connect(sfxBus);
          var at = t + i * 0.07;
          env(g, 0.16 * v, 0.012, 0.10, at);
          n.start(at); n.stop(at + 0.2);
        }
        return;
      }

      /* UI 클릭 — 나무를 가볍게 두드리는 소리 */
      case 'click': {
        var o = c.createOscillator(), g2 = c.createGain(), lp = c.createBiquadFilter();
        o.type = 'triangle';
        o.frequency.setValueAtTime(320, t);
        o.frequency.exponentialRampToValueAtTime(120, t + 0.06);
        lp.type = 'lowpass'; lp.frequency.value = 1400;
        o.connect(lp); lp.connect(g2); g2.connect(sfxBus);
        env(g2, 0.10 * v, 0.004, 0.07, t);
        o.start(t); o.stop(t + 0.12);
        return;
      }

      /* 사물에 다가감 — 아주 낮은 숨소리 */
      case 'hover': {
        var n2 = noise(); if (!n2) return;
        var hp = c.createBiquadFilter();
        hp.type = 'bandpass'; hp.frequency.value = 700; hp.Q.value = 1.4;
        var g3 = c.createGain();
        n2.connect(hp); hp.connect(g3); g3.connect(sfxBus);
        env(g3, 0.035 * v, 0.03, 0.12, t);
        n2.start(t); n2.stop(t + 0.2);
        return;
      }

      /* 발소리 — 저역 충격 + 짧은 잡음 */
      case 'step': {
        var o2 = c.createOscillator(), g4 = c.createGain();
        o2.type = 'sine';
        o2.frequency.setValueAtTime(90, t);
        o2.frequency.exponentialRampToValueAtTime(48, t + 0.09);
        o2.connect(g4); g4.connect(sfxBus);
        env(g4, 0.22 * v, 0.005, 0.10, t);
        o2.start(t); o2.stop(t + 0.16);

        var n3 = noise();
        var bp2 = c.createBiquadFilter();
        bp2.type = 'bandpass'; bp2.frequency.value = 1100; bp2.Q.value = 0.8;
        var g5 = c.createGain();
        n3.connect(bp2); bp2.connect(g5); g5.connect(sfxBus);
        env(g5, 0.05 * v, 0.004, 0.06, t);
        n3.start(t); n3.stop(t + 0.12);
        return;
      }

      /* 서랍 / 캐비닛 */
      case 'drawer': {
        var n4 = noise();
        var bp3 = c.createBiquadFilter();
        bp3.type = 'bandpass'; bp3.frequency.setValueAtTime(400, t);
        bp3.frequency.linearRampToValueAtTime(900, t + 0.35);
        bp3.Q.value = 1.2;
        var g6 = c.createGain();
        n4.connect(bp3); bp3.connect(g6); g6.connect(sfxBus);
        g6.gain.setValueAtTime(0.0001, t);
        g6.gain.exponentialRampToValueAtTime(0.09 * v, t + 0.06);
        g6.gain.setValueAtTime(0.09 * v, t + 0.28);
        g6.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        n4.start(t); n4.stop(t + 0.5);
        return;
      }

      /* 발견 — 낮은 종소리 두 음 */
      case 'find': {
        [392, 587.33].forEach(function (f, i) {
          var o3 = c.createOscillator(), g7 = c.createGain();
          o3.type = 'sine'; o3.frequency.value = f;
          o3.connect(g7); g7.connect(sfxBus);
          env(g7, 0.07 * v, 0.02, 1.5, t + i * 0.14);
          o3.start(t + i * 0.14); o3.stop(t + i * 0.14 + 1.8);
        });
        return;
      }

      /* 심장 박동 (상처가 깊을 때) */
      case 'heart': {
        [0, 0.26].forEach(function (dt, i) {
          var o4 = c.createOscillator(), g8 = c.createGain();
          o4.type = 'sine';
          o4.frequency.setValueAtTime(66, t + dt);
          o4.frequency.exponentialRampToValueAtTime(38, t + dt + 0.14);
          o4.connect(g8); g8.connect(sfxBus);
          env(g8, (i ? 0.13 : 0.2) * v, 0.01, 0.22, t + dt);
          o4.start(t + dt); o4.stop(t + dt + 0.4);
        });
        return;
      }

      /* 무전 잡음 */
      case 'radio': {
        var n5 = noise();
        var bp4 = c.createBiquadFilter();
        bp4.type = 'bandpass'; bp4.frequency.value = 1800; bp4.Q.value = 3;
        var g9 = c.createGain();
        n5.connect(bp4); bp4.connect(g9); g9.connect(sfxBus);
        g9.gain.setValueAtTime(0.0001, t);
        for (var k = 0; k < 6; k++) {
          g9.gain.setValueAtTime((0.02 + Math.random() * 0.05) * v, t + k * 0.06);
        }
        g9.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
        n5.start(t); n5.stop(t + 0.45);
        return;
      }

      /* 도장 찍는 소리 (엔딩 결산) */
      case 'stamp': {
        var o5 = c.createOscillator(), g10 = c.createGain();
        o5.type = 'square';
        o5.frequency.setValueAtTime(180, t);
        o5.frequency.exponentialRampToValueAtTime(60, t + 0.05);
        var lp2 = c.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 900;
        o5.connect(lp2); lp2.connect(g10); g10.connect(sfxBus);
        env(g10, 0.3 * v, 0.003, 0.13, t);
        o5.start(t); o5.stop(t + 0.2);
        return;
      }
    }
  };

  /* ---------- 앰비언스 ------------------------------------
   *  장면마다 "층"을 다르게 쌓는다.
   *  drone(저역) + air(공기) + 개별 요소(비/불/시계/기계음)
   * ------------------------------------------------------- */
  var Ambience = {};
  var current = null, currentName = null;

  var PRESETS = {
    /* 밤거리 · 사무실 */
    night:   { drone: 52,  air: 380,  airGain: 0.05, tick: 1.0 },
    day:     { drone: 70,  air: 900,  airGain: 0.06 },
    /* 자료실 · 보관실: 형광등 험, 아주 조용 */
    archive: { drone: 60,  air: 240,  airGain: 0.035, hum: 120, tick: 2.2 },
    /* 화재 현장 */
    fire:    { drone: 44,  air: 1500, airGain: 0.14, crackle: true, rumble: true },
    /* 병원 */
    cold:    { drone: 58,  air: 520,  airGain: 0.05, beep: 1.15, hum: 100 },
    /* 포장마차 · 따뜻함 */
    warm:    { drone: 80,  air: 700,  airGain: 0.06 },
    /* 새벽 */
    dawn:    { drone: 66,  air: 450,  airGain: 0.045 },
    /* 여름 (프롤로그) */
    summer:  { drone: 74,  air: 1100, airGain: 0.07, cicada: true }
  };

  function buildLayer(name) {
    var c = ac(); if (!c) return null;
    var p = PRESETS[name] || PRESETS.night;
    var out = c.createGain();
    out.gain.value = 0;
    out.connect(ambBus);
    var nodes = [], timers = [];

    /* 저역 드론 */
    var o = c.createOscillator(), og = c.createGain();
    o.type = 'sine'; o.frequency.value = p.drone;
    og.gain.value = 0.12;
    o.connect(og); og.connect(out); o.start();
    nodes.push(o);

    /* 살짝 어긋난 두 번째 드론 — 맥놀이 */
    var o2 = c.createOscillator(), og2 = c.createGain();
    o2.type = 'sine'; o2.frequency.value = p.drone * 1.006;
    og2.gain.value = 0.07;
    o2.connect(og2); og2.connect(out); o2.start();
    nodes.push(o2);

    /* 공기 */
    var n = noise();
    var lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = p.air;
    var ng = c.createGain(); ng.gain.value = p.airGain;
    n.connect(lp); lp.connect(ng); ng.connect(out); n.start();
    nodes.push(n);

    /* 형광등 험 */
    if (p.hum) {
      var h = c.createOscillator(), hg = c.createGain();
      h.type = 'sawtooth'; h.frequency.value = p.hum;
      var hlp = c.createBiquadFilter(); hlp.type = 'lowpass'; hlp.frequency.value = 300;
      hg.gain.value = 0.012;
      h.connect(hlp); hlp.connect(hg); hg.connect(out); h.start();
      nodes.push(h);
    }

    /* 시계 초침 */
    if (p.tick) {
      timers.push(setInterval(function () {
        if (muted) return;
        var t = c.currentTime;
        var nn = noise();
        var bp = c.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 4;
        var g = c.createGain();
        nn.connect(bp); bp.connect(g); g.connect(out);
        env(g, 0.05, 0.002, 0.03, t);
        nn.start(t); nn.stop(t + 0.06);
      }, p.tick * 1000));
    }

    /* 심전도 비프 */
    if (p.beep) {
      timers.push(setInterval(function () {
        if (muted) return;
        var t = c.currentTime;
        var b = c.createOscillator(), bg = c.createGain();
        b.type = 'sine'; b.frequency.value = 880;
        b.connect(bg); bg.connect(out);
        env(bg, 0.03, 0.005, 0.07, t);
        b.start(t); b.stop(t + 0.12);
      }, p.beep * 1000));
    }

    /* 불 타는 소리 — 랜덤 파열음 */
    if (p.crackle) {
      timers.push(setInterval(function () {
        if (muted) return;
        var t = c.currentTime;
        var nn = noise();
        var bp = c.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 900 + Math.random() * 2600;
        bp.Q.value = 1.5;
        var g = c.createGain();
        nn.connect(bp); bp.connect(g); g.connect(out);
        env(g, 0.03 + Math.random() * 0.05, 0.004, 0.06 + Math.random() * 0.1, t);
        nn.start(t); nn.stop(t + 0.25);
      }, 130));
    }

    /* 저역 울림 */
    if (p.rumble) {
      var r = c.createOscillator(), rg = c.createGain();
      r.type = 'sine'; r.frequency.value = 31;
      rg.gain.value = 0.16;
      r.connect(rg); rg.connect(out); r.start();
      nodes.push(r);
    }

    /* 매미 */
    if (p.cicada) {
      var cn = noise();
      var cbp = c.createBiquadFilter();
      cbp.type = 'bandpass'; cbp.frequency.value = 4200; cbp.Q.value = 6;
      var cg = c.createGain(); cg.gain.value = 0.02;
      var lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.value = 11; lg.gain.value = 0.014;
      lfo.connect(lg); lg.connect(cg.gain);
      cn.connect(cbp); cbp.connect(cg); cg.connect(out);
      cn.start(); lfo.start();
      nodes.push(cn, lfo);
    }

    return {
      out: out, nodes: nodes, timers: timers,
      stop: function () {
        timers.forEach(clearInterval);
        nodes.forEach(function (n) { try { n.stop(); } catch (e) {} });
        try { out.disconnect(); } catch (e) {}
      }
    };
  }

  Ambience.set = function (name, fade) {
    var c = ac(); if (!c) return;
    if (currentName === name) return;
    currentName = name;
    fade = fade == null ? 1.6 : fade;
    var t = c.currentTime;

    var old = current;
    if (old) {
      old.out.gain.cancelScheduledValues(t);
      old.out.gain.setValueAtTime(old.out.gain.value, t);
      old.out.gain.linearRampToValueAtTime(0, t + fade);
      setTimeout(function () { old.stop(); }, (fade + 0.4) * 1000);
    }
    var layer = buildLayer(name);
    if (!layer) return;
    layer.out.gain.setValueAtTime(0, t);
    layer.out.gain.linearRampToValueAtTime(1, t + fade);
    current = layer;
  };

  Ambience.stop = function () {
    currentName = null;
    if (current) { current.stop(); current = null; }
  };

  /* ---------- 톤 디렉터 -----------------------------------
   *  상처가 깊을수록 소리가 낮고 답답해지고,
   *  유대가 높을수록 공간이 열린다.
   * ------------------------------------------------------- */
  var Tone = { scar: 0, bond: 0 };
  var heartTimer = null;

  function applyTone() {
    var c = ac(); if (!c || !ambBus) return;
    var s = Math.min(Tone.scar / 14, 1);      // 0~1
    var b = Math.min(Tone.bond / 24, 1);
    ambBus.gain.setTargetAtTime(0.42 + s * 0.28 - b * 0.06, c.currentTime, 1.2);

    /* 상처가 깊으면 심장 소리가 배경에 깔린다 */
    if (heartTimer) { clearInterval(heartTimer); heartTimer = null; }
    if (s > 0.55) {
      heartTimer = setInterval(function () {
        if (!muted) Sfx.play('heart', { volume: (s - 0.5) * 1.1 });
      }, 3400 - s * 1000);
    }
  }

  var Audio = {
    unlock: unlock,
    started: function () { return started; },
    mute: function (v) {
      muted = v == null ? !muted : !!v;
      var c = ac();
      if (c && master) master.gain.setTargetAtTime(muted ? 0 : 0.9, c.currentTime, 0.15);
      return muted;
    },
    muted: function () { return muted; },
    tone: function (scar, bond) {
      Tone.scar = scar || 0; Tone.bond = bond || 0;
      applyTone();
    },
    sfx: Sfx,
    amb: Ambience
  };

  global.Sfx = Sfx;
  global.Ambience = Ambience;
  global.GameAudio = Audio;
})(window);
