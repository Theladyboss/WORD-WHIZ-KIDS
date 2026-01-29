import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Send, MessageSquare, Volume2, VolumeX } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Audio context logic
let _audioCtx: AudioContext | null = null;
const getAudioContext = () => {
    if (!_audioCtx) {
        try { _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); }
        catch (e) { console.error("Audio init failed", e); }
    }
    return _audioCtx;
};
let currentAudioSource: AudioBufferSourceNode | null = null;

async function playAudio(base64: string, onEnded?: () => void) {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume().catch(() => { });
    if (currentAudioSource) try { currentAudioSource.stop(); } catch (e) { }

    try {
        const binStr = atob(base64);
        const len = binStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);

        const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
        const src = ctx.createBufferSource();
        src.buffer = audioBuffer;
        src.connect(ctx.destination);
        src.onended = () => {
            if (currentAudioSource === src) currentAudioSource = null;
            if (onEnded) onEnded();
        };

        currentAudioSource = src;
        src.start(0);
    } catch (e) {
        console.error("Audio playback failed", e);
        if (onEnded) onEnded();
    }
}

interface Message {
    role: 'user' | 'model';
    content: string;
}

const LexaChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Hello! I'm Lexa, your AI Co-Pilot. How can I help you build your freedom today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const speak = async (text: string) => {
        if (isMuted) return;
        setIsSpeaking(true);
        try {
            const response = await fetch('/.netlify/functions/speak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voiceId: 'en-US-Journey-O' })
            });
            const data = await response.json();
            if (data.audioContent) {
                await playAudio(data.audioContent, () => setIsSpeaking(false));
            }
        } catch (e) {
            console.error("Speak error", e);
            setIsSpeaking(false);
        }
    };

    // Auto-speak welcome message when opened first time
    useEffect(() => {
        if (isOpen && messages.length === 1 && !isMuted) {
            // Small delay to ensure smooth entry
            setTimeout(() => speak(messages[0].content), 500);
        }
    }, [isOpen]);

    const startListening = () => {
        console.log("🎤 startListening called");
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error("❌ Speech recognition NOT supported");
            alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        try {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                console.log("🎤 Recognition started");
                setIsListening(true);
            };

            recognition.onresult = (event: any) => {
                console.log("🎤 Recognition result received");
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
            };

            recognition.onerror = (event: any) => {
                console.error("🎤 Speech recognition error:", event.error);
                if (event.error === 'not-allowed') {
                    alert("Microphone access blocked. Please allow microphone permission in your browser settings.");
                } else if (event.error === 'network') {
                    alert("Network error. Speech recognition requires an internet connection.");
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                console.log("🎤 Recognition ended");
                setIsListening(false);
            };

            recognition.start();
        } catch (e) {
            console.error("🎤 Failed to initialize SpeechRecognition:", e);
            alert("Failed to start microphone: " + e);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsTyping(true);

        try {
            // In a real deployment, this URL would be relative or configured
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages
                })
            });

            const data = await response.json();

            if (data.reply) {
                setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
                speak(data.reply);
            } else {
                setMessages(prev => [...prev, { role: 'model', content: "I'm having trouble connecting to my neural network right now. Please try again later." }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'model', content: "Connection error. Please check your internet or API configuration." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        style={{
                            position: 'absolute',
                            bottom: '80px',
                            right: '0',
                            width: '350px',
                            height: '500px',
                            background: 'rgba(10, 10, 10, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(43, 188, 154, 0.3)',
                            borderRadius: '20px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '15px 20px',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'linear-gradient(90deg, rgba(43, 188, 154, 0.1), transparent)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: '#2bbc9a',
                                    boxShadow: isSpeaking ? '0 0 15px #2bbc9a, 0 0 30px #2bbc9a' : '0 0 10px #2bbc9a',
                                    transition: 'all 0.3s ease'
                                }} />
                                <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>LEXA <span style={{ fontSize: '0.8em', opacity: 0.7 }}>AI CO-PILOT</span></span>
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button onClick={() => {
                                    setIsMuted(!isMuted);
                                    if (currentAudioSource) currentAudioSource.stop();
                                }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                </button>
                                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {messages.map((msg, idx) => (
                                <div key={idx} style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    padding: '12px 16px',
                                    borderRadius: '15px',
                                    background: msg.role === 'user' ? 'linear-gradient(135deg, #2bbc9a, #0088d4)' : 'rgba(255,255,255,0.05)',
                                    border: msg.role === 'model' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5',
                                    borderBottomRightRadius: msg.role === 'user' ? '2px' : '15px',
                                    borderBottomLeftRadius: msg.role === 'model' ? '2px' : '15px'
                                }}>
                                    {msg.content}
                                </div>
                            ))}
                            {isTyping && (
                                <div style={{ alignSelf: 'flex-start', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', borderBottomLeftRadius: '2px' }}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} style={{ width: '6px', height: '6px', background: '#aaa', borderRadius: '50%' }} />
                                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} style={{ width: '6px', height: '6px', background: '#aaa', borderRadius: '50%' }} />
                                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} style={{ width: '6px', height: '6px', background: '#aaa', borderRadius: '50%' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} style={{ padding: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask Lexa..."
                                style={{
                                    flex: 1,
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '25px',
                                    padding: '10px 20px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                            <button type="button" onClick={startListening} style={{
                                background: isListening ? '#ef4444' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'white',
                                transition: 'all 0.2s',
                                animation: isListening ? 'pulse 1.5s infinite' : 'none'
                            }}>
                                <Mic size={18} />
                            </button>
                            <button type="submit" disabled={!input.trim()} style={{
                                background: input.trim() ? 'var(--color-green)' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: input.trim() ? 'pointer' : 'default',
                                color: input.trim() ? 'black' : 'rgba(255,255,255,0.3)',
                                transition: 'all 0.2s'
                            }}>
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Orb Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-green), var(--color-blue))',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px var(--color-primary-glow)',
                    position: 'relative',
                    zIndex: 1001
                }}
            >
                {isOpen ? <X size={24} color="white" /> : <MessageSquare size={24} color="white" />}

                {/* Pulse Effect */}
                {!isOpen && (
                    <motion.div
                        style={{
                            position: 'absolute',
                            inset: -5,
                            borderRadius: '50%',
                            border: '2px solid var(--color-green)',
                            opacity: 0.5
                        }}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </motion.button>
        </div >
    );
};

export default LexaChat;
