#!/usr/bin/env node
/* =========================================================
 *  tools/bundle.js — 한 파일짜리 배포본 만들기
 *  실행: node tools/bundle.js [출력경로]
 *  ---------------------------------------------------------
 *  index.html 의 <link>/<script src> 를 전부 인라인해서
 *  파일 하나로 합친다. 아티팩트(claude.ai)에 올리거나,
 *  누군가에게 파일 하나만 보내고 싶을 때 쓴다.
 *
 *  아티팩트 규칙에 맞춰 doctype/html/head/body 껍데기는 빼고
 *  <title> + <style> + 본문 + <script> 만 남긴다.
 * ========================================================= */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = process.argv[2] || path.join(ROOT, 'dist', 'four-summers.artifact.html');

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
let html = read('index.html');

/* 1) 스타일 인라인 */
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, href) =>
  '<style>\n' + read(href) + '\n</style>');

/* 2) 스크립트 인라인 (순서 유지) */
const scripts = [];
html = html.replace(/<script src="([^"]+)"><\/script>\s*/g, (_, src) => {
  scripts.push(src);
  return '';
});

/* 3) 껍데기 제거 — 아티팩트가 씌워준다 */
const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [, '네 개의 여름'])[1];
const icon = (html.match(/<link rel="icon"[^>]*>/) || [''])[0];
const styles = (html.match(/<style>[\s\S]*?<\/style>/g) || []).join('\n');
const body = (html.match(/<body>([\s\S]*?)<\/body>/) || [, html])[1];

const bundled =
  '<title>' + title + '</title>\n' +
  icon + '\n' +
  styles + '\n' +
  body.trim() + '\n' +
  scripts.map((src) =>
    '<script>\n/* ---- ' + src + ' ---- */\n' + read(src) + '\n</script>'
  ).join('\n');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, bundled);

const kb = (Buffer.byteLength(bundled) / 1024).toFixed(0);
console.log('합침: ' + scripts.length + '개 스크립트 + 스타일 → ' + OUT);
console.log('크기: ' + kb + ' KB');

/* 남아 있으면 안 되는 것들 확인 */
const leftovers = [];
if (/<script src=/.test(bundled)) leftovers.push('외부 script 남음');
if (/<link rel="stylesheet"/.test(bundled)) leftovers.push('외부 stylesheet 남음');
if (/<!DOCTYPE|<html|<head>|<body>/i.test(bundled)) leftovers.push('문서 껍데기 남음');
if (leftovers.length) {
  console.error('✗ ' + leftovers.join(' / '));
  process.exit(1);
}
console.log('✓ 외부 참조 없음 — 파일 하나로 완결');
