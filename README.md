# 🚀 DeskLink

> **The Ultimate Remote Desktop Experience**
>
> *Connect, Control, and Collaborate Seamlessly across devices with high-performance screen sharing and real-time communication.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/Electron-39-blue.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

**DeskLink** is an open-source remote desktop application built with Electron, React, and WebRTC. It provides ultra-low latency screen sharing, remote mouse/keyboard control, two-way audio calling, and real-time text chat - making it a powerful alternative to commercial solutions like AnyDesk and TeamViewer.

---

## ✨ Features at a Glance

DeskLink brings you a robust suite of tools designed for effortless remote collaboration, rivaling industry leaders like AnyDesk.

| Feature | Description |
| :--- | :--- |
| **🖥️ Ultra-Low Latency Screen Sharing** | Experience crystal-clear, real-time desktop streaming with minimal delay. |
| **🖱️ Remote Control** | Take full control of the remote mouse and keyboard as if you were sitting right there. |
| **📞 Two-Way Audio Calling** | Talk naturally with the remote user using integrated high-quality voice chat. |
| **💬 Real-Time Text Chat** | Exchange instant messages securely through the built-in floating chat bubble. |
| **🔒 Secure Connection** | Direct P2P connections via WebRTC ensure your data stays private and fast. |
| **🔊 System Audio Sharing** | Stream system sounds along with the video for a complete multimedia experience. |

---

## 🛠️ Tech Stack

Built with modern, high-performance technologies:
- **Frontend/Client:** Electron, React, TypeScript, Vite
- **Real-time Comm:** WebRTC (SimplePeer), Socket.io
- **Server:** Node.js, Socket.io
- **Styling:** CSS3, Glassmorphism Design

## 🔍 Keywords & Topics

This project is optimized for discovery with these relevant topics:
- `remote-desktop` `remote-control` `screen-sharing` `webrtc` `p2p` `desktop-sharing` `remote-access`
- `electron` `react` `typescript` `vite` `socket.io` `video-streaming` `audio-calling`
- `real-time-communication` `peer-to-peer` `desktop-application` `cross-platform`
- `anydesk-alternative` `teamviewer-alternative` `remote-support` `remote-assistance`
- `screen-capture` `mouse-control` `keyboard-control` `voice-chat` `text-chat`
- `collaboration-tool` `remote-work` `tech-support` `open-source`

---

## 🚀 Getting Started

Follow these simple steps to get your own DeskLink instance running.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Git](https://git-scm.com/)

### 1️⃣ Setting up the Signaling Server

The signaling server handles the initial handshake between peers.

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Start the server
node index.js
```
The server will start on port `5000` by default.

### 2️⃣ Setting up the Client (Electron App)

The client is the desktop application you run on both Host and Guest machines.

```bash
# Open a new terminal and navigate to the client directory
cd client

# Install dependencies
npm install

# Start the application in development mode
npm run dev
```

---

## 📖 How to Use

### 🎭 As a Host (Share your Screen)
1. **Launch the App** and select **"Start Host"**.
2. **Copy the Session ID** displayed on the screen.
3. Share this ID with the person you want to connect with.
4. You can **Mute/Unmute** your mic or use the **Chat** bubble to talk!

### 👤 As a Guest (Control a Screen)
1. **Launch the App** and enter the **Session ID** provided by the Host.
2. Click **"Connect"**.
3. Accept the microphone permission prompt to enable voice chat.
4. You will see the remote screen! You can now control the mouse/keyboard and chat.

---

## 🎨 Design Philosophy
DeskLink isn't just functional; it's designed to be visually stunning.
- **Glassmorphism UI**: Sleek, semi-transparent elements using `backdrop-filter`.
- **Dynamic Interactions**: Smooth transitions and hover effects.
- **Dark Mode**: Easy on the eyes for long sessions.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⭐ Star History

If you find this project useful, please consider giving it a star ⭐ on GitHub!

---

*(c) 2025 DeskLink Team. Built with ❤️ and Code.*
