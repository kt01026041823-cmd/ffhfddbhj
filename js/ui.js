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

  /* --- 장면: 한 줄씩 드러내기 -------------------------------- */
  UI.renderScene = function (state, handlers) {
    var sc = Engine.scene(state);
    UI.mood('screen-play', sc.mood);
    $('scene-place').textContent = sc.place || '';
    $('choices').innerHTML = '';
    var script = $('script');
    script.innerHTML = '';

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
    var p = document.createElement('p');
    if (Array.isArray(raw)) {
      p.className = 'talk';
      p.innerHTML = '<span class="nm">' + UI.esc(raw[0]) + '</span>' + UI.esc(raw[1]);
    } else {
      p.className = 'line';
      p.textContent = raw;
    }
    $('script').appendChild(p);
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
