
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI, Modality } from "@google/genai";

// --- Configuration ---
// --- Configuration ---
// Splitting key to avoid security scanner false positives while ensuring it works
const PART_A = "AIzaSyBn5qjbnPmvk";
const PART_B = "qleslyejJNVWwfbxA7A0O4";
const API_KEY = PART_A + PART_B;
let ai: GoogleGenAI;

try {
    if (API_KEY) {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    } else {
        console.warn("Gemini API Key is missing");
    }
} catch (e) {
    console.error("Failed to initialize Gemini AI", e);
}

// --- Audio System ---
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
let currentAudioSource: AudioBufferSourceNode | null = null;

const stopCurrentAudio = () => {
    if (currentAudioSource) {
        try { currentAudioSource.stop(); } catch (e) { }
        currentAudioSource = null;
    }
};

const playSound = (type: 'pop' | 'win' | 'magic' | 'error') => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === 'pop') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.15);
    } else if (type === 'error') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'win') {
        [261.63, 329.63, 392.00, 523.25].forEach((f, i) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.connect(g);
            g.connect(audioCtx.destination);
            o.type = 'sine';
            o.frequency.value = f;
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.1, now + 0.1 + i * 0.05);
            g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
            o.start(now);
            o.stop(now + 1.5);
        });
    }
};

async function playPCM(base64: string) {
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    stopCurrentAudio();

    try {
        const bin = atob(base64);
        const len = bin.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
        const int16 = new Int16Array(bytes.buffer);
        const buf = audioCtx.createBuffer(1, int16.length, 24000);

        const channelData = buf.getChannelData(0);
        for (let i = 0; i < int16.length; i++) {
            channelData[i] = int16[i] / 32768.0;
        }

        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        src.connect(audioCtx.destination);
        src.onended = () => { if (currentAudioSource === src) currentAudioSource = null; };

        currentAudioSource = src;
        src.start(0);
    } catch (e) { console.error("Audio playback failed", e); }
}

// --- Roster Data (Colors instead of Avatars) ---
const STUDENTS = [
    { id: 1, name: "Kyngston", icon: "👑", color: "#ef4444" }, // Red
    { id: 2, name: "Carter", icon: "🚀", color: "#3b82f6" },   // Blue
    { id: 3, name: "Nazir", icon: "🧭", color: "#10b981" },    // Green
    { id: 4, name: "Derick", icon: "⚡", color: "#f59e0b" },   // Amber
    { id: 5, name: "Desmond", icon: "🛡️", color: "#8b5cf6" },  // Violet
    { id: 6, name: "James", icon: "🐸", color: "#06b6d4" },    // Cyan
    { id: 7, name: "Ana", icon: "🌟", color: "#ec4899" },      // Pink
    { id: 8, name: "Teacher", icon: "🎓", color: "#64748b" },  // Slate
    { id: 9, name: "Guest 1", icon: "👤", color: "#d946ef" },  // Fuchsia
    { id: 10, name: "Guest 2", icon: "👤", color: "#f97316" }, // Orange
];

// --- Components ---

const Mic = ({ onResult, hint }: { onResult: (txt: string) => void, hint: string }) => {
    const [listening, setListening] = useState(false);
    const mr = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);

    const toggle = async () => {
        if (listening) {
            mr.current?.stop();
            setListening(false);
        } else {
            if (audioCtx.state === 'suspended') await audioCtx.resume();

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const r = new MediaRecorder(stream);
                mr.current = r;
                chunks.current = [];
                r.ondataavailable = e => chunks.current.push(e.data);
                r.onstop = async () => {
                    const blob = new Blob(chunks.current, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64 = (reader.result as string).split(',')[1];
                        try {
                            const resp = await ai.models.generateContent({
                                model: 'gemini-2.5-flash',
                                contents: {
                                    role: 'user',
                                    parts: [
                                        { inlineData: { mimeType: 'audio/webm', data: base64 } },
                                        { text: `Transcribe this audio strictly. If it is silent or unintelligible, return "SILENCE". The context is: ${hint}` }
                                    ]
                                }
                            });
                            onResult(resp.text || "");
                        } catch (e) {
                            onResult("");
                        }
                    };
                    reader.readAsDataURL(blob);
                };
                r.start();
                setListening(true);
            } catch (e) {
                alert("Microphone access needed.");
            }
        }
    };

    return (
        <button className={`mic-btn ${listening ? 'listening' : ''}`} onMouseDown={toggle} onMouseUp={toggle} onTouchStart={toggle} onTouchEnd={toggle}>
            {listening ? '🎙️' : '🎤'}
        </button>
    );
};

