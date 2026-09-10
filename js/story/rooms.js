/* =========================================================
 *  story/rooms.js — 1인칭으로 둘러보는 공간
 *  ---------------------------------------------------------
 *  type:'look' 씬. 마우스로 공간을 훑고, 사물을 하나씩 살펴본다.
 *  살펴보는 행위 자체가 엔진에서는 '선택'이라, 저장·멀티가 그대로 따라온다.
 *
 *  hotspot = { id, hx, hy (화면 %), label, text[], doc, add, set, world, req }
 *  나가기는 choices 에 둔다. 대개 두세 군데는 보고 나가야 문이 열린다.
 * ========================================================= */
(function () {
  'use strict';

  var F = Stage.FLOOR;

  Story.register([

  /* ================= 프롤로그 · 불타는 창고 ================= */
  {
    id: 'room_warehouse', type: 'look', at: 0.03,
    chapter: '프롤로그 · 그해 여름', place: '해원동 목재창고 · 15년 전',
    mood: 'fire', amb: 'fire',
    intro: [
      '연기는 위에서 내려왔다. 바닥에 엎드리면 아직 숨을 쉴 수 있었다.',
      '넷은 서로의 손목을 잡고 있었다. 놓으면 안 된다는 것만 알았다.'
    ],
    hint: '연기 속을 더듬어 본다',
    view: {
      pal: 'warehouse', seed: 3, smoke: true,
      back: [{ t: 'window', x: 1290, y: 130, s: 1.1 }, { t: 'pipes', x: 0, y: 40, s: 1 }],
      mid: [{ t: 'shelf', x: 330, y: F, s: 1.05 }, { t: 'boxes', x: 760, y: F, s: 1.2 },
            { t: 'door', x: 1120, y: F, s: 1.1 }],
      fore: [{ t: 'boxes', x: 180, y: F + 90, s: 1.5 }, { t: 'rubble', x: 1420, y: F + 60, s: 0.8 }]
    },
    hotspots: [
      { id: 'door', hx: 70, hy: 55, label: '문 — 밀어본다',
        text: ['밖에서 무언가 걸려 있다. 열두 살 넷이 매달려도 꿈쩍하지 않는다.',
               '문틈으로 들어오는 건 바람이 아니라 열이었다.'],
        add: { scar: 1 } },
      { id: 'hands', hx: 24, hy: 72, label: '옆 사람의 손목을 잡는다',
        text: ['하은의 손목, 민재의 손목, 태오의 손목, 도현의 손목.',
               '누가 누구를 잡았는지는 지금도 정확히 기억나지 않는다.',
               '다만 넷 다 놓지 않았다는 것만 남았다.'],
        add: { bond: 2, memory: 1 } },
      { id: 'window', hx: 80, hy: 22, label: '높은 창 — 올려다본다',
        text: ['창은 너무 높고, 아래에 디딜 것이 없다.',
               '빛이 들어오는 곳이 나가는 곳은 아니었다.'] },
      { id: 'wall', hx: 45, hy: 62, label: '벽 쪽에서 나는 소리',
        text: ['쿵. 쿵. 규칙적이지 않은, 사람이 내는 소리.',
               '누군가 바깥에서 벽을 뜯고 있었다.',
               '판자 한 장이 뜯겨 나가고, 연기가 그쪽으로 빨려 나갔다.'],
        add: { memory: 1 }, set: { saw_wall: true } },
      { id: 'arm', hx: 46, hy: 50, label: '뜯긴 틈으로 들어온 팔',
        req: { flag: 'saw_wall' },
        text: ['맨팔이었다. 장갑도, 소매도 없었다.',
               '그 팔이 제일 가까이 있던 아이의 옷깃을 잡아 밖으로 밀어냈다.',
               '그리고 다시 들어왔다. 네 번.'],
        add: { memory: 1, faith: 1 }, world: 'w_name_hint' }
    ],
    choices: [
      { id: 'room_warehouse:out', t: '밖으로 밀려 나간다', req: { seenIn: 'room_warehouse', min: 2 },
        to: 'pro_3' }
    ]
  },

  /* ================= 경찰 · 미제 자료실 ================= */
  {
    id: 'room_p_archive', type: 'look', at: 0.26,
    chapter: '2화 · 빈칸', place: '해원경찰서 미제 자료실 · 새벽 02:40',
    mood: 'night', amb: 'archive',
    intro: [
      '지하 자료실은 냉방이 들어오지 않는다. 종이와 먼지 냄새가 층을 이루고 있었다.',
      '15년 전 8월 상자는 제일 아래 칸에 있었다.'
    ],
    hint: '상자를 열어본다',
    view: {
      pal: 'archive', seed: 11,
      back: [{ t: 'striplight', x: 800, y: 70, s: 1.2 }, { t: 'clock', x: 1380, y: 210, s: 1 }],
      mid: [{ t: 'shelf', x: 300, y: F, s: 1 }, { t: 'cabinet', x: 700, y: F, s: 1 },
            { t: 'cabinet', x: 850, y: F, s: 1 }, { t: 'desk', x: 1200, y: F, s: 1 }],
      fore: [{ t: 'boxes', x: 130, y: F + 110, s: 1.3 }]
    },
    hotspots: [
      { id: 'box', hx: 19, hy: 76, label: '15년 전 8월 상자',
        text: ['테이프가 삭아서 손을 대자마자 갈라졌다.',
               '안에는 서류철 하나. 「해원동 목재창고 화재」.'],
        doc: 'd_police_case', add: { memory: 1 }, set: { read_case: true } },
      { id: 'annex', hx: 44, hy: 58, label: '캐비닛 — 「별지」 서류철',
        req: { flag: 'read_case' },
        text: ['별지가 누락됐다고 적힌 그 별지가, 엉뚱한 캐비닛에 꽂혀 있었다.',
               '15년 동안 아무도 찾지 않았기 때문에 아무도 없앨 생각을 하지 않은 것이다.'],
        doc: 'd_police_names', add: { memory: 1, bond: 1 }, world: 'w_name_hint' },
      { id: 'order', hx: 53, hy: 44, label: '종결 지시 공문',
        text: ['「상급 지시에 의한 종결」. 지시한 사람의 직위는 있고 이름은 없다.',
               '결재란의 도장은 번져서 읽히지 않는다.'],
        add: { faith: 1 }, set: { chased_order: true } },
      { id: 'lamp', hx: 50, hy: 8, label: '깜빡이는 형광등',
        text: ['3초에 한 번씩 어두워진다. 그때마다 상자 그림자가 벽에서 한 뼘씩 자란다.'] },
      { id: 'desk', hx: 75, hy: 62, label: '먼지 쌓인 열람대',
        text: ['마지막 열람 기록: 15년 전 09월.',
               '그 아래 이름 칸에는 지금 이도현이 자기 이름을 적고 있다.'],
        add: { faith: 1 } }
    ],
    choices: [
      { id: 'room_p_archive:out', t: '상자를 안고 자료실을 나선다',
        req: { seenIn: 'room_p_archive', min: 2 }, to: 'police_5' }
    ]
  },

  /* ================= 경찰 · 박정한의 방 ================= */
  {
    id: 'room_p_flat', type: 'look', at: 0.46,
    chapter: '4화 · 손', place: '박정한의 반지하 방',
    mood: 'cold', amb: 'night',
    intro: [
      '수색영장은 오후에 나왔다. 반지하 방은 한 평 반, 창은 사람 머리 높이에 있었다.',
      '이런 방에 사는 사람이 세 번 불을 질렀다.'
    ],
    hint: '방을 살펴본다',
    view: {
      pal: 'archive', seed: 29,
      back: [{ t: 'window', x: 1180, y: 120, s: 0.8, blind: true }],
      mid: [{ t: 'desk', x: 520, y: F, s: 0.9 }, { t: 'boxes', x: 900, y: F, s: 0.9 },
            { t: 'board', x: 250, y: 250, s: 0.9 }],
      fore: [{ t: 'chair', x: 700, y: F + 60, s: 1.1 }]
    },
    hotspots: [
      { id: 'board', hx: 15, hy: 32, label: '벽에 붙은 신문 스크랩',
        text: ['15년 전 지역신문 한 장. 「해원동 창고 화재, 인명피해 없어」.',
               '기사 아래 여백에 볼펜으로 눌러 쓴 글씨.',
               '「우리 아버지 아니다」'],
        add: { memory: 1 }, set: { saw_clipping: true } },
      { id: 'desk', hx: 33, hy: 60, label: '책상 위 수첩',
        text: ['날짜와 주소가 적혀 있다. 세 번의 화재, 그리고 네 번째 예정지.',
               '마지막 줄은 언덕 위 창고 자리다.'],
        doc: 'd_police_memo', add: { faith: 1 }, set: { knows_next: true }, world: 'w_police_tip' },
      { id: 'photo', hx: 56, hy: 66, label: '엎어놓은 액자',
        text: ['가족사진. 창고 앞에서 찍은 것이다. 남자와 어린 아들.',
               '유리에 금이 가 있고, 먼지가 앞면에만 쌓여 있다.',
               '누군가 오래 엎어두었다는 뜻이다.'],
        add: { scar: 1 } },
      { id: 'medicine', hx: 62, hy: 55, label: '약봉지',
        text: ['수면제. 처방 날짜가 올해 것부터 3년 전 것까지 섞여 있다.'],
        add: { scar: 1 } },
      { id: 'window', hx: 74, hy: 24, label: '머리 높이의 창',
        text: ['창밖으로 보이는 건 사람들의 발목뿐이다.',
               '이 각도에서 15년을 봤으면, 세상이 발목으로만 기억될 것 같았다.'] }
    ],
    choices: [
      { id: 'room_p_flat:out', t: '방을 나선다', req: { seenIn: 'room_p_flat', min: 2 },
        to: 'police_8' }
    ]
  },

  /* ================= 소방 · 장비보관실 ================= */
  {
    id: 'room_f_gear', type: 'look', at: 0.31,
    chapter: '2화 · 보관실', place: '해원소방서 장비보관실',
    mood: 'night', amb: 'archive',
    intro: [
      '보관실은 방화복 냄새가 난다. 탄 냄새와 세제 냄새가 섞인, 그 직업만의 냄새.',
      '헬멧은 아직 손에 들려 있었다.'
    ],
    hint: '보관실을 뒤진다',
    view: {
      pal: 'station', seed: 7,
      back: [{ t: 'striplight', x: 900, y: 80, s: 1 }, { t: 'pipes', x: 0, y: 30, s: 1 }],
      mid: [{ t: 'lockers', x: 380, y: F, n: 4, s: 1 }, { t: 'hosereel', x: 1150, y: 400, s: 1 },
            { t: 'shelf', x: 820, y: F, s: 0.9 }],
      fore: [{ t: 'helmet', x: 1380, y: F - 40, s: 1.2 }]
    },
    hotspots: [
      { id: 'helmet', hx: 86, hy: 66, label: '일그러진 헬멧 「해원 3-7」',
        text: ['앞면이 녹아 한쪽으로 흘러내렸다. 내피 안쪽, 유성펜 두 글자. 「상철」.',
               '민재는 이 헬멧을 열두 살 여름에 본 적이 있다. 담벼락 옆 땅바닥에서.'],
        doc: 'd_fire_helmet', add: { memory: 1 }, set: { traced_helmet: true } },
      { id: 'log', hx: 51, hy: 52, label: '캐비닛 — 출동기록부 원부',
        text: ['15년 전 8월. 종이가 눌려 있어서 페이지가 저절로 그 날짜에서 멈춘다.',
               '누군가 이 페이지를 여러 번 폈다는 뜻이다.'],
        doc: 'd_fire_dispatch', add: { memory: 1, faith: 1 }, world: ['w_fire_report', 'w_name_hint'] },
      { id: 'locker', hx: 24, hy: 55, label: '이름표가 떼어진 사물함',
        text: ['네 번째 칸. 이름표 자리에 접착제 자국만 남아 있다.',
               '안은 비어 있고, 바닥에 마른 은행잎 한 장이 있다.'],
        add: { scar: 1 } },
      { id: 'jihun', hx: 62, hy: 62, label: '지훈의 방화복',
        text: ['어깨가 녹아 굳었다. 세탁을 세 번 돌려도 그 자국은 지워지지 않는다.',
               '민재는 자기 방화복 어깨를 한 번 만져봤다.'],
        add: { bond: 1 } },
      { id: 'reel', hx: 72, hy: 44, label: '호스릴',
        text: ['감은 지 오래된 호스는 접힌 자리에서 갈라진다.',
               '사람도 같은 자리에서 갈라진다는 걸, 이 일을 하면 알게 된다.'] }
    ],
    choices: [
      { id: 'room_f_gear:out', t: '헬멧을 들고 나온다', req: { seenIn: 'room_f_gear', min: 2 },
        to: 'fire_5' }
    ]
  },

  /* ================= 소방 · 언덕 위 마지막 집 ================= */
  {
    id: 'room_f_house', type: 'look', at: 0.60,
    chapter: '5화 · 3분', place: '언덕 위 마지막 가옥 · 잔여 3분',
    mood: 'fire', amb: 'fire',
    intro: [
      '집 안에 사람은 없었다. 이웃이 먼저 업고 내려간 뒤였다.',
      '무전이 3분을 알린다. 3분이면 방 하나는 볼 수 있다.'
    ],
    hint: '3분 안에 살펴본다',
    timer: '잔여 3분',
    view: {
      pal: 'station', seed: 41, smoke: true,
      back: [{ t: 'window', x: 1250, y: 140, s: 1 }, { t: 'board', x: 300, y: 230, s: 0.8 }],
      mid: [{ t: 'shelf', x: 620, y: F, s: 0.85 }, { t: 'desk', x: 980, y: F, s: 0.85 },
            { t: 'door', x: 130, y: F, s: 1 }],
      fore: [{ t: 'boxes', x: 1450, y: F + 80, s: 1.1 }]
    },
    hotspots: [
      { id: 'photo', hx: 19, hy: 30, label: '벽에 걸린 사진',
        text: ['소방 정복을 입은 젊은 남자와, 그의 무릎 높이쯤 오는 아들.',
               '액자 아래 명패. 「1998년 임용 · 한상철」.'],
        doc: 'd_hill_photo', add: { memory: 1 }, set: { got_photo: true }, world: 'w_name_hint' },
      { id: 'desk', hx: 61, hy: 60, label: '책상 서랍',
        text: ['봉투 하나. 주소가 적혀 있지 않다.',
               '연기가 문틈으로 들어오기 시작했다.'],
        doc: 'd_letter_son', add: { memory: 1, scar: 1 } },
      { id: 'shelf', hx: 39, hy: 55, label: '선반 위 상자',
        text: ['소방 정복 상의가 개켜져 있다. 계급장은 떼어져 있다.',
               '떼어낸 자리만 색이 진하다.'],
        add: { faith: 1 } },
      { id: 'calendar', hx: 74, hy: 40, label: '달력',
        text: ['15년 전 8월에서 멈춰 있다. 14일에 동그라미가 그려져 있고,',
               '그 옆에 「비번」이라고 적혀 있다.'],
        add: { memory: 1, scar: 1 } },
      { id: 'window', hx: 78, hy: 22, label: '창밖 — 불길',
        text: ['진입로 양쪽이 붙었다. 왕복 4분짜리 길이 3분짜리가 됐다.',
               '나가야 한다.'],
        add: { scar: 1 } }
    ],
    choices: [
      { id: 'room_f_house:out', t: '가지고 나온다', req: { seenIn: 'room_f_house', min: 2 },
        add: { faith: 1 }, to: 'fire_9' },
      { id: 'room_f_house:run', t: '아무것도 들지 않고 나간다', add: { scar: 1 }, to: 'fire_9' }
    ]
  },

  /* ================= 군 · 대대 행정실 ================= */
  {
    id: 'room_a_admin', type: 'look', at: 0.31,
    chapter: '2화 · 지워진 이름', place: '대대 행정실 · 일과 후',
    mood: 'night', amb: 'archive',
    intro: [
      '행정실은 일과가 끝나면 형광등 하나만 남긴다.',
      '캐비닛 세 번째 칸에 오래된 명부철들이 서 있었다.'
    ],
    hint: '캐비닛을 살펴본다',
    view: {
      pal: 'barrack', seed: 23,
      back: [{ t: 'striplight', x: 700, y: 75, s: 0.9 }, { t: 'board', x: 1250, y: 220, s: 1 }],
      mid: [{ t: 'cabinet', x: 380, y: F, s: 1 }, { t: 'cabinet', x: 530, y: F, s: 1 },
            { t: 'desk', x: 950, y: F, s: 1 }],
      fore: [{ t: 'chair', x: 1150, y: F + 50, s: 1.1 }]
    },
    hotspots: [
      { id: 'ledger', hx: 24, hy: 52, label: '표창 대장 — 15년 전 12월',
        text: ['연번 47. 공적란은 다 적혀 있는데 대상자 칸만 하얗다.',
               '수정액이 두껍게 발려 있다.'],
        doc: 'd_army_award', add: { memory: 1 }, set: { read_award: true } },
      { id: 'light', hx: 44, hy: 12, label: '명부를 형광등에 비춰본다',
        req: { flag: 'read_award' },
        text: ['수정액 아래로 눌린 획이 비친다. 세 글자.',
               '한 · 상 · 철.'],
        add: { memory: 2, faith: 1 }, set: { read_name: true }, world: 'w_name_hint' },
      { id: 'letter', hx: 60, hy: 58, label: '명부철 사이에 끼어 있던 종이',
        req: { flag: 'read_award' },
        text: ['접혀 있던 종이 한 장. 명부와 같이 보관될 이유가 없는 것이다.',
               '누군가 일부러 여기 끼워두었다.'],
        doc: 'd_army_letter', add: { memory: 1, scar: 1 } },
      { id: 'board', hx: 78, hy: 28, label: '게시판 — 이달의 표창',
        text: ['이번 달 표창자 명단이 붙어 있다. 이름 옆에 사진까지.',
               '15년 전에도 여기 누군가의 이름이 붙었어야 했다.'],
        add: { faith: 1 } },
      { id: 'desk', hx: 60, hy: 66, label: '당직 책상',
        text: ['당직사관 근무일지. 오늘 날짜 옆에 「이상 무」.',
               '이상은 대개 기록되지 않은 쪽에서 생긴다.'] }
    ],
    choices: [
      { id: 'room_a_admin:out', t: '캐비닛을 닫는다', req: { seenIn: 'room_a_admin', min: 2 },
        to: 'army_5' }
    ]
  },

  /* ================= 군 · 요양병원 복도 ================= */
  {
    id: 'room_a_ward', type: 'look', at: 0.70,
    chapter: '5화 · 병원 복도', place: '해원 요양병원 3층 복도',
    mood: 'cold', amb: 'cold',
    intro: [
      '세환은 아버지 병실 앞 복도에 앉아 있었다. 태오는 옆에 앉았다.',
      '20분 동안 아무도 말하지 않았다. 그동안 복도는 계속 뭔가를 보여줬다.'
    ],
    hint: '복도를 둘러본다',
    view: {
      pal: 'ward', seed: 53,
      back: [{ t: 'striplight', x: 500, y: 70, s: 1 }, { t: 'striplight', x: 1100, y: 70, s: 1 },
             { t: 'window', x: 1420, y: 160, s: 0.9 }],
      mid: [{ t: 'door', x: 300, y: F, s: 1 }, { t: 'door', x: 700, y: F, s: 1 },
            { t: 'bed', x: 1080, y: F, s: 0.8 }],
      fore: [{ t: 'ivstand', x: 200, y: F + 60, s: 1.1 }]
    },
    hotspots: [
      { id: 'saehwan', hx: 30, hy: 68, label: '세환의 옆에 그냥 앉아 있는다',
        text: ['스물한 살은 아직 어깨가 좁다. 그 어깨가 20분 동안 한 번도 펴지지 않았다.',
               '태오는 아무 말도 하지 않았다. 그게 지금 할 수 있는 전부였다.'],
        add: { bond: 2 } },
      { id: 'plate', hx: 62, hy: 46, label: '복도 끝 병실 문패',
        text: ['3층 창가에서 두 번째 침대.',
               '「한상철」.'],
        add: { memory: 1 }, set: { saw_plate: true }, world: 'w_name_hint' },
      { id: 'visit', hx: 48, hy: 34, label: '면회 기록판',
        req: { flag: 'saw_plate' },
        text: ['이번 달 면회자 명단. 그 이름 옆 칸만 15년째 비어 있다.',
               '태오는 볼펜을 들었다가 다시 내려놓았다. 오늘은 병사가 먼저다.'],
        add: { memory: 1, scar: 1 } },
      { id: 'window', hx: 86, hy: 26, label: '복도 창',
        text: ['창밖으로 해원동 언덕이 보인다. 여기서도 보이는 거리였다.',
               '15년 동안 저 언덕과 이 병실이 이렇게 가까웠다.'],
        add: { memory: 1 } },
      { id: 'chart', hx: 70, hy: 62, label: '카트 위 차트 더미',
        text: ['간호사가 두고 간 차트. 남의 것이다. 태오는 손대지 않았다.'],
        add: { faith: 1 } }
    ],
    choices: [
      { id: 'room_a_ward:out', t: '일어선다', req: { seenIn: 'room_a_ward', min: 2 },
        to: 'army_9' }
    ]
  },

  /* ================= 의사 · 요양병원 기록실 ================= */
  {
    id: 'room_d_records', type: 'look', at: 0.31,
    chapter: '2화 · 흡입 화상', place: '해원 요양병원 기록실',
    mood: 'cold', amb: 'archive',
    intro: [
      '기록실은 병동보다 두 도 낮다. 종이를 위해 유지하는 온도다.',
      '15년 치 입원기록이 연도별로 서 있었다.'
    ],
    hint: '기록을 찾아본다',
    view: {
      pal: 'ward', seed: 61,
      back: [{ t: 'striplight', x: 820, y: 70, s: 1.1 }],
      mid: [{ t: 'shelf', x: 340, y: F, s: 1 }, { t: 'shelf', x: 700, y: F, s: 1 },
            { t: 'cabinet', x: 1050, y: F, s: 1 }, { t: 'desk', x: 1350, y: F, s: 0.9 }],
      fore: [{ t: 'boxes', x: 150, y: F + 100, s: 1.2 }]
    },
    hotspots: [
      { id: 'chart', hx: 65, hy: 52, label: '캐비닛 — 한상철 입원기록',
        text: ['차트가 얇다. 15년을 누워 있은 사람의 기록치고는 이상하게 얇다.',
               '아무도 묻지 않으면 기록도 늘지 않는다.'],
        doc: 'd_ward_chart', add: { memory: 1 }, set: { read_chart: true } },
      { id: 'first', hx: 44, hy: 58, label: '최초 이송 기록',
        req: { flag: 'read_chart' },
        text: ['사고 장소 칸.',
               '「해원동 목재창고」.',
               '하은은 자기 손이 차트 위에서 멈춘 것을 나중에야 알았다.'],
        add: { memory: 2 }, world: 'w_name_hint' },
      { id: 'denied', hx: 22, hy: 50, label: '산재 불인정 통지서 사본',
        text: ['「비근무 중 개인행동으로 인한 부상은 공상에 해당하지 않음」.',
               '그 한 문장 때문에 15년의 치료비가 개인 몫이 됐다.'],
        add: { faith: 1, scar: 1 } },
      { id: 'desk', hx: 85, hy: 60, label: '기록실 책상 위 메모',
        text: ['간호기록 초안. 「8월이 되면 자꾸 문 쪽을 본다」.',
               '그 아래 다른 필체로 한 줄. 「몇 명이냐고 물으심」.'],
        add: { memory: 1, scar: 1 } },
      { id: 'cold', hx: 50, hy: 14, label: '온도계',
        text: ['18도. 종이를 위한 온도.',
               '사람을 위한 온도는 이 방에 없다.'] }
    ],
    choices: [
      { id: 'room_d_records:out', t: '기록실을 나선다', req: { seenIn: 'room_d_records', min: 2 },
        to: 'doctor_5' }
    ]
  },

  /* ================= 의사 · 창가에서 두 번째 침대 ================= */
  {
    id: 'room_d_bedside', type: 'look', at: 0.77,
    chapter: '5화 · 창가에서 두 번째', place: '해원 요양병원 3층 · 새벽',
    mood: 'dawn', amb: 'cold',
    intro: [
      '산소포화도가 안정을 찾았다. 한상철은 다시 잠들었다.',
      '하은은 침대 옆 의자에 앉아 있었다. 15년 만에, 이 사람 옆에.'
    ],
    hint: '침대 옆을 살펴본다',
    view: {
      pal: 'ward', seed: 71,
      back: [{ t: 'window', x: 1180, y: 130, s: 1.2 }],
      mid: [{ t: 'bed', x: 700, y: F, s: 1.05 }, { t: 'ivstand', x: 400, y: F, s: 1 },
            { t: 'cabinet', x: 1050, y: F, s: 0.65 }],
      fore: [{ t: 'chair', x: 300, y: F + 70, s: 1.2 }]
    },
    hotspots: [
      { id: 'drawer', hx: 66, hy: 58, label: '침대 옆 서랍',
        text: ['서랍 안에는 물건이 거의 없다. 안경집, 손톱깎이, 그리고 접힌 종이 한 장.',
               '종이는 여러 번 폈다 접은 자국으로 부드러워져 있었다.'],
        doc: 'd_letter_last', add: { memory: 2, scar: 1 }, set: { read_last: true } },
      { id: 'hand', hx: 44, hy: 55, label: '이불 밖으로 나온 손',
        text: ['손등에 오래된 화상 흉이 있다. 열두 살의 손목을 잡았던 손이다.',
               '하은은 그 손을 잠깐 잡았다. 의사로서가 아니라.'],
        add: { bond: 2, memory: 1 } },
      { id: 'monitor', hx: 30, hy: 40, label: '모니터',
        text: ['SpO₂ 91%. 산소 3L로 겨우 유지된다.',
               '폐의 절반은 15년 전 그 창고에 두고 왔다.'],
        add: { faith: 1 } },
      { id: 'window', hx: 78, hy: 22, label: '창밖',
        text: ['해가 뜨기 시작했다. 창가에서 두 번째 침대는 해를 제일 먼저 받는 자리다.',
               '이 사람이 이 자리를 골랐을 리는 없다. 그냥 비어 있던 자리였을 것이다.'] },
      { id: 'ask', hx: 55, hy: 44, label: '깨어 있는지 확인한다',
        req: { flag: 'read_last' },
        text: ['한상철이 눈을 떴다. 초점이 맞는 데 시간이 걸렸다.',
               '"선생님… 나 그때 몇 명 나왔는지 못 봤어요."'],
        add: { memory: 1 }, set: { he_asked: true } }
    ],
    choices: [
      { id: 'room_d_bedside:out', t: '자리에서 일어선다', req: { seenIn: 'room_d_bedside', min: 2 },
        to: 'doctor_10' }
    ]
  },

  /* ================= 재회 · 철거 예정지 ================= */
  {
    id: 'room_hill', type: 'look', at: 0.90,
    chapter: '재회 · 3', place: '해원동 언덕, 철거 예정지 · 새벽 04:10',
    mood: 'dawn', amb: 'dawn',
    intro: [
      '창고 자리는 생각보다 작았다. 열두 살에겐 세상만큼 컸던 곳이었다.',
      '넷은 흩어져서 각자 다른 것을 봤다.'
    ],
    hint: '함께 둘러본다',
    view: {
      pal: 'warehouse', seed: 83,
      back: [{ t: 'window', x: 1350, y: 120, s: 1.3 }],
      mid: [{ t: 'rubble', x: 620, y: F, s: 1.2 }, { t: 'board', x: 1120, y: 300, s: 0.9 }],
      fore: [{ t: 'boxes', x: 200, y: F + 120, s: 1.4 }]
    },
    hotspots: [
      { id: 'notice', hx: 70, hy: 36, label: '철거 안내문',
        text: ['「부지 내 잔존 구조물 없음. 특이 이력 없음.」',
               '넷은 그 다섯 글자 앞에 오래 서 있었다.'],
        doc: 'd_hill_notice', add: { memory: 1 } },
      { id: 'wall', hx: 39, hy: 62, label: '뜯긴 자국이 남은 벽',
        text: ['판자 몇 장이 뜯겨 나간 자리. 15년 동안 아무도 고치지 않았다.',
               '어른 어깨 하나가 겨우 들어갈 폭이다.',
               '이 폭으로 네 명을 밀어냈다.'],
        add: { memory: 1, bond: 1, scar: 1 } },
      { id: 'papers', hx: 22, hy: 70, label: '넷이 가져온 종이들을 바닥에 편다',
        text: ['출동기록, 조사보고서, 표창 대장, 입원기록.',
               '네 장의 빈칸이 같은 모양으로 뚫려 있었다.',
               '겹쳐 놓으니 뚫린 자리가 정확히 겹쳤다.'],
        add: { memory: 2, bond: 2 }, set: { papers_matched: true }, world: 'w_name_hint' },
      { id: 'sun', hx: 84, hy: 20, label: '해가 뜨는 쪽',
        text: ['언덕 위에서는 해원 요양병원 3층이 보인다.',
               '창가에서 두 번째 창에 불이 들어와 있었다.'],
        req: { flag: 'papers_matched' }, add: { memory: 1 } },
      { id: 'four', hx: 52, hy: 74, label: '넷이 서 있는 자리',
        text: ['열두 살에 겹쳤던 네 개의 손은 이제 각자 다른 것을 쥐느라 거칠어져 있었다.',
               '수갑, 관창, 소총, 메스.',
               '그런데도 네 개의 손은 똑같이 사람을 붙잡는 손이었다.'],
        add: { bond: 2 } }
    ],
    choices: [
      { id: 'room_hill:out', t: '서로를 본다', req: { seenIn: 'room_hill', min: 2 }, to: 're_3' }
    ]
  }

  ]);
})();
