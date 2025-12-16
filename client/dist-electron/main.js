import { app, BrowserWindow, ipcMain, desktopCapturer } from "electron";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import robot from "robotjs";
const __dirname$1 = dirname(fileURLToPath(import.meta.url));
const DIST = process.env.DIST || "dist";
process.env.DIST = DIST;
process.env.VITE_PUBLIC = app.isPackaged ? DIST : join(DIST, "../public");
let win;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
function createWindow() {
  win = new BrowserWindow({
    icon: join(process.env.VITE_PUBLIC, "vite.svg"),
    webPreferences: {
      preload: join(__dirname$1, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(join(process.env.DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
  ipcMain.handle("get-desktop-sources", async () => {
    const sources = await desktopCapturer.getSources({
      types: ["screen", "window"],
      thumbnailSize: { width: 150, height: 150 }
    });
    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL()
    }));
  });
  ipcMain.on("remote-input", (event, data) => {
    try {
      const { type } = data;
      const screenSize = robot.getScreenSize();
      if (type === "mousemove") {
        const { x, y } = data;
        const targetX = x * screenSize.width;
        const targetY = y * screenSize.height;
        robot.moveMouse(targetX, targetY);
      } else if (type === "click") {
        robot.mouseClick();
      } else if (type === "keydown") {
        const keyMap = {
          "Enter": "enter",
          "Backspace": "backspace",
          "ArrowUp": "up",
          "ArrowDown": "down",
          "ArrowLeft": "left",
          "ArrowRight": "right",
          " ": "space"
        };
        const k = keyMap[data.key] || data.key.toLowerCase();
        try {
          robot.keyTap(k);
        } catch {
        }
      }
    } catch (e) {
      console.error("Input error", e);
    }
  });
});
