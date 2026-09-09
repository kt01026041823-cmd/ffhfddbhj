/* =========================================================
 *  save.js — 저장 / 불러오기 / 엔딩 도감
 * ========================================================= */
(function (global) {
  'use strict';

  var KEY_SLOT = 'hw_save_v1';
  var KEY_DEX = 'hw_endings_v1';
  var KEY_NAME = 'hw_name_v1';

  function read(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, val) {
    try { global.localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  var Save = {
    /* 이어하기 슬롯 (솔로 / 로컬 협동 공용) */
    put: function (payload) { return write(KEY_SLOT, { at: Date.now(), payload: payload }); },
    get: function () { return read(KEY_SLOT, null); },
    clear: function () { try { global.localStorage.removeItem(KEY_SLOT); } catch (e) {} },
    has: function () { return !!Save.get(); },

    /* 엔딩 도감 */
    markEnding: function (route, ending) {
      var dex = read(KEY_DEX, {});
      dex[route] = dex[route] || {};
      dex[route][ending] = (dex[route][ending] || 0) + 1;
      write(KEY_DEX, dex);
      return dex;
    },
    dex: function () { return read(KEY_DEX, {}); },
    dexCount: function () {
      var dex = Save.dex(), n = 0;
      Object.keys(dex).forEach(function (r) { n += Object.keys(dex[r]).length; });
      return n;
    },
    resetDex: function () { try { global.localStorage.removeItem(KEY_DEX); } catch (e) {} },

    /* 플레이어 이름 기억 */
    name: function (v) {
      if (v === undefined) return read(KEY_NAME, '');
      write(KEY_NAME, v); return v;
    }
  };

  global.Save = Save;
})(window);
