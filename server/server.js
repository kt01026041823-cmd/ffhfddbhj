#!/usr/bin/env node
/* =========================================================
 *  server/server.js — 온라인 협동용 방 서버 + 정적 파일 서버
 *  ---------------------------------------------------------
 *  · 의존성 없음 (npm install 불필요). 순수 Node 만으로
 *    WebSocket(RFC 6455) 핸드셰이크와 프레임을 직접 처리한다.
 *  · 게임 규칙은 전혀 모른다. 방과 좌석, 그리고
 *    "세계 플래그 / 채팅 / 진행률 / 최종 상태"만 중계한다.
 *    → 엔딩 판정은 클라이언트(Story.judgeParty)가 한다. 규칙이 한 곳에만 있도록.
 *
 *  실행:  node server/server.js  [포트]
 *  접속:  http://localhost:3000
 * ========================================================= */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = parseInt(process.argv[2] || process.env.PORT || '3000', 10);
const ROOT = path.resolve(__dirname, '..');
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

/* ===================== 정적 파일 ===================== */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';
  const file = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
});

/* ===================== WebSocket ===================== */
let nextId = 1;
const rooms = new Map();   // code -> { code, players: Map<id, player>, world:{}, phase }

server.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];
  if (!key) { socket.destroy(); return; }
  const accept = crypto.createHash('sha1').update(key + GUID).digest('base64');
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    'Sec-WebSocket-Accept: ' + accept + '\r\n\r\n'
  );
  socket.setNoDelay(true);
  attach(socket);
});

/* --- 프레임 인코딩 --------------------------------------- */
function encode(str) {
  const payload = Buffer.from(str, 'utf8');
  const len = payload.length;
  let head;
  if (len < 126) {
    head = Buffer.from([0x81, len]);
  } else if (len < 65536) {
    head = Buffer.alloc(4);
    head[0] = 0x81; head[1] = 126; head.writeUInt16BE(len, 2);
  } else {
    head = Buffer.alloc(10);
    head[0] = 0x81; head[1] = 127;
    head.writeUInt32BE(0, 2); head.writeUInt32BE(len, 6);
  }
  return Buffer.concat([head, payload]);
}
function control(opcode) { return Buffer.from([0x80 | opcode, 0x00]); }

/* --- 소켓 하나 다루기 ------------------------------------- */
function attach(socket) {
  const conn = {
    id: nextId++, socket, room: null, name: '플레이어',
    route: null, ready: false, scene: '', at: 0, chapter: '', done: false,
    final: null, alive: true
  };

  let buf = Buffer.alloc(0);
  let frag = { opcode: 0, chunks: [] };

  socket.on('data', (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    for (;;) {
      if (buf.length < 2) return;
      const b0 = buf[0], b1 = buf[1];
      const fin = (b0 & 0x80) !== 0;
      const opcode = b0 & 0x0f;
      const masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f;
      let off = 2;

      if (len === 126) {
        if (buf.length < off + 2) return;
        len = buf.readUInt16BE(off); off += 2;
      } else if (len === 127) {
        if (buf.length < off + 8) return;
        const hi = buf.readUInt32BE(off), lo = buf.readUInt32BE(off + 4);
        if (hi !== 0) { drop(conn); return; }        // 4GB 프레임은 받지 않는다
        len = lo; off += 8;
      }
      if (len > 1 << 20) { drop(conn); return; }     // 1MB 초과 = 비정상
      let mask = null;
      if (masked) {
        if (buf.length < off + 4) return;
        mask = buf.slice(off, off + 4); off += 4;
      }
      if (buf.length < off + len) return;

      const payload = Buffer.from(buf.slice(off, off + len));
      if (mask) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3];
      buf = buf.slice(off + len);

      if (opcode === 0x8) { drop(conn); return; }                       // close
      if (opcode === 0x9) { safeWrite(conn, control(0xA)); continue; }  // ping → pong
      if (opcode === 0xA) continue;                                     // pong

      if (opcode === 0x0) {                                             // continuation
        frag.chunks.push(payload);
      } else {
        frag = { opcode, chunks: [payload] };
      }
      if (!fin) continue;

      if (frag.opcode === 0x1) {
        let msg = null;
        try { msg = JSON.parse(Buffer.concat(frag.chunks).toString('utf8')); } catch (e) {}
        frag = { opcode: 0, chunks: [] };
        if (msg && typeof msg.t === 'string') handle(conn, msg);
      } else {
        frag = { opcode: 0, chunks: [] };
      }
    }
  });

  socket.on('error', () => drop(conn));
  socket.on('close', () => drop(conn));
}

function safeWrite(conn, bufOrStr) {
  if (!conn.alive) return;
  try { conn.socket.write(typeof bufOrStr === 'string' ? encode(bufOrStr) : bufOrStr); }
  catch (e) { drop(conn); }
}
function send(conn, obj) { safeWrite(conn, JSON.stringify(obj)); }

