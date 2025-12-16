import { useState, useEffect } from 'react'
import io, { Socket } from 'socket.io-client'
import './index.css'

import { WelcomeScreen } from './components/WelcomeScreen'
import { HostScreen } from './components/HostScreen'
import { GuestScreen } from './components/GuestScreen'

type AppMode = 'welcome' | 'host' | 'guest';

// In development, assume internal server port. In prod, configurable.
const SERVER_URL = 'http://localhost:5000';

function App() {
  const [mode, setMode] = useState<AppMode>('welcome');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [targetId, setTargetId] = useState('');

  useEffect(() => {
    const s = io(SERVER_URL);
    setSocket(s);

    s.on('connect', () => {
      console.log('Connected to signaling server, socket ID:', s.id);
    });

    s.on('disconnect', () => {
      console.log('Disconnected from signaling server');
    });

    s.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      s.disconnect();
    }
  }, []);

  return (
    <div className="app-container">
      {mode === 'welcome' && (
        <WelcomeScreen
          onStartHost={() => setMode('host')}
          onConnect={(id) => {
            setTargetId(id);
            setMode('guest');
          }}
        />
      )}
      {mode === 'host' && <HostScreen socket={socket} onEnd={() => setMode('welcome')} />}
      {mode === 'guest' && <GuestScreen socket={socket} remoteId={targetId} onEnd={() => setMode('welcome')} />}
    </div>
  );
}

export default App
