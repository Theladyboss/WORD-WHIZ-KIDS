/// <reference types="vite/client" />
import { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { dataManager } from './services/DataManager';
import './App.css';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
let ai: GoogleGenAI;

try {
    if (API_KEY) {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    } else {
        console.warn('Gemini API Key is missing');
    }
} catch (e) {
    console.error('Failed to initialize Gemini AI', e);
}

// Audio playback for TTS
const playPCM = async (base64Data: string, onEnd: () => void) => {
    try {
        const audioCtx = new AudioContext();
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.onended = onEnd;
        source.start();
    } catch (e) {
        console.error('Audio playback failed:', e);
        onEnd();
    }
};

interface Student {
    id: number;
    name: string;
    icon: string;
    color: string;
    pin: string;
}

const STUDENTS: Student[] = [
    // Section 92200-26
    { id: 10, name: "Cali R.", icon: "🌈", color: "#8b5cf6", pin: "261" },
    { id: 14, name: "David V.", icon: "🦖", color: "#64748b", pin: "262" },
    { id: 1, name: "Fabricio B.", icon: "🚀", color: "#ef4444", pin: "263" },
    { id: 12, name: "Fareeha S.", icon: "🌙", color: "#06b6d4", pin: "264" },
    { id: 4, name: "Harmony C.", icon: "🎵", color: "#f59e0b", pin: "265" },
    { id: 13, name: "Jakai T.", icon: "🏀", color: "#10b981", pin: "266" },
    { id: 2, name: "Keyon B.", icon: "🎮", color: "#3b82f6", pin: "267" },
    { id: 3, name: "Lael B.", icon: "🎨", color: "#10b981", pin: "268" },
    { id: 8, name: "Lawrence L.", icon: "🦁", color: "#d946ef", pin: "269" },
    { id: 5, name: "Liana C.", icon: "🦄", color: "#8b5cf6", pin: "2610" },
    { id: 9, name: "Myhkal R.", icon: "🐯", color: "#f97316", pin: "2611" },
    { id: 11, name: "Naeem S.", icon: "⚽", color: "#f59e0b", pin: "2612" },
    { id: 6, name: "Nova D.", icon: "🌟", color: "#06b6d4", pin: "2613" },
    { id: 7, name: "Zamiah J.", icon: "🦋", color: "#ec4899", pin: "2614" },

    // Section 92200-21
    { id: 18, name: "Ana B.", icon: "✨", color: "#f59e0b", pin: "211" },
    { id: 25, name: "Ariana T.", icon: "🎤", color: "#f59e0b", pin: "212" },
    { id: 27, name: "Carter W.", icon: "✈️", color: "#10b981", pin: "213" },
    { id: 24, name: "Cherish L.", icon: "💖", color: "#8b5cf6", pin: "214" },
    { id: 21, name: "Christopher H.", icon: "🚒", color: "#ec4899", pin: "215" },
    { id: 26, name: "Derick T.", icon: "🎸", color: "#06b6d4", pin: "216" },
    { id: 17, name: "Desmond B.", icon: "🛡️", color: "#10b981", pin: "217" },
    { id: 23, name: "Ja'miah I.", icon: "🎀", color: "#f97316", pin: "218" },
    { id: 28, name: "Julian W.", icon: "🛸", color: "#64748b", pin: "219" },
    { id: 22, name: "Kayden H.", icon: "🏎️", color: "#d946ef", pin: "2110" },
    { id: 20, name: "Kyngston B.", icon: "👑", color: "#06b6d4", pin: "2111" },
    { id: 16, name: "Lesly A.", icon: "🌺", color: "#3b82f6", pin: "2112" },
    { id: 19, name: "Nazir B.", icon: "🧭", color: "#8b5cf6", pin: "2113" },
    { id: 15, name: "Tru A.", icon: "⚡", color: "#ef4444", pin: "2114" },

    // Section 92200-22
    { id: 41, name: "Aiyana T.", icon: "🦋", color: "#10b981", pin: "221" },
    { id: 30, name: "Allison C.", icon: "🎨", color: "#3b82f6", pin: "222" },
    { id: 29, name: "Ava C.", icon: "🩰", color: "#ef4444", pin: "223" },
    { id: 37, name: "Aytana O.", icon: "🌻", color: "#f97316", pin: "224" },
    { id: 40, name: "Brayden T.", icon: "🤖", color: "#06b6d4", pin: "225" },
    { id: 34, name: "Breon M.", icon: "🚲", color: "#06b6d4", pin: "226" },
    { id: 39, name: "Chloe R.", icon: "🧁", color: "#f59e0b", pin: "227" },
    { id: 31, name: "Corey J.", icon: "🏈", color: "#10b981", pin: "228" },
    { id: 35, name: "James M.", icon: "🐸", color: "#ec4899", pin: "229" },
    { id: 32, name: "Maurice L.", icon: "🎮", color: "#f59e0b", pin: "2210" },
    { id: 33, name: "Melanie M.", icon: "🍦", color: "#8b5cf6", pin: "2211" },
    { id: 38, name: "Nova R.", icon: "⭐", color: "#8b5cf6", pin: "2212" },
    { id: 42, name: "Raevon W.", icon: "🏃", color: "#64748b", pin: "2213" },
    { id: 36, name: "Wayne M.", icon: "🛹", color: "#d946ef", pin: "2214" },

    // Section 92200-23
    { id: 52, name: "Alma Q.", icon: "🧚‍♀️", color: "#8b5cf6", pin: "231" },
    { id: 48, name: "Amar J.", icon: "🏈", color: "#06b6d4", pin: "232" },
    { id: 47, name: "Ashton H.", icon: "🏀", color: "#8b5cf6", pin: "233" },
    { id: 45, name: "Bella G.", icon: "🐞", color: "#10b981", pin: "234" },
    { id: 44, name: "Brian C.", icon: "🕶️", color: "#3b82f6", pin: "235" },
    { id: 55, name: "Bria' S.", icon: "💎", color: "#10b981", pin: "236" },
    { id: 54, name: "Christin R.", icon: "🎮", color: "#06b6d4", pin: "237" },
    { id: 43, name: "Douglas C.", icon: "🧢", color: "#ef4444", pin: "238" },
    { id: 50, name: "Gianna M.", icon: "🌸", color: "#d946ef", pin: "239" },
    { id: 46, name: "Jazelle H.", icon: "🦄", color: "#f59e0b", pin: "2310" },
    { id: 53, name: "Nyomi R.", icon: "🍩", color: "#f59e0b", pin: "2311" },
    { id: 49, name: "Oliver M.", icon: "🦁", color: "#ec4899", pin: "2312" },
    { id: 51, name: "Sophia O.", icon: "🧜‍♀️", color: "#f97316", pin: "2313" },
    { id: 56, name: "Zakari T.", icon: "🏆", color: "#64748b", pin: "2314" },

    // Section 92200-24
    { id: 70, name: "Aubree W.", icon: "🦄", color: "#64748b", pin: "241" },
    { id: 67, name: "Davon P.", icon: "🎮", color: "#f59e0b", pin: "242" },
    { id: 63, name: "Jackson D.", icon: "🎸", color: "#ec4899", pin: "243" },
    { id: 61, name: "Juan C.", icon: "⚽", color: "#8b5cf6", pin: "244" },
    { id: 65, name: "Magali M.", icon: "🌺", color: "#f97316", pin: "245" },
    { id: 69, name: "Marli W.", icon: "🍭", color: "#10b981", pin: "246" },
    { id: 60, name: "Namir C.", icon: "🏎️", color: "#f59e0b", pin: "247" },
    { id: 68, name: "Nasir R.", icon: "🚀", color: "#06b6d4", pin: "248" },
    { id: 62, name: "Noah D.", icon: "🦕", color: "#06b6d4", pin: "249" },
    { id: 57, name: "Reagan A.", icon: "🎀", color: "#ef4444", pin: "2410" },
    { id: 66, name: "Savoy P.", icon: "🏀", color: "#8b5cf6", pin: "2411" },
    { id: 58, name: "Sofia A.", icon: "🐱", color: "#3b82f6", pin: "2412" },
    { id: 59, name: "Xi'airah C.", icon: "👑", color: "#10b981", pin: "2413" },
    { id: 64, name: "Zianya F.", icon: "🦋", color: "#d946ef", pin: "2414" },

    // Section 92200-25
    { id: 82, name: "Axel P.", icon: "🎸", color: "#06b6d4", pin: "251" },
    { id: 74, name: "Brien B.", icon: "🏈", color: "#f59e0b", pin: "252" },
    { id: 80, name: "Christie M.", icon: "💎", color: "#8b5cf6", pin: "253" },
    { id: 81, name: "Dayron O.", icon: "🚲", color: "#f59e0b", pin: "254" },
    { id: 83, name: "Emjai T.", icon: "🌈", color: "#10b981", pin: "255" },
    { id: 77, name: "Fernanda M.", icon: "🌻", color: "#ec4899", pin: "256" },
    { id: 79, name: "Jasmine M.", icon: "🌸", color: "#f97316", pin: "257" },
    { id: 76, name: "Jazmine C.", icon: "🎤", color: "#06b6d4", pin: "258" },
    { id: 73, name: "Kalia B.", icon: "🩰", color: "#10b981", pin: "259" },
    { id: 72, name: "Krhee B.", icon: "🎨", color: "#3b82f6", pin: "2510" },
    { id: 71, name: "Krystian A.", icon: "🕹️", color: "#ef4444", pin: "2511" },
    { id: 85, name: "Nadir W.", icon: "🛡️", color: "#ef4444", pin: "2512" },
    { id: 78, name: "Ruth D.", icon: "📚", color: "#d946ef", pin: "2513" },
    { id: 75, name: "Ryan B.", icon: "⚽", color: "#8b5cf6", pin: "2514" },
    { id: 84, name: "Zyaire T.", icon: "🛹", color: "#64748b", pin: "2515" },

    // Staff
    { id: 900, name: "Teacher", icon: "🎓", color: "#d946ef", pin: "2001" },
    { id: 901, name: "Guest", icon: "👤", color: "#22c55e", pin: "1234" },
];

function App() {
    const [student, setStudent] = useState<Student | null>(null);
    const [targetStudent, setTargetStudent] = useState<Student | null>(null);
    const [showPinPad, setShowPinPad] = useState(false);
    const [enteredPin, setEnteredPin] = useState('');
    const [mode, setMode] = useState<string>('menu');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [language, setLanguage] = useState<'en' | 'es'>('en');

    const speak = async (text: string) => {
        setIsSpeaking(true);
        try {
            const resp = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: { role: 'user', parts: [{ text: text }] },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } }
                    }
                }
            });
            const audioData = resp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (audioData) {
                await playPCM(audioData, () => setIsSpeaking(false));
                return;
            }
        } catch (e) {
            console.error('TTS failed:', e);
            // Fallback to browser TTS
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
            return;
        }
        setIsSpeaking(false);
    };

    const handleStudentSelect = (s: Student) => {
        setTargetStudent(s);
        setShowPinPad(true);
        setEnteredPin('');
    };

    const handlePinEnter = (digit: string) => {
        if (enteredPin.length < 4) {
            setEnteredPin(enteredPin + digit);
        }
    };

    const handlePinSubmit = () => {
        if (enteredPin.length >= 3) {
            if (targetStudent && enteredPin === targetStudent.pin) {
                // Initialize Data
                dataManager.initStudent(targetStudent.pin, targetStudent.name);

                setStudent(targetStudent);
                setShowPinPad(false);
                setTargetStudent(null);
                setEnteredPin('');
                try {
                    speak(`Welcome, ${targetStudent.name}! Let's learn together!`).catch(() => { });
                } catch (e) {
                    console.log('Could not speak');
                }
            } else {
                setEnteredPin('');
                try {
                    speak('Incorrect PIN. Try again!').catch(() => { });
                } catch (e) {
                    console.log('Could not speak');
                }
            }
        }
    };

    const handlePinClear = () => {
        setEnteredPin('');
    };

    const handleHome = () => {
        setStudent(null);
        setMode('menu');
    };

    // Roster View
    if (!student) {
        return (
            <div className="mobile-app">
                <div className="mobile-header">
                    <div className="app-title-mobile">🦉 WORD WHIZ KIDS</div>
                    <button
                        className="mobile-btn"
                        onClick={() => {
                            const newLang = language === 'en' ? 'es' : 'en';
                            setLanguage(newLang);
                            speak(newLang === 'es' ? "¡Hola! Modo Español Activado." : "Hello! English Mode Activated.");
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            padding: '0',
                            cursor: 'pointer',
                            marginBottom: 0,
                            minHeight: 'auto',
                            width: 'auto',
                            boxShadow: 'none'
                        }}
                    >
                        {language === 'en' ? '🦉' : '🇪🇸'}
                    </button>
                </div>

                <div className="mobile-content">
                    <h2 style={{ textAlign: 'center', margin: '20px 0', fontSize: '20px', fontWeight: 600 }}>
                        {language === 'en' ? 'Select Your Profile' : 'Selecciona Tu Perfil'}
                    </h2>

                    <button
                        className="mobile-btn"
                        onClick={() => speak(language === 'en' ? 'Hi! I am Wally, your AI learning companion!' : '¡Hola! Soy Wally, tu compañero de aprendizaje!')}
                        style={{ marginBottom: '20px' }}
                    >
                        👋 {language === 'en' ? 'Meet Wally' : 'Conoce a Wally'}
                    </button>

                    <div className="mobile-roster-grid">
                        {STUDENTS.map((s) => (
                            <div
                                key={s.id}
                                className="mobile-student-card"
                                style={{ backgroundColor: s.color }}
                                onClick={() => handleStudentSelect(s)}
                            >
                                <div className="card-icon-mobile">{s.icon}</div>
                                <div className="card-name-mobile">{s.name}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '40px', color: '#64748b', fontSize: '12px' }}>
                        Created by © FREEDOMAi SOLUTIONS LLC
                    </div>
                </div>

                {/* PIN Pad Modal */}
                {showPinPad && targetStudent && (
                    <div className="mobile-pinpad">
                        <div className="pinpad-content">
                            <h3 style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
                                {language === 'en' ? 'Enter PIN for' : 'Ingresar PIN para'} {targetStudent.name}
                            </h3>
                            <div className="pin-display">
                                {enteredPin.split('').map(() => '●').join(' ') || '_ _ _ _'}
                            </div>
                            <div className="pin-grid">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                    <button key={num} className="pin-btn" onClick={() => handlePinEnter(num.toString())}>
                                        {num}
                                    </button>
                                ))}
                                <button className="pin-btn" onClick={handlePinClear} style={{ fontSize: '16px', fontWeight: 600, background: '#ef4444' }}>
                                    {language === 'en' ? 'Clear' : 'Borrar'}
                                </button>
                                <button className="pin-btn" onClick={() => handlePinEnter('0')}>
                                    0
                                </button>
                                <button
                                    className="pin-btn"
                                    onClick={handlePinSubmit}
                                    style={{
                                        background: enteredPin.length >= 3 ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                                        borderColor: enteredPin.length >= 3 ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                                        color: '#ffffff'
                                    }}
                                >
                                    ✓
                                </button>
                            </div>
                            <button
                                className="close-pin-btn"
                                onClick={() => setShowPinPad(false)}
                            >
                                {language === 'en' ? 'Cancel' : 'Cancelar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Activity View
    if (mode !== 'menu') {
        return (
            <div className="mobile-app">
                <div className="mobile-header">
                    <div className="app-title-mobile">🦉 WORD WHIZ KIDS</div>
                    <button
                        className="mobile-btn"
                        onClick={() => setMode('menu')}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            padding: '0',
                            cursor: 'pointer',
                            marginBottom: 0,
                            minHeight: 'auto',
                            width: 'auto',
                            boxShadow: 'none'
                        }}
                    >
                        🏠
                    </button>
                </div>
                <div className="mobile-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h2 style={{ textAlign: 'center' }}>
                        {mode === 'digraph' ? 'Digraph Detective' :
                            mode === 'spell' ? 'Word Builder' :
                                mode === 'syllable' ? 'Syllable Savvy' : 'Story Spark'}
                    </h2>
                    <p style={{ textAlign: 'center', color: '#a0a0a0' }}>
                        {language === 'en' ? 'Coming Soon to Mobile!' : '¡Próximamente en Móvil!'}
                    </p>
                    <button className="mobile-btn" onClick={() => setMode('menu')} style={{ marginTop: '20px' }}>
                        {language === 'en' ? 'Back to Menu' : 'Volver al Menú'}
                    </button>
                </div>
            </div>
        );
    }

    // Main Menu
    return (
        <div className="mobile-app">
            <div className="mobile-header">
                <div className="app-title-mobile">🦉 WORD WHIZ KIDS</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        className="mobile-btn"
                        onClick={() => {
                            const newLang = language === 'en' ? 'es' : 'en';
                            setLanguage(newLang);
                            speak(newLang === 'es' ? "¡Hola! Modo Español Activado." : "Hello! English Mode Activated.");
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            padding: '0',
                            cursor: 'pointer',
                            marginBottom: 0,
                            minHeight: 'auto',
                            width: 'auto',
                            boxShadow: 'none'
                        }}
                    >
                        {language === 'en' ? '🦉' : '🇪🇸'}
                    </button>
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#00ff9d',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                        onClick={handleHome}
                    >
                        {student?.name} →
                    </button>
                </div>
            </div>

            <div className="mobile-content">
                <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '20px' }}>
                    {language === 'en' ? 'Select Activity' : 'Seleccionar Actividad'}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button className="mobile-btn" onClick={() => setMode('digraph')}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔍</div>
                        {language === 'en' ? 'Digraph Detective' : 'Detective de Dígrafos'}
                    </button>
                    <button className="mobile-btn" onClick={() => setMode('spell')}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>📝</div>
                        {language === 'en' ? 'Word Builder' : 'Constructor de Palabras'}
                    </button>
                    <button className="mobile-btn" onClick={() => setMode('syllable')}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>🧩</div>
                        {language === 'en' ? 'Syllable Savvy' : 'Sílabas Sabias'}
                    </button>
                    <button className="mobile-btn" onClick={() => setMode('story')}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>📖</div>
                        {language === 'en' ? 'Story Spark' : 'Chispa de Historia'}
                    </button>
                </div>

                <div className="loading-mobile" style={{ marginTop: '40px' }}>
                    <div className="wally-mobile" style={{ fontSize: '64px' }}>
                        {isSpeaking ? '🦉' : '🦉'}
                    </div>
                    <p style={{ color: '#a0a0a0', textAlign: 'center' }}>
                        {isSpeaking ? 'Wally is speaking...' : 'Choose an activity to begin!'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;
