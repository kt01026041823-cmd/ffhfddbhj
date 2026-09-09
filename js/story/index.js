/* =========================================================
 *  story/index.js — 씬 저장소 + 엔딩 판정
 * ========================================================= */
(function (global) {
  'use strict';

  var Story = {
    scenes: {},
    // 등장인물
    cast: {
      police: { name: '이도현', icon: '👮', job: '경찰' },
      fire:   { name: '강민재', icon: '🚒', job: '소방관' },
      army:   { name: '윤태오', icon: '🪖', job: '군인' },
      doctor: { name: '서하은', icon: '🩺', job: '의사' }
    }
  };

  /* 씬 등록 — 배열로 넘기면 순서대로 next를 자동 연결하지 않는다(명시적으로 쓴다) */
  Story.register = function (list) {
    list.forEach(function (sc) {
      if (Story.scenes[sc.id]) throw new Error('duplicate scene id: ' + sc.id);
      Story.scenes[sc.id] = sc;
    });
  };

  /* 엔딩 판정 -------------------------------------------------
   *  기준값은 tools/check.js 로 실제 분포를 측정해서 잡았다.
   *    · 무작위로 아무거나 누르면  유대 12 / 기억 6 근처
   *    · 친구를 챙기며 플레이하면  유대 25+ / 기억 9+
   *  그래서:
   *    진엔딩 : 마지막에 "찾아가자"를 고르고(GO)         → 무작위로는 14%
   *             + 유대 20↑ + 기억 8↑ + 되돌릴 수 없는 선택 없음
   *    해피   : 유대 16↑
   *    보통   : 유대 8↑
   *    새드   : 그 밖 / 덮어버린 선택을 안고 끝났을 때
   * --------------------------------------------------------- */
  Story.BAR = { trueBond: 20, trueMemory: 8, happy: 16, normal: 8 };

  Story.judge = function (state) {
    var st = state.stats, f = state.flags, B = Story.BAR;
    if (f.irreversible && st.bond < B.happy) return 'sad';
    if (f.go_together && st.bond >= B.trueBond && st.memory >= B.trueMemory) return 'true';
    if (st.bond >= B.happy) return 'happy';
    if (st.bond >= B.normal) return 'normal';
    return 'sad';
  };

  /** 진엔딩까지 뭐가 남았는지 — 엔딩 화면 안내용 */
  Story.missingForTrue = function (state) {
    var st = state.stats, B = Story.BAR, out = [];
    if (!state.flags.go_together) out.push('마지막에 넷이 함께 찾아가는 선택');
    if (st.bond < B.trueBond) out.push('유대 ' + B.trueBond + ' (지금 ' + st.bond + ')');
    if (st.memory < B.trueMemory) out.push('기억 조각 ' + B.trueMemory + '개 (지금 ' + st.memory + ')');
    if (state.flags.irreversible) out.push('덮어버린 선택을 바로잡는 것');
    return out;
  };

  Story.endingScene = function (state) {
    return 'ending_' + Story.judge(state);
  };

  /* 여러 명이 함께 끝냈을 때(멀티) — 합산 판정
   *   규칙 하나로 설명된다: "전원이 진엔딩이면 합산도 진엔딩."
   *   한 사람이라도 손을 놓으면 그 아래로 내려간다. */
  Story.judgeParty = function (states) {
    var sum = { bond: 0, faith: 0, scar: 0, memory: 0 };
    states.forEach(function (s) {
      Object.keys(sum).forEach(function (k) { sum[k] += (s.stats[k] || 0); });
    });
    var n = states.length || 1;
    var avg = {};
    Object.keys(sum).forEach(function (k) { avg[k] = sum[k] / n; });

    var each = states.map(function (s) { return Story.judge(s); });
    var res = { avg: avg, sum: sum, each: each, n: n };

    if (each.every(function (e) { return e === 'true'; })) { res.key = 'true'; return res; }
    if (states.some(function (s) { return s.flags.irreversible; }) && avg.bond < Story.BAR.happy) {
      res.key = 'sad'; return res;
    }
    if (avg.bond >= Story.BAR.happy) { res.key = 'happy'; return res; }
    if (avg.bond >= Story.BAR.normal) { res.key = 'normal'; return res; }
    res.key = 'sad';
    return res;
  };

  global.Story = Story;
})(window);
