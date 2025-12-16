# 🚀 DeskLink

> **The Ultimate Remote Desktop Experience**
>
> *Connect, Control, and Collaborate Seamlessly across devices with high-performance screen sharing and real-time communication.*

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

*(c) 2025 DeskLink Team. Built with ❤️ and Code.*
