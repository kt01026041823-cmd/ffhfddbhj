/* =========================================================
 *  ui.js — 화면 그리기 (DOM만 담당, 게임 규칙은 모른다)
 * ========================================================= */
(function (global) {
  'use strict';

  var UI = {};
  var $ = function (id) { return document.getElementById(id); };
  UI.$ = $;

  UI.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* --- 화면 전환 --------------------------------------------- */
  UI.show = function (id) {
    Array.prototype.forEach.call(document.querySelectorAll('.screen'), function (s) {
      s.classList.toggle('active', s.id === id);
    });
    var sc = $(id);
    if (sc) sc.scrollTop = 0;
  };

  UI.mood = function (screenId, mood) {
    var el = $(screenId);
    if (!el) return;
    el.className = el.className.replace(/\bmood-\w+/g, '').trim();
    el.classList.add('mood-' + (mood || 'night'));
  };

  UI.toast = function (msg, ms) {
    var t = $('toast');
    t.innerHTML = msg;
    t.hidden = false;
    clearTimeout(UI._toast);
    UI._toast = setTimeout(function () { t.hidden = true; }, ms || 2200);
  };

  /* --- 직업 카드 --------------------------------------------- */
  UI.renderJobs = function (host, opt) {
    opt = opt || {};
    host.innerHTML = '';
    Engine.JOB_ORDER.forEach(function (key) {
      var j = Engine.JOBS[key];
      var taken = opt.taken && opt.taken[key];
      var b = document.createElement('button');
      b.className = 'job' + (opt.selected === key ? ' sel' : '') + (taken ? ' taken' : '');
      b.style.setProperty('--c', j.color);
      if (global.Art && Art.sel[key]) b.style.backgroundImage = 'url(' + Art.sel[key] + ')';
      b.type = 'button';
      b.innerHTML =
        '<span class="ic">' + j.icon + '</span>' +
        '<div class="jb">' + j.job + '</div>' +
        '<div class="nm">' + j.name + '</div>' +
        '<span class="tg">' + j.tag + '</span>' +
        (taken ? '<span class="by">' + UI.esc(taken) + '</span>' : '');
      if (!taken) {
        b.addEventListener('click', function () { opt.onPick && opt.onPick(key); });
      }
      host.appendChild(b);
    });
  };

  /* --- HUD ---------------------------------------------------- */
  UI.renderHud = function (state, prevStats) {
    var j = Engine.JOBS[state.route];
    var sc = Story.scenes[state.scene] || {};
    $('hud-who').textContent = j.icon + ' ' + j.job + ' · ' + j.name;
    $('hud-chapter').textContent = sc.chapter || '';
    $('hud-bar').style.width = Math.round((sc.at || 0) * 100) + '%';

    $('hud-stats').innerHTML = Engine.STATS.map(function (s) {
      var v = state.stats[s.key] || 0;
      var up = prevStats && v !== (prevStats[s.key] || 0);
      return '<span class="stat' + (up ? ' up' : '') + '" title="' + s.desc + '">' +
             s.icon + ' ' + s.label + '<b>' + v + '</b></span>';
    }).join('');
  };

  /* --- 무대 세우기 ------------------------------------------- */
  var lastSetKey = null;

  function buildStage(sc) {
    var setEl = $('scene-set');
    var view = Cast.backdrop(sc);
    var key = (view.pal || '') + '|' + (view.seed || 0);

    if (key !== lastSetKey) {                 // 같은 무대면 다시 그리지 않는다
      lastSetKey = key;
      setEl.classList.remove('on');
      setEl.innerHTML = Stage.draw(view);
      requestAnimationFrame(function () { setEl.classList.add('on'); });
    } else {
      setEl.classList.add('on');
    }

    var host = $('actors');
    host.innerHTML = '';
    var cast = Cast.speakers(sc);
    host.dataset.n = cast.length;             /* 인원에 따라 크기를 줄인다 */
    cast.forEach(function (p, i) {
      var d = document.createElement('div');
      d.className = 'actor idle';
      d.dataset.who = p.key;
      d.style.animationDelay = (i * 120) + 'ms';
      d.innerHTML = Cast.figure(p.key) +
        '<span class="tag">' + UI.esc(p.name) + '</span>';
      host.appendChild(d);
    });
  }

  /** 탐색 화면에 다녀오면 무대를 다시 세운다 */
  UI.resetStage = function () { lastSetKey = null; };

  /* 나 말고 세 친구는 이 모습으로 나온다 */
  var DEFAULT_G = { police: 'm', fire: 'm', army: 'm', doctor: 'f' };

  /** 말하는 사람의 초상화 — 네 친구는 그림이 있다 */
  UI.showPortrait = function (whoKey, name, state) {
    var el = $('portrait');
    if (!el) return;
    var art = global.Art && Art.bust[whoKey];
    if (!art) { el.classList.remove('on'); el.hidden = true; return; }
    var g = (state && whoKey === state.route && state.gender) || DEFAULT_G[whoKey] || 'm';
    var src = art[g] || art.m;
    if (el.dataset.src !== whoKey + g) {
      el.dataset.src = whoKey + g;
      el.innerHTML = '<img alt="" src="' + src + '"><figcaption>' + UI.esc(name || '') + '</figcaption>';
    } else {
      var cap = el.querySelector('figcaption');
      if (cap) cap.textContent = name || '';
    }
    el.style.setProperty('--pc', Cast.look(whoKey).rim);
    el.hidden = false;
    requestAnimationFrame(function () { el.classList.add('on'); });
  };

  /** 지금 말하는 사람만 앞으로 나오게 한다 */
  UI.spotlight = function (whoKey) {
    Array.prototype.forEach.call($('actors').children, function (el) {
      var mine = whoKey && el.dataset.who === whoKey;
      el.classList.toggle('speaking', !!mine);
      el.classList.toggle('idle', !mine);
    });
  };

  /* --- 장면: 한 줄씩 드러내기 -------------------------------- */
  UI.renderScene = function (state, handlers) {
    var sc = Engine.scene(state);
    UI.mood('screen-play', sc.mood);
    $('scene-place').textContent = sc.place || '';
    $('choices').innerHTML = '';
    var script = $('script');
    script.innerHTML = '';
    buildStage(sc);

    UI._reveal = {
      lines: (sc.text || []).slice(),
      i: 0,
      finished: false,
      handlers: handlers,
      state: state
    };
    $('tap-hint').hidden = false;
    UI.revealNext();
    UI.revealNext();   // 첫 두 줄은 바로 보여준다
  };

  UI.revealNext = function () {
    var r = UI._reveal;
    if (!r) return;
    if (r.i >= r.lines.length) {
      if (!r.finished) { r.finished = true; UI.renderChoices(r.state, r.handlers); }
      return;
    }
    var raw = r.lines[r.i++];
    var script = $('script');

    /* 지나간 줄은 뒤로 물린다 — 지금 읽는 줄이 어디인지 보이게 */
    Array.prototype.forEach.call(script.children, function (el) {
      el.classList.add('past'); el.classList.remove('now');
    });

    var p = document.createElement('p');
    p.classList.add('now');
    if (Array.isArray(raw)) {
      p.classList.add('talk');
      p.innerHTML = '<span class="nm">' + UI.esc(raw[0]) + '</span>' + UI.esc(raw[1]);
      var who = Cast.who(raw[0]);
      UI.spotlight(who);
      UI.showPortrait(who, raw[0], r.state);
      if (global.Sfx) Sfx.play('click', { volume: .35 });
    } else {
      p.classList.add('line');
      p.textContent = raw;
      UI.spotlight(null);                      /* 지문에서는 아무도 말하지 않는다 */
      var pf = $('portrait');
      if (pf) pf.classList.remove('on');
    }
    script.appendChild(p);
    while (script.children.length > 2) script.removeChild(script.firstChild);

    if (r.i >= r.lines.length) {
      r.finished = true;
      $('tap-hint').hidden = true;
      UI.renderChoices(r.state, r.handlers);
    }
  };

  UI.revealAll = function () {
    var guard = 0;
    while (UI._reveal && !UI._reveal.finished && guard++ < 200) UI.revealNext();
  };

  /* --- 선택지 ------------------------------------------------- */
  UI.renderChoices = function (state, handlers) {
    var host = $('choices');
    host.innerHTML = '';
    var sc = Engine.scene(state);

    if (sc.ending) { handlers.onEnding && handlers.onEnding(state); return; }

    var opts = Engine.choices(state);
    if (!opts.length) {
      var b = document.createElement('button');
      b.className = 'choice';
      b.type = 'button';
      b.textContent = sc.next ? '계속 ▸' : '…';
      b.addEventListener('click', function () { handlers.onChoice('@next'); });
      host.appendChild(b);
      return;
    }

    opts.forEach(function (o, n) {
      var b = document.createElement('button');
      b.className = 'choice';
      b.type = 'button';
      b.style.animationDelay = (n * 60) + 'ms';
      var mark = '';
      if (o.data.req && (o.data.req.world || (o.data.req.any || []).some(function (r) { return r.world; })))
        mark = '<span class="mark">친구의 흔적</span>';
      else if (o.data.req && (o.data.req.stat === 'memory' || o.data.req.flag))
        mark = '<span class="mark">단서</span>';
      b.innerHTML = mark + UI.esc(o.data.t);
      b.addEventListener('click', function () { handlers.onChoice(o.id); });
      host.appendChild(b);
    });
  };

  /* --- 서랍 --------------------------------------------------- */
  UI.openDrawer = function (title, html, withChat) {
    $('drawer-title').textContent = title;
    $('drawer-body').innerHTML = html;
    $('chat-box').hidden = !withChat;
    $('drawer').classList.add('open');
  };
  UI.closeDrawer = function () { $('drawer').classList.remove('open'); };
  UI.drawerOpen = function () { return $('drawer').classList.contains('open'); };

  UI.appendChat = function (from, text, mine) {
    var body = $('drawer-body');
    var p = document.createElement('p');
    p.className = 'chat-line';
    p.innerHTML = '<span class="from">' + UI.esc(mine ? '나' : from) + '</span>' + UI.esc(text);
    body.appendChild(p);
    body.scrollTop = body.scrollHeight;
  };

  /* --- 엔딩 --------------------------------------------------- */
  var ENDING_LABEL = {
    'true': '숨겨진 진엔딩', happy: '해피엔딩', normal: '보통 엔딩', sad: '새드 엔딩'
  };
  UI.endingLabel = function (k) { return ENDING_LABEL[k] || k; };

  UI.renderEnding = function (state, extraHtml) {
    var sc = Engine.scene(state);
    UI.mood('screen-ending', sc.mood);
    var bg = $('ending-set');
    if (bg) {
      bg.innerHTML = Stage.draw(Cast.backdrop(sc));
      bg.classList.add('on');
    }
    $('ending-kind').textContent = ENDING_LABEL[state.ending] || '엔딩';
    $('ending-title').textContent = sc.title || '';
    $('ending-script').innerHTML = (sc.text || []).map(function (raw) {
      if (Array.isArray(raw))
        return '<p class="talk"><span class="nm">' + UI.esc(raw[0]) + '</span>' + UI.esc(raw[1]) + '</p>';
      return '<p class="line">' + UI.esc(raw) + '</p>';
    }).join('');

    var j = Engine.JOBS[state.route];
    $('ending-result').innerHTML =
      '<h4>결산 — ' + j.icon + ' ' + j.job + ' ' + j.name + '</h4>' +
      '<div class="grid">' + Engine.STATS.map(function (s) {
        return '<div class="cell"><b>' + (state.stats[s.key] || 0) + '</b>' + s.icon + ' ' + s.label + '</div>';
      }).join('') + '</div>' +
      (extraHtml || '') +
      '<p class="note">' + UI.endingNote(state) + '</p>';
    UI.show('screen-ending');
  };

  UI.endingNote = function (state) {
    if (state.ending === 'true')
      return '네 사람의 이야기를 끝까지 이어붙인 사람만 볼 수 있는 결말입니다.';
    var need = Story.missingForTrue(state);
    return '<b>숨겨진 진엔딩</b>까지 남은 것 — ' + need.map(UI.esc).join(' · ') +
           '<br>친구의 연락에 답하고, 남의 이야기를 끝까지 듣고, 현장에서 발견한 단서를 흘려보내지 않는 선택이 그 길입니다.';
  };

  /* --- 엔딩 도감 ---------------------------------------------- */
  UI.renderDex = function () {
    var dex = Save.dex();
    $('dex-grid').innerHTML = Engine.JOB_ORDER.map(function (key) {
      var j = Engine.JOBS[key];
      var got = dex[key] || {};
      return '<div class="cell"><h4>' + j.icon + ' ' + j.job + '</h4>' +
        ['true', 'happy', 'normal', 'sad'].map(function (e) {
          var has = got[e];
          return '<div class="e' + (has ? ' got' : '') + '">' +
                 (has ? '<span class="k">◆</span> ' + ENDING_LABEL[e] + ' ×' + has
                      : '◇ ' + (e === 'true' ? '？？？' : ENDING_LABEL[e])) + '</div>';
        }).join('') + '</div>';
    }).join('');
    $('dex-badge').textContent = Save.dexCount();
  };

  global.UI = UI;
})(window);