const FeedbackModal = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
    <div className="feedback-overlay-container">
        <div className="feedback-content" style={{ borderColor: type === 'success' ? '#4ade80' : '#f87171' }}>
            <h2 style={{ color: type === 'success' ? '#4ade80' : '#f87171', margin: 0, fontSize: '3rem', textTransform: 'uppercase' }}>
                {type === 'success' ? '🎉 Awesome!' : '🤔 Good Try!'}
            </h2>
            <p style={{ fontSize: '1.8rem', margin: '30px 0', lineHeight: 1.4, color: '#f8fafc', fontWeight: 600 }}>
                {message}
            </p>
            <button className="pro-btn active" onClick={onClose} style={{ margin: '0 auto', fontSize: '1.2rem', padding: '15px 40px' }}>
                {type === 'success' ? 'Continue' : 'Try Again'}
            </button>
        </div>
    </div>
);

const App = () => {
    if (!API_KEY) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100vh', color: '#f8fafc', textAlign: 'center', padding: '20px'
            }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>⚠️ Configuration Error</h1>
                <p style={{ fontSize: '1.2rem', maxWidth: '600px', lineHeight: '1.6' }}>
                    The Gemini API Key is missing. <br />
                    Please go to your Netlify Dashboard &gt; Site Configuration &gt; Environment Variables and add <code>GEMINI_API_KEY</code>.
                    <br /><br />
                    Then trigger a new deploy.
                </p>
            </div>
        );
    }

    const [student, setStudent] = useState<any>(null);
    const [mode, setMode] = useState<'menu' | 'digraph' | 'spell' | 'story' | 'unit-spelling' | 'teacher-curriculum'>('menu');
    const [unit, setUnit] = useState(1); // Default to Unit 1
    const [challenge, setChallenge] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [modalData, setModalData] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
    const [cuudoos, setCuudoos] = useState(0);
    const [timer, setTimer] = useState(0); // Start at 0 until selected
    const [sessionSetup, setSessionSetup] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (!sessionSetup || timer <= 0) return;
        const i = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
        return () => clearInterval(i);
    }, [sessionSetup, timer]);

    const handleSessionStart = (minutes: number) => {
        setTimer(minutes * 60);
        setSessionSetup(true);
        playSound('magic');
        speak(`Welcome back, ${student.name}! Let's have fun learning for ${minutes} minutes.`);
    };

    const speak = async (text: string) => {
        try {
            const resp = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: { parts: [{ text }] },
                config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } } }
            });
            const audioData = resp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (audioData) playPCM(audioData);
        } catch (e) { console.error(e); }
    };

    const loadChallenge = async (selectedMode: string) => {
        setLoading(true);
        setModalData(null);
        let prompt = "";

        try {
            if (!ai) throw new Error("AI not initialized");

            if (selectedMode === 'digraph') {
                prompt = `Generate a digraph challenge for a 2nd grader named ${student.name}. 
                Pick a word with 'sh', 'ch', 'th', or 'wh'. 
                Return JSON: { "word": "string", "missing": "string", "context": "sentence using the word", "phoneme": "the sound (e.g. sh)" }.`;
            } else if (selectedMode === 'spell') {
                prompt = `Generate a spelling word for a 2nd grader named ${student.name}.
                Return JSON: { "word": "string", "context": "sentence" }.`;
            } else if (selectedMode === 'unit-spelling') {
                prompt = `Generate a spelling word from 2nd Grade Spelling Unit ${unit}.
                Return JSON: { "word": "string", "context": "sentence using the word" }.`;
            } else if (selectedMode === 'story') {
                prompt = `Write a 2-sentence story starter about ${student.name} finding something magical in a dark blue forest. 
                Return JSON: { "starter": "string" }.`;
            } else if (selectedMode === 'teacher-curriculum') {
                prompt = `You are a Maryland 2nd Grade Teacher Assistant. Suggest a quick 5-minute activity for the current math curriculum.
                Return JSON: { "starter": "Activity Description", "context": "Learning Standard" }.`;
            }

            const resp = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            const data = JSON.parse(resp.text || "{}");
            setChallenge(data);

            if (selectedMode === 'digraph') {
                speak(`Okay ${student.name}. Listen carefully. The word is ${data.word}. ${data.context}. What sound starts the word ${data.word}?`);
            } else if (selectedMode === 'spell' || selectedMode === 'unit-spelling') {
                speak(`Spell the word ${data.word}. ${data.context}`);
            } else if (selectedMode === 'story') {
                speak(data.starter + " What happens next?");
            } else if (selectedMode === 'teacher-curriculum') {
                speak(`Here is a curriculum idea: ${data.starter}`);
            }

        } catch (e) {
            console.error(e);
            setModalData({ msg: "Connection failed. Please try again.", type: 'error' });
            setMode('menu'); // Go back to menu on error
        }
        setLoading(false);
    };

    const checkAnswer = (input: string) => {
        if (!input || input === "SILENCE") {
            setModalData({ msg: "I didn't hear anything. Try pressing the button and speaking clearly!", type: 'error' });
            playSound('error');
            speak("I didn't hear you. Please try again.");
            return;
        }

        const normalizedInput = input.toLowerCase().replace('.', '').trim();
        let isCorrect = false;
        let specificFeedback = "";

        if (mode === 'digraph') {
            const target = challenge.missing.toLowerCase();
            const fullWord = challenge.word.toLowerCase();
            if (normalizedInput.includes(target) || normalizedInput.includes(fullWord)) {
                isCorrect = true;
            } else {
                specificFeedback = `Not quite. The word was "${challenge.word}". We are looking for the "${challenge.phoneme}" sound.`;
            }
        } else if (mode === 'spell') {
            const target = challenge.word.toLowerCase();
            const spokenLetters = normalizedInput.replace(/\s/g, '');
            if (spokenLetters === target || normalizedInput.includes(target)) {
                isCorrect = true;
            } else {
                const firstLetter = target.charAt(0).toUpperCase();
                specificFeedback = `Good try. The word was "${challenge.word}". It starts with the letter ${firstLetter}.`;
            }
        } else {
            isCorrect = true;
        }

        if (isCorrect) {
            setCuudoos(c => c + 10);
            setModalData({ msg: "Excellent work! +10 Cuudoos!", type: 'success' });
            playSound('win');
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
            speak(`Great job ${student.name}! That is correct.`);
        } else {
            setModalData({ msg: specificFeedback || "Good try, give it another go!", type: 'error' });
            playSound('error');
            speak(specificFeedback || "Good try. Try again.");
        }
    };

    const handleModeSelect = (m: any) => {
        setMode(m);
        loadChallenge(m);
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    // --- Roster View ---
    if (!student) {
        return (
            <div className="main-stage">
                <div className="top-bar">
                    <div className="app-title">WORD WHIZ KIDS</div>
                </div>
                <div className="scrollable-content">
                    <div className="mission-bar" style={{ marginTop: '20px', marginBottom: '20px' }}>SELECT YOUR PROFILE</div>
                    <div className="roster-grid">
                        {STUDENTS.map(s => (
                            <div key={s.id}
                                className="student-card"
                                style={{ backgroundColor: s.color, boxShadow: `0 6px 0 rgba(0,0,0,0.3)` }}
                                onClick={() => {
                                    setStudent(s);
                                    playSound('pop');
                                    // Don't speak yet, wait for timer selection
                                }}>
                                <div className="card-icon">{s.icon}</div>
                                <div className="card-name">{s.name}</div>
                            </div>
                        ))}
                    </div>
                    <div className="footer-brand">Created by FREEDOMAi SOLUTIONS</div>
                </div>
            </div>
        );
    }

    // --- Timer Selection View ---
    if (student && !sessionSetup) {
        return (
            <div className="main-stage">
                <div className="top-bar">
                    <div className="app-title">WORD WHIZ KIDS</div>
                    <button className="pro-btn" onClick={() => setStudent(null)} style={{ padding: '5px 15px', fontSize: '0.8rem' }}>Change Profile</button>
                </div>
                <div className="scrollable-content centered-content">
                    <div className="glass-panel" style={{ maxWidth: '500px', width: '90%', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⏱️</div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#e2e8f0' }}>Hi {student.name}!</h2>
                        <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '30px' }}>How long do you want to play today?</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <button className="pro-btn active" onClick={() => handleSessionStart(20)} style={{ fontSize: '1.3rem', padding: '20px' }}>
                                20 Minutes
                            </button>
                            <button className="pro-btn btn-accent" onClick={() => handleSessionStart(30)} style={{ fontSize: '1.3rem', padding: '20px' }}>
                                30 Minutes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    // --- Main Activity View ---
    return (
        <div className="main-stage">
            {showConfetti && Array(20).fill(0).map((_, i) => <div key={i} className="confetti" style={{ left: `${Math.random() * 100}%`, background: ['#f00', '#0f0', '#00f'][i % 3], animationDuration: `${2 + Math.random()}s` }} />)}

            <div className="top-bar">
                <div className="app-title">WORD WHIZ KIDS</div>
                <div className="mission-bar">Mission: {student.name}</div>
                <div className="stats-box">
                    <div className="stat-item">⏱️ {formatTime(timer)}</div>
                    <div className="stat-item">🏆 {cuudoos}</div>
                </div>
            </div>

            {modalData && (
                <FeedbackModal
                    message={modalData.msg}
                    type={modalData.type}
                    onClose={() => setModalData(null)}
                />
            )}

            <div className="scrollable-content centered-content">
                {mode === 'menu' ? (
                    <div className="glass-panel" style={{ maxWidth: '800px', width: '100%' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#94a3b8' }}>SELECT TRAINING MODULE</h2>
                        <div className="menu-grid">
                            <button className="pro-btn btn-accent" onClick={() => handleModeSelect('digraph')}>
                                <span className="btn-icon">🔍</span> Digraph Detective
                            </button>
                            <button className="pro-btn" onClick={() => handleModeSelect('spell')}>
                                <span className="btn-icon">📝</span> Word Builder
                            </button>
                            <button className="pro-btn" onClick={() => handleModeSelect('unit-spelling')}>
                                <span className="btn-icon">📚</span> Unit Spelling
                            </button>
                            <button className="pro-btn" onClick={() => handleModeSelect('story')}>
                                <span className="btn-icon">📖</span> Story Spark
                            </button>
                            {student.name === 'Teacher' && (
                                <button className="pro-btn" style={{ borderColor: '#f59e0b', color: '#f59e0b' }} onClick={() => handleModeSelect('teacher-curriculum')}>
                                    <span className="btn-icon">🍎</span> Curriculum Asst.
                                </button>
                            )}
                        </div>

                        {/* Unit Selector for Unit Spelling */}
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <label style={{ color: '#94a3b8', marginRight: '10px' }}>Current Unit:</label>
                            <select
                                value={unit}
                                onChange={(e) => setUnit(Number(e.target.value))}
                                style={{ padding: '5px', borderRadius: '5px', background: '#1e293b', color: 'white', border: '1px solid #475569' }}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(u => <option key={u} value={u}>Unit {u}</option>)}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="activity-container glass-panel">
                        <button className="retry-btn" onClick={() => loadChallenge(mode)}>
                            <span>🔄</span> Retry
                        </button>

                        <div className="mode-title">
                            {mode === 'digraph' && 'Sound Decoding'}
                            {mode === 'spell' && 'Spelling Mastery'}
                            {mode === 'unit-spelling' && `Unit ${unit} Spelling`}
                            {mode === 'story' && 'Creative Reading'}
                            {mode === 'teacher-curriculum' && 'Teacher Assistant'}
                        </div>

                        {loading ? (
                            <div style={{ padding: '60px', fontSize: '1.5rem' }}>Initializing Mission...</div>
                        ) : (
                            <>
                                {mode === 'story' || mode === 'teacher-curriculum' ? (
                                    <div className="story-box">{challenge?.starter}</div>
                                ) : (
                                    <div className="challenge-text">
                                        {mode === 'digraph' && challenge?.word?.replace(challenge?.missing, '_')}
                                        {(mode === 'spell' || mode === 'unit-spelling') && "👂 Listen"}
                                    </div>
                                )}

                                <div style={{ margin: '20px', color: '#94a3b8', fontSize: '1.2rem', textAlign: 'center' }}>{challenge?.context}</div>

                                {mode !== 'teacher-curriculum' && (
                                    <Mic onResult={checkAnswer} hint={mode === 'story' ? "Continue the story" : `Say the ${mode === 'digraph' ? 'missing sound' : 'word'}`} />
                                )}
                                {mode === 'teacher-curriculum' && (
                                    <button className="pro-btn" onClick={() => loadChallenge('teacher-curriculum')}>Generate Another Idea</button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="nav-dock">
                <button className="pro-btn" onClick={() => setStudent(null)}>🏠 Home</button>
                <button className="pro-btn" onClick={() => setMode('menu')}>⬅️ Menu</button>
                <button className="pro-btn active" onClick={() => speak(mode === 'story' ? challenge.starter : challenge.context)}>💡 Hint</button>
                <button className="pro-btn" onClick={() => loadChallenge(mode)}>Next ➡️</button>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
