#!/usr/bin/env node
/* =========================================================
 *  tools/check.js — 스토리 그래프 검증 (브라우저 없이)
 *  실행: node tools/check.js
 *  ---------------------------------------------------------
 *   1) 정적 검사 : 끊긴 연결, 막힌 씬, 중복 id
 *   2) 무작위 플레이 : 전 루트 크래시/무한루프 없이 종료되는가
 *   3) 도달 검사 : 각 루트에서 4종 엔딩이 실제로 나오는가
 *   4) 커버리지 : 한 번도 안 지나가는 씬이 있는가
 * ========================================================= */
'use strict';

const path = require('path');
const fs = require('fs');

/* 브라우저 전역 흉내 */
global.window = global;
global.localStorage = null;

const load = (p) => {
  const code = fs.readFileSync(path.resolve(__dirname, '..', p), 'utf8');
  // eslint-disable-next-line no-new-func
  new Function(code).call(global);
};

['js/engine.js', 'js/story/index.js', 'js/story/common.js',
 'js/story/police.js', 'js/story/fire.js', 'js/story/army.js',
 'js/story/doctor.js'].forEach(load);

let fail = 0;
const bad = (m) => { console.log('  ✗ ' + m); fail++; };
const ok = (m) => console.log('  ✓ ' + m);

const scenes = Story.scenes;
const ids = Object.keys(scenes);

/* ---------- 1) 정적 검사 ---------- */
console.log('\n[1] 정적 검사  (씬 ' + ids.length + '개)');

const targets = (to, from) => {
  if (!to) return [];
  if (typeof to === 'object') return [...targets(to.then, from), ...targets(to.else, from)];
  return [to];
};

let links = 0;
ids.forEach((id) => {
  const sc = scenes[id];
  const outs = [];
  (sc.choices || []).forEach((c) => {
    if (!c.to) bad(`${id}: 선택지 "${(c.t || '').slice(0, 14)}…" 에 to 없음`);
    if (!c.id) bad(`${id}: 선택지에 안정적인 id 없음 (멀티 동기화에 필요)`);
    outs.push(...targets(c.to, id));
  });
  if (sc.next) outs.push(...targets(sc.next, id));

  outs.forEach((t) => {
    links++;
    if (t === '#ending' || t === '#route') return;
    if (!scenes[t]) bad(`${id} → ${t} (없는 씬)`);
  });

  if (!sc.choices && !sc.next && !sc.ending) bad(`${id}: 막힌 씬 (choices/next/ending 전부 없음)`);
  if (!sc.text || !sc.text.length) bad(`${id}: 본문 없음`);
});

/* 선택지 id 중복 */
const seenChoice = new Set();
ids.forEach((id) => (scenes[id].choices || []).forEach((c) => {
  if (seenChoice.has(c.id)) bad(`선택지 id 중복: ${c.id}`);
  seenChoice.add(c.id);
}));

if (!fail) ok(`연결 ${links}개, 선택지 ${seenChoice.size}개 — 끊긴 곳 없음`);

/* ---------- 2~3) 무작위 플레이 ---------- */
console.log('\n[2] 무작위 플레이 (루트별 3000회)');

const visited = new Set();
const endingsByRoute = {};
let maxSteps = 0;

function play(route, pickFn) {
  let st = Engine.newState(route, 'test');
  visited.add(st.scene);
  let steps = 0;
  while (!st.done) {
    if (++steps > 200) throw new Error('무한 루프 의심: ' + route + ' @ ' + st.scene);
    const opts = Engine.choices(st);
    const sc = Engine.scene(st);
    if (!opts.length && !sc.next && !sc.ending) throw new Error('막힘: ' + st.scene);
    st = opts.length ? Engine.apply(st, pickFn(opts, st)) : Engine.next(st);
    visited.add(st.scene);
  }
  maxSteps = Math.max(maxSteps, steps);
  return st;
}

Engine.JOB_ORDER.forEach((route) => {
  const seen = {};
  for (let i = 0; i < 3000; i++) {
    let end;
    try {
      end = play(route, (opts) => opts[(Math.random() * opts.length) | 0].id);
    } catch (e) { bad(`${route}: ${e.message}`); break; }
    seen[end.ending] = (seen[end.ending] || 0) + 1;
  }
  endingsByRoute[route] = seen;
  const got = Object.keys(seen).sort();
  ok(`${Engine.JOBS[route].icon} ${Engine.JOBS[route].job.padEnd(4)} — 도달 엔딩: ` +
     got.map((k) => `${k}(${seen[k]})`).join(' '));
});
ok(`가장 긴 플레이 길이 ${maxSteps}단계 — 모두 정상 종료`);

/* ---------- 2.5) 플레이 성향별 결과 (밸런스 측정) ---------- */
console.log('\n[2.5] 성향별 플레이 결과');

