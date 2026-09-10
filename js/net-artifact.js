/* =========================================================
 *  net-artifact.js — 아티팩트(claude.ai)에서의 온라인 협동
 *  ---------------------------------------------------------
 *  링크 하나로 같이 하려면 웹소켓 서버를 띄울 수 없다.
 *  그래서 전송 계층만 갈아끼운다:
 *
 *     방 상태(누가 무슨 직업, 세계 플래그, 최종 결과) → db   (남는 것)
 *     채팅 한마디                                    → room (지나가는 것)
 *
 *  게임 규칙도, main.js 도 건드리지 않는다.
 *  net.js 가 만들어 둔 이벤트 이름(room/world/chat/party)을 그대로 흉내 낸다.
 * ========================================================= */
(function (global) {
  'use strict';

  var Net = global.Net;
  if (!Net) return;

  var DB = null, ROOM = null, ready = false;

  /* 아티팩트 런타임이 있으면 붙잡아 둔다 (없으면 그냥 조용히 지나간다) */
  (function init() {
    var c = global.claude;
    if (!c || typeof c.use !== 'function') { markMode(); return; }
    Promise.all([
      c.use('db').catch(function () { return null; }),
      c.use('room').catch(function () { return null; })
    ]).then(function (r) {
      DB = r[0]; ROOM = r[1]; ready = !!DB;
      markMode();
    });
  })();

  Net.artifactReady = function () { return ready; };

  /* 로비 화면 문구를 이 환경에 맞게 바꾼다 */
  function markMode() {
    var url = document.getElementById('srv-url');
    var card = document.querySelector('[data-mode="online"] .card-body p');
    if (ready) {
      if (url && url.closest('.field')) url.closest('.field').hidden = true;
      var note = document.getElementById('srv-note');
      if (note) {
        note.textContent = '같은 링크를 연 친구끼리 방 코드만 맞추면 됩니다. 서버는 필요 없습니다.';
      }
      if (card) {
        card.innerHTML = '방 코드로 모여 각자 기기에서 동시에 플레이. 서로의 선택이 실시간으로 넘어갑니다. ' +
                         '<span class="tag">이 링크 그대로</span>';
      }
    } else if (card && !global.WebSocket) {
      card.innerHTML = '이 환경에서는 온라인 방을 열 수 없습니다. <b>한 화면 협동</b>으로 즐겨주세요.';
    }
  }

  /* --- 아주 작은 이벤트 버스 (net.js 와 같은 모양) ---------- */
  function Emitter() { this._h = {}; }
  Emitter.prototype.on = function (evt, fn) {
    (this._h[evt] = this._h[evt] || []).push(fn); return this;
  };
  Emitter.prototype.emit = function (evt, data) {
    (this._h[evt] || []).forEach(function (fn) {
      try { fn(data); } catch (e) { console.error(e); }
    });
  };

  function myId() {
    var k = 'hw_pid_v1', v = null;
    try { v = localStorage.getItem(k); } catch (e) {}
    if (!v) {
      v = 'p' + Math.random().toString(36).slice(2, 10);
      try { localStorage.setItem(k, v); } catch (e) {}
    }
    return v;
  }

  /* --- db + room 전송 -------------------------------------- */
  function ArtifactTransport(code, name) {
    Emitter.call(this);
    this.kind = 'online';
    this.connected = false;
    this.code = String(code || 'HAEWON').toUpperCase().slice(0, 8);
    this.name = String(name || '플레이어').slice(0, 12);
    this.id = myId();
    this.me = { name: this.name, route: null, ready: false, at: 0, chapter: '', done: false };
    this.world = {};
    this.players = [];
    this.subs = [];
    this.lastProgress = 0;
    this.partySent = false;
    this.open();
  }
  ArtifactTransport.prototype = Object.create(Emitter.prototype);

  ArtifactTransport.prototype.open = function () {
    var self = this;
    if (!DB) { this.emit('error', '이 화면에서는 온라인 방을 열 수 없습니다.'); return; }

    var base = 'rooms/' + this.code;
    this.roomRef = DB.doc(base);
    this.playersRef = DB.collection(base + '/players');
    this.meRef = this.playersRef.doc(this.id);

    /* 방 문서가 없으면 만든다 */
    this.roomRef.get().then(function (snap) {
      if (!snap.exists) return self.roomRef.set({ world: {}, phase: 'lobby' });
    }).catch(function () {}).then(function () {
      return self.meRef.set(Object.assign({ ts: Date.now() }, self.me));
    }).then(function () {
      self.connected = true;
      self.emit('status', { connected: true });
    }).catch(function (e) {
      self.emit('error', '방에 들어가지 못했습니다. (' + (e && e.code || 'unknown') + ')');
    });

    /* 좌석 변화 */
    this.subs.push(this.playersRef.onSnapshot(function (snap) {
      var list = [];
      snap.forEach(function (d) {
        var v = d.data() || {};
        list.push({
          id: d.id, name: v.name || '플레이어', route: v.route || null,
          ready: !!v.ready, at: v.at || 0, chapter: v.chapter || '',
          done: !!v.done, final: v.final || null
        });
      });
      self.players = list;
      self.emit('room', {
        t: 'room', code: self.code, phase: self.phase || 'lobby',
        players: list, you: self.id, world: self.world
      });
      self.maybeStart();
      self.maybeParty();
    }, function (e) { self.emit('error', '연결이 끊겼습니다. (' + e.code + ')'); }));

    /* 세계 플래그 · 단계 */
    this.subs.push(this.roomRef.onSnapshot(function (snap) {
      var v = snap.data() || {};
      var w = v.world || {};
      var fresh = Object.keys(w).filter(function (k) { return w[k] && !self.world[k]; });
      self.world = w;
      var wasPhase = self.phase;
      self.phase = v.phase || 'lobby';

      if (fresh.length && self.started) {
        self.emit('world', { t: 'world', keys: fresh, from: v.lastBy || '친구' });
      }
      if (self.phase !== wasPhase) {
        self.emit('room', {
          t: 'room', code: self.code, phase: self.phase,
          players: self.players, you: self.id, world: self.world
        });
      }
    }));

    /* 채팅은 지금 열어둔 사람들끼리 (남기지 않는다) */
    if (ROOM) {
      ROOM.on('chat', function (msg) {
        var d = (msg && msg.data) || msg || {};
        self.emit('chat', { t: 'chat', from: d.from || '친구', id: d.id, text: String(d.text || '') });
      });
    }
  };

  /* 전원이 준비되면 시작으로 넘긴다 (제일 앞 좌석만 쓴다 — 쓰기 충돌 방지) */
  ArtifactTransport.prototype.maybeStart = function () {
    if (this.phase !== 'lobby') return;
    var list = this.players;
    if (list.length < 2) return;
    if (!list.every(function (p) { return p.ready && p.route; })) return;
    var first = list.slice().sort(function (a, b) { return a.id < b.id ? -1 : 1; })[0];
    if (first.id !== this.id) return;
    this.roomRef.set({ world: this.world, phase: 'play' }).catch(function () {});
  };

  /* 전원이 끝내면 결산을 한 번만 올린다 */
  ArtifactTransport.prototype.maybeParty = function () {
    if (this.partySent) return;
    var list = this.players;
    if (list.length < 2 || !list.every(function (p) { return p.final; })) return;
    this.partySent = true;
    this.emit('party', {
      t: 'party',
      states: list.map(function (p) {
        return {
          name: p.name, route: p.final.route, ending: p.final.ending,
          stats: p.final.stats || {}, flags: p.final.flags || {}
        };
      })
    });
  };

  ArtifactTransport.prototype.send = function (msg) {
    var self = this;
    if (!msg || !this.meRef) return;

    switch (msg.t) {
      case 'hello':
        return;

      case 'pick': {
        var taken = this.players.some(function (p) {
          return p.id !== self.id && p.route === msg.route;
        });
        if (taken) { this.emit('error', { msg: '이미 다른 친구가 고른 직업입니다' }); return; }
        this.me.route = msg.route; this.me.ready = false;
        return this.write();
      }

      case 'ready':
        this.me.ready = !!msg.ready;
        return this.write();

      case 'world': {
        var w = Object.assign({}, this.world);
        (msg.keys || []).forEach(function (k) { w[k] = true; });
        this.world = w;
        return this.roomRef.set({ world: w, phase: this.phase || 'play', lastBy: this.name })
          .catch(function () {});
      }

      case 'progress': {
        this.started = true;
        var now = Date.now();
        if (now - this.lastProgress < 1500 && !msg.done) return;   // 쓰기 아끼기
        this.lastProgress = now;
        this.me.at = msg.at; this.me.chapter = msg.chapter; this.me.done = msg.done;
        return this.write();
      }

      case 'chat':
        if (ROOM) ROOM.emit('chat', { from: this.name, id: this.id, text: msg.text });
        this.emit('chat', { t: 'chat', from: this.name, id: this.id, text: msg.text });
        return;

      case 'finish':
        this.me.done = true;
        this.me.final = { route: msg.route, ending: msg.ending, stats: msg.stats, flags: msg.flags };
        return this.write();
    }
  };

  ArtifactTransport.prototype.write = function () {
    var self = this;
    return this.meRef.set(Object.assign({ ts: Date.now() }, this.me)).catch(function (e) {
      self.emit('error', '방에 쓰지 못했습니다. (' + (e && e.code || 'unknown') + ')');
    });
  };

  ArtifactTransport.prototype.close = function () {
    this.connected = false;
    this.subs.forEach(function (u) { try { u(); } catch (e) {} });
    this.subs = [];
    if (this.meRef) this.meRef.delete().catch(function () {});
  };

  /* --- Net.connect 를 이 환경용으로 바꿔 끼운다 ------------- */
  var wsConnect = Net.connect;
  Net.connect = function (url, room, name) {
    if (ready) {
      Net.transport.close();
      Net.transport = new ArtifactTransport(room, name);
      return Net.transport;
    }
    return wsConnect.call(Net, url, room, name);
  };
})(window);
