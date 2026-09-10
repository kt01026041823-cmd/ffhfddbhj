/* =========================================================
 *  electron/main.js — 데스크톱(Steam) 실행 껍데기
 *  ---------------------------------------------------------
 *  웹 게임을 그대로 감싼다. 게임 코드는 한 줄도 고치지 않는다.
 *
 *  Steam 배포에서 필요한 것들을 여기서 처리한다:
 *   · 전체화면 / 해상도 기억
 *   · 저장 파일을 userData 로 (Steam Cloud 대상 경로)
 *   · ESC 메뉴, F11 전체화면, Alt+Enter
 *   · 외부 링크 차단(스토어 심사에서 걸리는 흔한 항목)
 *   · steam_appid.txt 를 실행 폴더에서 읽어 App ID 를 로그로 확인
 * ========================================================= */
'use strict';

const { app, BrowserWindow, shell, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const isDev = !app.isPackaged;

/* ---------- 창 상태 기억 ---------- */
const stateFile = () => path.join(app.getPath('userData'), 'window.json');

function loadWindowState() {
  try { return JSON.parse(fs.readFileSync(stateFile(), 'utf8')); }
  catch (e) { return null; }
}
function saveWindowState(win) {
  if (!win || win.isDestroyed()) return;
  try {
    const b = win.getNormalBounds();
    fs.writeFileSync(stateFile(), JSON.stringify({
      width: b.width, height: b.height, x: b.x, y: b.y,
      fullscreen: win.isFullScreen()
    }));
  } catch (e) { /* 저장 실패는 게임을 막지 않는다 */ }
}

/* ---------- Steam App ID ---------- */
function steamAppId() {
  const p = path.join(path.dirname(app.getPath('exe')), 'steam_appid.txt');
  try { return fs.readFileSync(p, 'utf8').trim(); } catch (e) { return null; }
}

let win = null;

function createWindow() {
  const saved = loadWindowState();
  const area = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: saved ? saved.width : Math.min(1600, area.width - 80),
    height: saved ? saved.height : Math.min(900, area.height - 80),
    x: saved ? saved.x : undefined,
    y: saved ? saved.y : undefined,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#05070a',
    show: false,
    autoHideMenuBar: true,
    title: '네 개의 여름',
    icon: path.join(ROOT, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false      // 창이 뒤로 가도 앰비언스가 끊기지 않게
    }
  });

  win.once('ready-to-show', () => {
    if (saved && saved.fullscreen) win.setFullScreen(true);
    win.show();
  });

  win.loadFile(path.join(ROOT, 'index.html'));

  /* 외부 링크는 기본 브라우저로 — 게임 창 안에서는 절대 열지 않는다 */
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) { e.preventDefault(); shell.openExternal(url); }
  });

  /* 단축키 */
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    const f11 = input.key === 'F11';
    const altEnter = input.alt && input.key === 'Enter';
    if (f11 || altEnter) { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (isDev && input.key === 'F12') win.webContents.toggleDevTools();
  });

  ['resize', 'move', 'close'].forEach(ev => win.on(ev, () => saveWindowState(win)));
  win.on('closed', () => { win = null; });
}

/* 인스턴스 하나만 (Steam 오버레이가 두 번 띄우는 것을 막는다) */
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });

  app.whenReady().then(() => {
    const id = steamAppId();
    console.log('[네 개의 여름] 저장 경로:', app.getPath('userData'));
    console.log('[네 개의 여름] Steam App ID:', id || '(steam_appid.txt 없음 — 개발 실행)');
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}

/* 게임 쪽에서 저장 경로를 물어볼 수 있게 */
ipcMain.handle('save-dir', () => app.getPath('userData'));
