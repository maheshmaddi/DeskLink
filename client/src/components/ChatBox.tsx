import { useState, useEffect, useRef } from 'react';

interface Message {
    sender: 'Me' | 'Remote';
    text: string;
}

interface ChatBoxProps {
    messages: Message[];
    onSend: (text: string) => void;
}

export const ChatBox = ({ messages, onSend }: ChatBoxProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const prevMessagesLength = useRef(messages.length);

    useEffect(() => {
        if (messages.length > prevMessagesLength.current) {
            if (!isOpen) {
                setUnreadCount(c => c + 1);
            }
            if (isOpen) {
                scrollToBottom();
            }
        }
        prevMessagesLength.current = messages.length;
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setUnreadCount(0);
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = () => {
        if (!input.trim()) return;
        onSend(input);
        setInput('');
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            pointerEvents: 'auto'
        }}>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="glass"
                    style={{
                        padding: '12px',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        cursor: 'pointer'
                    }}
                >
                    💬
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            background: 'red',
                            color: 'white',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {unreadCount}
                        </span>
                    )}
                </button>
            )}

            {isOpen && (
                <div className="glass" style={{
                    width: '300px',
                    height: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '10px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(0,0,0,0.2)'
                    }}>
                        <span>Chat</span>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }}>✕</button>
                    </div>

                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.sender === 'Me' ? 'flex-end' : 'flex-start',
                                background: msg.sender === 'Me' ? 'var(--primary-color, #646cff)' : 'rgba(255,255,255,0.1)',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                maxWidth: '80%',
                                wordBreak: 'break-word'
                            }}>
                                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '2px' }}>{msg.sender}</div>
                                <div>{msg.text}</div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{
                        padding: '10px',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white'
                            }}
                        />
                        <button onClick={handleSend} style={{ padding: '8px 12px', cursor: 'pointer' }}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};