/* =========================================================
 *  ui.explore.js — 1인칭 탐색 + 문서 읽기
 *  (ui.js 뒤에 이어 붙는 부분)
 * ========================================================= */
(function (global) {
  'use strict';
  var UI = global.UI, $ = UI.$;

  /* ---------- 탐색 씬 그리기 ---------------------------- */
  UI.renderLook = function (state, handlers) {
    var sc = Engine.scene(state);
    UI.mood('screen-play', sc.mood);

    $('explore').hidden = false;
    $('stage').hidden = true;
    UI.resetStage();               /* 돌아오면 무대를 다시 세운다 */
    $('observe').hidden = true;

    /* 무대 */
    $('set-wrap').innerHTML = Stage.draw(sc.view || { pal: 'archive' });
    UI._layers = $('set-wrap').querySelectorAll('.lay');

    /* 들어설 때의 두세 줄 */
    $('look-intro').innerHTML = (sc.intro || []).map(function (t) {
      return '<p>' + UI.esc(t) + '</p>';
    }).join('');

    UI.refreshSpots(state, handlers);
  };

  /* 살펴볼 지점 + 나가기 — 상태가 바뀔 때마다 다시 그린다 */
  UI.refreshSpots = function (state, handlers) {
    var sc = Engine.scene(state);
    var opts = Engine.choices(state);
    var spots = $('spots');
    spots.innerHTML = '';

    var total = (sc.hotspots || []).length;
    var seen = Engine.seenCount(state, sc.id);

    opts.filter(function (o) { return o.spot; }).forEach(function (o, i) {
      var h = o.spot;
      var b = document.createElement('button');
      b.className = 'spot' + (h.doc ? ' doc' : '');
      b.type = 'button';
      b.style.left = h.hx + '%';
      b.style.top = h.hy + '%';
      b.style.animationDelay = (i * 90) + 'ms';
      b.innerHTML = '<span class="ring"></span><span class="tag">' + UI.esc(h.label) + '</span>';
      b.addEventListener('mouseenter', function () { Sfx.play('hover'); });
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        handlers.onChoice(o.id);
      });
      spots.appendChild(b);
    });

    $('look-hint').textContent = sc.hint || '살펴본다';
    $('look-count').textContent = '살펴본 것 ' + seen + ' / ' + total;

    var exits = $('look-exits');
    exits.innerHTML = '';
    opts.filter(function (o) { return !o.spot; }).forEach(function (o) {
      var b = document.createElement('button');
      b.className = 'btn' + (seen >= 2 ? ' primary' : '');
      b.type = 'button';
      b.textContent = o.data.t;
      b.addEventListener('click', function () { Sfx.play('step'); handlers.onChoice(o.id); });
      exits.appendChild(b);
    });
    if (!exits.children.length) {
      var need = document.createElement('span');
      need.className = 'look-hint';
      need.textContent = '— 조금 더 살펴봐야 나갈 수 있다';
      exits.appendChild(need);
    }
  };

  /* 살펴본 결과 문장 */
  UI.showObserve = function (lines, more) {
    var box = $('observe');
    box.innerHTML = (lines || []).map(function (t) {
      return '<p>' + UI.esc(t) + '</p>';
    }).join('') + (more ? '<span class="more">' + UI.esc(more) + '</span>' : '');
    box.hidden = false;
    box.style.animation = 'none';
    void box.offsetWidth;
    box.style.animation = '';
  };

  UI.hideLook = function () {
    $('explore').hidden = true;
    $('stage').hidden = false;
  };

  /* 마우스를 따라 시선이 움직인다(시차 + 손전등) */
  UI.bindParallax = function () {
    var ex = $('explore');
    function move(px, py) {
      ex.style.setProperty('--mx', (px * 100) + '%');
      ex.style.setProperty('--my', (py * 100) + '%');
      var dx = (px - 0.5), dy = (py - 0.5);
      (UI._layers || []).forEach(function (g) {
        var d = parseFloat(g.getAttribute('data-depth')) || 0.5;
        g.setAttribute('transform',
          'translate(' + (-dx * 46 * d).toFixed(1) + ',' + (-dy * 22 * d).toFixed(1) + ')');
      });
    }
    ex.addEventListener('mousemove', function (e) {
      move(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
    });
    ex.addEventListener('touchmove', function (e) {
      if (!e.touches[0]) return;
      move(e.touches[0].clientX / window.innerWidth, e.touches[0].clientY / window.innerHeight);
    }, { passive: true });
  };

  /* ---------- 문서 읽기 --------------------------------- */
  var KIND = {
    report: '공 문 서', log: '기 록 부', letter: '편 지',
    chart: '의 무 기 록', note: '메 모', photo: '사 진'
  };

  /* ~~지워진 글자~~ → 먹칠. 기억이 충분하면 밑에 있는 글자가 비친다 */
  function inkLine(raw, revealed) {
    var out = '', rest = String(raw), m;
    while ((m = rest.match(/~~(.+?)~~/))) {
      out += UI.esc(rest.slice(0, m.index));
      var word = m[1];
      out += revealed
        ? '<span class="unredact">' + UI.esc(word) + '</span>'
        : '<span class="redact" aria-label="지워진 글자">' + UI.esc(word) + '</span>';
      rest = rest.slice(m.index + m[0].length);
    }
    return out + UI.esc(rest);
  }

  UI.openDoc = function (docId, state, onClose) {
    var d = Story.doc(docId);
    if (!d) return;
    var revealed = d.reveal ? Engine.test(state, d.reveal) : true;

    $('paper').className = 'paper ' + d.kind;
    $('paper').innerHTML =
      (d.stamp ? '<div class="stamp">' + UI.esc(d.stamp) + '</div>' : '') +
      '<p class="kind">' + (KIND[d.kind] || '') + '</p>' +
      '<h3>' + UI.esc(d.title) + '</h3>' +
      '<p class="meta">' + UI.esc(d.from || '') +
        (d.date ? ' · ' + UI.esc(d.date) : '') + '</p>' +
      '<div class="body">' + (d.lines || []).map(function (l) {
        return '<p>' + inkLine(l, revealed) + '</p>';
      }).join('') + '</div>' +
      (d.note ? '<p class="note">' + UI.esc(d.note) + '</p>' : '') +
      (!revealed && d.reveal
        ? '<p class="note">지워진 글자는 아직 읽히지 않는다. 그해 여름을 더 알게 되면, 눌린 자국이 보일지도 모른다.</p>'
        : '');

    $('doc-layer').hidden = false;
    Sfx.play('paper');
    UI._docClose = onClose || null;
  };

  UI.closeDoc = function () {
    if ($('doc-layer').hidden) return false;
    $('doc-layer').hidden = true;
    Sfx.play('paper', { volume: 0.6 });
    var cb = UI._docClose; UI._docClose = null;
    if (cb) cb();
    return true;
  };
  UI.docOpen = function () { return !$('doc-layer').hidden; };

  /* ---------- 보관함 ------------------------------------ */
  UI.renderArchive = function (state, onOpen) {
    var docs = state.docs || [];
    var html = '<h4>손에 넣은 것 ' + docs.length + ' / ' + Object.keys(Story.docs).length + '</h4>';
    if (!docs.length) {
      html += '<div class="item mini">아직 없다. 방을 둘러보면 종이가 나온다.</div>';
    } else {
      html += '<div class="docs-list">' + docs.map(function (id) {
        var d = Story.doc(id);
        return '<div class="item" data-doc="' + id + '">' +
          '<div class="k">' + (KIND[d.kind] || '') + '</div>' +
          '<b>' + UI.esc(d.title) + '</b>' +
          '<div class="mini">' + UI.esc(d.from || '') + (d.date ? ' · ' + UI.esc(d.date) : '') + '</div>' +
          '</div>';
      }).join('') + '</div>';
    }
    UI.openDrawer('보관함', html, false);
    $('drawer-body').querySelectorAll('[data-doc]').forEach(function (el) {
      el.addEventListener('click', function () { onOpen(el.getAttribute('data-doc')); });
    });
  };

  /* ---------- 톤 디렉터 ---------------------------------
   *  상처가 깊을수록 색이 빠지고 어두워진다.
   *  유대가 높을수록 다시 밝아진다. 엔딩까지 이 값이 따라간다.
   * ------------------------------------------------------ */
  UI.tone = function (state) {
    var scar = state.stats.scar || 0, bond = state.stats.bond || 0;
    var s = Math.min(scar / 16, 1);
    var b = Math.min(bond / 30, 1);
    var sat = (1 - s * 0.55 + b * 0.12).toFixed(3);
    var bright = (1 - s * 0.22 + b * 0.06).toFixed(3);
    ['screen-play', 'screen-ending'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.style.setProperty('--tone-sat', sat);
      el.style.setProperty('--tone-bright', bright);
    });
    GameAudio.tone(scar, bond);
  };
})(window);
