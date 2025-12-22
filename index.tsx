/// <reference types="vite/client" />
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI, Modality } from "@google/genai";
import { OFFLINE_DATA } from "./offlineData";

// --- Configuration ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
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
// COMPLETELY LAZY LOAD - No init until user interaction
let _audioCtx: AudioContext | null = null;
const getAudioContext = () => {
    // Only create if it doesn't exist AND we are inside a user interaction
    if (!_audioCtx) {
        try {
            const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtor) {
                _audioCtx = new AudioCtor();
            }
        } catch (e) {
            console.error("Audio init failed", e);
        }
    }
    return _audioCtx;
};
let currentAudioSource: AudioBufferSourceNode | null = null;

const stopCurrentAudio = () => {
    if (currentAudioSource) {
        try { currentAudioSource.stop(); } catch (e) { }
        currentAudioSource = null;
    }
};

const playSound = (type: 'pop' | 'win' | 'magic' | 'error') => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => { });

    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
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
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.connect(g);
                g.connect(ctx.destination);
                o.type = 'sine';
                o.frequency.value = f;
                g.gain.setValueAtTime(0, now);
                g.gain.linearRampToValueAtTime(0.1, now + 0.1 + i * 0.05);
                g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
                o.start(now);
                o.stop(now + 1.5);
            });
        }
    } catch (e) { console.error("Sound error", e); }
};

async function playPCM(base64: string) {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume().catch(() => { });
    stopCurrentAudio();

    try {
        const bin = atob(base64);
        const len = bin.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);

        // Ensure even length
        const safeBytes = bytes.length % 2 === 0 ? bytes : bytes.slice(0, bytes.length - 1);
        const int16 = new Int16Array(safeBytes.buffer);
        const buf = ctx.createBuffer(1, int16.length, 24000);

        const channelData = buf.getChannelData(0);
        for (let i = 0; i < int16.length; i++) {
            channelData[i] = int16[i] / 32768.0;
        }

        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.onended = () => { if (currentAudioSource === src) currentAudioSource = null; };

        currentAudioSource = src;
        src.start(0);
    } catch (e) { console.error("Audio playback failed", e); }
}

// --- Roster Data (Colors instead of Avatars) ---
const STUDENTS = [
    { id: 1, name: "Kyngston", icon: "👑", color: "#ef4444", pin: "201" }, // Red
    { id: 2, name: "Carter", icon: "🚀", color: "#3b82f6", pin: "202" },   // Blue
    { id: 3, name: "Nazir", icon: "🧭", color: "#10b981", pin: "203" },    // Green
    { id: 4, name: "Derick", icon: "⚡", color: "#f59e0b", pin: "204" },   // Amber
    { id: 5, name: "Desmond", icon: "🛡️", color: "#8b5cf6", pin: "205" },  // Violet
    { id: 6, name: "James", icon: "🐸", color: "#06b6d4", pin: "206" },    // Cyan
    { id: 7, name: "Ana", icon: "🌟", color: "#ec4899", pin: "207" },      // Pink
    { id: 8, name: "Teacher", icon: "🎓", color: "#64748b", pin: "1234" },  // Slate
    { id: 9, name: "Jasmine", icon: "🌸", color: "#d946ef", pin: "0000" },  // Fuchsia
    { id: 10, name: "Axel", icon: "🎸", color: "#f97316", pin: "0000" },    // Orange
];

const UNIT_WORDS: { [key: number]: string[] } = {
    1: ["dish", "than", "chop", "such", "rush", "which", "bath", "this", "kick", "sock"],
    2: ["stop", "clap", "spin", "swim", "last", "skin", "drag", "sent", "tenth", "lunch"],
    3: ["catch", "ridge", "judge", "split", "strum", "match", "splash", "strap", "dodge", "sprint"],
    4: ["picnic", "napkin", "finish", "bandit", "cobweb", "exit", "traffic", "cabin", "contest", "sandwich"],
    5: ["lady", "funny", "lucky", "begin", "menu", "relax", "volcano", "music", "respect", "robot"],
    6: ["attack", "metal", "adult", "cotton", "wisdom", "salad", "broken", "gallon", "apron", "basket"],
    7: ["plate", "size", "excuse", "prize", "cupcake", "sunshine", "pole", "cute", "polite", "broke"],
    8: ["native", "climate", "message", "negative", "luggage", "palace", "cottage", "pirate", "necklace", "active"],
    9: ["queen", "detail", "display", "paint", "sweet", "clean", "treat", "toasty", "rainbow", "high"],
    10: ["below", "groan", "key", "shield", "alley", "belief", "field", "delay", "bright", "afraid"],
    11: ["artist", "party", "carpet", "apart", "remark", "forgive", "story", "report", "acorn", "orbit"],
    12: ["before", "indoor", "more", "court", "soar", "airplane", "parent", "pear", "hair", "share"],
    13: ["survive", "partner", "after", "verb", "ever", "hurt", "heard", "insert", "shirt", "church"],
    14: ["nectar", "doctor", "motor", "grammar", "collar", "factor", "forward", "word", "polar", "flavor"],
    15: ["grew", "super", "include", "unscrew", "sooner", "flute", "truth", "boost", "salute", "cartoon"],
    16: ["enjoy", "royal", "boil", "loyal", "spoil", "point", "oily", "soybean", "boy", "noisy"]
};

