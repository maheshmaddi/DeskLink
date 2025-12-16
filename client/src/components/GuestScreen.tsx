import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { ChatBox } from './ChatBox';

interface GuestScreenProps {
    socket: Socket | null;
    remoteId: string;
    onEnd: () => void;
}

export const GuestScreen = ({ socket, remoteId, onEnd }: GuestScreenProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<SimplePeer.Instance | null>(null);
    const [status, setStatus] = useState('Connecting...');
    const initializedRef = useRef(false);
    const [isMuted, setIsMuted] = useState(false);
    const localStreamRef = useRef<MediaStream | null>(null);
    const [messages, setMessages] = useState<{ sender: 'Me' | 'Remote', text: string }[]>([]);

    useEffect(() => {
        // Prevent double initialization in StrictMode
        if (initializedRef.current) {
            console.log("Already initialized, skipping");
            return;
        }

        if (!socket) {
            console.error("No socket available");
            setStatus('Error: No socket connection');
            return;
        }

        if (!socket.connected) {
            console.error("Socket not connected");
            setStatus('Error: Socket not connected');
            return;
        }

        const startConnection = async () => {
            initializedRef.current = true;
            console.log("Creating peer connection to", remoteId, "from socket", socket.id);

            // Don't attach audio stream initially - it will be added after connection
            // This prevents SDP m-line mismatch since Host has video+audio
            const peer = new SimplePeer({
                initiator: true,
                trickle: true,
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
                console.log("Sending Signal to", remoteId, "from", socket.id);
                if (signal.type) {
                    // This is the offer SDP
                    socket.emit('call-user', { userToCall: remoteId, signalData: signal, from: socket.id });
                } else if (signal.candidate) {
                    // This is an ICE candidate
                    socket.emit('ice-candidate', { candidate: signal, to: remoteId });
                }
            });

            peer.on('stream', (stream) => {
                console.log("Got stream from Host");
                setStatus('Connected');
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            });

            peer.on('connect', async () => {
                console.log("Peer connected, now adding Guest audio...");
                // Now add the Guest's audio stream for two-way communication
                try {
                    const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    localStreamRef.current = localStream;
                    localStream.getTracks().forEach(track => {
                        peer.addTrack(track, localStream);
                    });
                    console.log("Guest audio track added");
                } catch (err) {
                    console.warn("Guest microphone access denied or unavailable", err);
                }
            });

            peer.on('data', (data) => {
                try {
                    const payload = JSON.parse(data.toString());
                    if (payload.type === 'chat') {
                        setMessages(prev => [...prev, { sender: 'Remote', text: payload.message }]);
                    }
                } catch (e) { }
            });

            peer.on('close', () => {
                console.log("Peer closed");
                if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach(t => t.stop());
                }
            });

            peer.on('error', (err) => {
                console.error("Peer error", err);
                setStatus('Error: ' + err.message);
            });

            const handleCallAccepted = (data: any) => {
                console.log("Call accepted, signaling peer");
                peer.signal(data.signal);
            };

            const handleIceCandidate = (iceData: { candidate: any; from: string }) => {
                console.log("Received ICE candidate from", iceData.from);
                if (peerRef.current) {
                    peerRef.current.signal(iceData.candidate);
                }
            };

            socket.on('call-accepted', handleCallAccepted);
            socket.on('ice-candidate', handleIceCandidate);

            peerRef.current = peer;
        };

        startConnection();

        return () => {
            console.log("Cleaning up peer connection");
            socket.off('call-accepted');
            socket.off('ice-candidate');
            if (peerRef.current) peerRef.current.destroy();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(t => t.stop());
            }
            initializedRef.current = false;
        }
    }, [socket, remoteId]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!peerRef.current || !videoRef.current) return;
        const rect = videoRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const data = JSON.stringify({ type: 'mousemove', x, y });
        try { peerRef.current.send(data); } catch { }
    };

    const handleClick = () => {
        if (!peerRef.current) return;
        try { peerRef.current.send(JSON.stringify({ type: 'click' })); } catch { }
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!peerRef.current) return;
        try { peerRef.current.send(JSON.stringify({ type: 'keydown', key: e.key })); } catch { }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

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
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: 'black' }}>
            <div className="glass" style={{
                padding: '10px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                pointerEvents: 'none'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'auto' }}>
                    <strong>DeskLink</strong>
                    <span style={{ opacity: 0.7 }}>|</span>
                    <span>Remote: {remoteId}</span>
                    <span style={{ opacity: 0.7 }}>|</span>
                    <span style={{ color: status === 'Connected' ? 'var(--success-color)' : 'orange' }}>{status}</span>
                </div>

                <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
                    <button onClick={toggleMute} style={{ padding: '6px 16px' }}>
                        {isMuted ? 'Unmute Mic' : 'Mute Mic'}
                    </button>
                    <button className="primary" style={{ padding: '6px 16px', backgroundColor: 'var(--error-color)' }} onClick={onEnd}>Disconnect</button>
                </div>
            </div>
            <div
                style={{ width: '100%', height: '100%', position: 'relative' }}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
            >
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                />
                <ChatBox messages={messages} onSend={handleSendMessage} />
            </div>
        </div>
    );
}
