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


  /* ---------- 치비 인물 ------------------------------------
   *  좌표계 200 x 460, 발끝 452. 머리가 크고 색이 있는 인물.
   *  눈 깜빡임과 말할 때 입 움직임은 CSS가 맡는다(.eyes / .mouth).
   * -------------------------------------------------------- */
  var SKIN = '#f6d3b4', SKIN2 = '#e3b492', LINE = '#2b2118';

  function esc(n) { return Math.round(n * 10) / 10; }

  /* 얼굴 — 눈, 입, 볼 */
  function face(o) {
    var ey = 158, ex = 22;
    return (
      /* 볼 */
      '<ellipse class="blush" cx="' + (100 - 36) + '" cy="176" rx="11" ry="7" fill="#ef9d92" opacity=".45"/>' +
      '<ellipse class="blush" cx="' + (100 + 36) + '" cy="176" rx="11" ry="7" fill="#ef9d92" opacity=".45"/>' +
      /* 눈 */
      '<g class="eyes" fill="' + LINE + '">' +
        '<ellipse cx="' + (100 - ex) + '" cy="' + ey + '" rx="7.5" ry="9.5"/>' +
        '<ellipse cx="' + (100 + ex) + '" cy="' + ey + '" rx="7.5" ry="9.5"/>' +
      '</g>' +
      '<g fill="#fff" opacity=".9">' +
        '<circle cx="' + (100 - ex + 3) + '" cy="' + (ey - 3) + '" r="2.4"/>' +
        '<circle cx="' + (100 + ex + 3) + '" cy="' + (ey - 3) + '" r="2.4"/>' +
      '</g>' +
      /* 눈썹 */
      '<g stroke="' + LINE + '" stroke-width="3" stroke-linecap="round" opacity=".75">' +
        '<path d="M' + (100 - ex - 9) + ' 140 q9 ' + (o.brow || -4) + ' 18 0"/>' +
        '<path d="M' + (100 + ex - 9) + ' 140 q9 ' + (o.brow || -4) + ' 18 0"/>' +
      '</g>' +
      /* 입 */
      '<g class="mouth">' +
        '<path d="M92 184 q8 ' + (o.smile == null ? 7 : o.smile) + ' 16 0" fill="none" stroke="' + LINE +
        '" stroke-width="3.2" stroke-linecap="round"/>' +
      '</g>'
    );
  }

  /* 머리카락 — 남/여 */
  function hair(color, g) {
    var top =
      '<path d="M32 150 a68 68 0 0 1 136 0 q-8 -46 -68 -46 q-60 0 -68 46 Z" fill="' + color + '"/>' +
      '<path d="M36 132 q22 -34 64 -34 q42 0 64 34 q-14 -12 -30 -6 q-16 -18 -40 -12 q-24 6 -34 22 q-14 -8 -24 -4 Z" fill="' + color + '"/>';
    if (g === 'f') {
      top += '<path d="M30 146 q-6 64 6 104 q14 -10 12 -52 q-2 -34 -18 -52 Z" fill="' + color + '"/>' +
             '<path d="M170 146 q6 64 -6 104 q-14 -10 -12 -52 q2 -34 18 -52 Z" fill="' + color + '"/>' +
             '<circle cx="150" cy="112" r="19" fill="' + color + '"/>';     /* 묶은 머리 */
    }
    return top;
  }

  /* 몸통 · 팔 · 다리 */
  function body(o) {
    var top = o.top, dark = o.topDark || o.top, pants = o.pants || '#2c3550',
        shoe = o.shoes || '#241d18';
    return (
      /* 다리 */
      '<rect x="76" y="344" width="20" height="92" rx="9" fill="' + pants + '"/>' +
      '<rect x="104" y="344" width="20" height="92" rx="9" fill="' + pants + '"/>' +
      '<rect x="70" y="430" width="30" height="22" rx="9" fill="' + shoe + '"/>' +
      '<rect x="100" y="430" width="30" height="22" rx="9" fill="' + shoe + '"/>' +
      /* 몸통 */
      '<path d="M62 226 q38 -14 76 0 l10 124 q-48 12 -96 0 Z" fill="' + top + '"/>' +
      /* 팔 */
      '<rect class="armL" x="42" y="232" width="22" height="96" rx="11" fill="' + dark + '"/>' +
      '<rect class="armR" x="136" y="232" width="22" height="96" rx="11" fill="' + dark + '"/>' +
      '<circle cx="53" cy="332" r="12" fill="' + SKIN + '"/>' +
      '<circle cx="147" cy="332" r="12" fill="' + SKIN + '"/>' +
      /* 목 */
      '<rect x="88" y="200" width="24" height="30" rx="10" fill="' + SKIN2 + '"/>'
    );
  }

  /** 인물 하나 = 몸 + 머리 + 얼굴 + 직업 소품 */
  function chibi(o) {
    return '<g class="chibi">' +
      body(o) +
      '<circle cx="100" cy="150" r="68" fill="' + SKIN + '"/>' +
      hair(o.hairColor || '#3a2b22', o.g) +
      face(o) +
      (o.kit || '') +
      '</g>';
  }

  /* ---------- 직업별 ---------------------------------------- */
  var FIGURES = {

    /* 경찰 — 감청 근무복, 방검조끼, 정모 */
    police: function (c, g) {
      return chibi({
        g: g, top: '#33436e', topDark: '#2a3860', pants: '#232c46', shoes: '#1b1f2c',
        hairColor: '#2f2620',
        kit:
          /* 조끼 */
          '<path d="M66 232 q34 -12 68 0 l6 78 q-40 10 -80 0 Z" fill="#1a2030"/>' +
          '<rect x="70" y="262" width="60" height="9" rx="4" fill="#0f1420"/>' +
          '<rect x="118" y="246" width="14" height="26" rx="4" fill="#0f1420"/>' +
          /* 정모 */
          '<path d="M34 118 q66 -40 132 0 q-8 -44 -66 -44 q-58 0 -66 44 Z" fill="#20293f"/>' +
          '<rect x="28" y="112" width="144" height="16" rx="8" fill="#161c2c"/>' +
          '<circle cx="100" cy="94" r="10" fill="' + c + '"/>' +
          /* 어깨 견장 */
          '<rect x="44" y="234" width="22" height="9" rx="4" fill="' + c + '"/>' +
          '<rect x="134" y="234" width="22" height="9" rx="4" fill="' + c + '"/>'
      });
    },

    /* 소방관 — 방화복, 형광 반사띠, 헬멧 */
    fire: function (c, g) {
      return chibi({
        g: g, top: '#b79463', topDark: '#a38256', pants: '#8f7349', shoes: '#2a2119',
        hairColor: '#43301f',
        kit:
          '<rect x="60" y="276" width="82" height="11" rx="5" fill="#f4d64e"/>' +
          '<rect x="58" y="296" width="86" height="8" rx="4" fill="#cfe8f5" opacity=".85"/>' +
          '<rect x="40" y="268" width="26" height="10" rx="5" fill="#f4d64e"/>' +
          '<rect x="134" y="268" width="26" height="10" rx="5" fill="#f4d64e"/>' +
          /* 헬멧 */
          '<path d="M32 142 a68 62 0 0 1 136 0 q-10 -18 -68 -18 q-58 0 -68 18 Z" fill="' + c + '"/>' +
          '<rect x="24" y="136" width="152" height="16" rx="8" fill="#8f3b1c"/>' +
          '<rect x="86" y="86" width="28" height="30" rx="6" fill="#f4d64e"/>'
      });
    },

    /* 군인 — 전투복, 베레, 태극기 패치 */
    army: function (c, g) {
      return chibi({
        g: g, top: '#6e7c55', topDark: '#5e6a49', pants: '#5a664a', shoes: '#26291f',
        hairColor: '#2b2a20',
        kit:
          /* 위장 얼룩 */
          '<g fill="#4e5a3c" opacity=".85">' +
            '<ellipse cx="80" cy="252" rx="13" ry="9"/>' +
            '<ellipse cx="122" cy="276" rx="15" ry="10"/>' +
            '<ellipse cx="92" cy="304" rx="12" ry="8"/>' +
          '</g>' +
          /* 태극기 패치 */
          '<rect x="132" y="246" width="18" height="12" rx="2" fill="#f3f0ea"/>' +
          '<circle cx="141" cy="252" r="4" fill="#c3423f"/>' +
          /* 베레 */
          '<path d="M32 126 q34 -46 96 -40 q30 4 40 22 q-14 26 -74 30 q-46 2 -62 -12 Z" fill="#333c28"/>' +
          '<circle cx="146" cy="112" r="8" fill="' + c + '"/>'
      });
    },

    /* 의사 — 흰 가운, 스크럽, 청진기 */
    doctor: function (c, g) {
      return chibi({
        g: g, top: '#3c5578', topDark: '#334a69', pants: '#33496a', shoes: '#e9edf1',
        hairColor: '#35271f',
        kit:
          /* 가운 */
          '<path d="M58 230 q14 -8 24 -10 l6 120 q-24 4 -34 0 Z" fill="#f4f7fa"/>' +
          '<path d="M142 230 q-14 -8 -24 -10 l-6 120 q24 4 34 0 Z" fill="#f4f7fa"/>' +
          /* 청진기 */
          '<path d="M84 214 q0 52 16 60 q16 -8 16 -60" fill="none" stroke="#c9d3dc" stroke-width="6" stroke-linecap="round"/>' +
          '<circle cx="100" cy="280" r="10" fill="' + c + '"/>' +
          /* 사원증 */
          '<rect x="122" y="272" width="16" height="22" rx="3" fill="#eef2f6"/>'
      });
    },

    /* 한상철 — 환자복, 산소 캐뉼라 */
    sangchul: function (c, g) {
      return chibi({
        g: g, top: '#9fb3bd', topDark: '#8ea3ae', pants: '#8ea3ae', shoes: '#5c6a72',
        hairColor: '#9a9a96', brow: 4, smile: 2,
        kit:
          '<path d="M78 176 q22 12 44 0" fill="none" stroke="#dfe7ec" stroke-width="4"/>' +
          '<path d="M78 176 q-16 40 -8 74" fill="none" stroke="#dfe7ec" stroke-width="4"/>' +
          '<rect x="66" y="244" width="68" height="7" rx="3" fill="#8ba0ab"/>'
      });
    },

    soldier: function (c, g) {
      return chibi({ g: g, top: '#77855e', topDark: '#67734f', pants: '#5f6b4d',
        shoes: '#26291f', hairColor: '#2f2b22', smile: 3 });
    },
    rookie: function (c, g) {
      return chibi({ g: g, top: '#c0a06e', topDark: '#ab8d5f', pants: '#93794f',
        shoes: '#2a2119', hairColor: '#3d2c1e',
        kit: '<rect x="60" y="280" width="80" height="9" rx="4" fill="#f4d64e"/>' });
    },
    partner: function (c, g) {
      return chibi({ g: g || 'f', top: '#3b4c78', topDark: '#324068', pants: '#28304a',
        shoes: '#1b1f2c', hairColor: '#33261e',
        kit: '<path d="M66 232 q34 -12 68 0 l6 74 q-40 10 -80 0 Z" fill="#1c2333"/>' });
    },
    elder: function (c, g) {
      return chibi({ g: g, top: '#8a7f6d', topDark: '#786e5e', pants: '#6c6355',
        shoes: '#3b352c', hairColor: '#c9c6bd', brow: 3, smile: 1 });
    },
    jeonghan: function (c, g) {
      return chibi({ g: g, top: '#4a4152', topDark: '#3e3646', pants: '#332e3c',
        shoes: '#241f2a', hairColor: '#241c18', brow: 5, smile: -3 });
    },
    chief: function (c, g) {
      return chibi({ g: g, top: '#565f6d', topDark: '#4a525e', pants: '#3d4550',
        shoes: '#22262c', hairColor: '#3a332c', brow: 2 });
    },
    nurse: function (c, g) {
      return chibi({ g: g || 'f', top: '#5fb9ac', topDark: '#52a396', pants: '#4a8f85',
        shoes: '#eef3f4', hairColor: '#2f2620' });
    },
    family: function (c, g) {
      return chibi({ g: g || 'f', top: '#a97f7f', topDark: '#956f6f', pants: '#6f5555',
        shoes: '#3a2d2d', hairColor: '#2c221c', smile: 2 });
    },
    radio: function () { return ''; },
    other: function (c, g) {
      return chibi({ g: g, top: '#6b7382', topDark: '#5c636f', pants: '#4b515b',
        shoes: '#2a2d33', hairColor: '#332c26' });
    }
  };

  /** key: 인물, g: 'm'|'f' (내 캐릭터는 플레이어가 고른 성별로) */
  Cast.figure = function (key, g) {
    var fn = FIGURES[key] || FIGURES.other;
    var look = Cast.look(key);
    return '<svg class="fig" viewBox="0 0 200 460" xmlns="http://www.w3.org/2000/svg" ' +
           'preserveAspectRatio="xMidYMax meet" aria-hidden="true">' +
           '<ellipse cx="100" cy="452" rx="60" ry="11" fill="#000" opacity=".32"/>' +
           fn(look.rim, g === 'f' ? 'f' : 'm') + '</svg>';
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
