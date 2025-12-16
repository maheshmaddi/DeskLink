import { app, BrowserWindow, ipcMain, desktopCapturer } from 'electron'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import robot from 'robotjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DIST = process.env.DIST || 'dist';
process.env.DIST = DIST;
process.env.VITE_PUBLIC = app.isPackaged ? DIST : join(DIST, '../public')

let win: BrowserWindow | null

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: join(process.env.VITE_PUBLIC as string, 'vite.svg'),
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(join(process.env.DIST as string, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow();

  // Handle request for desktop sources
  ipcMain.handle('get-desktop-sources', async () => {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 150, height: 150 }
    });
    return sources.map(source => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL()
    }));
  });

  ipcMain.on('remote-input', (event, data) => {
    try {
      const { type } = data;
      const screenSize = robot.getScreenSize();

      if (type === 'mousemove') {
        const { x, y } = data;
        const targetX = x * screenSize.width;
        const targetY = y * screenSize.height;
        robot.moveMouse(targetX, targetY);
      } else if (type === 'click') {
        robot.mouseClick();
      } else if (type === 'keydown') {
        // Simple mapping attempt, robotjs takes strings like "space", "enter", "a"...
        // data.key might be "Enter", " " etc.
        const keyMap: any = {
          'Enter': 'enter',
          'Backspace': 'backspace',
          'ArrowUp': 'up',
          'ArrowDown': 'down',
          'ArrowLeft': 'left',
          'ArrowRight': 'right',
          ' ': 'space'
        };
        const k = keyMap[data.key] || data.key.toLowerCase();
        try {
          robot.keyTap(k);
        } catch { }
      }
    } catch (e) {
      console.error("Input error", e);
    }
  });
})
