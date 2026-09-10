/* =========================================================
 *  set.js — 절차적 무대 화가 (이미지 파일 0개)
 *  ---------------------------------------------------------
 *  방을 "소품 목록"으로 선언하면 SVG로 그려준다.
 *  실루엣 + 광선 + 먼지 + 비네트로 분위기를 만든다.
 *
 *    Stage.draw({ pal:'archive', props:[ {t:'cabinet', x:380}, ... ] })
 *
 *  레이어 3장(back / mid / fore)을 따로 내보내서
 *  마우스에 따라 시차(parallax)를 준다. → 1인칭으로 둘러보는 감각
 * ========================================================= */
(function (global) {
  'use strict';

  var W = 1600, H = 900, FLOOR = 660;

  /* ---------- 팔레트 -------------------------------------- */
  var PALETTES = {
    archive: { sky: '#12161f', wall: '#1a1f2b', wall2: '#141824', floor: '#0e1219',
               prop: '#0b0e14', prop2: '#171c27', light: '#8fb2ff', warm: '#e0b26a' },
    station: { sky: '#181218', wall: '#241a1a', wall2: '#1a1315', floor: '#120d0f',
               prop: '#0d0809', prop2: '#211719', light: '#ffb27a', warm: '#ff8a4a' },
    barrack: { sky: '#131811', wall: '#1c2318', wall2: '#151a12', floor: '#0d110b',
               prop: '#080b07', prop2: '#1a2016', light: '#cfe0a8', warm: '#c9d18a' },
    ward:    { sky: '#0e1618', wall: '#152023', wall2: '#101819', floor: '#0a1113',
               prop: '#070d0e', prop2: '#131e20', light: '#a8e6e0', warm: '#7fd6c9' },
    warehouse:{ sky:'#1a1207', wall: '#231909', wall2: '#180f05', floor: '#0f0a04',
               prop: '#0a0603', prop2: '#1d1408', light: '#ffd08a', warm: '#ff8c3a' }
  };

  function esc(n) { return Math.round(n * 100) / 100; }

  /* ---------- 소품 ---------------------------------------- */
  /* 각 소품: fn(o, p) → svg 문자열.  o={x,y,s}, p=팔레트   */
  var PROPS = {

    /* 서류 캐비닛 */
    cabinet: function (o, p) {
      var s = o.s || 1, w = 130 * s, h = 300 * s, x = o.x - w / 2, y = (o.y || FLOOR) - h;
      var out = '<rect x="' + esc(x) + '" y="' + esc(y) + '" width="' + esc(w) + '" height="' + esc(h) +
                '" fill="' + p.prop + '"/>';
      for (var i = 0; i < 4; i++) {
        var dy = y + 14 * s + i * (h - 20 * s) / 4;
        out += '<rect x="' + esc(x + 10 * s) + '" y="' + esc(dy) + '" width="' + esc(w - 20 * s) +
               '" height="' + esc((h - 30 * s) / 4 - 6 * s) + '" fill="none" stroke="' + p.prop2 +
               '" stroke-width="' + esc(3 * s) + '"/>' +
               '<rect x="' + esc(o.x - 16 * s) + '" y="' + esc(dy + 18 * s) + '" width="' + esc(32 * s) +
               '" height="' + esc(5 * s) + '" fill="' + p.prop2 + '"/>';
      }
      return out;
    },

    /* 선반 + 상자 */
    shelf: function (o, p) {
      var s = o.s || 1, w = 300 * s, h = 340 * s, x = o.x - w / 2, y = (o.y || FLOOR) - h;
      var out = '<rect x="' + esc(x) + '" y="' + esc(y) + '" width="' + esc(w) + '" height="' + esc(h) +
                '" fill="none" stroke="' + p.prop + '" stroke-width="' + esc(9 * s) + '"/>';
      for (var r = 1; r < 4; r++) {
        var ry = y + r * h / 4;
        out += '<rect x="' + esc(x) + '" y="' + esc(ry) + '" width="' + esc(w) + '" height="' + esc(7 * s) +
               '" fill="' + p.prop + '"/>';
        /* 상자들 */
        var n = 2 + (r % 2);
        for (var b = 0; b < n; b++) {
          var bw = (w - 20 * s) / n - 10 * s;
          var bh = (h / 4) * (0.45 + ((r + b) % 3) * 0.14);
          out += '<rect x="' + esc(x + 12 * s + b * (bw + 10 * s)) + '" y="' + esc(ry - bh) +
                 '" width="' + esc(bw) + '" height="' + esc(bh) + '" fill="' + p.prop2 + '"/>';
        }
      }
      return out;
    },

    /* 책상 + 스탠드 조명 웅덩이 */
    desk: function (o, p) {
      var s = o.s || 1, w = 340 * s, x = o.x - w / 2, y = (o.y || FLOOR) - 130 * s;
      return '<ellipse cx="' + esc(o.x) + '" cy="' + esc(y + 4 * s) + '" rx="' + esc(w * 0.62) +
             '" ry="' + esc(46 * s) + '" fill="' + p.warm + '" opacity=".07"/>' +
             '<rect x="' + esc(x) + '" y="' + esc(y) + '" width="' + esc(w) + '" height="' + esc(16 * s) +
             '" fill="' + p.prop + '"/>' +
             '<rect x="' + esc(x + 18 * s) + '" y="' + esc(y + 16 * s) + '" width="' + esc(20 * s) +
             '" height="' + esc(114 * s) + '" fill="' + p.prop + '"/>' +
             '<rect x="' + esc(x + w - 38 * s) + '" y="' + esc(y + 16 * s) + '" width="' + esc(20 * s) +
             '" height="' + esc(114 * s) + '" fill="' + p.prop + '"/>' +
             /* 서류 더미 */
             '<rect x="' + esc(o.x - 40 * s) + '" y="' + esc(y - 22 * s) + '" width="' + esc(90 * s) +
             '" height="' + esc(22 * s) + '" fill="' + p.prop2 + '"/>' +
             '<rect x="' + esc(o.x - 34 * s) + '" y="' + esc(y - 30 * s) + '" width="' + esc(78 * s) +
             '" height="' + esc(9 * s) + '" fill="#cbb894" opacity=".5"/>';
    },

    /* 사무용 의자 */
    chair: function (o, p) {
      var s = o.s || 1, y = (o.y || FLOOR);
      return '<rect x="' + esc(o.x - 44 * s) + '" y="' + esc(y - 120 * s) + '" width="' + esc(88 * s) +
             '" height="' + esc(96 * s) + '" rx="' + esc(10 * s) + '" fill="' + p.prop + '"/>' +
             '<rect x="' + esc(o.x - 8 * s) + '" y="' + esc(y - 30 * s) + '" width="' + esc(16 * s) +
             '" height="' + esc(24 * s) + '" fill="' + p.prop + '"/>' +
             '<path d="M' + esc(o.x - 46 * s) + ' ' + esc(y) + ' L' + esc(o.x + 46 * s) + ' ' + esc(y) +
             '" stroke="' + p.prop + '" stroke-width="' + esc(8 * s) + '"/>';
    },

    /* 창문 + 빛기둥 */
    window: function (o, p) {
      var s = o.s || 1, w = 260 * s, h = 320 * s, x = o.x - w / 2, y = (o.y || 150);
      var out = '<rect x="' + esc(x) + '" y="' + esc(y) + '" width="' + esc(w) + '" height="' + esc(h) +
                '" fill="url(#winGlow)"/>' +
                '<rect x="' + esc(x) + '" y="' + esc(y) + '" width="' + esc(w) + '" height="' + esc(h) +
                '" fill="none" stroke="' + p.prop + '" stroke-width="' + esc(14 * s) + '"/>' +
                '<line x1="' + esc(o.x) + '" y1="' + esc(y) + '" x2="' + esc(o.x) + '" y2="' + esc(y + h) +
                '" stroke="' + p.prop + '" stroke-width="' + esc(10 * s) + '"/>' +
                '<line x1="' + esc(x) + '" y1="' + esc(y + h / 2) + '" x2="' + esc(x + w) + '" y2="' + esc(y + h / 2) +
                '" stroke="' + p.prop + '" stroke-width="' + esc(10 * s) + '"/>';
      if (o.blind) {
        for (var i = 0; i < 9; i++) {
          out += '<rect x="' + esc(x) + '" y="' + esc(y + 12 * s + i * (h / 9)) + '" width="' + esc(w) +
                 '" height="' + esc(9 * s) + '" fill="' + p.prop + '" opacity=".75"/>';
        }
      }
      return out;
    },

    /* 문 (반쯤 열린) */
    door: function (o, p) {
      var s = o.s || 1, w = 150 * s, h = 360 * s, x = o.x - w / 2, y = (o.y || FLOOR) - h;
      return '<rect x="' + esc(x) + '" y="' + esc(y) + '" width="' + esc(w) + '" height="' + esc(h) +
             '" fill="#000" opacity=".55"/>' +
             '<rect x="' + esc(x) + '" y="' + esc(y) + '" width="' + esc(w * 0.22) + '" height="' + esc(h) +
             '" fill="' + p.light + '" opacity=".10"/>' +
             '<rect x="' + esc(x) + '" y="' + esc(y) + '" width="' + esc(w) + '" height="' + esc(h) +
             '" fill="none" stroke="' + p.prop2 + '" stroke-width="' + esc(8 * s) + '"/>';
    },

    /* 천장 형광등 */
    striplight: function (o, p) {
      var s = o.s || 1, w = 360 * s, x = o.x - w / 2, y = o.y || 90;
      return '<rect x="' + esc(x) + '" y="' + esc(y) + '" width="' + esc(w) + '" height="' + esc(18 * s) +
             '" fill="' + p.light + '" opacity=".5"/>' +
             '<path d="M' + esc(x) + ' ' + esc(y + 18 * s) + ' L' + esc(x - 120 * s) + ' ' + esc(FLOOR) +
             ' L' + esc(x + w + 120 * s) + ' ' + esc(FLOOR) + ' L' + esc(x + w) + ' ' + esc(y + 18 * s) +
             ' Z" fill="url(#shaft)" opacity=".22"/>';
    },

    /* 매달린 전구 */
    bulb: function (o, p) {
      var s = o.s || 1, y = o.y || 120;
      return '<line x1="' + esc(o.x) + '" y1="0" x2="' + esc(o.x) + '" y2="' + esc(y) +
             '" stroke="' + p.prop2 + '" stroke-width="' + esc(3 * s) + '"/>' +
             '<circle cx="' + esc(o.x) + '" cy="' + esc(y + 14 * s) + '" r="' + esc(13 * s) +
             '" fill="' + p.warm + '" opacity=".85"/>' +
             '<circle cx="' + esc(o.x) + '" cy="' + esc(y + 14 * s) + '" r="' + esc(120 * s) +
             '" fill="url(#bulbGlow)"/>';
    },

    /* 라커(개인 사물함) 줄 */
    lockers: function (o, p) {
      var s = o.s || 1, n = o.n || 4, cw = 90 * s, h = 330 * s;
      var x0 = o.x - (n * cw) / 2, y = (o.y || FLOOR) - h, out = '';
      for (var i = 0; i < n; i++) {
        var x = x0 + i * cw;
        out += '<rect x="' + esc(x) + '" y="' + esc(y) + '" width="' + esc(cw - 5 * s) + '" height="' + esc(h) +
               '" fill="' + p.prop + '" stroke="' + p.prop2 + '" stroke-width="' + esc(3 * s) + '"/>' +
               '<rect x="' + esc(x + cw * 0.2) + '" y="' + esc(y + 40 * s) + '" width="' + esc(cw * 0.5) +
               '" height="' + esc(8 * s) + '" fill="' + p.prop2 + '"/>' +
               '<circle cx="' + esc(x + cw * 0.72) + '" cy="' + esc(y + h * 0.5) + '" r="' + esc(5 * s) +
               '" fill="' + p.prop2 + '"/>';
      }
      return out;
    },

    /* 병원 침대 */
    bed: function (o, p) {
      var s = o.s || 1, w = 420 * s, y = (o.y || FLOOR) - 150 * s, x = o.x - w / 2;
      return '<rect x="' + esc(x) + '" y="' + esc(y) + '" width="' + esc(w) + '" height="' + esc(24 * s) +
             '" rx="' + esc(6 * s) + '" fill="' + p.prop2 + '"/>' +
             '<rect x="' + esc(x + 10 * s) + '" y="' + esc(y - 26 * s) + '" width="' + esc(w * 0.42) +
             '" height="' + esc(30 * s) + '" rx="' + esc(12 * s) + '" fill="#c9d6d8" opacity=".28"/>' +
             '<rect x="' + esc(x) + '" y="' + esc(y + 24 * s) + '" width="' + esc(14 * s) + '" height="' + esc(126 * s) +
             '" fill="' + p.prop + '"/>' +
             '<rect x="' + esc(x + w - 14 * s) + '" y="' + esc(y + 24 * s) + '" width="' + esc(14 * s) +
             '" height="' + esc(126 * s) + '" fill="' + p.prop + '"/>' +
             '<rect x="' + esc(x - 20 * s) + '" y="' + esc(y - 90 * s) + '" width="' + esc(20 * s) +
             '" height="' + esc(90 * s) + '" fill="' + p.prop + '"/>';
    },

    /* 수액 걸이 */
    ivstand: function (o, p) {
      var s = o.s || 1, y = (o.y || FLOOR);
      return '<line x1="' + esc(o.x) + '" y1="' + esc(y) + '" x2="' + esc(o.x) + '" y2="' + esc(y - 300 * s) +
             '" stroke="' + p.prop2 + '" stroke-width="' + esc(6 * s) + '"/>' +
             '<path d="M' + esc(o.x - 26 * s) + ' ' + esc(y) + ' L' + esc(o.x + 26 * s) + ' ' + esc(y) +
             '" stroke="' + p.prop2 + '" stroke-width="' + esc(5 * s) + '"/>' +
             '<rect x="' + esc(o.x + 4 * s) + '" y="' + esc(y - 290 * s) + '" width="' + esc(34 * s) +
             '" height="' + esc(70 * s) + '" rx="' + esc(10 * s) + '" fill="' + p.light + '" opacity=".22"/>';
    },

    /* 소방 호스릴 */
    hosereel: function (o, p) {
      var s = o.s || 1, y = o.y || 380;
      return '<circle cx="' + esc(o.x) + '" cy="' + esc(y) + '" r="' + esc(78 * s) + '" fill="none" stroke="' +
             p.prop + '" stroke-width="' + esc(16 * s) + '"/>' +
             '<circle cx="' + esc(o.x) + '" cy="' + esc(y) + '" r="' + esc(46 * s) + '" fill="none" stroke="' +
             p.prop2 + '" stroke-width="' + esc(22 * s) + '"/>' +
             '<circle cx="' + esc(o.x) + '" cy="' + esc(y) + '" r="' + esc(10 * s) + '" fill="' + p.prop + '"/>';
    },

    /* 헬멧 (선반 위) */
    helmet: function (o, p) {
      var s = o.s || 1, y = o.y || FLOOR;
      return '<path d="M' + esc(o.x - 48 * s) + ' ' + esc(y) + ' a' + esc(48 * s) + ' ' + esc(44 * s) +
             ' 0 0 1 ' + esc(96 * s) + ' 0 z" fill="' + p.prop + '"/>' +
             '<rect x="' + esc(o.x - 58 * s) + '" y="' + esc(y - 6 * s) + '" width="' + esc(116 * s) +
             '" height="' + esc(10 * s) + '" rx="' + esc(5 * s) + '" fill="' + p.prop2 + '"/>' +
             '<path d="M' + esc(o.x - 30 * s) + ' ' + esc(y - 30 * s) + ' q' + esc(30 * s) + ' ' + esc(-18 * s) +
             ' ' + esc(60 * s) + ' 0" stroke="' + p.warm + '" stroke-width="' + esc(4 * s) +
             '" fill="none" opacity=".55"/>';
    },

    /* 상자 더미 */
    boxes: function (o, p) {
      var s = o.s || 1, y = (o.y || FLOOR), out = '';
      var rows = [[0, 110, 90], [96, 92, 74], [30, 84, 66]];
      rows.forEach(function (r, i) {
        var bw = r[1] * s, bh = r[2] * s;
        var bx = o.x - 60 * s + r[0] * s * 0.7;
        var by = y - bh - (i === 2 ? 90 * s : 0);
        out += '<rect x="' + esc(bx) + '" y="' + esc(by) + '" width="' + esc(bw) + '" height="' + esc(bh) +
               '" fill="' + p.prop + '" stroke="' + p.prop2 + '" stroke-width="' + esc(2 * s) + '"/>' +
               '<line x1="' + esc(bx) + '" y1="' + esc(by + bh * 0.34) + '" x2="' + esc(bx + bw) + '" y2="' +
               esc(by + bh * 0.34) + '" stroke="' + p.prop2 + '" stroke-width="' + esc(2 * s) + '"/>';
      });
      return out;
    },

    /* 벽시계 */
    clock: function (o, p) {
      var s = o.s || 1, y = o.y || 200;
      return '<circle cx="' + esc(o.x) + '" cy="' + esc(y) + '" r="' + esc(40 * s) + '" fill="' + p.prop +
             '" stroke="' + p.prop2 + '" stroke-width="' + esc(5 * s) + '"/>' +
             '<line x1="' + esc(o.x) + '" y1="' + esc(y) + '" x2="' + esc(o.x) + '" y2="' + esc(y - 24 * s) +
             '" stroke="' + p.light + '" stroke-width="' + esc(3 * s) + '" opacity=".7"/>' +
             '<line x1="' + esc(o.x) + '" y1="' + esc(y) + '" x2="' + esc(o.x + 18 * s) + '" y2="' + esc(y + 8 * s) +
             '" stroke="' + p.light + '" stroke-width="' + esc(3 * s) + '" opacity=".7"/>';
    },

    /* 천장 배관 */
    pipes: function (o, p) {
      var s = o.s || 1, y = o.y || 60, out = '';
      for (var i = 0; i < 3; i++) {
        out += '<rect x="0" y="' + esc(y + i * 26 * s) + '" width="' + W + '" height="' + esc(13 * s) +
               '" fill="' + p.prop + '" opacity="' + (0.9 - i * 0.2) + '"/>';
      }
      return out;
    },

    /* 게시판 */
    board: function (o, p) {
      var s = o.s || 1, w = 300 * s, h = 200 * s, x = o.x - w / 2, y = o.y || 240;
      var out = '<rect x="' + esc(x) + '" y="' + esc(y) + '" width="' + esc(w) + '" height="' + esc(h) +
                '" fill="' + p.prop2 + '" stroke="' + p.prop + '" stroke-width="' + esc(8 * s) + '"/>';
      for (var i = 0; i < 5; i++) {
        var pw = (34 + (i * 13) % 40) * s, ph = (44 + (i * 7) % 26) * s;
        out += '<rect x="' + esc(x + 18 * s + (i * 56) * s) + '" y="' + esc(y + 18 * s + (i % 2) * 60 * s) +
               '" width="' + esc(pw) + '" height="' + esc(ph) + '" fill="#d8cdb4" opacity=".33"/>';
      }
      return out;
    },

    /* 무너진 벽 (창고 자리) */
    rubble: function (o, p) {
      var s = o.s || 1, y = (o.y || FLOOR);
      var out = '<path d="M' + esc(o.x - 260 * s) + ' ' + esc(y) +
                ' L' + esc(o.x - 210 * s) + ' ' + esc(y - 180 * s) +
                ' L' + esc(o.x - 120 * s) + ' ' + esc(y - 96 * s) +
                ' L' + esc(o.x - 40 * s) + ' ' + esc(y - 210 * s) +
                ' L' + esc(o.x + 60 * s) + ' ' + esc(y - 70 * s) +
                ' L' + esc(o.x + 150 * s) + ' ' + esc(y - 150 * s) +
                ' L' + esc(o.x + 250 * s) + ' ' + esc(y) + ' Z" fill="' + p.prop + '"/>';
      for (var i = 0; i < 7; i++) {
        out += '<rect x="' + esc(o.x - 240 * s + i * 70 * s) + '" y="' + esc(y - (14 + (i * 11) % 30) * s) +
               '" width="' + esc((30 + (i * 17) % 40) * s) + '" height="' + esc((14 + (i * 9) % 20) * s) +
               '" fill="' + p.prop2 + '"/>';
      }
      return out;
    }
  };

  /* ---------- 그리기 -------------------------------------- */
  function defs(p) {
    return '<defs>' +
      '<linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + p.wall + '"/>' +
        '<stop offset="1" stop-color="' + p.wall2 + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + p.floor + '"/>' +
        '<stop offset="1" stop-color="#05070a"/>' +
      '</linearGradient>' +
      '<linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + p.light + '" stop-opacity=".55"/>' +
        '<stop offset="1" stop-color="' + p.light + '" stop-opacity="0"/>' +
      '</linearGradient>' +
      '<radialGradient id="winGlow" cx=".5" cy=".4" r=".8">' +
        '<stop offset="0" stop-color="' + p.light + '" stop-opacity=".55"/>' +
        '<stop offset="1" stop-color="' + p.light + '" stop-opacity=".05"/>' +
      '</radialGradient>' +
      '<radialGradient id="bulbGlow" cx=".5" cy=".5" r=".5">' +
        '<stop offset="0" stop-color="' + p.warm + '" stop-opacity=".38"/>' +
        '<stop offset="1" stop-color="' + p.warm + '" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<radialGradient id="haze" cx=".5" cy=".5" r=".5">' +
        '<stop offset="0" stop-color="' + p.light + '" stop-opacity=".16"/>' +
        '<stop offset="1" stop-color="' + p.light + '" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<linearGradient id="floorLine" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="' + p.light + '" stop-opacity="0"/>' +
        '<stop offset=".5" stop-color="' + p.light + '" stop-opacity=".22"/>' +
        '<stop offset="1" stop-color="' + p.light + '" stop-opacity="0"/>' +
      '</linearGradient>' +
      '<radialGradient id="vig" cx=".5" cy=".5" r=".78">' +
        '<stop offset=".45" stop-color="#000" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#000" stop-opacity=".92"/>' +
      '</radialGradient>' +
      '</defs>';
  }

  function layer(props, p) {
    return (props || []).map(function (o) {
      var fn = PROPS[o.t];
      return fn ? fn(o, p) : '';
    }).join('');
  }

  /* 공기 중의 연기 — 천천히 흐르는 덩어리 */
  function haze(n, seed, strong) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var cx = ((seed * 31 + i * 5407) % 1900) - 150;
      var cy = 120 + ((seed + i * 977) % 520);
      var rx = 260 + ((i * 233) % 300);
      var ry = 90 + ((i * 71) % 90);
      var dur = 26 + ((i * 13) % 22);
      out += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry +
             '" fill="url(#haze)" opacity="' + (strong ? 0.9 : 0.45) + '">' +
             '<animateTransform attributeName="transform" type="translate" ' +
               'values="0 0; ' + (120 + i * 18) + ' ' + (-24 - (i % 3) * 12) + '; 0 0" ' +
               'dur="' + dur + 's" repeatCount="indefinite"/>' +
             '<animate attributeName="opacity" values="' +
               (strong ? '.35;.95;.35' : '.2;.5;.2') + '" dur="' + (dur / 2) +
               's" repeatCount="indefinite"/>' +
             '</ellipse>';
    }
    return out;
  }

  /* 바닥에 비치는 빛 — 공간이 이어져 보이게 */
  function floorGlow(p) {
    var out = '<rect x="0" y="' + FLOOR + '" width="' + W + '" height="4" fill="url(#floorLine)"/>';
    for (var i = 0; i < 7; i++) {
      var x = 90 + i * 230;
      out += '<path d="M' + x + ' ' + FLOOR + ' L' + (x - 70) + ' ' + H +
             ' L' + (x + 130) + ' ' + H + ' L' + (x + 60) + ' ' + FLOOR +
             ' Z" fill="' + p.light + '" opacity=".022"/>';
    }
    return out;
  }

  function dust(n, seed) {
    var out = '';
    for (var i = 0; i < n; i++) {
      var x = ((seed + i * 7919) % 1600);
      var y = ((seed + i * 104729) % 900);
      var r = 1 + ((i * 13) % 3) * 0.7;
      var dur = 7 + ((i * 37) % 90) / 10;
      out += '<circle class="mote" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" opacity="0">' +
             '<animate attributeName="opacity" values="0;.30;0" dur="' + dur + 's" begin="' +
             ((i * 31) % 70) / 10 + 's" repeatCount="indefinite"/>' +
             '<animate attributeName="cy" values="' + y + ';' + (y - 60 - (i % 5) * 20) + '" dur="' +
             dur + 's" begin="' + ((i * 31) % 70) / 10 + 's" repeatCount="indefinite"/>' +
             '</circle>';
    }
    return out;
  }

  /**
   * view = {
   *   pal: 'archive',
   *   back: [props...],   // 벽면 (시차 약)
   *   mid:  [props...],   // 주요 소품
   *   fore: [props...]    // 앞쪽 (시차 강)
   * }
   */
  var Stage = {};
  Stage.W = W; Stage.H = H; Stage.FLOOR = FLOOR;
  Stage.props = function () { return Object.keys(PROPS); };

  Stage.draw = function (view) {
    var p = PALETTES[view.pal] || PALETTES.archive;
    return '<svg class="set" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" ' +
      'xmlns="http://www.w3.org/2000/svg">' + defs(p) +
      /* 벽 · 바닥 */
      '<rect width="' + W + '" height="' + FLOOR + '" fill="url(#wallG)"/>' +
      '<rect y="' + FLOOR + '" width="' + W + '" height="' + (H - FLOOR) + '" fill="url(#floorG)"/>' +
      floorGlow(p) +
      '<g class="lay back" data-depth="0.25">' + layer(view.back, p) + '</g>' +
      '<g class="lay mid"  data-depth="0.6">' + layer(view.mid, p) + '</g>' +
      '<g class="haze">' + haze(view.smoke ? 7 : 4, view.seed || 17, !!view.smoke) + '</g>' +
      '<g class="lay fore" data-depth="1.15">' + layer(view.fore, p) + '</g>' +
      '<g class="motes">' + dust(26, view.seed || 17) + '</g>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#vig)" pointer-events="none"/>' +
      '</svg>';
  };

  global.Stage = Stage;
})(window);