// --- Components ---

const AnswerInput: React.FC<{ onResult: (txt: string) => void, hint: string }> = ({ onResult, hint }) => {
    const [text, setText] = useState("");

    const handleSubmit = () => {
        if (text.trim()) {
            onResult(text);
            setText("");
        }
    };

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={hint}
                style={{
                    width: '90%',
                    padding: '15px',
                    fontSize: '1.2rem',
                    borderRadius: '12px',
                    border: '2px solid #475569',
                    background: '#1e293b',
                    color: 'white',
                    textAlign: 'center'
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
                className="pro-btn active"
                onClick={handleSubmit}
                style={{ padding: '15px 40px', fontSize: '1.2rem', width: 'auto' }}
            >
                Submit Answer
            </button>
        </div>
    );
};

const FeedbackModal = ({ message, type, onClose, onContinue }: { message: string, type: 'success' | 'error', onClose: () => void, onContinue?: () => void }) => (
    <div className="feedback-overlay-container">
        <div className="feedback-content" style={{ borderColor: type === 'success' ? '#4ade80' : '#f87171' }}>
            <h2 style={{ color: type === 'success' ? '#4ade80' : '#f87171', margin: 0, fontSize: '3rem', textTransform: 'uppercase' }}>
                {type === 'success' ? '🎉 Awesome!' : '🤔 Good Try!'}
            </h2>
            <p style={{ fontSize: '1.8rem', margin: '30px 0', lineHeight: 1.4, color: '#f8fafc', fontWeight: 600 }}>
                {message}
            </p>
            <button className="pro-btn active" onClick={type === 'success' && onContinue ? onContinue : onClose} style={{ margin: '0 auto', fontSize: '1.2rem', padding: '15px 40px' }}>
                {type === 'success' ? 'Continue' : 'Try Again'}
            </button>
        </div>
    </div>
);

const PinPad = ({ onUnlock, onClose, title }: { onUnlock: (pin: string) => void, onClose: () => void, title: string }) => {
    const [pin, setPin] = useState("");
    const handleNum = (n: string) => {
        if (pin.length < 4) {
            const newPin = pin + n;
            setPin(newPin);
            if (newPin.length === 4) onUnlock(newPin);
        }
    };
    return (
        <div className="feedback-overlay-container">
            <div className="glass-panel" style={{ maxWidth: '300px', textAlign: 'center' }}>
                <h3>{title}</h3>
                <div style={{ fontSize: '2rem', letterSpacing: '10px', margin: '20px 0', minHeight: '40px' }}>
                    {pin.replace(/./g, '•')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <button key={n} className="pro-btn" onClick={() => handleNum(n.toString())} style={{ justifyContent: 'center', fontSize: '1.5rem' }}>{n}</button>
                    ))}
                    <button className="pro-btn" onClick={() => setPin("")} style={{ justifyContent: 'center' }}>C</button>
                    <button className="pro-btn" onClick={() => handleNum("0")} style={{ justifyContent: 'center', fontSize: '1.5rem' }}>0</button>
                    <button className="pro-btn" onClick={onClose} style={{ justifyContent: 'center' }}>❌</button>
                </div>
            </div>
        </div>
    );
};

const TeacherChat = ({ onClose }: { onClose: () => void }) => {
    const [msgs, setMsgs] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const send = async () => {
        if (!input.trim()) return;
        const newMsgs = [...msgs, { role: 'user' as const, text: input }];
        setMsgs(newMsgs);
        setInput("");
        setLoading(true);
        try {
            if (!ai) throw new Error("AI not available");
            const resp = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: `You are a helpful Teaching Assistant for 2nd Grade. Answer briefly and helpfully. History: ${JSON.stringify(newMsgs)}. User: ${input}`
            });
            setMsgs([...newMsgs, { role: 'ai', text: resp.text || "I'm not sure, sorry!" }]);
        } catch (e) { setMsgs([...newMsgs, { role: 'ai', text: "Error connecting to AI." }]); }
        setLoading(false);
    };

    return (
        <div className="feedback-overlay-container">
            <div className="glass-panel" style={{ width: '90%', maxWidth: '600px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3>🍎 Teacher Assistant Chat</h3>
                    <button className="pro-btn" onClick={onClose}>Close</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '10px', marginBottom: '10px' }}>
                    {msgs.map((m, i) => (
                        <div key={i} style={{ textAlign: m.role === 'user' ? 'right' : 'left', margin: '5px 0' }}>
                            <span style={{ background: m.role === 'user' ? '#3b82f6' : '#475569', padding: '8px 12px', borderRadius: '10px', display: 'inline-block' }}>
                                {m.text}
                            </span>
                        </div>
                    ))}
                    {loading && <div>Thinking...</div>}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none' }} placeholder="Ask a question..." />
                    <button className="pro-btn active" onClick={send}>Send</button>
                </div>
            </div>
        </div>
    );
};

