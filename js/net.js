/* =========================================================
 *  net.js — 멀티플레이 전송 계층
 *  ---------------------------------------------------------
 *  게임 규칙은 engine.js에만 있고, 여기서는 "무엇을 주고받는지"만
 *  다룬다. 그래서 전송 방식(웹소켓 / 로컬 / 나중에 다른 서버)을
 *  갈아끼워도 게임 로직은 손대지 않는다.
 *
 *  주고받는 것 (전부 작다):
 *    - 좌석 정보(이름 / 직업 / 진행률)
 *    - 세계 플래그 키   ← 이것만으로 네 사람의 이야기가 얽힌다
 *    - 채팅
 *    - 엔딩 결산용 최종 상태
 * ========================================================= */
(function (global) {
  'use strict';

  /* --- 아주 작은 이벤트 버스 ------------------------------- */
  function Emitter() { this._h = {}; }
  Emitter.prototype.on = function (evt, fn) {
    (this._h[evt] = this._h[evt] || []).push(fn); return this;
  };
  Emitter.prototype.emit = function (evt, data) {
    (this._h[evt] || []).forEach(function (fn) {
      try { fn(data); } catch (e) { console.error(e); }
    });
  };

  /* --- 오프라인용 더미 전송 (혼자 / 로컬 협동) -------------- */
  function NullTransport() { Emitter.call(this); this.kind = 'local'; this.connected = false; }
  NullTransport.prototype = Object.create(Emitter.prototype);
  NullTransport.prototype.send = function () {};
  NullTransport.prototype.close = function () {};

  /* --- 온라인 방 (웹소켓) ----------------------------------- */
  function WsTransport(url, room, name) {
    Emitter.call(this);
    this.kind = 'online';
    this.connected = false;
    this.room = room;
    this.name = name;
    this.url = url;
    this.queue = [];
    this._open(url);
  }
  WsTransport.prototype = Object.create(Emitter.prototype);

  WsTransport.prototype._open = function (url) {
    var self = this;
    var ws;
    try { ws = new global.WebSocket(url); }
    catch (e) { this.emit('error', '서버 주소가 올바르지 않습니다: ' + url); return; }
    this.ws = ws;

    ws.onopen = function () {
      self.connected = true;
      self.send({ t: 'hello', room: self.room, name: self.name });
      self.queue.forEach(function (m) { ws.send(JSON.stringify(m)); });
      self.queue = [];
      self.emit('status', { connected: true });
    };
    ws.onmessage = function (ev) {
      var msg;
      try { msg = JSON.parse(ev.data); } catch (e) { return; }
      if (!msg || !msg.t) return;
      self.emit(msg.t, msg);      // room / world / chat / party / chose / error
      self.emit('any', msg);
    };
    ws.onclose = function () {
      self.connected = false;
      self.emit('status', { connected: false });
    };
    ws.onerror = function () {
      self.emit('error', '서버에 연결할 수 없습니다. (server/server.js 를 실행했는지 확인)');
    };
  };

  WsTransport.prototype.send = function (msg) {
    if (this.ws && this.connected) { this.ws.send(JSON.stringify(msg)); }
    else { this.queue.push(msg); }
  };
  WsTransport.prototype.close = function () {
    this.connected = false;
    if (this.ws) { try { this.ws.close(); } catch (e) {} }
  };

  /* --- 공개 API --------------------------------------------- */
  var Net = {
    transport: new NullTransport(),

    /** 기본 서버 주소 추정 — 같은 호스트의 3000/ws */
    guessUrl: function () {
      var loc = global.location;
      if (!loc || loc.protocol === 'file:') return 'ws://localhost:3000';
      var proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
      var port = loc.port && loc.port !== '80' && loc.port !== '443' ? ':' + loc.port : '';
      return proto + '//' + loc.hostname + port;
    },

    offline: function () {
      Net.transport.close();
      Net.transport = new NullTransport();
      return Net.transport;
    },

    connect: function (url, room, name) {
      Net.transport.close();
      Net.transport = new WsTransport(url || Net.guessUrl(), room, name);
      return Net.transport;
    },

    isOnline: function () { return Net.transport.kind === 'online'; },

    /* 보내기 헬퍼 */
    pick: function (route) { Net.transport.send({ t: 'pick', route: route }); },
    ready: function (v) { Net.transport.send({ t: 'ready', ready: !!v }); },
    world: function (keys) {
      if (keys && keys.length) Net.transport.send({ t: 'world', keys: keys });
    },
    progress: function (state) {
      Net.transport.send({
        t: 'progress', scene: state.scene, at: Engine.progress(state),
        chapter: (Story.scenes[state.scene] || {}).chapter || '', done: !!state.done
      });
    },
    chat: function (text) { Net.transport.send({ t: 'chat', text: text }); },
    finish: function (state) {
      Net.transport.send({
        t: 'finish', stats: state.stats, flags: state.flags,
        ending: state.ending, route: state.route
      });
    },
    on: function (evt, fn) { Net.transport.on(evt, fn); return Net; }
  };

  global.Net = Net;
})(window);