const styles = {
  '친구 우선 (근시안)': (opts, st) => {
    let best = opts[0], bs = -99;
    opts.forEach((o) => {
      const s = (o.data.add?.bond || 0) * 2 + (o.data.add?.memory || 0) * 2 - (o.data.add?.scar || 0);
      if (s > bs) { bs = s; best = o; }
    });
    return best.id;
  },
  '일 우선 (신념형)': (opts) => {
    let best = opts[0], bs = -99;
    opts.forEach((o) => {
      const s = (o.data.add?.faith || 0) * 2 - (o.data.add?.bond || 0);
      if (s > bs) { bs = s; best = o; }
    });
    return best.id;
  },
  '첫 선택지만': (opts) => opts[0].id,
  '마지막 선택지만': (opts) => opts[opts.length - 1].id
};

Object.keys(styles).forEach((label) => {
  const line = Engine.JOB_ORDER.map((route) => {
    const end = play(route, styles[label]);
    return `${Engine.JOBS[route].icon}${end.ending}(유대${end.stats.bond}/기억${end.stats.memory})`;
  }).join(' ');
  ok(`${label.padEnd(16)} ${line}`);
});

console.log('\n[3] 4종 엔딩 도달 검사');
const WANT = ['true', 'happy', 'normal', 'sad'];
Engine.JOB_ORDER.forEach((route) => {
  // 진엔딩은 확률이 낮으므로 "유대+기억 최대화" 빔서치로 따로 확인
  let beam = [Engine.newState(route, 'best')];
  const score = (s) => (s.stats.bond || 0) * 2 + (s.stats.memory || 0) * 3 +
    (s.flags.go_together ? 30 : 0) - (s.flags.irreversible ? 40 : 0);
  const finished = [];
  for (let step = 0; step < 60 && beam.length; step++) {
    const nxt = [];
    beam.forEach((s) => {
      if (s.done) { finished.push(s); return; }
      const opts = Engine.choices(s);
      if (!opts.length) { nxt.push(Engine.next(s)); return; }
      opts.forEach((o) => nxt.push(Engine.apply(s, o.id)));
    });
    nxt.sort((a, b) => score(b) - score(a));
    beam = nxt.slice(0, 400);
    if (beam.every((s) => s.done)) { finished.push(...beam); break; }
  }
  const best = finished.sort((a, b) => score(b) - score(a))[0];
  const reached = new Set([...WANT.filter((e) => endingsByRoute[route][e]),
                           ...(best ? [best.ending] : [])]);
  const missing = WANT.filter((e) => !reached.has(e));
  if (missing.length) bad(`${route}: 도달 불가 엔딩 ${missing.join(', ')}`);
  else ok(`${Engine.JOBS[route].job.padEnd(4)} — 4종 모두 도달 가능 ` +
          `(최적 플레이: 유대 ${best.stats.bond} / 기억 ${best.stats.memory} → ${best.ending})`);
});

/* ---------- 4) 커버리지 ---------- */
console.log('\n[4] 씬 커버리지');
const unreached = ids.filter((id) => !visited.has(id));
if (unreached.length) bad('한 번도 도달하지 않은 씬: ' + unreached.join(', '));
else ok(`${ids.length}개 씬 전부 도달`);

/* ---------- 합산(멀티) 판정 ---------- */
console.log('\n[5] 멀티 합산 판정');
const four = Engine.JOB_ORDER.map((r) => {
  let beam = [Engine.newState(r, 'p')];
  const sc = (s) => (s.stats.bond || 0) * 2 + (s.stats.memory || 0) * 3 +
    (s.flags.go_together ? 30 : 0) - (s.flags.irreversible ? 40 : 0);
  const fin = [];
  for (let i = 0; i < 60 && beam.length; i++) {
    const nx = [];
    beam.forEach((s) => {
      if (s.done) { fin.push(s); return; }
      const o = Engine.choices(s);
      if (!o.length) { nx.push(Engine.next(s)); return; }
      o.forEach((x) => nx.push(Engine.apply(s, x.id)));
    });
    nx.sort((a, b) => sc(b) - sc(a));
    beam = nx.slice(0, 200);
  }
  return fin.sort((a, b) => sc(b) - sc(a))[0];
});
const party = Story.judgeParty(four);
if (party.key !== 'true') bad('네 명 최적 플레이인데 합산이 진엔딩이 아님: ' + party.key);
else ok('네 명 최적 플레이 → 합산 진엔딩 (유대 평균 ' + party.avg.bond.toFixed(1) +
        ', 기억 합계 ' + party.sum.memory + ')');

console.log('\n' + (fail ? `실패 ${fail}건` : '전부 통과 ✅') + '\n');
process.exit(fail ? 1 : 0);