function drop(conn) {
  if (!conn.alive) return;
  conn.alive = false;
  try { conn.socket.destroy(); } catch (e) {}
  const room = conn.room;
  if (!room) return;
  room.players.delete(conn.id);
  if (room.players.size === 0) { rooms.delete(room.code); log('방 삭제: ' + room.code); return; }
  broadcastRoom(room);
}

/* --- 방 상태 브로드캐스트 --------------------------------- */
function roomView(room) {
  return {
    t: 'room', code: room.code, phase: room.phase,
    world: room.world,
    players: [...room.players.values()].map(p => ({
      id: p.id, name: p.name, route: p.route, ready: p.ready,
      scene: p.scene, at: p.at, chapter: p.chapter, done: p.done
    }))
  };
}
function broadcastRoom(room) {
  const view = roomView(room);
  for (const p of room.players.values()) send(p, Object.assign({ you: p.id }, view));
}
function broadcast(room, obj, exceptId) {
  for (const p of room.players.values()) if (p.id !== exceptId) send(p, obj);
}

/* --- 메시지 처리 ------------------------------------------ */
function handle(conn, msg) {
  switch (msg.t) {

    case 'hello': {
      const code = String(msg.room || 'HAEWON').toUpperCase().slice(0, 8);
      conn.name = String(msg.name || '플레이어').slice(0, 12);
      let room = rooms.get(code);
      if (!room) {
        room = { code, players: new Map(), world: {}, phase: 'lobby' };
        rooms.set(code, room);
        log('방 생성: ' + code);
      }
      if (room.players.size >= 4) { send(conn, { t: 'error', msg: '방이 꽉 찼습니다 (최대 4명)' }); drop(conn); return; }
      conn.room = room;
      room.players.set(conn.id, conn);
      log(`입장: ${conn.name} → ${code} (${room.players.size}명)`);
      broadcastRoom(room);
      return;
    }

    case 'pick': {
      const room = conn.room; if (!room) return;
      const route = String(msg.route || '');
      for (const p of room.players.values()) {
        if (p.id !== conn.id && p.route === route) {
          send(conn, { t: 'error', msg: '이미 다른 친구가 고른 직업입니다' });
          return;
        }
      }
      conn.route = route;
      conn.ready = false;
      broadcastRoom(room);
      return;
    }

    case 'ready': {
      const room = conn.room; if (!room) return;
      conn.ready = !!msg.ready;
      const list = [...room.players.values()];
      if (room.phase === 'lobby' && list.length >= 2 &&
          list.every(p => p.ready && p.route)) {
        room.phase = 'play';
        log('시작: ' + room.code);
      }
      broadcastRoom(room);
      return;
    }

    case 'world': {
      const room = conn.room; if (!room) return;
      const keys = (Array.isArray(msg.keys) ? msg.keys : []).slice(0, 12)
        .filter(k => typeof k === 'string' && /^w_[a-z_]{1,30}$/.test(k));
      if (!keys.length) return;
      keys.forEach(k => { room.world[k] = true; });
      broadcast(room, { t: 'world', keys, from: conn.name, id: conn.id }, conn.id);
      return;
    }

    case 'progress': {
      const room = conn.room; if (!room) return;
      conn.scene = String(msg.scene || '').slice(0, 40);
      conn.at = Math.max(0, Math.min(1, Number(msg.at) || 0));
      conn.chapter = String(msg.chapter || '').slice(0, 40);
      conn.done = !!msg.done;
      broadcastRoom(room);
      return;
    }

    case 'chat': {
      const room = conn.room; if (!room) return;
      const text = String(msg.text || '').slice(0, 200);
      if (!text) return;
      broadcast(room, { t: 'chat', from: conn.name, id: conn.id, text }, -1);
      return;
    }

    case 'finish': {
      const room = conn.room; if (!room) return;
      conn.done = true;
      conn.final = {
        route: String(msg.route || ''), ending: String(msg.ending || ''),
        stats: msg.stats && typeof msg.stats === 'object' ? msg.stats : {},
        flags: msg.flags && typeof msg.flags === 'object' ? msg.flags : {}
      };
      broadcastRoom(room);
      const list = [...room.players.values()];
      if (list.length >= 2 && list.every(p => p.final)) {
        room.phase = 'ended';
        broadcast(room, {
          t: 'party',
          states: list.map(p => ({ name: p.name, route: p.final.route, ending: p.final.ending,
                                   stats: p.final.stats, flags: p.final.flags }))
        }, -1);
        log('종료: ' + room.code);
      }
      return;
    }
  }
}

function log(s) {
  console.log('[' + new Date().toTimeString().slice(0, 8) + '] ' + s);
}

server.listen(PORT, () => {
  console.log('');
  console.log('  네 개의 여름 — 온라인 협동 서버');
  console.log('  ------------------------------------------');
  console.log('  게임 접속 :  http://localhost:' + PORT);
  console.log('  서버 주소 :  ws://localhost:' + PORT + '   (로비에 입력)');
  console.log('  같은 와이파이의 친구는 이 PC의 내부 IP로 접속하면 됩니다.');
  console.log('');
});
