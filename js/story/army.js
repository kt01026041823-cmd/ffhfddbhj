/* =========================================================
 *  story/army.js — 🪖 군인 윤태오 : 훈련 · 임무 · 동료와의 선택
 *  세계 플래그
 *    낸다 : w_army_relief (재난 지원), w_name_hint
 *    받는다: w_police_tip, w_doctor_hold, w_fire_report
 * ========================================================= */
(function () {
  'use strict';

  Story.register([

  {
    id: 'army_1', chapter: '1화 · 혹서기', place: '제7보병사단 3대대', mood: 'day', at: 0.10,
    text: [
      '중사 7년. 윤태오는 매일 05시 40분에 눈을 떴다. 알람이 울리기 10분 전이었다.',
      '8월, 체감 36도. 20km 행군 3시간째. 선두는 멀쩡했고 후미가 무너지고 있었다.',
      ['김세환 일병', '중사님… 저 다리가….'],
      '얼굴이 붉지 않고 하얗다. 땀이 멈춘 상태. 열탈진이 아니라 열사병 직전이다.',
      ['소대장', '윤 중사, 30분 뒤 복귀 보고 잡혀 있습니다.']
    ],
    choices: [
      { id: 'army_1:a', t: '행군을 세운다. 보고는 내가 늦게 한다',
        add: { faith: 2, bond: 1 }, set: { stopped_march: true }, to: 'army_2' },
      { id: 'army_1:b', t: '세환의 군장을 내가 멘다. 일정은 지킨다',
        add: { faith: 1, scar: 1, bond: 1 }, set: { carried_pack: true }, to: 'army_2' },
      { id: 'army_1:c', t: '의무병에게 넘기고 부대는 계속 간다',
        add: { faith: 1, scar: 1 }, set: { handed_medic: true }, to: 'army_2' }
    ]
  },
  {
    id: 'army_2', chapter: '1화 · 관심', place: '생활관', mood: 'night', at: 0.16,
    text: [
      '세환은 링거 두 개를 맞고 돌아왔다. 그리고 그날 밤, 태오를 찾아왔다.',
      ['세환', '중사님. 저 여기 못 있을 것 같습니다.'],
      ['세환', '집에… 아버지가 편찮으신데, 제가 없으면 안 되는데.'],
      '태오는 열두 살 여름을 떠올렸다. 아무도 이름을 몰랐던 사람이 자기를 밖으로 밀어냈던 그 순간을.'
    ],
    choices: [
      { id: 'army_2:a', t: '규정 그대로: 위로휴가 상신하고, 그린캠프도 같이 알아본다',
        add: { faith: 2, bond: 1 }, set: { helped_system: true }, to: 'army_3' },
      { id: 'army_2:b', t: '내 번호를 준다. “새벽 3시에도 전화해.”',
        add: { bond: 3 }, set: { gave_number: true }, to: 'army_3' },
      { id: 'army_2:c', t: '“군인은 다 그래.” 정신교육으로 끝낸다',
        add: { scar: 2 }, set: { dismissed: true }, to: 'army_3' }
    ]
  },
  {
    id: 'army_3', chapter: '2화 · 야간 사격', place: '사격장', mood: 'night', at: 0.22,
    text: [
      '야간 사격 중 사고가 났다. 오발이 아니라 도비탄. 맞은 건 흙벽이었지만, 파편이 옆 사수의 뺨을 갈랐다.',
      '규정상 즉시 중지, 즉시 보고. 그러나 그 주는 대대 평가 주였다.',
      ['소대장', '윤 중사. 피 조금이잖아. 나중에 정리하죠.'],
      '태오는 다친 병사의 이름을 확인했다. 이등병. 입대 3주.'
    ],
    choices: [
      { id: 'army_3:a', t: '즉시 중지·즉시 보고. 평가는 떨어져도 된다',
        add: { faith: 3, bond: 1 }, set: { reported: true }, to: 'army_4' },
      { id: 'army_3:b', t: '사격만 중지시키고, 보고는 내 이름으로 다음 날 올린다',
        add: { faith: 1, scar: 1 }, set: { late_report: true }, to: 'army_4' },
      { id: 'army_3:c', t: '덮는다. 대대 전체가 걸려 있다',
        add: { scar: 3 }, set: { covered: true, irreversible: true }, to: 'army_4' }
    ]
  },
  {
    id: 'army_4', chapter: '2화 · 지워진 이름', place: '대대 행정실', mood: 'day', at: 0.28,
    text: [
      '징계 심의 자료를 정리하러 행정실에 들어갔다. 일과가 끝난 행정실은 형광등 하나만 남는다.',
      '캐비닛 세 번째 칸에 오래된 명부철들이 서 있었다. 등에 연도가 적혀 있다.',
      '15년 전 것에서 태오의 손이 멈췄다.'
    ],
    choices: [
      { id: 'army_4:go', t: '캐비닛을 연다', to: 'room_a_admin' }
    ]
  },
  {
    id: 'army_5', chapter: '3화 · 지원 출동', place: '해원산 능선', mood: 'fire', at: 0.36,
    text: [
      '해원산 산불. 민가 방향 확산. 사단에 대민지원 명령이 떨어졌다.',
      '태오는 소대를 이끌고 능선에 올랐다. 삽과 갈퀴, 그리고 물에 적신 수건 한 장씩.',
      '연기 속에서 방화복 하나가 걸어 나왔다. 헬멧을 올린 얼굴.',
      ['태오', '…민재냐?'],
      ['민재', '태오야.'],
      '열두 살에 같은 창고에서 기어 나온 둘이, 불붙은 능선에서 마주 섰다.'
    ],
    choices: [
      { id: 'army_5:a', t: '“구간 하나 줘. 우리가 판다.” — 방화선을 맡는다',
        add: { faith: 2, bond: 2 }, set: { took_line: true }, world: 'w_army_relief', to: 'army_6' },
      { id: 'army_5:b', t: '지휘체계를 지킨다. 소방 지휘부 명령만 따른다',
        add: { faith: 1 }, set: { chain: true }, world: 'w_army_relief', to: 'army_6' },
      { id: 'army_5:c', t: '민재 옆에 선다. 내 병사들은 후방으로 뺀다',
        add: { bond: 3, scar: 1, memory: 1 }, set: { side_by_side: true }, to: 'army_6' }
    ]
  },
  {
    id: 'army_6', chapter: '3화 · 바람이 돌 때', place: '방화선', mood: 'fire', at: 0.44,
    text: [
      '두 시간 만에 방화선 400미터를 팠다. 그리고 바람이 돌았다.',
      '불이 방화선을 넘어 들어왔다. 태오의 소대 후미 다섯 명이 안쪽에 갇혔다.',
      '무전은 지지직거렸고, 소방 인력은 반대편 사면에 있었다.',
      ['세환', '중사님! 여기 길 없습니다!']
    ],
    choices: [
      { id: 'army_6:a', t: '내가 들어가 다섯을 데리고 나온다',
        add: { faith: 3, scar: 2 }, set: { went_in: true }, to: 'army_7' },
      { id: 'army_6:b', t: '민재에게 무전으로 좌표를 던진다. 물길을 열어달라고',
        req: { any: [{ flag: 'took_line' }, { flag: 'side_by_side' }, { world: 'w_fire_report' }] },
        add: { faith: 2, bond: 3 }, set: { got_water: true }, to: 'army_7' },
      { id: 'army_6:c', t: '전원 지면 대피 자세. 불이 지나갈 때까지 엎드리게 한다',
        add: { faith: 2, scar: 1 }, set: { hunkered: true }, to: 'army_7' }
    ]
  },
  {
    id: 'army_7', chapter: '4화 · 응급실', place: '해원대병원 응급실', mood: 'cold', at: 0.52,
    text: [
      '다섯 명 다 나왔다. 세환이 제일 늦게 나왔고, 발목과 등에 화상을 입었다.',
      '군 병원은 두 시간 거리. 태오는 민간 병원으로 향하는 구급차에 함께 올랐다.',
      '응급실 문이 열리고, 의사 하나가 걸어 나왔다.',
      ['하은', '…태오?'],
      ['태오', '하은아.'],
      '하은은 인사 대신 세환의 화상 면적을 셌다. 그리고 안쪽으로 밀어 넣었다.'
    ],
    choices: [
      { id: 'army_7:a', t: '세환의 보호자 칸에 내 이름을 쓴다. 부모가 오기 전까지',
        add: { bond: 3, faith: 1 }, set: { guardian: true }, to: 'army_8' },
      { id: 'army_7:b', t: '부대 복귀 보고를 먼저 한다. 나머지 서른 명이 남아 있다',
        add: { faith: 2, scar: 1 }, set: { went_back: true }, to: 'army_8' },
      { id: 'army_7:c', t: '하은에게 15년 전 표창 명부 이야기를 꺼낸다',
        req: { any: [{ flag: 'read_name' }, { flag: 'photo_name' }] },
        add: { bond: 2, memory: 1 }, set: { asked_haeun: true }, world: 'w_name_hint', to: 'army_8' }
    ]
  },
  {
    id: 'army_8', chapter: '4화 · 사라진 병사', place: '대대 상황실', mood: 'night', at: 0.60,
    text: [
      '2주 뒤, 세환이 사라졌다. 통원 치료를 위한 외진 중이었다.',
      '무단이탈 8시간. 12시간이 지나면 군무이탈로 정식 수배가 걸린다.',
      ['소대장', '헌병대 넘기죠. 규정입니다.'],
      '태오는 세환의 관물대를 열었다. 아버지 사진, 그리고 접힌 진단서 한 장. 말기.'
    ],
    choices: [
      { id: 'army_8:a', t: '12시간 안에 내가 찾는다. 대대장에게 시간을 달라고 한다',
        add: { faith: 2, bond: 2 }, set: { asked_time: true }, to: 'room_a_ward' },
      { id: 'army_8:b', t: '규정대로 헌병대에 넘긴다. 그게 세환에게도 낫다',
        add: { faith: 1, scar: 2 }, set: { to_mp: true }, to: 'room_a_ward' },
      { id: 'army_8:c', t: '경찰에 있는 도현에게 전화한다',
        add: { bond: 2, faith: 1 }, set: { called_dohyun: true }, world: 'w_police_tip', to: 'room_a_ward' }
    ]
  },
  {
    id: 'army_9', chapter: '5화 · 복도에서', place: '해원 요양병원 3층', mood: 'cold', at: 0.68,
    text: [
      ['세환', '저 이제 어떻게 됩니까.'],
      ['태오', '같이 돌아가면, 이탈이 아니라 지연이야.'],
      ['세환', '중사님은 왜 여기까지 오셨습니까.'],
      '태오는 대답 대신 복도 끝을 한 번 봤다. 창가에서 두 번째 침대가 있는 병실 쪽이었다.'
    ],
    choices: [
      { id: 'army_9:a', t: '세환을 먼저 데리고 부대로 돌아간다',
        add: { faith: 2, bond: 2, memory: 1 }, set: { chose_saehwan: true }, world: 'w_name_hint', to: 'army_10' },
      { id: 'army_9:b', t: '“5분만.” — 그 병실 문을 열어본다',
        req: { flag: 'saw_plate' },
        add: { memory: 2, scar: 1 }, set: { peeked: true }, world: 'w_name_hint', to: 'army_10' },
      { id: 'army_9:c', t: '아무 말도 하지 않고 같이 일어선다',
        add: { faith: 1, bond: 1 }, to: 'army_10' }
    ]
  },
  {
    id: 'army_10', chapter: '5화 · 심의', place: '대대 징계위원회', mood: 'day', at: 0.74,
    text: [
      '세환은 지연 복귀로 처리됐다. 대신 태오에게 관리 책임이 걸렸다.',
      ['대대장', '윤 중사. 자네 진급 심사 이번에 걸려 있는 거 아나.'],
      ['태오', '압니다.'],
      ['대대장', '그럼 왜 그랬나.'],
      '태오는 열두 살 여름을 생각했다. 아무 의무도 없던 사람이 벽을 뜯고 들어왔던 그날을.'
    ],
    choices: [
      { id: 'army_10:a', t: '“제 병사라서 그랬습니다.” — 책임을 다 진다',
        add: { faith: 3, bond: 1 }, set: { took_blame: true }, to: 'army_11' },
      { id: 'army_10:b', t: '경위서를 규정대로만 쓴다. 진급은 필요하다',
        add: { faith: 1, scar: 1 }, to: 'army_11' },
      { id: 'army_10:c', t: '사격장 사고까지 이제 와서 함께 보고한다',
        req: { flag: 'covered' },
        add: { faith: 3, scar: 1 }, set: { irreversible: false, confessed: true }, to: 'army_11' }
    ]
  },
  {
    id: 'army_11', chapter: '6화 · 남는 사람', place: '위병소', mood: 'dawn', at: 0.80,
    text: [
      '세환은 반년 뒤 만기 전역했다. 아버지 장례를 치른 다음 날 부대로 인사를 왔다.',
      ['세환', '중사님. 저 그날 새벽에 전화 안 했는데도, 중사님 오셨습니다.'],
      ['태오', '나도 그런 사람 한 명 알아. 부르지도 않았는데 온 사람.'],
      '위병소 밖으로 언덕이 보였다. 해원동은 여기서 차로 40분이었다.',
      '주머니 속 휴대폰이 울렸다. 15년 동안 세 사람의 생일에만 울렸던 방이었다.'
    ],
    choices: [
      { id: 'army_11:a', t: '“해원동 재개발 확정됐대.” — 내가 먼저 방에 쓴다',
        add: { bond: 2, memory: 1 }, set: { started_chat: true }, to: 're_1' },
      { id: 'army_11:b', t: '방을 열어보고 조용히 읽는다', add: { bond: 1 }, to: 're_1' }
    ]
  }

  ]);
})();
