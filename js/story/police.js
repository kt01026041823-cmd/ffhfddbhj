/* =========================================================
 *  story/police.js — 👮 경찰 이도현 : 사건 수사와 범인 추적
 *  세계 플래그
 *    낸다 : w_police_tip (수사 정보 공유), w_name_hint (이름 단서)
 *    받는다: w_fire_report (소방 출동기록), w_doctor_hold (응급실 자리)
 * ========================================================= */
(function () {
  'use strict';

  Story.register([

  {
    id: 'police_1', chapter: '1화 · 재개발 지구', place: '해원경찰서 강력2팀', mood: 'day', at: 0.10,
    text: [
      '경찰 7년, 강력팀 3년. 이도현의 책상은 서류로 두 겹이었다.',
      '해원동 재개발 예정지에서 세 번째 화재가 났다. 빈집이라 사상자는 없었지만, 세 번은 우연이 아니다.',
      ['진 반장', '도현아. 방화 맞다고 보냐?'],
      ['도현', '세 번째면 사람이 하는 겁니다.'],
      ['진 반장', '그럼 네가 맡아. 파트너는 수경이.'],
      '문가에 서 있던 진수경이 손을 들었다. 2년차, 눈이 빠른 후배였다.'
    ],
    choices: [
      { id: 'police_1:a', t: '현장으로 먼저 간다 — 발화점은 거짓말을 못 한다',
        add: { faith: 1 }, set: { went_scene: true }, to: 'police_2' },
      { id: 'police_1:b', t: '자료실로 간다 — 해원동에서 전에도 불이 났던 적이 있다',
        add: { memory: 1 }, set: { went_archive: true }, to: 'police_2' }
    ]
  },
  {
    id: 'police_2', chapter: '1화 · 재개발 지구', place: '화재 현장 / 자료실', mood: 'day', at: 0.14,
    text: [
      '“빈집이라 다행”이라는 말은 현장에 서면 잘 안 나온다. 누군가의 집이었던 것들이 재가 되어 쌓여 있었다.',
      '창틀 아래에 기름 흔적. 세 곳 모두 같은 자리, 같은 방식.'
    ],
    choices: [
      { id: 'police_2:a', t: '소방 쪽 감식 결과를 정식 공문으로 요청한다',
        add: { faith: 1 }, set: { formal: true }, to: 'police_3' },
      { id: 'police_2:b', t: '민재에게 전화한다. 15년 만에 처음으로 “일” 때문에',
        add: { bond: 2 }, set: { called_minjae: true }, world: 'w_police_tip', to: 'police_3' }
    ]
  },
  {
    id: 'police_3', chapter: '2화 · 목격자', place: '해원동 골목', mood: 'night', at: 0.18,
    onEnter: { set: { ch2: true } },
    text: [
      '유일한 목격자는 언덕 끝에서 폐지를 줍는 노인이었다. 이름은 밝히기를 꺼렸다.',
      ['노인', '아무것도 못 봤어요. 나는 그냥 지나갔고.'],
      '손이 떨리고 있었다. 못 본 사람의 손은 그렇게 떨리지 않는다.',
      ['수경', '선배, 압박 넣죠. 하루면 붑니다.']
    ],
    choices: [
      { id: 'police_3:a', t: '규정대로 압박한다. 시간이 없다',
        add: { faith: 1, scar: 1 }, set: { pressed: true }, to: 'police_4' },
      { id: 'police_3:b', t: '수레를 같이 끌어준다. 오늘은 아무것도 묻지 않는다',
        add: { bond: 1, faith: 1 }, set: { patient: true }, to: 'police_4' },
      { id: 'police_3:c', t: '“누가 무섭게 하던가요?” — 협박 여부만 묻는다',
        add: { faith: 2 }, set: { patient: true, threat_known: true }, to: 'police_4' }
    ]
  },
  {
    id: 'police_4', chapter: '2화 · 빈칸', place: '해원경찰서', mood: 'night', at: 0.24,
    text: [
      '노인은 이틀 뒤에 제 발로 찾아왔다. 해원동에서 15년 산 사람이었다.',
      ['노인', '전에도 한 번 그랬어요. 언덕 위 창고. 그때도 재개발 얘기 나왔을 때였고.'],
      ['노인', '그때 사람 하나 크게 다쳤는데, 뉴스에도 안 나오더라고요.'],
      '이도현의 손이 멈췄다.',
      '그날 밤, 도현은 지하 미제 자료실 열쇠를 빌렸다. 15년 전 8월 상자는 제일 아래 칸에 있다고 했다.'
    ],
    choices: [
      { id: 'police_4:go', t: '자료실로 내려간다', to: 'room_p_archive' }
    ]
  },
  {
    id: 'police_5', chapter: '3화 · 같은 불', place: '네 번째 화재 현장', mood: 'fire', at: 0.30,
    text: [
      '네 번째 불은 빈집이 아니었다. 세입자 한 가구가 아직 남아 있던 집이었다.',
      '도착했을 때 소방차가 먼저 와 있었다. 진압복 하나가 연기 속에서 걸어 나왔다. 어깨에 사람을 업은 채였다.',
      '헬멧을 벗은 얼굴이 익숙했다.',
      ['민재', '…도현이?'],
      ['도현', '민재야.'],
      '15년 만의 재회는 3초였다. 민재는 곧 사람을 구급차에 넘기고 다시 들어갔다.'
    ],
    choices: [
      { id: 'police_5:a', t: '민재가 나올 때까지 현장을 지킨다',
        add: { bond: 2 }, set: { waited: true }, to: 'police_6' },
      { id: 'police_5:b', t: '민재 대신 목격자 통제선을 잡는다 — 그게 내 일이다',
        add: { faith: 2, bond: 1 }, to: 'police_6' },
      { id: 'police_5:c', t: '용의자가 현장에 돌아왔을 수 있다. 군중을 촬영한다',
        add: { faith: 1 }, set: { filmed_crowd: true }, to: 'police_6' }
    ]
  },
  {
    id: 'police_6', chapter: '3화 · 기록', place: '해원소방서 앞', mood: 'dawn', at: 0.35,
    text: [
      '동틀 무렵, 민재가 재를 뒤집어쓴 채 나왔다. 둘은 자판기 앞에 앉았다.',
      ['민재', '네 번 다 같은 방식이야. 인화물질 놓는 위치까지.'],
      ['민재', '그리고 하나 더. 15년 전 그 창고 출동기록, 내가 복사해뒀어.'],
      '민재가 접힌 종이를 내밀었다. 최초 진입자 이름 칸이, 여기서도 비어 있었다.'
    ],
    choices: [
      { id: 'police_6:a', t: '받는다. 그리고 “같이 파보자”고 말한다',
        add: { bond: 2, memory: 1 }, set: { with_minjae: true }, world: 'w_fire_report', to: 'police_7' },
      { id: 'police_6:b', t: '“그건 내가 알아서 할게.” — 민재를 끌어들이지 않는다',
        add: { faith: 1, scar: 1 }, to: 'police_7' }
    ]
  },
  {
    id: 'police_7', chapter: '4화 · 사주', place: '해원경찰서', mood: 'day', at: 0.42,
    text: [
      '군중 사진과 통신 기록이 한 사람을 가리켰다. 이십대 후반, 박정한.',
      '그리고 그의 계좌로 세 번에 걸쳐 돈이 들어왔다. 보낸 쪽은 재개발 시행사 하청의 하청.',
      ['수경', '박정한은 손이에요. 위에 사람이 있어요.'],
      ['도현', '알아. 근데 손도 사람을 태웠어.'],
      '자료 하나가 더 걸렸다. 박정한의 아버지 — 15년 전 그 목재창고 소유주였다.'
    ],
    choices: [
      { id: 'police_7:a', t: '박정한을 먼저 잡는다. 위는 그 다음이다',
        add: { faith: 1 }, set: { target_hand: true }, to: 'room_p_flat' },
      { id: 'police_7:b', t: '박정한을 흔들어 위를 잡는다. 시간이 걸려도',
        add: { faith: 2 }, set: { target_head: true }, to: 'room_p_flat' },
      { id: 'police_7:c', t: '15년 전 창고 화재부터 다시 연다 — 같은 사람들이다',
        add: { memory: 1, faith: 1 }, set: { reopen: true }, world: 'w_name_hint', to: 'room_p_flat' }
    ]
  },
  {
    id: 'police_8', chapter: '4화 · 추격', place: '해원동 언덕', mood: 'night', at: 0.50,
    text: [
      '박정한의 위치가 잡혔다. 하필 언덕 위, 창고가 있던 자리였다.',
      '그는 기름통을 들고 있었다. 다섯 번째 불을 준비하고 있었다.',
      ['수경', '선배, 지원 5분. 기다려요.'],
      '5분. 기름통이 기울어지는 데는 5초면 충분하다.'
    ],
    choices: [
      { id: 'police_8:a', t: '혼자 들어간다. 5분은 너무 길다',
        add: { faith: 2, scar: 2 }, set: { went_alone: true }, to: 'police_9' },
      { id: 'police_8:b', t: '수경과 둘이 양쪽에서 좁힌다',
        add: { faith: 1, bond: 1 }, set: { with_partner: true }, to: 'police_9' },
      { id: 'police_8:c', t: '지원을 기다리며 대피를 먼저 방송한다',
        add: { faith: 1 }, set: { evacuated: true }, to: 'police_9' },
      { id: 'police_8:d', t: '민재에게 좌표를 보낸다. 불이 날 거라고',
        req: { any: [{ flag: 'with_minjae' }, { flag: 'called_minjae' }] },
        add: { bond: 2, faith: 1 }, set: { evacuated: true, fire_ready: true },
        world: 'w_police_tip', to: 'police_9' }
    ]
  },
  {
    id: 'police_9', chapter: '5화 · 5초', place: '언덕 위, 창고 자리', mood: 'fire', at: 0.58,
    text: [
      '박정한은 도현을 보고도 도망가지 않았다. 오히려 기다린 것처럼 보였다.',
      ['박정한', '여기 원래 우리 창고였어요. 아버지가 그거 하나로 버텄고.'],
      ['박정한', '15년 전에 여기 불난 거, 아버지가 지른 거 아니에요. 근데 그렇게 됐어요. 조사가 그냥 끝났으니까.'],
      ['박정한', '이번엔 내가 지를 거예요. 그래야 여기 다시 뉴스에 나오니까.'],
      '기름통이 기울었다. 라이터가 켜졌다.'
    ],
    choices: [
      { id: 'police_9:a', t: '“당신 아버지 이름, 내가 다시 조사할게요.” — 말로 붙든다',
        req: { any: [{ flag: 'reopen' }, { flag: 'chased_order' }, { flag: 'saw_names' }] },
        add: { faith: 2, bond: 1, memory: 1 }, set: { talked_down: true }, to: 'police_10' },
      { id: 'police_9:b', t: '몸으로 덮친다. 기름통을 먼저 뺏는다',
        add: { faith: 1, scar: 2 }, set: { tackled: true }, to: 'police_10' },
      { id: 'police_9:c', t: '“나도 이 창고에서 나온 애였어요.”',
        req: { stat: 'memory', min: 2 },
        add: { bond: 2, memory: 1, faith: 1 }, set: { talked_down: true, told_truth: true }, to: 'police_10' },
      { id: 'police_9:d', t: '총을 뽑는다', add: { scar: 3 }, set: { drew_gun: true }, to: 'police_10' }
    ]
  },
  {
    id: 'police_10', chapter: '5화 · 그날의 대가', place: '언덕 위', mood: 'fire', at: 0.66,
    text: [
      '불은 결국 붙었다. 라이터가 떨어진 자리에서, 마른 풀을 타고.',
      '박정한은 주저앉아 움직이지 않았다. 도현은 그의 팔을 잡았다.'
    ],
    choices: [
      { id: 'police_10:a', t: '박정한을 끌고 나온다. 증거는 나중이다',
        add: { bond: 1, faith: 2 }, set: { saved_suspect: true }, to: 'police_11' },
      { id: 'police_10:b', t: '증거물(기름통·라이터)을 먼저 확보한다',
        add: { faith: 1, scar: 2 }, set: { chose_evidence: true }, to: 'police_11' },
      { id: 'police_10:c', t: '이미 와 있는 소방대에 넘기고 통제선을 잡는다',
        req: { any: [{ flag: 'fire_ready' }, { world: 'w_fire_report' }] },
        add: { bond: 2, faith: 1 }, set: { saved_suspect: true, teamwork: true }, to: 'police_11' }
    ]
  },
  {
    id: 'police_11', chapter: '6화 · 응급실', place: '해원대병원 응급실', mood: 'cold', at: 0.74,
    text: [
      '수경이 화상을 입었다. 불붙은 각목이 어깨로 떨어졌다.',
      '응급실은 이미 만원이었다. 접수 앞에서 도현이 소리를 지르려는 순간, 안쪽에서 누군가 걸어 나왔다.',
      ['하은', '…도현이?'],
      ['도현', '하은아.'],
      '서하은은 3초 만에 상황을 읽고, 수경을 안쪽으로 밀어 넣었다.'
    ],
    choices: [
      { id: 'police_11:a', t: '수경 옆에 남는다. 조사는 밀린다',
        add: { bond: 2, faith: 1 }, set: { stayed_partner: true }, world: 'w_doctor_hold', to: 'police_12' },
      { id: 'police_11:b', t: '하은에게 부탁만 하고 서로 돌아간다. 진술이 식기 전에',
        add: { faith: 2, scar: 1 }, to: 'police_12' },
      { id: 'police_11:c', t: '하은에게 15년 전 창고 화재 이야기를 꺼낸다',
        req: { stat: 'memory', min: 2 },
        add: { bond: 2, memory: 1 }, set: { asked_haeun: true }, world: 'w_name_hint', to: 'police_12' }
    ]
  },
  {
    id: 'police_12', chapter: '6화 · 종결과 미종결', place: '해원경찰서', mood: 'day', at: 0.80,
    text: [
      '박정한은 구속됐다. 시행사 상무 하나도 함께 들어갔다.',
      '하지만 15년 전 「상급 지시에 의한 종결」의 주인은 이미 퇴직한 사람이었고, 서류상 아무 잘못도 없었다.',
      '도현의 책상에는 낡은 상자가 남았다. 「해원동 목재창고 화재 — 구조자 미상」.',
      ['진 반장', '그건 이제 사건도 아니야, 도현아.'],
      ['도현', '알아요. 근데 이름 하나가 비어 있어서요.']
    ],
    choices: [
      { id: 'police_12:a', t: '퇴근길에 그 상자를 들고 나온다',
        add: { faith: 2, memory: 1, bond: 1 }, set: { took_box: true }, world: 'w_name_hint', to: 're_1' },
      { id: 'police_12:b', t: '제자리에 돌려놓는다. 대신 사진을 찍어둔다',
        add: { memory: 1 }, to: 're_1' },
      { id: 'police_12:c', t: '덮는다. 오늘은 쉬어야 한다', add: { scar: 1 }, to: 're_1' }
    ]
  }

  ]);
})();