const WhackAVowel = ({ onExit }: { onExit: () => void }) => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [grid, setGrid] = useState<string[]>(Array(9).fill(''));
    const [active, setActive] = useState<number | null>(null);
    const timeLeftRef = useRef(30);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(t => {
                const newTime = t - 1;
                timeLeftRef.current = newTime;
                if (newTime <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        const mole = setInterval(() => {
            if (timeLeftRef.current > 0) {
                const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                const vowels = "AEIOU";
                const isVowel = Math.random() > 0.5;
                const char = isVowel ? vowels[Math.floor(Math.random() * vowels.length)] : letters[Math.floor(Math.random() * letters.length)];

                const pos = Math.floor(Math.random() * 9);
                setActive(pos);
                setGrid(prev => {
                    const newGrid = [...prev];
                    newGrid[pos] = char;
                    return newGrid;
                });

                setTimeout(() => {
                    setActive(null);
                    setGrid(prev => {
                        const newGrid = [...prev];
                        newGrid[pos] = '';
                        return newGrid;
                    });
                }, 800);
            }
        }, 1000);

        return () => { clearInterval(timer); clearInterval(mole); };
    }, []);

    const handleWhack = (index: number, char: string) => {
        if (index === active && "AEIOU".includes(char)) {
            setScore(s => s + 10);
            playSound('pop');
        }
    };

    return (
        <div className="glass-panel" style={{ textAlign: 'center' }}>
            <h2>🔨 Whack-a-Vowel</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', marginBottom: '20px' }}>
                <span>Score: {score}</span>
                <span>Time: {timeLeft}s</span>
            </div>

            {timeLeft === 0 ? (
                <div>
                    <h3>Game Over!</h3>
                    <p>Final Score: {score}</p>
                    <button className="pro-btn" onClick={onExit}>Exit</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
                    {grid.map((char, i) => (
                        <div key={i}
                            onClick={() => handleWhack(i, char)}
                            style={{
                                height: '80px',
                                background: i === active ? '#f472b6' : '#334155',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                cursor: 'pointer',
                                transition: 'all 0.1s'
                            }}>
                            {i === active ? char : ''}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const App = () => {
    // Non-blocking check for API Key
    useEffect(() => {
        if (!API_KEY) {
            console.warn("API Key missing - AI features will be disabled.");
        }
    }, []);

    const [student, setStudent] = useState<any>(null);
    const [mode, setMode] = useState<'menu' | 'digraph' | 'spell' | 'story' | 'unit-spelling' | 'teacher-curriculum' | 'syllable' | 'schwa' | 'vce' | 'games' | 'whack-a-vowel'>('menu');
    const [unit, setUnit] = useState(1);
    const [challenge, setChallenge] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [modalData, setModalData] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
    const [cuudoos, setCuudoos] = useState(0);
    const [timer, setTimer] = useState(0);
    const [sessionSetup, setSessionSetup] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [streak, setStreak] = useState(0);

    const [gamesUnlocked, setGamesUnlocked] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [restartTrigger, setRestartTrigger] = useState(0);
    const [nextChallenge, setNextChallenge] = useState<{ mode: string, data: any } | null>(null);

    // New State
    const [lockMode, setLockMode] = useState<'none' | 'student' | 'teacher'>('none');
    const [targetStudent, setTargetStudent] = useState<any>(null);
    const [attempts, setAttempts] = useState(0);
    const [showTeacherChat, setShowTeacherChat] = useState(false);
    const [language, setLanguage] = useState<'en' | 'es'>('en');
    const [syllableStep, setSyllableStep] = useState(0); // 0: count, 1+: syllable index + 1


    useEffect(() => {
        if (!sessionSetup || timer <= 0) return;
        const i = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
        return () => clearInterval(i);
    }, [sessionSetup, timer]);



    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered', reg))
                .catch(err => console.log('SW failed', err));
        }
    }, []);

    const handleSessionStart = async (minutes: number) => {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') await ctx.resume().catch(() => { });
        setTimer(minutes * 60);
        setSessionSetup(true);
        playSound('magic');
        speak(`Welcome back, ${student.name}! Let's have fun learning for ${minutes} minutes.`);
    };

    const logToScreen = (msg: string) => {
        console.log(msg);
        const el = document.getElementById('debug-log-content');
        if (el) el.innerText = msg + '\n' + el.innerText.substring(0, 200);
    };

    const speak = async (text: string) => {
        logToScreen(`Speaking: "${text}"...`);
        let aiSuccess = false;

        // 1. Try AI Voice
        try {
            if (ai) {
                const ctx = getAudioContext();
                if (ctx && ctx.state === 'suspended') await ctx.resume().catch(() => { });

                logToScreen("Requesting AI Audio...");
                const resp = await ai.models.generateContent({
                    model: 'gemini-2.0-flash-exp',
                    contents: { parts: [{ text }] },
                    config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } } }
                });
                const audioData = resp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (audioData) {
                    logToScreen("AI Audio received. Playing...");
                    await playPCM(audioData);
                    aiSuccess = true;
                    logToScreen("AI Audio playing.");
                } else {
                    logToScreen("AI response had no audio data.");
                }
            } else {
                logToScreen("AI not initialized (No Key).");
            }
        } catch (aiError: any) {
            logToScreen(`AI Failed: ${aiError.message || aiError}`);
        }

        if (aiSuccess) return;

        // 2. Fallback to System Voice
        try {
            logToScreen("Trying System Voice...");
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 0.9;
            const voices = window.speechSynthesis.getVoices();
            logToScreen(`Found ${voices.length} system voices.`);
            const preferred = voices.find(v => v.name.includes("Google US English")) || voices.find(v => v.lang === 'en-US');
            if (preferred) {
                u.voice = preferred;
                logToScreen(`Selected voice: ${preferred.name}`);
            }
            window.speechSynthesis.speak(u);
            logToScreen("System speak command sent.");
        } catch (sysError: any) {
            logToScreen(`System Failed: ${sysError.message || sysError}`);
        }
    };

    const fetchChallengeData = async (selectedMode: string) => {
        // Check for offline status
        if (!navigator.onLine) {
            console.log("Offline mode active. Using fallback data.");
            const dataList = (OFFLINE_DATA as any)[selectedMode];
            if (dataList && dataList.length > 0) {
                const randomItem = dataList[Math.floor(Math.random() * dataList.length)];
                return { ...randomItem }; // Return a copy
            }
            // Fallback for unit spelling if offline (reuse spell list or similar)
            if (selectedMode === 'unit-spelling') {
                const words = UNIT_WORDS[unit] || UNIT_WORDS[1];
                const word = words[Math.floor(Math.random() * words.length)];
                return { word, context: `Spell the word ${word}.` };
            }
            return { word: "Offline", context: "You are offline. Please reconnect." };
        }

        let prompt = "";
        const langInstruction = language === 'es' ? "Generate the content in Spanish." : "";

        if (selectedMode === 'digraph') {
            prompt = `Generate a digraph challenge for a 2nd grader named ${student.name}. ${langInstruction}
            Pick a word with 'sh', 'ch', 'th', or 'wh'. 
            Return JSON: { "word": "string", "missing": "string", "context": "sentence using the word", "phoneme": "the sound (e.g. sh)" }.`;
        } else if (selectedMode === 'spell') {
            prompt = `Generate a spelling word for a 2nd grader named ${student.name}. ${langInstruction}
            Return JSON: { "word": "string", "context": "sentence" }.`;
        } else if (selectedMode === 'unit-spelling') {
            const words = UNIT_WORDS[unit] || UNIT_WORDS[1];
            const word = words[Math.floor(Math.random() * words.length)];
            prompt = `Generate a sentence for a 2nd grader using the spelling word "${word}". ${langInstruction}
            Return JSON: { "word": "${word}", "context": "sentence using the word" }.`;
        } else if (selectedMode === 'syllable') {
            prompt = `Generate a challenge about 2nd Grade syllable types (Open, Closed, VCE). ${langInstruction}
            Focus on breaking words into syllables.
            Return JSON: { "word": "string", "syllables": ["syl", "la", "ble"], "count": number, "context": "sentence using the word", "type": "VCE, Open, or Closed" }.`;
        } else if (selectedMode === 'schwa') {
            prompt = `Generate a challenge focusing on the Schwa sound (unstressed vowel sound like 'uh' in 'about' or 'balloon'). ${langInstruction}
            Return JSON: { "word": "string", "syllables": ["syl", "la", "ble"], "count": number, "context": "sentence using the word", "type": "Schwa" }.`;
        } else if (selectedMode === 'vce') {
            prompt = `Generate a challenge focusing on Vowel-Consonant-E (VCE) words (Magic E). ${langInstruction}
            Return JSON: { "word": "string", "syllables": ["syl", "la", "ble"], "count": number, "context": "sentence using the word", "type": "VCE" }.`;
        } else if (selectedMode === 'contractions') {
            prompt = `Generate a contraction challenge. ${langInstruction}
            Return JSON: { "word": "string (e.g. do not)", "contraction": "string (e.g. don't)", "context": "sentence using the contraction" }.`;
        } else if (selectedMode === 'dictation') {
            prompt = `Generate a simple 2nd grade sentence for dictation. ${langInstruction}
            Return JSON: { "sentence": "string" }.`;
        } else if (selectedMode === 'story') {
            prompt = `Write a 2-sentence story starter about ${student.name} finding something magical in a dark blue forest. ${langInstruction}
            Return JSON: { "starter": "string" }.`;
        } else if (selectedMode === 'teacher-curriculum') {
            prompt = `You are a Maryland 2nd Grade Teacher Assistant. Suggest a quick 5-minute activity for the current Reading/Language Arts curriculum (Phonics, Spelling, or Vocabulary) OR a Reading Lesson Plan. ${langInstruction}
            Return JSON: { "starter": "Activity/Plan Description", "context": "Learning Standard" }.`;
        }

        try {
            const resp = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            return JSON.parse(resp.text || "{}");
        } catch (e) {
            console.error("AI Error, falling back to offline data", e);
            // Fallback if AI fails even if online
            const dataList = (OFFLINE_DATA as any)[selectedMode];
            if (dataList && dataList.length > 0) {
                return dataList[Math.floor(Math.random() * dataList.length)];
            }
            if (selectedMode === 'unit-spelling') {
                const words = UNIT_WORDS[unit] || UNIT_WORDS[1];
                const word = words[Math.floor(Math.random() * words.length)];
                return { word, context: `Spell the word ${word}.` };
            }
            return { word: "Error", context: "Could not generate content." };
        }
    };

    const fetchNext = async (m: string) => {
        try {
            const data = await fetchChallengeData(m);
            setNextChallenge({ mode: m, data });
        } catch (e) { console.error("Background fetch failed", e); }
    };

    const loadChallenge = async (selectedMode: string) => {
        setLoading(true);
        setModalData(null);

        try {
            if (!ai) throw new Error("AI not initialized. Check API Key.");

            let data;
            // Use pre-fetched data if available and matches mode
            if (nextChallenge && nextChallenge.mode === selectedMode) {
                data = nextChallenge.data;
                setNextChallenge(null); // Clear used data
            } else {
                data = await fetchChallengeData(selectedMode);
            }

            setChallenge(data);
            setHistory(prev => [...prev.slice(0, historyIndex + 1), data]);
            setHistoryIndex(prev => prev.length > historyIndex + 1 ? historyIndex + 1 : prev.length);
            setAttempts(0); // Reset attempts

            if (selectedMode === 'digraph') {
                speak(`Okay ${student.name}. Listen carefully. The word is ${data.word}. ${data.context}. What sound starts the word ${data.word}?`);
            } else if (selectedMode === 'spell' || selectedMode === 'unit-spelling') {
                speak(`Spell the word ${data.word}. ${data.context}`);
            } else if (selectedMode === 'syllable' || selectedMode === 'schwa' || selectedMode === 'vce') {
                setSyllableStep(0);
                speak(`How many syllables do you hear in the word ${data.word}? ${data.context}`);
            } else if (selectedMode === 'contractions') {
                speak(`What is the contraction for ${data.word}?`);
            } else if (selectedMode === 'dictation') {
                speak(`Write this sentence: ${data.sentence}`);
            } else if (selectedMode === 'story') {
                speak(data.starter + " What happens next?");
            } else if (selectedMode === 'teacher-curriculum') {
                speak(`Here is a curriculum idea: ${data.starter}`);
            }

            // Trigger background fetch for the next one
            fetchNext(selectedMode);

        } catch (e: any) {
            console.error(e);
            setModalData({ msg: `Connection failed: ${e.message || "Unknown error"}`, type: 'error' });
            setMode('menu');
        }
        setLoading(false);
    };

    const checkAnswer = (input: string) => {
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
        } else if (mode === 'spell' || mode === 'unit-spelling') {
            const target = challenge.word.toLowerCase();
            if (normalizedInput.includes(target)) {
                isCorrect = true;
            } else {
                specificFeedback = `Good try. The word was "${challenge.word}".`;
            }
        } else if (mode === 'syllable' || mode === 'schwa' || mode === 'vce') {
            if (syllableStep === 0) {
                // Check syllable count
                if (parseInt(normalizedInput) === challenge.count) {
                    setSyllableStep(1);
                    playSound('pop');
                    speak("That's right! Now spell the first syllable.");
                    return; // Don't trigger full success yet
                } else {
                    specificFeedback = `Not quite. Listen to the word: ${challenge.word}. How many syllables do you hear?`;
                }
            } else {
                // Check specific syllable
                if (!challenge.syllables) {
                    // Fallback if AI didn't provide syllables
                    isCorrect = true;
                } else {
                    const currentSylIndex = syllableStep - 1;
                    const targetSyl = challenge.syllables[currentSylIndex].toLowerCase();
                    if (normalizedInput === targetSyl) {
                        if (currentSylIndex + 1 === challenge.syllables.length) {
                            isCorrect = true; // All syllables done!
                        } else {
                            setSyllableStep(s => s + 1);
                            playSound('pop');
                            speak("Good! Now spell the next syllable.");
                            return; // Don't trigger full success yet
                        }
                    } else {
                        specificFeedback = `Try again. Spell the ${currentSylIndex === 0 ? 'first' : 'next'} syllable.`;
                    }
                }
            }
        } else if (mode === 'contractions') {
            if (normalizedInput.includes(challenge.contraction.toLowerCase())) isCorrect = true;
            else specificFeedback = `The contraction is ${challenge.contraction}.`;
        } else if (mode === 'dictation') {
            if (normalizedInput === challenge.sentence.toLowerCase().replace('.', '').trim()) isCorrect = true;
            else specificFeedback = `Close! The sentence was: ${challenge.sentence}`;
        } else {
            isCorrect = true;
        }

        if (isCorrect) {
            setCuudoos(c => c + 10);
            setStreak(s => {
                const newStreak = s + 1;
                if (newStreak >= 3 && !gamesUnlocked) {
                    setGamesUnlocked(true);
                    setModalData({ msg: "🎉 You unlocked the Game Room! 🎮", type: 'success' });
                }
                return newStreak;
            });
            setModalData({ msg: "Excellent work! +10 Cuudoos!", type: 'success' });
            playSound('win');
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
            speak(`Great job ${student.name}! That is correct.`);
        } else {
            setStreak(0);
            setAttempts(a => a + 1);
            setModalData({ msg: specificFeedback || "Good try, give it another go!", type: 'error' });
            playSound('error');
            speak(specificFeedback || "Good try. Try again.");
        }
    };

    const handleModeSelect = (m: any) => {
        setMode(m);
        loadChallenge(m);
    };

    const handlePrevious = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setChallenge(history[newIndex]);
        }
    };

    const handleNext = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setChallenge(history[newIndex]);
        } else {
            loadChallenge(mode);
        }
    };

    const handleRestart = () => {
        if (challenge) {
            setRestartTrigger(prev => prev + 1);
            speak(mode === 'story' ? challenge.starter : challenge.context);
        }
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const handlePinUnlock = (pin: string) => {
        if (targetStudent && pin === targetStudent.pin) {
            setStudent(targetStudent);
            setLockMode('none');
            playSound('pop');
            if (targetStudent.name !== 'Teacher') {
                speak(`Hi, ${targetStudent.name}. I am Wally. Let's have fun learning.`);
            } else {
                speak("Welcome back, Teacher. I am ready to assist you.");
            }
        } else {
            playSound('error');
            alert("Incorrect PIN");
        }
    };

    const handleHome = () => {
        speak("See You Soon and Happy Learning Panther Scholar!");
        setStudent(null);
        setMode('menu');
        setChallenge(null);
        setHistory([]);
        setHistoryIndex(-1);
        setShowTeacherChat(false);
        setSessionSetup(false);
        setTimer(0);
        setStreak(0);
        setCuudoos(0);
        setGamesUnlocked(false);
        setAttempts(0);
        setLockMode('none');
    };

    // --- Roster View ---
    if (!student) {
        return (
            <div className="main-stage">
                <div className="top-bar">
                    <div className="app-title">WORD WHIZ KIDS</div>
                    <button className="pro-btn" onClick={() => setLanguage(l => l === 'en' ? 'es' : 'en')}>{language === 'en' ? '🇪🇸 ES' : '🇺🇸 EN'}</button>
                </div>
                {lockMode !== 'none' && (
                    <PinPad
                        title={`Enter PIN for ${targetStudent?.name}`}
                        onUnlock={handlePinUnlock}
                        onClose={() => setLockMode('none')}
                    />
                )}
                <div className="scrollable-content">
                    <div className="mission-bar" style={{ marginTop: '20px', marginBottom: '20px', flex: '0 0 auto' }}>SELECT YOUR PROFILE</div>
                    <button className="pro-btn" style={{ marginBottom: '20px', fontSize: '1rem', padding: '10px 20px' }} onClick={() => speak("Hi! I am Wally, your AI learning companion. Select your profile to get started!")}>
                        👋 Meet Wally
                    </button>

                    {/* Sound Debug Section */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                        <button className="pro-btn" style={{ fontSize: '0.8rem', padding: '5px 10px', background: '#475569' }} onClick={() => playSound('pop')}>
                            🔊 Test Beep
                        </button>
                        <button className="pro-btn" style={{ fontSize: '0.8rem', padding: '5px 10px', background: '#475569' }} onClick={() => {
                            const u = new SpeechSynthesisUtterance("System voice check.");
                            window.speechSynthesis.speak(u);
                        }}>
                            🗣️ Test System Voice
                        </button>
                        <button className="pro-btn" style={{ fontSize: '0.8rem', padding: '5px 10px', background: '#475569' }} onClick={() => speak("AI voice check.")}>
                            🤖 Test AI Voice
                        </button>
                    </div>

                    {/* On-screen Debug Log */}
                    <div style={{
                        background: '#0f172a',
                        color: '#38bdf8',
                        padding: '10px',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        marginBottom: '20px',
                        maxHeight: '100px',
                        overflowY: 'auto',
                        textAlign: 'left'
                    }}>
                        <div>Debug Log:</div>
                        <div id="debug-log-content">Waiting for action...</div>
                    </div>

                    <div className="roster-grid">
                        {STUDENTS.map(s => (
                            <div key={s.id}
                                className="student-card"
                                style={{ backgroundColor: s.color, boxShadow: `0 6px 0 rgba(0,0,0,0.3)` }}
                                onClick={() => {
                                    setTargetStudent(s);
                                    setLockMode(s.name === 'Teacher' ? 'teacher' : 'student');
                                }}>
                                <div className="card-icon">{s.icon}</div>
                                <div className="card-name">{s.name}</div>
                            </div>
                        ))}
                    </div>
                    <div className="footer-brand">Created by © FREEDOMAi SOLUTIONS LLC</div>
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
                    <button className="pro-btn" onClick={handleHome} style={{ padding: '5px 15px', fontSize: '0.8rem' }}>Change Profile</button>
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
                <div className="app-title" onClick={handleHome} style={{ cursor: 'pointer' }}>WORD WHIZ KIDS</div>
                <button className="pro-btn" style={{ padding: '5px 15px', fontSize: '0.8rem', marginRight: '10px' }} onClick={() => setLanguage(l => l === 'en' ? 'es' : 'en')}>{language === 'en' ? '🇪🇸 ES' : '🇺🇸 EN'}</button>
                <div className="mission-bar">Mission: {student.name}</div>
                <div className="stats-box">
                    <div className="stat-item">⏱️ {formatTime(timer)}</div>
                    <div className="stat-item">🏆 {cuudoos}</div>
                </div>
            </div>

            {showTeacherChat && <TeacherChat onClose={() => setShowTeacherChat(false)} />}
            {modalData && (
                <FeedbackModal
                    message={modalData.msg}
                    type={modalData.type}
                    onClose={() => setModalData(null)}
                    onContinue={() => {
                        setModalData(null);
                        handleNext();
                    }}
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
                            <button className="pro-btn" onClick={() => handleModeSelect('syllable')}>
                                <span className="btn-icon">🧩</span> Syllable Savvy
                            </button>
                            <button className="pro-btn" onClick={() => handleModeSelect('contractions')}>
                                <span className="btn-icon">🔗</span> Contractions
                            </button>
                            <button className="pro-btn" onClick={() => handleModeSelect('dictation')}>
                                <span className="btn-icon">✍️</span> Dictation
                            </button>
                            <button className="pro-btn" onClick={() => handleModeSelect('schwa')}>
                                <span className="btn-icon">ə</span> Schwa Sound
                            </button>
                            <button className="pro-btn" onClick={() => handleModeSelect('vce')}>
                                <span className="btn-icon">🪄</span> Magic E (VCE)
                            </button>
                            <button className="pro-btn" onClick={() => handleModeSelect('story')}>
                                <span className="btn-icon">📖</span> Story Spark
                            </button>
                            <button className="pro-btn btn-accent"
                                style={{
                                    background: gamesUnlocked ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : '#334155',
                                    opacity: gamesUnlocked ? 1 : 0.7,
                                    cursor: gamesUnlocked ? 'pointer' : 'not-allowed'
                                }}
                                onClick={() => {
                                    if (gamesUnlocked) setMode('games');
                                    else setModalData({ msg: `Get ${3 - streak} more correct answers to unlock!`, type: 'error' });
                                }}>
                                <span className="btn-icon">{gamesUnlocked ? '🎮' : '🔒'}</span> Game Room
                            </button>
                            {student.name === 'Teacher' && (
                                <>
                                    <button className="pro-btn" style={{ borderColor: '#f59e0b', color: '#f59e0b' }} onClick={() => handleModeSelect('teacher-curriculum')}>
                                        <span className="btn-icon">🍎</span> Curriculum Asst.
                                    </button>
                                    <button className="pro-btn" style={{ borderColor: '#3b82f6', color: '#3b82f6' }} onClick={() => setShowTeacherChat(true)}>
                                        <span className="btn-icon">💬</span> Gemini Chat
                                    </button>
                                </>
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
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(u => <option key={u} value={u}>Unit {u}</option>)}
                            </select>
                        </div>
                    </div>
                ) : mode === 'games' ? (
                    <div className="glass-panel" style={{ maxWidth: '800px', width: '100%' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#f093fb' }}>GAME ROOM 🎮</h2>
                        <div className="menu-grid">
                            <button className="pro-btn" style={{ borderColor: '#f472b6', color: '#f472b6' }} onClick={() => setMode('whack-a-vowel')}>
                                <span className="btn-icon">🔨</span> Whack-a-Vowel
                            </button>
                            <button className="pro-btn" style={{ borderColor: '#34d399', color: '#34d399' }} onClick={() => alert("Word Ninja Coming Soon!")}>
                                <span className="btn-icon">⚔️</span> Word Ninja
                            </button>
                            <button className="pro-btn" style={{ borderColor: '#60a5fa', color: '#60a5fa' }} onClick={() => alert("Memory Match Coming Soon!")}>
                                <span className="btn-icon">🧠</span> Memory Match
                            </button>
                        </div>
                        <button className="pro-btn" style={{ marginTop: '20px' }} onClick={() => setMode('menu')}>⬅️ Back to Menu</button>
                    </div>
                ) : mode === 'whack-a-vowel' ? (
                    <WhackAVowel onExit={() => setMode('games')} />
                ) : (
                    <div className="activity-container glass-panel">
                        <button className="retry-btn" onClick={() => loadChallenge(mode)}>
                            <span>🔄</span> Retry
                        </button>

                        <div className="mode-title">
                            {mode === 'digraph' && 'Sound Decoding'}
                            {mode === 'spell' && 'Spelling Mastery'}
                            {mode === 'unit-spelling' && `Unit ${unit} Spelling`}
                            {mode === 'contractions' && 'Contraction Action'}
                            {mode === 'dictation' && 'Sentence Dictation'}
                            {mode === 'story' && 'Creative Reading'}
                            {mode === 'teacher-curriculum' && 'Teacher Assistant'}
                            {mode === 'teacher-curriculum' && 'Teacher Assistant'}
                            {mode === 'syllable' && 'Syllable Savvy'}
                            {mode === 'schwa' && 'Schwa Sound'}
                            {mode === 'vce' && 'Magic E (VCE)'}
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
                                        {(mode === 'spell' || mode === 'unit-spelling') && (
                                            attempts >= 3 ? challenge?.word : Array(challenge?.word?.length || 0).fill('•').join(' ')
                                        )}
                                        {(mode === 'syllable' || mode === 'schwa' || mode === 'vce') && (
                                            syllableStep === 0
                                                ? "How many syllables?"
                                                : (
                                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                        {challenge?.syllables?.map((s: string, i: number) => (
                                                            <span key={i} style={{
                                                                textDecoration: i < syllableStep - 1 ? 'none' : 'underline',
                                                                color: i < syllableStep - 1 ? '#4ade80' : 'white'
                                                            }}>
                                                                {i < syllableStep - 1 ? s : (i === syllableStep - 1 ? '???' : '...')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )
                                        )}
                                        {mode === 'contractions' && (
                                            attempts >= 3 ? challenge?.contraction : `${challenge?.word} -> ?`
                                        )}
                                        {mode === 'dictation' && "👂 Listen & Write"}
                                    </div>
                                )}

                                <div style={{ margin: '20px', color: '#94a3b8', fontSize: '1.2rem', textAlign: 'center' }}>
                                    {(mode === 'spell' || mode === 'unit-spelling' || mode === 'digraph')
                                        ? (attempts >= 3 ? challenge?.context : challenge?.context?.replace(new RegExp(challenge?.word, 'gi'), '_____'))
                                        : ((mode === 'syllable' || mode === 'schwa' || mode === 'vce')
                                            ? (syllableStep === 0 ? `Word: ${challenge?.word}` : `Spell syllable ${syllableStep}`)
                                            : (mode === 'contractions'
                                                ? (attempts >= 3 ? challenge?.context : challenge?.context?.replace(new RegExp(challenge?.contraction, 'gi'), '_____'))
                                                : (mode === 'dictation' ? "" : challenge?.context)
                                            )
                                        )
                                    }
                                </div>

                                {mode !== 'teacher-curriculum' && (
                                    <AnswerInput key={challenge?.word + historyIndex + restartTrigger} onResult={checkAnswer} hint={mode === 'story' ? "Type the next part..." : `Type the answer...`} />
                                )}
                                {mode === 'teacher-curriculum' && (
                                    <button className="pro-btn" onClick={() => loadChallenge('teacher-curriculum')}>Generate Another Idea</button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {!['menu', 'games', 'whack-a-vowel'].includes(mode) && (
                <div className="nav-dock">
                    <button className="pro-btn" onClick={handlePrevious} disabled={historyIndex <= 0} style={{ opacity: historyIndex <= 0 ? 0.5 : 1 }}>⬅️ Prev</button>
                    <button className="pro-btn" onClick={handleRestart}>🔄 Restart</button>
                    <button className="pro-btn" onClick={handleHome}>🏠 Home</button>
                    <button className="pro-btn" onClick={handleNext}>Next ➡️</button>
                </div>
            )}
        </div>
    );
};

class ReactErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    state: { hasError: boolean, error: any };
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("React Error Boundary Caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'white', fontFamily: 'sans-serif' }}>
                    <h1>⚠️ Something went wrong.</h1>
                    <p>Please refresh the page.</p>
                    <details style={{ marginTop: '20px', whiteSpace: 'pre-wrap', color: '#f87171' }}>
                        <summary>Error Details</summary>
                        {this.state.error?.toString()}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

const initApp = () => {
    try {
        const container = document.getElementById("root");
        if (!container) {
            throw new Error("Fatal: Root element #root not found in DOM");
        }

        // Clear container to ensure clean mount
        container.innerHTML = '';

        const root = createRoot(container);
        root.render(
            <ReactErrorBoundary>
                <React.Suspense fallback={<div style={{ color: 'white', padding: 20 }}>Loading App Components...</div>}>
                    <App />
                </React.Suspense>
            </ReactErrorBoundary>
        );

        // Hide overlay immediately if possible, or let the effect handle it
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'none';

    } catch (e: any) {
        console.error("App Crash", e);
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.innerHTML = `<div style="color:red;padding:20px;font-family:sans-serif;text-align:left;">
                <h1>Startup Error</h1>
                <p>Please refresh.</p>
                <pre style="background:rgba(0,0,0,0.5);padding:10px;white-space:pre-wrap;">${e?.message || 'Unknown error'}\n${e?.stack || ''}</pre>
            </div>`;
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
