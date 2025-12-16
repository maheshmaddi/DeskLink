import { useState } from 'react';

interface WelcomeScreenProps {
    onStartHost: () => void;
    onConnect: (id: string) => void;
}

export const WelcomeScreen = ({ onStartHost, onConnect }: WelcomeScreenProps) => {
    const [remoteId, setRemoteId] = useState('');

    return (
        <div className="flex-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '40px' }}>
            <h1 style={{ fontSize: '3rem', margin: 0 }}>DeskLink</h1>

            <div className="card glass" style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <h3>Start Session</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Allow others to control this computer.</p>
                </div>
                <button className="primary" onClick={onStartHost}>Share Screen</button>
            </div>

            <div className="card glass" style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <h3>Connect to Session</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Control a remote computer.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        style={{ flex: 1 }}
                        placeholder="Enter Remote ID"
                        value={remoteId}
                        onChange={(e) => setRemoteId(e.target.value)}
                    />
                    <button className="primary" onClick={() => onConnect(remoteId)} disabled={!remoteId}>Connect</button>
                </div>
            </div>
        </div>
    );
};
