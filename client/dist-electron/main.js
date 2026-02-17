import { app as n, BrowserWindow as m, ipcMain as l, desktopCapturer as g } from "electron";
import { dirname as k, join as r } from "node:path";
import { fileURLToPath as v } from "node:url";
import s from "robotjs";
const y = k(v(import.meta.url)), c = process.env.DIST || "dist";
process.env.DIST = c;
process.env.VITE_PUBLIC = n.isPackaged ? c : r(c, "../public");
let o;
const d = process.env.VITE_DEV_SERVER_URL;
function w() {
  o = new m({
    icon: r(process.env.VITE_PUBLIC, "vite.svg"),
    webPreferences: {
      preload: r(y, "preload.mjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), o.webContents.on("did-finish-load", () => {
    o == null || o.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), d ? (o.loadURL(d), o.webContents.openDevTools()) : o.loadFile(r(process.env.DIST, "index.html"));
}
n.on("window-all-closed", () => {
  process.platform !== "darwin" && n.quit();
});
n.on("activate", () => {
  m.getAllWindows().length === 0 && w();
});
n.whenReady().then(() => {
  w(), l.handle("get-desktop-sources", async () => (await g.getSources({
    types: ["screen", "window"],
    thumbnailSize: { width: 150, height: 150 }
  })).map((e) => ({
    id: e.id,
    name: e.name,
    thumbnail: e.thumbnail.toDataURL()
  }))), l.on("remote-input", (h, e) => {
    try {
      const { type: t } = e, a = s.getScreenSize();
      if (t === "mousemove") {
        const { x: p, y: i } = e, f = p * a.width, u = i * a.height;
        s.moveMouse(f, u);
      } else if (t === "click")
        s.mouseClick();
      else if (t === "keydown") {
        const i = {
          Enter: "enter",
          Backspace: "backspace",
          ArrowUp: "up",
          ArrowDown: "down",
          ArrowLeft: "left",
          ArrowRight: "right",
          " ": "space"
        }[e.key] || e.key.toLowerCase();
        try {
          s.keyTap(i);
        } catch {
        }
      }
    } catch (t) {
      console.error("Input error", t);
    }
  });
});
