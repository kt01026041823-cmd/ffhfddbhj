/* =========================================================
 *  electron/preload.js
 *  게임(웹) 쪽에 딱 두 가지만 알려준다.
 *   · 지금 데스크톱 빌드로 돌고 있다는 사실
 *   · 저장 폴더 (Steam Cloud 연동 시 이 경로를 등록하면 된다)
 *  그 외의 Node 권한은 넘기지 않는다.
 * ========================================================= */
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('DESKTOP', {
  isDesktop: true,
  platform: process.platform,
  saveDir: () => ipcRenderer.invoke('save-dir')
});
