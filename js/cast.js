/* =========================================================
 *  cast.js — 대사 장면의 인물과 무대
 *  ---------------------------------------------------------
 *  누가 말하면 그 사람이 앞으로 나오고, 나머지는 뒤로 물러난다.
 *  인물은 실루엣 + 직업색 림라이트로만 그린다(이미지 파일 0개).
 *
 *    Cast.who('도현')      → 'police'
 *    Cast.figure('police') → SVG 문자열
 *    Cast.backdrop(scene)  → 그 장면에 어울리는 무대(Stage용 view)
 * ========================================================= */
(function (global) {
  'use strict';

  var Cast = {};

  /* ---------- 이름 → 인물 -------------------------------- */
  var BY_NAME = {
    '도현': 'police', '이도현': 'police',
    '민재': 'fire', '강민재': 'fire',
    '태오': 'army', '윤태오': 'army',
    '하은': 'doctor', '서하은': 'doctor',
    '한상철': 'sangchul',
    '세환': 'soldier', '김세환 일병': 'soldier',
    '지훈': 'rookie',
    '수경': 'partner',
    '노인': 'elder', '박정한': 'jeonghan',
    '진 반장': 'chief', '소대장': 'chief', '대대장': 'chief',
    '과장': 'chief', '지휘': 'chief', '당직의': 'chief',
    '간호사': 'nurse', '보호자': 'family', '무전': 'radio'
  };

  Cast.who = function (name) {
    return BY_NAME[String(name || '').trim()] || 'other';
  };

  /* ---------- 인물별 색 / 표시 --------------------------- */
  var LOOK = {
    police:   { rim: '#4a7cff', label: '이도현' },
    fire:     { rim: '#ff6a3d', label: '강민재' },
    army:     { rim: '#7ea366', label: '윤태오' },
    doctor:   { rim: '#39b8a6', label: '서하은' },
    sangchul: { rim: '#e0b26a', label: '한상철' },
    soldier:  { rim: '#9bb37f', label: '김세환' },
    rookie:   { rim: '#ff9a6a', label: '지훈' },
    partner:  { rim: '#7c9fff', label: '진수경' },
    elder:    { rim: '#b0a48c', label: '노인' },
    jeonghan: { rim: '#8c7f9e', label: '박정한' },
    chief:    { rim: '#9aa3b2', label: '' },
    nurse:    { rim: '#6fd0c4', label: '' },
    family:   { rim: '#c8a0a0', label: '' },
    radio:    { rim: '#9aa3b2', label: '' },
    other:    { rim: '#9aa3b2', label: '' }
  };
  Cast.look = function (key) { return LOOK[key] || LOOK.other; };

  /* ---------- 실루엣 부품 -------------------------------- */
  /* 좌표계: 200 x 460, 발끝이 460 */
  var BODY = '#05070b';   /* 배경보다 어둡게 — 실루엣으로 읽히도록 */

  function head(cx, cy, r, extra) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + BODY + '"/>' + (extra || '');
  }

  /* 어깨에서 아래로 떨어지는 몸통 — w는 어깨 너비 */
  function torso(w, top, bottom, flare) {
    var cx = 100, half = w / 2, foot = half + (flare || 0);
    return '<path d="M' + (cx - half) + ' ' + top +
           ' Q' + cx + ' ' + (top - 14) + ' ' + (cx + half) + ' ' + top +
           ' L' + (cx + foot) + ' ' + bottom +
           ' L' + (cx - foot) + ' ' + bottom + ' Z" fill="' + BODY + '"/>';
  }

  function legs(top, bottom, w) {
    w = w || 22;
    return '<rect x="' + (100 - w - 6) + '" y="' + top + '" width="' + w + '" height="' + (bottom - top) + '" fill="' + BODY + '"/>' +
           '<rect x="' + (100 + 6) + '" y="' + top + '" width="' + w + '" height="' + (bottom - top) + '" fill="' + BODY + '"/>';
  }

  function rim(d, color) {
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="4.2" ' +
           'stroke-linecap="round" opacity="1"/>';
  }

  /* ---------- 인물 ---------------------------------------- */
  var FIGURES = {

    /* 경찰 — 각진 어깨, 무전기, 짧은 머리 */
    police: function (c) {
      return head(100, 62, 30) +
        '<rect x="70" y="34" width="60" height="14" rx="6" fill="' + BODY + '"/>' +   /* 짧은 머리 */
        torso(96, 100, 300, 6) + legs(300, 452) +
        '<rect x="128" y="128" width="16" height="34" rx="4" fill="' + BODY + '"/>' + /* 무전기 */
        '<path d="M136 128 L136 108" stroke="' + BODY + '" stroke-width="4"/>' +
        rim('M52 104 Q64 88 78 82', c) +
        rim('M52 108 L46 296', c) +
        rim('M78 44 Q100 26 122 44', c);
    },

    /* 소방관 — 넓은 어깨, 반사띠 두 줄, 손에 든 헬멧 */
    fire: function (c) {
      return head(100, 60, 31) +
        torso(112, 100, 306, 10) + legs(306, 452, 26) +
        '<rect x="44" y="176" width="112" height="9" fill="' + c + '" opacity=".55"/>' +
        '<rect x="42" y="206" width="116" height="9" fill="' + c + '" opacity=".38"/>' +
        /* 옆으로 든 헬멧 */
        '<path d="M156 268 a26 22 0 0 1 52 0 z" fill="' + BODY + '"/>' +
        '<rect x="150" y="264" width="64" height="8" rx="4" fill="' + BODY + '"/>' +
        rim('M44 106 Q60 86 80 80', c) +
        rim('M44 110 L40 302', c);
    },

    /* 군인 — 베레모, 곧은 자세, 견장 */
    army: function (c) {
      return head(100, 62, 29) +
        '<path d="M70 46 Q100 22 132 40 Q124 52 70 52 Z" fill="' + BODY + '"/>' +  /* 베레 */
        torso(100, 102, 298, 4) + legs(298, 452, 24) +
        '<rect x="52" y="112" width="30" height="8" rx="3" fill="' + c + '" opacity=".5"/>' +
        '<rect x="118" y="112" width="30" height="8" rx="3" fill="' + c + '" opacity=".5"/>' +
        rim('M50 108 Q62 90 78 84', c) +
        rim('M50 112 L48 294', c) +
        rim('M100 300 L100 452', c);
    },

    /* 의사 — 가운(밝은 실루엣), 청진기 */
    doctor: function (c) {
      return head(100, 60, 28) +
        '<path d="M72 40 Q100 24 130 42 Q132 64 126 76 L74 76 Q68 60 72 40 Z" fill="' + BODY + '"/>' +
        torso(90, 98, 240, 0) +
        '<path d="M56 240 L144 240 L156 372 L44 372 Z" fill="#e9eef2" opacity=".16"/>' +  /* 가운 자락 */
        '<path d="M56 240 L144 240 L156 372 L44 372 Z" fill="none" stroke="' + c + '" stroke-width="2" opacity=".5"/>' +
        legs(372, 452, 20) +
        '<path d="M86 100 Q86 150 100 158 Q114 150 114 100" fill="none" stroke="' + c +
        '" stroke-width="4" opacity=".8"/>' +                                        /* 청진기 */
        rim('M56 104 Q68 88 82 82', c);
    },

    /* 한상철 — 침대에 앉은 야윈 실루엣, 산소 캐뉼라 */
    sangchul: function (c) {
      return '<rect x="20" y="330" width="180" height="18" rx="6" fill="' + BODY + '"/>' +  /* 침대 */
        '<rect x="26" y="348" width="14" height="88" fill="' + BODY + '"/>' +
        '<rect x="160" y="348" width="14" height="88" fill="' + BODY + '"/>' +
        head(100, 190, 27) +
        '<path d="M76 218 Q100 206 124 218 L136 330 L64 330 Z" fill="' + BODY + '"/>' +
        '<path d="M64 330 Q100 318 190 334 L190 348 L64 348 Z" fill="' + BODY + '" opacity=".8"/>' +
        '<path d="M88 198 Q100 210 112 198" fill="none" stroke="' + c + '" stroke-width="3" opacity=".8"/>' +
        '<path d="M112 200 Q150 214 150 300" fill="none" stroke="' + c +
        '" stroke-width="2.6" opacity=".55"/>' +
        rim('M74 224 L66 326', c);
    },

    /* 병사 — 전투모, 좁은 어깨 */
    soldier: function (c) {
      return head(100, 66, 27) +
        '<path d="M72 50 L128 50 L132 60 L68 60 Z" fill="' + BODY + '"/>' +
        '<rect x="66" y="46" width="68" height="8" rx="4" fill="' + BODY + '"/>' +
        torso(88, 106, 298, 2) + legs(298, 452, 22) +
        rim('M56 112 Q66 96 80 90', c);
    },

    /* 신참 대원 — 헬멧 쓴 채 */
    rookie: function (c) {
      return '<path d="M68 60 a32 28 0 0 1 64 0 z" fill="' + BODY + '"/>' +
        '<rect x="60" y="56" width="80" height="10" rx="5" fill="' + BODY + '"/>' +
        head(100, 78, 24) +
        torso(102, 112, 300, 8) + legs(300, 452, 24) +
        '<rect x="50" y="180" width="100" height="8" fill="' + c + '" opacity=".45"/>' +
        rim('M50 118 Q62 100 78 94', c);
    },

    /* 후배 형사 — 묶은 머리 */
    partner: function (c) {
      return head(100, 62, 27) +
        '<path d="M74 44 Q100 26 128 44 Q128 58 122 66 L78 66 Q72 56 74 44 Z" fill="' + BODY + '"/>' +
        '<circle cx="132" cy="72" r="13" fill="' + BODY + '"/>' +
        torso(88, 102, 296, 4) + legs(296, 452, 21) +
        rim('M58 108 Q68 92 82 86', c);
    },

    /* 노인 — 굽은 등 */
    elder: function (c) {
      return head(96, 106, 26) +
        '<path d="M70 132 Q96 120 122 136 L142 320 L62 320 Z" fill="' + BODY + '"/>' +
        legs(320, 452, 20) +
        '<path d="M146 150 L152 452" stroke="' + BODY + '" stroke-width="7"/>' +  /* 지팡이 */
        rim('M70 138 Q78 126 92 122', c);
    },

    /* 박정한 — 후드, 웅크린 어깨 */
    jeonghan: function (c) {
      return '<path d="M66 74 Q100 40 134 74 Q136 100 128 110 L72 110 Q64 96 66 74 Z" fill="' + BODY + '"/>' +
        head(100, 82, 25) +
        '<path d="M70 110 Q100 100 130 110 L142 300 L58 300 Z" fill="' + BODY + '"/>' +
        legs(300, 452, 22) +
        rim('M70 116 L60 296', c);
    },

    /* 상급자 / 그 외 — 정장 실루엣 */
    chief: function (c) {
      return head(100, 62, 28) +
        torso(94, 100, 300, 4) + legs(300, 452, 22) +
        '<path d="M100 104 L94 140 L100 152 L106 140 Z" fill="' + c + '" opacity=".45"/>' +
        rim('M54 106 Q66 90 80 84', c);
    },

    nurse: function (c) { return FIGURES.doctor(c); },
    family: function (c) { return FIGURES.elder(c); },
    radio: function (c) { return FIGURES.chief(c); },
    other: function (c) { return FIGURES.chief(c); }
  };

  Cast.figure = function (key) {
    var look = Cast.look(key);
    var draw = FIGURES[key] || FIGURES.other;
    return '<svg class="fig" viewBox="0 0 200 460" xmlns="http://www.w3.org/2000/svg" ' +
      'preserveAspectRatio="xMidYMax meet" aria-hidden="true">' +
      '<ellipse cx="100" cy="452" rx="66" ry="12" fill="#000" opacity=".45"/>' +
      draw(look.rim) +
      '</svg>';
  };

  /* ---------- 장면에 나오는 인물 -------------------------- */
  Cast.speakers = function (scene) {
    var seen = [], out = [];
    (scene.text || []).forEach(function (raw) {
      if (!Array.isArray(raw)) return;
      var k = Cast.who(raw[0]);
      if (k === 'radio') return;              // 무전은 목소리만
      if (seen.indexOf(k) >= 0) return;
      seen.push(k); out.push({ key: k, name: raw[0] });
    });
    return out.slice(0, 4);
  };

  /* ---------- 장면 → 무대 --------------------------------
   *  57개 장면에 배경을 일일이 붙이는 대신, 장소 이름에서 고른다.
   *  (씬에 view 가 직접 있으면 그걸 쓴다)
   * ------------------------------------------------------- */
  var F = Stage.FLOOR;

  var SETS = {
    office: { pal: 'archive', seed: 5,
      back: [{ t: 'striplight', x: 760, y: 70, s: 1.1 }, { t: 'clock', x: 1420, y: 200, s: .9 }],
      mid: [{ t: 'cabinet', x: 250, y: F, s: .95 }, { t: 'desk', x: 620, y: F, s: 1 },
            { t: 'board', x: 1180, y: 230, s: .9 }],
      fore: [{ t: 'chair', x: 1460, y: F + 70, s: 1.2 }] },

    street: { pal: 'archive', seed: 13,
      back: [{ t: 'window', x: 280, y: 150, s: .9, blind: true }, { t: 'window', x: 1300, y: 160, s: .8 }],
      mid: [{ t: 'door', x: 760, y: F, s: 1.1 }, { t: 'boxes', x: 1120, y: F, s: 1 }],
      fore: [{ t: 'rubble', x: 220, y: F + 110, s: .8 }] },

    fire: { pal: 'station', seed: 23, smoke: true,
      back: [{ t: 'window', x: 1240, y: 120, s: 1.2 }],
      mid: [{ t: 'rubble', x: 620, y: F, s: 1.1 }, { t: 'door', x: 1080, y: F, s: 1 }],
      fore: [{ t: 'boxes', x: 210, y: F + 120, s: 1.3 }] },

    station: { pal: 'station', seed: 31,
      back: [{ t: 'striplight', x: 880, y: 76, s: 1 }, { t: 'pipes', x: 0, y: 30, s: 1 }],
      mid: [{ t: 'lockers', x: 340, y: F, n: 3, s: .95 }, { t: 'hosereel', x: 1180, y: 380, s: .9 }],
      fore: [{ t: 'helmet', x: 1420, y: F - 30, s: 1.1 }] },

    ward: { pal: 'ward', seed: 43,
      back: [{ t: 'striplight', x: 560, y: 70, s: 1 }, { t: 'window', x: 1360, y: 150, s: 1 }],
      mid: [{ t: 'bed', x: 820, y: F, s: .9 }, { t: 'ivstand', x: 420, y: F, s: 1 }],
      fore: [{ t: 'chair', x: 200, y: F + 80, s: 1.1 }] },

    barrack: { pal: 'barrack', seed: 57,
      back: [{ t: 'striplight', x: 800, y: 74, s: 1 }, { t: 'board', x: 1300, y: 220, s: .9 }],
      mid: [{ t: 'lockers', x: 380, y: F, n: 4, s: .9 }, { t: 'desk', x: 1000, y: F, s: .95 }],
      fore: [{ t: 'boxes', x: 1500, y: F + 90, s: 1 }] },

    hill: { pal: 'warehouse', seed: 67,
      back: [{ t: 'window', x: 1330, y: 130, s: 1.25 }],
      mid: [{ t: 'rubble', x: 700, y: F, s: 1.15 }, { t: 'board', x: 1180, y: 300, s: .8 }],
      fore: [{ t: 'boxes', x: 190, y: F + 120, s: 1.35 }] },

    warm: { pal: 'warehouse', seed: 79,
      back: [{ t: 'bulb', x: 500, y: 110, s: 1.1 }, { t: 'bulb', x: 1080, y: 130, s: .9 }],
      mid: [{ t: 'desk', x: 780, y: F, s: 1.15 }],
      fore: [{ t: 'chair', x: 280, y: F + 70, s: 1.2 }, { t: 'chair', x: 1300, y: F + 60, s: 1.15 }] },

    summer: { pal: 'warehouse', seed: 91,
      back: [{ t: 'window', x: 1280, y: 140, s: 1.15 }],
      mid: [{ t: 'shelf', x: 360, y: F, s: 1 }, { t: 'boxes', x: 820, y: F, s: 1.15 },
            { t: 'door', x: 1160, y: F, s: 1.05 }],
      fore: [{ t: 'rubble', x: 1480, y: F + 70, s: .75 }] }
  };

  var RULES = [
    [/창고|언덕|철거|해원동$|골목/, 'hill'],
    [/화재|현장|산|능선|진입로|가옥|불/, 'fire'],
    [/소방서|보관실|차고/, 'station'],
    [/병원|응급|요양|중환자|처치|의국|병동/, 'ward'],
    [/부대|대대|사단|생활관|사격장|위병소|행정실|상황실|징계/, 'barrack'],
    [/경찰서|자료실|형사/, 'office'],
    [/포장마차/, 'warm'],
    [/반지하|방$|집/, 'street']
  ];

  Cast.backdrop = function (scene) {
    if (scene.view) return scene.view;
    var place = String(scene.place || '');
    for (var i = 0; i < RULES.length; i++) {
      if (RULES[i][0].test(place)) return SETS[RULES[i][1]];
    }
    if (scene.mood === 'summer') return SETS.summer;
    if (scene.mood === 'fire') return SETS.fire;
    if (scene.mood === 'warm') return SETS.warm;
    if (scene.mood === 'cold') return SETS.ward;
    if (scene.mood === 'dawn') return SETS.hill;
    return SETS.office;
  };

  Cast.sets = function () { return Object.keys(SETS); };

  global.Cast = Cast;
})(window);
