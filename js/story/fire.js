/* =========================================================
 *  story/fire.js — 🚒 소방관 강민재 : 화재 · 구조 · 재난
 *  세계 플래그
 *    낸다 : w_fire_report (출동기록 공유), w_name_hint
 *    받는다: w_police_tip (수사 정보), w_army_relief (군 지원), w_doctor_hold
 * ========================================================= */
(function () {
  'use strict';

  Story.register([

  {
    id: 'fire_1', chapter: '1화 · 야간 근무', place: '해원소방서 119구조대', mood: 'night', at: 0.10,
    text: [
      '소방 9년. 강민재의 손등에는 흉이 여섯 개 있었다. 어느 게 몇 번째 출동인지는 다 기억했다.',
      '새벽 2시 17분, 벨이 울렸다. 해원동 다세대주택, 2층 발화, 거주 4세대.',
      ['지훈', '반장님, 저 오늘 첫 진입입니다.'],
      ['민재', '내 뒤에 붙어. 내 어깨에서 손 떼지 마.'],
      '차고 문이 열리자 언덕 위로 붉은 기운이 보였다. 15년 전과 똑같은 색이었다.'
    ],
    choices: [
      { id: 'fire_1:a', t: '계단으로 정면 진입한다 — 가장 빠르다',
        add: { faith: 1 }, set: { entry_stair: true }, to: 'fire_2' },
      { id: 'fire_1:b', t: '사다리차로 3층 창을 먼저 뜯는다 — 위층 사람이 먼저 죽는다',
        add: { faith: 2 }, set: { entry_ladder: true }, to: 'fire_2' },
      { id: 'fire_1:c', t: '지훈을 밖에 세우고 혼자 들어간다',
        add: { scar: 1 }, set: { solo: true }, to: 'fire_2' }
    ]
  },
  {
    id: 'fire_2', chapter: '1화 · 두 개의 방', place: '다세대주택 2층', mood: 'fire', at: 0.16,
    text: [
      '복도 끝에서 두 개의 소리가 동시에 들렸다.',
      '왼쪽 방 — 아이 울음. 오른쪽 방 — 문을 두드리는 소리, 그리고 산소통 도는 소리.',
      '천장은 이미 검게 내려앉고 있었다. 두 곳을 다 갈 시간은 없다.',
      ['지훈', '반장님, 어디로…!']
    ],
    choices: [
      { id: 'fire_2:a', t: '왼쪽 — 아이에게 간다',
        add: { faith: 1, scar: 1 }, set: { saved_child: true }, to: 'fire_3' },
      { id: 'fire_2:b', t: '오른쪽 — 산소통을 쓰는 사람에게 간다. 폭발하면 둘 다 죽는다',
        add: { faith: 2, scar: 1 }, set: { saved_old: true }, to: 'fire_3' },
      { id: 'fire_2:c', t: '지훈을 왼쪽으로 보내고 내가 오른쪽으로 간다',
        add: { faith: 1, scar: 2 }, set: { split_team: true }, to: 'fire_3' }
    ]
  },
  {
    id: 'fire_3', chapter: '2화 · 손을 떼지 마', place: '다세대주택 2층', mood: 'fire', at: 0.22,
    text: [
      '둘 다 나왔다. 아이도, 노인도. 대신 대가가 있었다.',
      '나오는 길에 천장 마감재가 떨어졌다. 지훈의 헬멧을 스치고 어깨로.',
      ['지훈', '괜, 괜찮습니다…!'],
      '괜찮지 않았다. 방화복 어깨가 녹아 있었다.',
      '민재는 지훈을 업고 계단을 내려갔다. 열두 살 때 누군가 자신을 밖으로 밀어냈던 그 감각이, 등 쪽에서 올라왔다.'
    ],
    onEnter: { add: { memory: 1 } },
    choices: [
      { id: 'fire_3:a', t: '“손 떼지 말라고 했지.” — 업은 채로 끝까지 말을 시킨다',
        add: { bond: 2, faith: 1 }, set: { kept_talking: true }, to: 'fire_4' },
      { id: 'fire_3:b', t: '아무 말 없이 뛴다. 초를 아낀다',
        add: { faith: 1, scar: 1 }, to: 'fire_4' }
    ]
  },
  {
    id: 'fire_4', chapter: '2화 · 보관실', place: '해원소방서 장비보관실', mood: 'night', at: 0.28,
    text: [
      '지훈은 2도 화상, 3주 진단. 살았다.',
      '보고서를 쓰다 만 새벽, 민재는 보관실 제일 아래 칸을 열었다. 폐기 대기 장비들이 쌓인 칸이었다.',
      '거기 헬멧 하나가 있었다. 낡고, 앞면이 녹아 일그러진 것.',
      '내부 표기: 「해원 3-7」. 그리고 유성펜으로 눌러 쓴 두 글자, 「상철」.',
      '민재는 그 헬멧을 15년 전 여름에 본 적이 있다. 창고 밖, 담벼락 옆 땅바닥에서.'
    ],
    onEnter: { add: { memory: 1 } },
    choices: [
      { id: 'fire_4:a', t: '「해원 3-7」 배정 기록을 뒤진다',
        add: { memory: 1, faith: 1 }, set: { traced_helmet: true }, world: 'w_name_hint', to: 'fire_5' },
      { id: 'fire_4:b', t: '헬멧을 내 사물함으로 옮긴다. 폐기 목록에서 지운다',
        add: { faith: 1, bond: 1 }, set: { kept_helmet: true }, to: 'fire_5' },
      { id: 'fire_4:c', t: '사진만 찍고 닫는다. 지금은 근무 중이다',
        add: { scar: 1 }, to: 'fire_5' }
    ]
  },
  {
    id: 'fire_5', chapter: '3화 · 같은 불', place: '해원동 화재 현장', mood: 'fire', at: 0.34,
    text: [
      '해원동 재개발 지구에서 네 번째 불이 났다. 이번엔 사람이 있었다.',
      '민재가 한 명을 업고 나왔을 때, 통제선 안쪽에 형사 한 명이 서 있었다.',
      ['민재', '…도현이?'],
      ['도현', '민재야.'],
      '3초. 민재는 사람을 구급차에 넘기고 다시 들어갔다. 인사는 나중이었다.'
    ],
    choices: [
      { id: 'fire_5:a', t: '나오자마자 도현을 붙잡는다. 네 번 다 같은 패턴이라고 말해준다',
        add: { bond: 2, faith: 1 }, set: { told_dohyun: true }, world: 'w_fire_report', to: 'fire_6' },
      { id: 'fire_5:b', t: '감식 결과가 정리될 때까지 기다린다. 공문이 원칙이다',
        add: { faith: 1 }, set: { by_book: true }, to: 'fire_6' }
    ]
  },
  {
    id: 'fire_6', chapter: '3화 · 자판기 앞', place: '해원소방서 앞', mood: 'dawn', at: 0.40,
    text: [
      '동틀 무렵, 둘은 자판기 앞에 앉았다. 15년 만에 나란히 앉는 건데 어색하지 않았다.',
      ['도현', '너 여기 있었냐. 계속.'],
      ['민재', '너도 여기 있었네. 계속.'],
      '민재는 주머니에서 접힌 종이를 꺼냈다. 15년 전 그 창고의 출동기록 복사본.',
      '최초 진입자 이름 칸: 공란. 비고: 「민간인, 인계 후 이송」.'
    ],
    choices: [
      { id: 'fire_6:a', t: '도현에게 준다. “너 이런 거 찾는 거 잘하잖아.”',
        add: { bond: 2, memory: 1 }, set: { shared_report: true }, world: ['w_fire_report', 'w_name_hint'], to: 'fire_7' },
      { id: 'fire_6:b', t: '내가 직접 찾겠다고 한다. 우리 쪽 기록이다',
        add: { faith: 2 }, set: { keep_alone: true }, to: 'fire_7' },
      { id: 'fire_6:c', t: '수사 정보를 받고 대신 대피 계획을 짠다',
        req: { world: 'w_police_tip' },
        add: { bond: 2, faith: 2 }, set: { prepared: true }, to: 'fire_7' }
    ]
  },
  {
    id: 'fire_7', chapter: '4화 · 산으로 번지다', place: '해원산 능선', mood: 'fire', at: 0.48,
    text: [
      '언덕 위 화재가 산으로 옮겨붙었다. 바람이 초속 12미터. 마을 방향.',
      '전 소방력이 투입되고, 군 병력이 지원으로 올라왔다.',
      '방화선 작업 중, 삽을 든 부사관 하나가 민재 앞에 멈춰 섰다.',
      ['태오', '…민재냐?'],
      ['민재', '태오야.'],
      '15년 전 넷 중 둘이, 불붙은 산 능선에서 마주 섰다.'
    ],
    choices: [
      { id: 'fire_7:a', t: '태오 부대에 방화선 구간을 맡긴다. 나는 진화에 붙는다',
        add: { bond: 2, faith: 1 }, set: { trusted_army: true }, world: 'w_army_relief', to: 'fire_8' },
      { id: 'fire_7:b', t: '군 병력은 후방으로 뺀다. 전문 인력이 아니다',
        add: { faith: 1, scar: 1 }, set: { pushed_army: true }, to: 'fire_8' },
      { id: 'fire_7:c', t: '둘이 같은 구간에 선다. 열두 살 때처럼',
        add: { bond: 3, scar: 1, memory: 1 }, set: { side_by_side: true }, to: 'fire_8' }
    ]
  },
  {
    id: 'fire_8', chapter: '4화 · 마지막 집', place: '언덕 위 마지막 가옥', mood: 'fire', at: 0.56,
    text: [
      '방화선 안쪽에 집 하나가 남았다. 거동이 어려운 노인이 산다는 신고가 들어왔다.',
      '진입로는 이미 불이 양쪽으로 붙었다. 왕복 4분, 현재 잔여 시간 3분.',
      ['지휘', '강민재! 진입 불허! 들었나!'],
      '무전이 한 번 더 울렸다. 민재는 헬멧 안쪽에 눌러 쓴 두 글자를 떠올렸다.'
    ],
    choices: [
      { id: 'fire_8:a', t: '들어간다. 명령을 어긴다',
        add: { faith: 3, scar: 2, memory: 1 }, set: { disobeyed: true }, to: 'fire_9' },
      { id: 'fire_8:b', t: '태오의 부대와 함께 진입로 양쪽을 물로 눌러 길을 만든다',
        req: { any: [{ flag: 'trusted_army' }, { flag: 'side_by_side' }, { world: 'w_army_relief' }] },
        add: { faith: 2, bond: 2 }, set: { made_path: true }, to: 'fire_9' },
      { id: 'fire_8:c', t: '명령을 따른다. 내 대원들을 죽일 수 없다',
        add: { faith: 1, scar: 3 }, set: { obeyed: true }, to: 'fire_9' }
    ]
  },
  {
    id: 'fire_9', chapter: '5화 · 3분', place: '마지막 가옥', mood: 'fire', at: 0.62,
    text: [
      '집 안에 노인은 없었다. 이미 이웃이 업고 내려간 뒤였다.',
      '대신 벽에 걸린 사진이 있었다. 소방 정복을 입은 젊은 남자와, 어린 아들.',
      '사진 아래 명패. 「1998년 임용 · 한상철」.',
      '민재는 사진을 떼어 방화복 안에 넣었다.'
    ],
    onEnter: { add: { memory: 1 } },
    choices: [
      { id: 'fire_9:a', t: '사진을 가지고 나온다. 반드시 돌려줄 것이다',
        add: { faith: 2, bond: 1 }, set: { got_photo: true }, world: 'w_name_hint', to: 'fire_10' },
      { id: 'fire_9:b', t: '사진을 제자리에 두고, 위치만 기억한다',
        add: { faith: 1 }, to: 'fire_10' }
    ]
  },
  {
    id: 'fire_10', chapter: '5화 · 병실', place: '해원대병원', mood: 'cold', at: 0.70,
    text: [
      '민재는 왼팔 2도 화상, 연기 흡입. 침대에 눕혀진 건 6년 만이었다.',
      '커튼을 젖히며 들어온 의사가 차트를 보다 멈췄다.',
      ['하은', '…강민재?'],
      ['민재', '하은아. 나 퇴원해도 되지?'],
      ['하은', '안 돼.'],
      '그리고 하은이 조용히 덧붙였다.',
      ['하은', '너 헬멧 안에 뭐 쓰여 있는 거, 나도 봤어. 우리 병동에 그 이름 있어.']
    ],
    choices: [
      { id: 'fire_10:a', t: '“어디. 지금 가자.” — 링거를 뽑는다',
        add: { bond: 1, faith: 2, scar: 1, memory: 1 }, set: { rushed: true }, to: 'fire_11' },
      { id: 'fire_10:b', t: '“넷이 같이 가자.” — 도현과 태오를 부른다',
        add: { bond: 3, memory: 1 }, set: { called_all: true }, world: 'w_name_hint', to: 'fire_11' },
      { id: 'fire_10:c', t: '“…나중에.” 천장을 본다',
        add: { scar: 2 }, to: 'fire_11' }
    ]
  },
  {
    id: 'fire_11', chapter: '6화 · 명부', place: '해원소방서 회의실', mood: 'day', at: 0.78,
    text: [
      '지훈은 복귀했다. 어깨에 흉이 하나 늘었다.',
      ['지훈', '반장님, 저 이제 손 안 떼도 되죠?'],
      ['민재', '아니. 계속 잡아.'],
      '민재는 인명구조 유공자 명부를 신청서에 다시 올렸다. 15년 전 누락된 한 명.',
      '반려 사유는 매번 같았다. 「비근무 중 민간인 신분 — 해당 없음」.'
    ],
    choices: [
      { id: 'fire_11:a', t: '다시 쓴다. 열 번째 신청서를',
        add: { faith: 3, memory: 1, bond: 1 }, set: { kept_filing: true }, to: 'fire_12' },
      { id: 'fire_11:b', t: '기록만 남겨둔다. 언젠가 누군가 볼 것이다',
        add: { faith: 1, memory: 1 }, to: 'fire_12' },
      { id: 'fire_11:c', t: '그만둔다. 규정은 규정이다', add: { scar: 2 }, to: 'fire_12' }
    ]
  },
  {
    id: 'fire_12', chapter: '6화 · 같은 색', place: '해원소방서 옥상', mood: 'dawn', at: 0.82,
    text: [
      '비번 날 아침, 민재는 옥상에서 언덕을 봤다. 창고 자리에 철거 안내 현수막이 걸려 있었다.',
      '주머니 속 휴대폰이 울렸다. 15년 동안 세 사람의 생일에만 울렸던 방이었다.'
    ],
    choices: [
      { id: 'fire_12:a', t: '방을 열어본다', add: { bond: 1 }, to: 're_1' }
    ]
  }

  ]);
})();
