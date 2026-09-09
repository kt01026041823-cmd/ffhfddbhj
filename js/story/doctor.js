/* =========================================================
 *  story/doctor.js — 🩺 의사 서하은 : 환자 치료 · 응급 · 의료 판단
 *  세계 플래그
 *    낸다 : w_doctor_hold (응급실 자리 확보), w_name_hint
 *    받는다: w_police_tip, w_army_relief, w_fire_report
 * ========================================================= */
(function () {
  'use strict';

  Story.register([

  {
    id: 'doctor_1', chapter: '1화 · 당직', place: '해원대병원 응급의료센터', mood: 'cold', at: 0.10,
    text: [
      '응급의학과 4년차. 서하은은 자기 손이 떨리는 걸 본 적이 없다. 대신 자주 잠에서 깼다.',
      '02시 40분, 동시에 두 대가 들어왔다.',
      '① 40대 남성, 교통사고. 혈압 70/40, 복강 내 출혈 의심.',
      '② 70대 여성, 화재 현장. 기도 화상, 산소포화도 84%.',
      '남은 수술방은 하나. 마취과 콜은 12분 뒤.',
      ['간호사', '선생님, 누구부터요.']
    ],
    choices: [
      { id: 'doctor_1:a', t: '① 출혈 — 지금 5분이 생사를 가른다',
        add: { faith: 1 }, set: { chose_trauma: true }, to: 'doctor_2' },
      { id: 'doctor_1:b', t: '② 기도 화상 — 기관내관 먼저. 기도는 기다려주지 않는다',
        add: { faith: 2 }, set: { chose_airway: true }, to: 'doctor_2' },
      { id: 'doctor_1:c', t: '둘 다 잡는다. 내가 기도 확보하면서 외과 콜을 동시에 돌린다',
        add: { faith: 2, scar: 1 }, set: { chose_both: true }, to: 'doctor_2' }
    ]
  },
  {
    id: 'doctor_2', chapter: '1화 · 12분', place: '응급실 처치실', mood: 'cold', at: 0.16,
    text: [
      '둘 다 살았다. 기도는 하은이 잡고, 출혈은 12분 뒤 도착한 외과가 잡았다.',
      '가운 앞자락이 젖어 있었다. 땀인지 피인지 확인하지 않은 채 하은은 다음 환자를 봤다.',
      '새벽 5시, 처치실 벽에 기대 3분을 앉았다. 그때 화재 환자의 보호자가 들어왔다.',
      ['보호자', '선생님. 우리 어머니… 왜 저렇게 관을 넣어놨어요. 답답하다고 하실 텐데.']
    ],
    choices: [
      { id: 'doctor_2:a', t: '앉아서 처음부터 설명한다. 다음 환자는 5분 늦어진다',
        add: { bond: 2, faith: 1 }, set: { explained: true }, to: 'doctor_3' },
      { id: 'doctor_2:b', t: '핵심만 말하고 간호사에게 인계한다',
        add: { faith: 1, scar: 1 }, to: 'doctor_3' },
      { id: 'doctor_2:c', t: '보호자의 손을 잡는다. 설명 대신 먼저',
        add: { bond: 2, memory: 1 }, set: { held_hand: true }, to: 'doctor_3' }
    ]
  },
  {
    id: 'doctor_3', chapter: '2화 · 회진', place: '해원 요양병원 3층 (파견 진료)', mood: 'day', at: 0.22,
    text: [
      '주 1회 파견 진료. 해원 요양병원 3층은 대부분 오래 누운 사람들이었다.',
      '창가에서 두 번째 침대. 「한상철, 48세, 만성 폐질환」.',
      '차트가 유독 얇았다. 면회 기록은 15년간 0회.',
      ['한상철', '…선생님. 오늘 며칠이에요.'],
      ['하은', '8월 12일이요.'],
      ['한상철', '8월이구나. 8월엔 조심해야 해요. 마른 나무가 잘 타요.'],
      '하은의 손이 차트 위에서 멈췄다.'
    ],
    onEnter: { add: { memory: 1 } },
    choices: [
      { id: 'doctor_3:a', t: '“왜 마른 나무를 아세요?” — 물어본다',
        add: { memory: 2, bond: 1 }, set: { asked_wood: true }, world: 'w_name_hint', to: 'doctor_4' },
      { id: 'doctor_3:b', t: '과거 병력 기록을 처음부터 다시 뒤진다',
        add: { memory: 1, faith: 2 }, set: { read_chart: true }, to: 'doctor_4' },
      { id: 'doctor_3:c', t: '진료만 마치고 나온다. 오후 외래가 40명이다',
        add: { scar: 1 }, to: 'doctor_4' }
    ]
  },
  {
    id: 'doctor_4', chapter: '2화 · 흡입 화상', place: '요양병원 기록실', mood: 'night', at: 0.28,
    text: [
      '한상철의 최초 입원 기록은 15년 전 8월이었다.',
      '「기도 흡입 화상, 폐 손상 3도. 화재 현장 자력 탈출. 산업재해 불인정 — 비근무 중.」',
      '그리고 최초 이송 기록의 사고 장소 칸.',
      '「해원동 목재창고」.',
      '하은은 열두 살 여름을 떠올렸다. 누가 자기 등을 밀어 문 밖으로 내보냈던 감각을.'
    ],
    onEnter: { add: { memory: 1 } },
    choices: [
      { id: 'doctor_4:a', t: '친구들에게 알린다. 셋 다에게, 지금',
        add: { bond: 3, memory: 1 }, set: { told_friends: true }, world: 'w_name_hint', to: 'doctor_5' },
      { id: 'doctor_4:b', t: '혼자 확인부터 한다. 틀렸으면 상처가 되니까',
        add: { faith: 2, scar: 1 }, set: { alone_check: true }, to: 'doctor_5' },
      { id: 'doctor_4:c', t: '기록을 덮는다. 환자와 의사 사이에 그 이야기를 놓지 않는다',
        add: { faith: 1, scar: 1 }, to: 'doctor_5' }
    ]
  },
  {
    id: 'doctor_5', chapter: '3화 · 다수 사상자', place: '응급의료센터', mood: 'fire', at: 0.36,
    text: [
      '해원산 산불. 재난 의료 대응 단계 발령. 30분 안에 화상·연기흡입 환자 열넷이 들어온다.',
      '병상은 여덟. 인공호흡기는 셋.',
      ['간호사', '선생님, 트리아지 지휘 누가 잡습니까!'],
      ['하은', '내가 잡아요.']
    ],
    choices: [
      { id: 'doctor_5:a', t: '중증 우선. 살릴 수 있는 순서로 냉정하게 자른다',
        add: { faith: 3, scar: 2 }, set: { hard_triage: true }, world: 'w_doctor_hold', to: 'doctor_6' },
      { id: 'doctor_5:b', t: '전원 조정을 동시에 돌린다. 인근 3개 병원에 직접 전화',
        add: { faith: 2, bond: 1 }, set: { transferred: true }, world: 'w_doctor_hold', to: 'doctor_6' },
      { id: 'doctor_5:c', t: '현장 소방 지휘부와 직접 연결해 이송 순서를 맞춘다',
        req: { any: [{ world: 'w_fire_report' }, { world: 'w_army_relief' }, { world: 'w_police_tip' }] },
        add: { faith: 2, bond: 2 }, set: { linked_field: true }, world: 'w_doctor_hold', to: 'doctor_6' }
    ]
  },
  {
    id: 'doctor_6', chapter: '3화 · 들것 위의 얼굴', place: '응급실', mood: 'fire', at: 0.42,
    text: [
      '열두 번째 환자가 들어왔다. 방화복을 가위로 자르는데, 왼팔 화상 아래 손등에 흉이 여섯 개.',
      '하은은 그 손을 알아봤다. 열두 살 때 자기 손목을 잡고 벽을 따라 기었던 손이었다.',
      ['하은', '…강민재?'],
      ['민재', '하은아. 나 퇴원해도 되지?'],
      ['하은', '안 돼.']
    ],
    choices: [
      { id: 'doctor_6:a', t: '내가 직접 본다. 다른 환자는 후배에게 넘긴다',
        add: { bond: 2, scar: 1 }, set: { treated_minjae: true }, to: 'doctor_7' },
      { id: 'doctor_6:b', t: '후배에게 민재를 맡긴다. 나는 지휘를 놓을 수 없다',
        add: { faith: 3, scar: 1 }, set: { kept_command: true }, to: 'doctor_7' },
      { id: 'doctor_6:c', t: '“너 헬멧에 쓰인 이름, 나 알아.” — 지금 말한다',
        req: { stat: 'memory', min: 2 },
        add: { bond: 3, memory: 1 }, set: { told_minjae: true }, world: 'w_name_hint', to: 'doctor_7' }
    ]
  },
  {
    id: 'doctor_7', chapter: '4화 · 세 명의 방문', place: '응급실 · 3일간', mood: 'cold', at: 0.50,
    text: [
      '그 주에 하은은 나머지 두 사람도 만났다.',
      '화상 입은 형사 후배를 들쳐 안고 온 도현. 발목이 익은 병사를 데려온 태오.',
      '셋 다 자기 몸은 뒤로 밀어놓고 남의 몸을 먼저 내밀었다.',
      ['도현', '하은아, 자리 하나만.'],
      ['태오', '하은아, 얘 스물한 살이야.'],
      '하은은 그날 밤 의무기록 대신 다른 것을 썼다. 15년 만에 처음으로 단체 채팅방에 초안을 적었다가 지웠다.'
    ],
    choices: [
      { id: 'doctor_7:a', t: '지우지 않고 보낸다. “우리 넷, 한 번 봐야 해.”',
        add: { bond: 3, memory: 1 }, set: { sent_msg: true }, world: 'w_name_hint', to: 'doctor_8' },
      { id: 'doctor_7:b', t: '지운다. 셋 다 지금 각자 지옥이다',
        add: { scar: 2 }, to: 'doctor_8' },
      { id: 'doctor_7:c', t: '대신 셋의 환자 상태를 매일 문자로 보낸다',
        add: { bond: 2, faith: 1 }, set: { daily_msg: true }, to: 'doctor_8' }
    ]
  },
  {
    id: 'doctor_8', chapter: '4화 · 판단', place: '중환자실', mood: 'cold', at: 0.58,
    text: [
      '산불 환자 중 한 명이 나빠졌다. 62세 남성, 기도 화상. 하은이 첫날 “경증”으로 분류한 환자였다.',
      '재평가가 6시간 늦었다. 그 6시간에 부종이 기도를 막았다.',
      ['과장', '서하은. 트리아지 기록, 재난 상황이었으니 소급 조정 가능해. 정리해줄까?'],
      '살릴 수 있었다. 그리고 그건 하은의 판단이었다.'
    ],
    choices: [
      { id: 'doctor_8:a', t: '내 이름으로 그대로 보고한다. 유족에게도 직접 설명한다',
        add: { faith: 3, scar: 2, bond: 1 }, set: { confessed: true }, to: 'doctor_9' },
      { id: 'doctor_8:b', t: '과장의 제안을 받아들인다. 나는 아직 이 응급실에 필요하다',
        add: { scar: 3 }, set: { covered: true, irreversible: true }, to: 'doctor_9' },
      { id: 'doctor_8:c', t: '보고는 그대로 두고, 재난 트리아지 지침 개정안을 쓴다',
        add: { faith: 2, scar: 1 }, set: { wrote_guideline: true }, to: 'doctor_9' }
    ]
  },
  {
    id: 'doctor_9', chapter: '5화 · 사직서', place: '의국', mood: 'night', at: 0.66,
    text: [
      '하은의 서랍에는 6개월 전부터 사직서가 있었다. 날짜만 비워둔 채로.',
      '그날 밤 당직표를 보다가, 하은은 그 종이를 꺼냈다.',
      '그때 휴대폰이 울렸다. 요양병원 야간 당직의 전화였다.',
      ['당직의', '3층 한상철 환자요. 산소포화도 계속 떨어집니다. 전원 필요할 것 같은데, 받아주실 수 있습니까?']
    ],
    choices: [
      { id: 'doctor_9:a', t: '“받아요. 내가 직접 갈게요.” — 사직서를 다시 넣는다',
        add: { faith: 2, bond: 2, memory: 1 }, set: { went_himself: true }, world: ['w_doctor_hold', 'w_name_hint'], to: 'doctor_10' },
      { id: 'doctor_9:b', t: '병상을 확보하고 이송만 조율한다. 나는 여기 있어야 한다',
        add: { faith: 2 }, set: { arranged: true }, world: 'w_doctor_hold', to: 'doctor_10' },
      { id: 'doctor_9:c', t: '“오늘은 병상이 없습니다.” — 사실이었다',
        add: { scar: 3 }, set: { refused: true }, to: 'doctor_10' }
    ]
  },
  {
    id: 'doctor_10', chapter: '5화 · 창가에서 두 번째', place: '해원 요양병원 3층', mood: 'night', at: 0.74,
    text: [
      '산소마스크 아래에서 한상철이 눈을 떴다. 하은을 알아보는 데 시간이 좀 걸렸다.',
      ['한상철', '선생님… 나 그때 몇 명 나왔는지 못 봤어요.'],
      ['한상철', '나오다가 정신을 잃어서. 15년 동안 그게 계속 걸렸어요.'],
      ['한상철', '몇 명이었을까요.'],
      '하은은 그 자리에서 대답할 수 있었다. 대답하기까지 15년이 걸렸을 뿐이다.'
    ],
    onEnter: { add: { memory: 1 } },
    choices: [
      { id: 'doctor_10:a', t: '“네 명이요. 네 명 다 나왔어요.” — 그리고 그중 하나가 나라고 말한다',
        add: { bond: 3, faith: 2, memory: 1 }, set: { answered: true }, world: 'w_name_hint', to: 'doctor_11' },
      { id: 'doctor_10:b', t: '“네 명이요.” — 의사와 환자의 거리는 지킨다',
        add: { faith: 1, memory: 1, scar: 1 }, to: 'doctor_11' },
      { id: 'doctor_10:c', t: '지금은 치료가 먼저다. 산소를 올린다',
        add: { faith: 2, scar: 1 }, to: 'doctor_11' }
    ]
  },
  {
    id: 'doctor_11', chapter: '6화 · 인계', place: '해원대병원 옥상', mood: 'dawn', at: 0.80,
    text: [
      '한상철은 그날 밤을 넘겼다. 폐는 절반이었지만, 살아 있는 절반이었다.',
      '하은은 옥상에서 해가 뜨는 걸 봤다. 사직서는 서랍에 그대로, 날짜는 여전히 빈칸이었다.',
      '주머니 속 휴대폰이 울렸다. 15년 동안 세 사람의 생일에만 울렸던 방이었다.',
      ['태오', '해원동 재개발 확정됐대. 언덕 위 창고 자리, 다음 달에 철거.']
    ],
    choices: [
      { id: 'doctor_11:a', t: '“나 그 사람 어디 있는지 알아.” — 답장을 쓴다',
        req: { stat: 'memory', min: 3 },
        add: { bond: 2, memory: 1 }, set: { knows_where: true }, world: 'w_name_hint', to: 're_1' },
      { id: 'doctor_11:b', t: '“나도 갈게.”', add: { bond: 1 }, to: 're_1' },
      { id: 'doctor_11:c', t: '읽고 휴대폰을 뒤집어 놓는다', add: { scar: 1 }, to: 're_1' }
    ]
  }

  ]);
})();
