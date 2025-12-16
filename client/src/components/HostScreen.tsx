import { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { ChatBox } from './ChatBox';

interface HostScreenProps {
    socket: Socket | null;
    onEnd: () => void;
}

// Declare the electronAPI type
declare global {
    interface Window {
        electronAPI?: {
            getDesktopSources: () => Promise<Array<{
                id: string;
                name: string;
                thumbnail: string;
            }>>;
        };
        ipcRenderer?: {
            send: (channel: string, ...args: any[]) => void;
        };
    }
}

export const HostScreen = ({ socket, onEnd }: HostScreenProps) => {
    const [myId, setMyId] = useState('');
    const [status, setStatus] = useState('Waiting for connection...');
    const peerRef = useRef<SimplePeer.Instance | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const [messages, setMessages] = useState<{ sender: 'Me' | 'Remote', text: string }[]>([]);

    useEffect(() => {
        if (!socket) return;

        // Generate ID
        const id = Math.random().toString(36).substring(2, 6).toUpperCase();
        setMyId(id);
        socket.emit('register', id);

        const handleCall = async (data: any) => {
            console.log("Incoming call from", data.from);
            setStatus('Requesting Screen Access...');

            try {
                let screenStream: MediaStream;
                let micStream: MediaStream | null = null;

                // Check if we're in Electron with the electronAPI available
                if (window.electronAPI?.getDesktopSources) {
                    console.log("Using Electron desktopCapturer");
                    const sources = await window.electronAPI.getDesktopSources();
                    console.log("Available sources:", sources);

                    if (sources.length === 0) {
                        throw new Error("No screen sources available");
                    }

                    // Use the first screen source (usually the primary display)
                    const screenSource = sources.find(s => s.id.startsWith('screen:')) || sources[0];
                    console.log("Selected source:", screenSource.name);

                    // 1. Get Screen Stream (Video + System Audio if supported)
                    try {
                        screenStream = await navigator.mediaDevices.getUserMedia({
                            audio: {
                                // @ts-ignore - Electron-specific constraint
                                mandatory: {
                                    chromeMediaSource: 'desktop'
                                }
                            },
                            video: {
                                // @ts-ignore - Electron-specific constraint
                                mandatory: {
                                    chromeMediaSource: 'desktop',
                                    chromeMediaSourceId: screenSource.id,
                                    minWidth: 1280,
                                    maxWidth: 1920,
                                    minHeight: 720,
                                    maxHeight: 1080
                                }
                            }
                        } as any);
                    } catch (err) {
                        console.warn("Could not get system audio, trying video only", err);
                        screenStream = await navigator.mediaDevices.getUserMedia({
                            audio: false,
                            video: {
                                // @ts-ignore - Electron-specific constraint
                                mandatory: {
                                    chromeMediaSource: 'desktop',
                                    chromeMediaSourceId: screenSource.id,
                                    minWidth: 1280,
                                    maxWidth: 1920,
                                    minHeight: 720,
                                    maxHeight: 1080
                                }
                            }
                        } as any);
                    }
                } else {
                    // Fallback for browser (won't work in Electron but useful for testing)
                    console.log("Using standard getDisplayMedia");
                    screenStream = await navigator.mediaDevices.getDisplayMedia({
                        video: true,
                        audio: true // Request system audio in browser
                    });
                }

                // 2. Get Microphone Stream
                try {
                    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                } catch (err) {
                    console.warn("Could not get microphone access", err);
                }

                setStatus('Connecting...');

                // 3. Combine Streams
                const tracks = [
                    ...screenStream.getTracks(),
                    ...(micStream ? micStream.getTracks() : [])
                ];
                const combinedStream = new MediaStream(tracks);
                localStreamRef.current = combinedStream;

                const peer = new SimplePeer({
                    initiator: false,
                    trickle: true,
                    stream: combinedStream,
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:stun1.l.google.com:19302' },
                            { urls: 'stun:stun2.l.google.com:19302' },
                            { urls: 'stun:stun3.l.google.com:19302' },
                            { urls: 'stun:stun4.l.google.com:19302' }
                        ]
                    }
                });

                peer.on('signal', (signal: any) => {
                    if (signal.type) {
                        // This is the answer SDP
                        socket.emit('answer-call', { signal, to: data.from });
                    } else if (signal.candidate) {
                        // This is an ICE candidate
                        socket.emit('ice-candidate', { candidate: signal, to: data.from });
                    }
                });

                peer.on('stream', (remoteStream) => {
                    // This is the stream FROM the Guest (Audio)
                    console.log("Got remote stream (audio) from Guest");
                    if (remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject = remoteStream;
                        remoteAudioRef.current.play().catch(e => console.error("Audio play failed", e));
                    }
                });

                peer.on('data', (data) => {
                    try {
                        const payload = JSON.parse(data.toString());
                        if (payload.type === 'chat') {
                            setMessages(prev => [...prev, { sender: 'Remote', text: payload.message }]);
                        } else {
                            // Remote Input
                            if (window.ipcRenderer) {
                                window.ipcRenderer.send('remote-input', payload);
                            }
                        }
                    } catch (e) { console.error(e); }
                });

                peer.on('connect', () => {
                    setStatus('Device Connected');
                });

                peer.on('close', () => {
                    setStatus('Disconnected');
                    combinedStream.getTracks().forEach(t => t.stop());
                });

                peer.on('error', (err) => {
                    console.error("Peer error", err);
                    setStatus('Connection Error');
                });

                // Handle incoming ICE candidates from Guest
                const handleIceCandidate = (iceData: { candidate: any; from: string }) => {
                    console.log("Received ICE candidate from", iceData.from);
                    if (peerRef.current) {
                        peerRef.current.signal(iceData.candidate);
                    }
                };
                socket.on('ice-candidate', handleIceCandidate);

                peer.signal(data.signal);
                peerRef.current = peer;

            } catch (err) {
                console.error("Failed to get stream", err);
                setStatus('Failed to get screen/audio stream');
            }
        };

        socket.on('call-user', handleCall);

        return () => {
            socket.off('call-user', handleCall);
            socket.off('ice-candidate');
            if (peerRef.current) peerRef.current.destroy();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, [socket]);

    const copyId = () => {
        navigator.clipboard.writeText(myId);
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const handleSendMessage = (text: string) => {
        if (peerRef.current) {
            peerRef.current.send(JSON.stringify({ type: 'chat', message: text }));
            setMessages(prev => [...prev, { sender: 'Me', text }]);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card glass" style={{ textAlign: 'center', width: '300px' }}>
                <h2>Session Host</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Share this ID:</p>
                <div
                    onClick={copyId}
                    style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '16px',
                        borderRadius: '8px',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        margin: '20px 0',
                        cursor: 'pointer',
                        letterSpacing: '4px'
                    }}>
                    {myId || '...'}
                </div>
                <p style={{ marginBottom: '20px', color: status === 'Device Connected' ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                    Status: {status}
                </p>

                {status === 'Device Connected' && (
                    <div style={{ marginBottom: '20px' }}>
                        <button onClick={toggleMute} style={{ marginRight: '10px' }}>
                            {isMuted ? 'Unmute Mic' : 'Mute Mic'}
                        </button>
                    </div>
                )}

                <button className="primary" onClick={onEnd} style={{ width: '100%', backgroundColor: 'var(--error-color)' }}>Stop Sharing</button>

                {/* Hidden Audio for Remote Voice */}
                <audio ref={remoteAudioRef} autoPlay />

                <ChatBox messages={messages} onSend={handleSendMessage} />
            </div>
        </div>
    );
};
