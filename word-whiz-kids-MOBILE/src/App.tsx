/// <reference types="vite/client" />
import { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { dataManager } from './services/DataManager';
import { OFFLINE_DATA } from './offlineData';
import './App.css';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

try {
    if (API_KEY) {
        new GoogleGenAI({ apiKey: API_KEY });
    } else {
        console.warn('Gemini API Key is missing');
    }
} catch (e) {
    console.error('Failed to initialize Gemini AI', e);
}

// Audio cleanup - track current sources to prevent stuck audio
let currentAudioSource: AudioBufferSourceNode | null = null;
let currentAudioContext: AudioContext | null = null;

// Stop any currently playing audio
const stopAllAudio = () => {
    // Stop browser TTS
    try {
        window.speechSynthesis.cancel();
    } catch (e) {
        console.log('Could not cancel speech synthesis');
    }

    // Stop current audio source
    if (currentAudioSource) {
        try {
            currentAudioSource.stop();
            currentAudioSource.disconnect();
        } catch (e) {
            // Already stopped, ignore
        }
        currentAudioSource = null;
    }

    // Close audio context
    if (currentAudioContext) {
        try {
            currentAudioContext.close();
        } catch (e) {
            // Already closed, ignore
        }
        currentAudioContext = null;
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
// Preload voices on app start
let loadedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    loadedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
        loadedVoices = window.speechSynthesis.getVoices();
        console.log('🎤 Voices loaded:', loadedVoices.length);
    };
    // Trigger initial load
    window.speechSynthesis.getVoices();
}

function App() {
    const [student, setStudent] = useState<Student | null>(null);
    const [targetStudent, setTargetStudent] = useState<Student | null>(null);
    const [showPinPad, setShowPinPad] = useState(false);
    const [enteredPin, setEnteredPin] = useState('');
    const [mode, setMode] = useState<string>('menu');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [language, setLanguage] = useState<'en' | 'es'>('en');

    // Game State
    const [challenge, setChallenge] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [gamesUnlocked, setGamesUnlocked] = useState(false);
    const [score, setScore] = useState(0);

    // Whack-a-Vowel State
    const [whackGrid, setWhackGrid] = useState<string[]>(Array(9).fill(''));
    const [activeWhack, setActiveWhack] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [timerActive, setTimerActive] = useState(false);
    const [userInput, setUserInput] = useState(''); // For Word Builder and Story Spark
    const [usedWords, setUsedWords] = useState<Set<string>>(new Set()); // Track used words to avoid repetition


    const fetchChallengeData = (selectedMode: string) => {
        setLoading(true);
        setFeedback('');
        setChallenge(null);
        setUserInput('');

        try {
            // Fallback to offline data helper
            const useOfflineData = () => {
                const modeMap: Record<string, string> = {
                    'spell': 'spell',
                    'syllable': 'syllable',
                    'story': 'story',
                    'vowel-sort': 'vowelSort',
                    'r-controlled': 'rControlled',
                    'n-controlled': 'nControlled'
                };
                const dataKey = modeMap[selectedMode] || 'digraph';
                const dataList = (OFFLINE_DATA as any)[dataKey];

                // Debug log
                console.log(`Loading mode: ${selectedMode}, key: ${dataKey}, data found: ${!!dataList}`);

                if (!dataList || !Array.isArray(dataList)) {
                    throw new Error(`No data found for mode: ${selectedMode} (key: ${dataKey})`);
                }

                // Filter out used words, reset if all used
                let availableItems = dataList.filter((item: any) => !usedWords.has(item.word || item.starter));
                if (availableItems.length === 0) {
                    setUsedWords(new Set()); // Reset if we've used all words
                    availableItems = dataList;
                }

                const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];

                if (!randomItem) {
                    throw new Error(`Failed to select random item for ${selectedMode}`);
                }

                // Track this word
                setUsedWords(prev => new Set(prev).add(randomItem.word || randomItem.starter));

                console.log('Selected item:', randomItem);

                if (selectedMode === 'digraph') {
                    const challenge = {
                        word: randomItem.word,
                        missing: randomItem.missing,
                        phoneme: randomItem.phoneme,
                        context: randomItem.context,
                        options: ['sh', 'ch', 'th', 'wh', 'ph', 'ck', 'ng']
                    };
                    setChallenge(challenge);
                    speak(`Listen carefully. The word is ${challenge.word}. ${challenge.context}. What sound is missing?`);
                } else if (selectedMode === 'spell') {
                    setChallenge(randomItem);
                    speak(`Hey, listen to this! ${randomItem.context}. Can you spell that word for me?`);
                } else if (selectedMode === 'syllable') {
                    setChallenge(randomItem);
                    speak(`Let's clap it out! How many syllables are in ${randomItem.word}?`);
                } else if (selectedMode === 'story') {
                    setChallenge(randomItem);
                    speak(`Time for a story! ${randomItem.starter}. What happens next?`);
                } else if (selectedMode === 'vowel-sort') {
                    setChallenge(randomItem);
                    speak(`Listen to this word: ${randomItem.word}. Is the vowel short, long, or r-controlled?`);
                } else if (selectedMode === 'r-controlled') {
                    setChallenge(randomItem);
                    speak(`Here's a word for you: ${randomItem.word}. Does it have an R-controlled vowel?`);
                } else if (selectedMode === 'n-controlled') {
                    setChallenge(randomItem);
                    speak(`Listen carefully: ${randomItem.word}. Does it have an N-controlled vowel?`);
                }
                setLoading(false);
            };

            // Always use offline data for reliability
            useOfflineData();
        } catch (error: any) {
            console.error("Error in fetchChallengeData:", error);
            setFeedback("Error loading task. Please try again.");
            setLoading(false);
            // Show visible error for mobile debugging
            const errDiv = document.getElementById('error-display');
            if (errDiv) {
                errDiv.style.display = 'block';
                errDiv.innerHTML += `Task Load Error (${selectedMode}): ${error.message}\n`;
            }
        }
    };

    const checkAnswer = (answer: string) => {
        if (!challenge) return;
        if (answer === challenge.missing) {
            setFeedback('Correct! 🎉');
            speak("That is correct! Great job!");
            setGamesUnlocked(true);
            setTimeout(() => {
                fetchChallengeData('digraph');
            }, 2000);
        } else {
            setFeedback('Try again!');
            speak(`Not quite. The word is ${challenge.word}.`);
        }
    };

    const startWhackGame = () => {
        setScore(0);
        setTimeLeft(30);
        setTimerActive(true);
        setWhackGrid(Array(9).fill(''));
    };

    useEffect(() => {
        if (!timerActive) return;
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setTimerActive(false);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        const mole = setInterval(() => {
            const letters = "AEIOU";
            const char = letters[Math.floor(Math.random() * letters.length)];
            const pos = Math.floor(Math.random() * 9);
            setActiveWhack(pos);
            setWhackGrid(prev => {
                const newGrid = [...prev];
                newGrid[pos] = char;
                return newGrid;
            });

            setTimeout(() => {
                setActiveWhack(null);
                setWhackGrid(prev => {
                    const newGrid = [...prev];
                    newGrid[pos] = '';
                    return newGrid;
                });
            }, 800);
        }, 1000);

        return () => {
            clearInterval(timer);
            clearInterval(mole);
        };
    }, [timerActive]);

    const speak = async (text: string) => {
        // Stop any existing audio before starting new speech
        stopAllAudio();
        setIsSpeaking(true);

        try {
            // Use browser TTS directly
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            utterance.pitch = 1.15;
            utterance.volume = 1.0;
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            // Simple voice selection
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                // Prefer female English voices
                const voice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
                    voices.find(v => v.lang.startsWith('en'));
                if (voice) utterance.voice = voice;
            }

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error('Speech error:', e);
            setIsSpeaking(false);
        }
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
                {
                    showPinPad && targetStudent && (
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
                    )
                }
            </div >
        );
    }

    // Activity View
    if (mode !== 'menu') {
        return (
            <div className="mobile-app">
                <div className="mobile-header">
                    <div className="app-title-mobile">🦉 WORD WHIZ KIDS v1.1</div>
                    <div style={{ fontSize: '10px', color: '#888' }}>Mode: {mode}</div>
                    <button
                        className="mobile-btn"
                        onClick={() => {
                            stopAllAudio(); // Stop any playing audio when going home
                            setMode('menu');
                            setTimerActive(false);
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
                        🏠
                    </button>
                </div>

                <div className="mobile-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    {mode === 'digraph' && (
                        <>
                            <h2 style={{ textAlign: 'center', color: '#00ff9d' }}>Digraph Detective 🔍</h2>

                            {!challenge && !loading && (
                                <button className="mobile-btn" onClick={() => fetchChallengeData('digraph')} style={{ background: '#3b82f6', marginTop: '40px' }}>
                                    Start Task
                                </button>
                            )}

                            {loading && <div className="wally-mobile" style={{ fontSize: '48px', animation: 'bounce 1s infinite' }}>🦉</div>}

                            {challenge && challenge.word && challenge.missing && (
                                <>
                                    <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0', letterSpacing: '4px' }}>
                                        {challenge.word.replace(challenge.missing, '_'.repeat(challenge.missing.length))}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', width: '100%' }}>
                                        {['sh', 'ch', 'th', 'wh', 'ph', 'ck', 'ng'].map(d => (
                                            <button
                                                key={d}
                                                className="mobile-btn"
                                                onClick={() => checkAnswer(d)}
                                                style={{ fontSize: '24px', padding: '15px' }}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '20px', fontSize: '18px', color: feedback.includes('Correct') ? '#10b981' : '#ef4444', textAlign: 'center' }}>
                                        {feedback}
                                    </div>
                                </>
                            )}

                            {challenge && (!challenge.word || !challenge.missing) && !loading && (
                                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
                                    <p style={{ color: '#ef4444', marginBottom: '20px' }}>Oops! Something went wrong.</p>
                                    <button
                                        className="mobile-btn"
                                        onClick={() => fetchChallengeData('digraph')}
                                        style={{ background: '#3b82f6' }}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {mode === 'games' && (
                        <>
                            <h2 style={{ textAlign: 'center', color: '#f093fb' }}>Game Room 🎮</h2>
                            <p style={{ textAlign: 'center' }}>Score: {score} | Time: {timeLeft}s</p>

                            {!timerActive ? (
                                <button className="mobile-btn" onClick={startWhackGame} style={{ background: '#ec4899', marginTop: '20px' }}>
                                    Start Whack-a-Vowel
                                </button>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '20px' }}>
                                    {whackGrid.map((char, i) => (
                                        <div key={i}
                                            onClick={() => {
                                                if (i === activeWhack) {
                                                    setScore(s => s + 10);
                                                    setActiveWhack(null);
                                                }
                                            }}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                background: i === activeWhack ? '#f472b6' : 'rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '32px',
                                                cursor: 'pointer'
                                            }}>
                                            {i === activeWhack ? char : ''}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {mode === 'spell' && (
                        <>
                            <h2 style={{ textAlign: 'center', color: '#f093fb' }}>Word Builder 📝</h2>

                            {!challenge && !loading && (
                                <button className="mobile-btn" onClick={() => fetchChallengeData('spell')} style={{ background: '#3b82f6', marginTop: '40px' }}>
                                    Start Task
                                </button>
                            )}

                            {loading && <div className="wally-mobile" style={{ fontSize: '48px', animation: 'bounce 1s infinite' }}>🦉</div>}

                            {challenge && challenge.context && (
                                <>
                                    <div style={{ fontSize: '18px', margin: '20px 0', textAlign: 'center', lineHeight: '1.6' }}>
                                        {challenge.context.replace(challenge.word, '_ '.repeat(challenge.word.length).trim())}
                                    </div>

                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder={language === 'en' ? 'Type your answer...' : 'Escribe tu respuesta...'}
                                        style={{
                                            width: '90%',
                                            padding: '15px',
                                            fontSize: '18px',
                                            borderRadius: '12px',
                                            border: '2px solid #475569',
                                            background: '#1e293b',
                                            color: 'white',
                                            textAlign: 'center',
                                            marginBottom: '20px'
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && userInput.trim()) {
                                                if (userInput.trim().toLowerCase() === challenge.word.toLowerCase()) {
                                                    setFeedback('Correct! 🎉');
                                                    speak('Amazing! That\'s correct!');
                                                    setTimeout(() => fetchChallengeData('spell'), 2000);
                                                } else {
                                                    setFeedback(`Try again! The word is: ${challenge.word}`);
                                                    speak(`Close! The correct spelling is ${challenge.word}.`);
                                                }
                                            }
                                        }}
                                    />

                                    <button
                                        className="mobile-btn"
                                        onClick={() => {
                                            if (userInput.trim().toLowerCase() === challenge.word.toLowerCase()) {
                                                setFeedback('Correct! 🎉');
                                                speak('Amazing! That\'s correct!');
                                                setTimeout(() => fetchChallengeData('spell'), 2000);
                                            } else {
                                                setFeedback(`Try again! The word is: ${challenge.word}`);
                                                speak(`Close! The correct spelling is ${challenge.word}.`);
                                            }
                                        }}
                                        style={{ background: '#10b981', marginBottom: '20px' }}
                                    >
                                        {language === 'en' ? 'Submit' : 'Enviar'}
                                    </button>

                                    <div style={{ marginTop: '20px', fontSize: '18px', color: feedback.includes('Correct') ? '#10b981' : '#ef4444', textAlign: 'center' }}>
                                        {feedback}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {mode === 'syllable' && (
                        <>
                            <h2 style={{ textAlign: 'center', color: '#fbbf24' }}>Syllable Savvy 🧩</h2>

                            {!challenge && !loading && (
                                <button className="mobile-btn" onClick={() => fetchChallengeData('syllable')} style={{ background: '#3b82f6', marginTop: '40px' }}>
                                    Start Task
                                </button>
                            )}

                            {loading && <div className="wally-mobile" style={{ fontSize: '48px', animation: 'bounce 1s infinite' }}>🦉</div>}

                            {challenge && challenge.word && challenge.count && (
                                <>
                                    <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '20px 0', textAlign: 'center', letterSpacing: '2px' }}>
                                        {challenge.syllables ? challenge.syllables.join('•') : challenge.word}
                                    </div>

                                    <p style={{ textAlign: 'center', color: '#a0a0a0', marginBottom: '30px' }}>
                                        {language === 'en' ? 'How many syllables?' : '¿Cuántas sílabas?'}
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', width: '100%' }}>
                                        {[1, 2, 3, 4].map(num => (
                                            <button
                                                key={num}
                                                className="mobile-btn"
                                                onClick={() => {
                                                    if (num === challenge.count) {
                                                        setFeedback('Correct! 🎉');
                                                        speak('Perfect! You counted correctly!');
                                                        setTimeout(() => fetchChallengeData('syllable'), 2000);
                                                    } else {
                                                        setFeedback(`Try again! It has ${challenge.count} syllable${challenge.count > 1 ? 's' : ''}.`);
                                                        speak(`Not quite. Count again carefully.`);
                                                    }
                                                }}
                                                style={{ fontSize: '32px', padding: '20px' }}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '20px', fontSize: '18px', color: feedback.includes('Correct') ? '#10b981' : '#ef4444', textAlign: 'center' }}>
                                        {feedback}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {mode === 'story' && (
                        <>
                            <h2 style={{ textAlign: 'center', color: '#60a5fa' }}>Story Spark 📖</h2>

                            {!challenge && !loading && (
                                <button className="mobile-btn" onClick={() => fetchChallengeData('story')} style={{ background: '#3b82f6', marginTop: '40px' }}>
                                    Start Task
                                </button>
                            )}

                            {loading && <div className="wally-mobile" style={{ fontSize: '48px', animation: 'bounce 1s infinite' }}>🦉</div>}

                            {challenge && challenge.starter && (
                                <>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        marginBottom: '20px',
                                        fontSize: '16px',
                                        lineHeight: '1.6',
                                        textAlign: 'center'
                                    }}>
                                        {challenge.starter}
                                    </div>

                                    <p style={{ textAlign: 'center', color: '#a0a0a0', marginBottom: '15px', fontSize: '14px' }}>
                                        {language === 'en' ? 'What happens next? Write your story!' : '¿Qué pasa después? ¡Escribe tu historia!'}
                                    </p>

                                    <textarea
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        placeholder={language === 'en' ? 'Once upon a time...' : 'Había una vez...'}
                                        style={{
                                            width: '90%',
                                            padding: '15px',
                                            fontSize: '16px',
                                            borderRadius: '12px',
                                            border: '2px solid #475569',
                                            background: '#1e293b',
                                            color: 'white',
                                            minHeight: '120px',
                                            marginBottom: '20px',
                                            resize: 'vertical'
                                        }}
                                    />

                                    <button
                                        className="mobile-btn"
                                        onClick={() => {
                                            if (userInput.trim().length > 10) {
                                                setFeedback('Wonderful story! 🎉🎨');
                                                speak('Amazing creativity! Great job!');
                                                setTimeout(() => fetchChallengeData('story'), 2500);
                                            } else {
                                                setFeedback('Write at least a few words!');
                                                speak('Keep writing! Tell us more!');
                                            }
                                        }}
                                        style={{ background: '#8b5cf6', marginBottom: '20px' }}
                                    >
                                        {language === 'en' ? 'Share Story' : 'Compartir Historia'}
                                    </button>

                                    <div style={{ marginTop: '20px', fontSize: '18px', color: feedback.includes('Wonderful') ? '#10b981' : '#ef4444', textAlign: 'center' }}>
                                        {feedback}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {mode === 'vowel-sort' && (
                        <>
                            <h2 style={{ textAlign: 'center', color: '#facc15' }}>Vowel Sort 📊</h2>
                            {!challenge && !loading && (
                                <button className="mobile-btn" onClick={() => fetchChallengeData('vowel-sort')} style={{ background: '#3b82f6', marginTop: '40px' }}>
                                    Start Task
                                </button>
                            )}
                            {loading && <div className="wally-mobile" style={{ fontSize: '48px', animation: 'bounce 1s infinite' }}>🦉</div>}
                            {challenge && challenge.word && (
                                <>
                                    <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '20px 0', textAlign: 'center' }}>
                                        {challenge.word}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', width: '100%' }}>
                                        {['short', 'long', 'r-controlled'].map(cat => (
                                            <button
                                                key={cat}
                                                className="mobile-btn"
                                                onClick={() => {
                                                    if (cat === challenge.category) {
                                                        setFeedback('Correct! 🎉');
                                                        speak('That is correct!');
                                                        setTimeout(() => fetchChallengeData('vowel-sort'), 2000);
                                                    } else {
                                                        setFeedback('Try again!');
                                                        speak('Not quite. Listen again.');
                                                    }
                                                }}
                                                style={{ background: '#334155' }}
                                            >
                                                {cat.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '20px', fontSize: '18px', color: feedback.includes('Correct') ? '#10b981' : '#ef4444', textAlign: 'center' }}>
                                        {feedback}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {mode === 'r-controlled' && (
                        <>
                            <h2 style={{ textAlign: 'center', color: '#f472b6' }}>R-Controlled 🅁</h2>
                            {!challenge && !loading && (
                                <button className="mobile-btn" onClick={() => fetchChallengeData('r-controlled')} style={{ background: '#3b82f6', marginTop: '40px' }}>
                                    Start Task
                                </button>
                            )}
                            {loading && <div className="wally-mobile" style={{ fontSize: '48px', animation: 'bounce 1s infinite' }}>🦉</div>}
                            {challenge && challenge.word && (
                                <>
                                    <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '20px 0', textAlign: 'center' }}>
                                        {challenge.word}
                                    </div>
                                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', width: '100%' }}>
                                        <button
                                            className="mobile-btn"
                                            onClick={() => {
                                                if (challenge.hasRControlled) {
                                                    setFeedback('Correct! It has an R-controlled vowel! 🎉');
                                                    speak('Yes! You found the R-controlled vowel!');
                                                    setTimeout(() => fetchChallengeData('r-controlled'), 2000);
                                                } else {
                                                    setFeedback('Oops! No R-controlled vowel here.');
                                                    speak('Not quite. This word does not have an R-controlled vowel.');
                                                }
                                            }}
                                            style={{ background: '#10b981', flex: 1 }}
                                        >
                                            YES
                                        </button>
                                        <button
                                            className="mobile-btn"
                                            onClick={() => {
                                                if (!challenge.hasRControlled) {
                                                    setFeedback('Correct! No R-controlled vowel! 🎉');
                                                    speak('That is correct! No R-controlled vowel.');
                                                    setTimeout(() => fetchChallengeData('r-controlled'), 2000);
                                                } else {
                                                    setFeedback('Oops! It DOES have one!');
                                                    speak('Look closer! It does have an R-controlled vowel.');
                                                }
                                            }}
                                            style={{ background: '#ef4444', flex: 1 }}
                                        >
                                            NO
                                        </button>
                                    </div>
                                    <div style={{ marginTop: '20px', fontSize: '18px', color: feedback.includes('Correct') ? '#10b981' : '#ef4444', textAlign: 'center' }}>
                                        {feedback}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {mode === 'n-controlled' && (
                        <>
                            <h2 style={{ textAlign: 'center', color: '#22d3ee' }}>N-Controlled 🅝</h2>
                            {!challenge && !loading && (
                                <button className="mobile-btn" onClick={() => fetchChallengeData('n-controlled')} style={{ background: '#3b82f6', marginTop: '40px' }}>
                                    Start Task
                                </button>
                            )}
                            {loading && <div className="wally-mobile" style={{ fontSize: '48px', animation: 'bounce 1s infinite' }}>🦉</div>}
                            {challenge && challenge.word && (
                                <>
                                    <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '20px 0', textAlign: 'center' }}>
                                        {challenge.word}
                                    </div>
                                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', width: '100%' }}>
                                        <button
                                            className="mobile-btn"
                                            onClick={() => {
                                                if (challenge.hasNControlled) {
                                                    setFeedback('Correct! It has an N-controlled vowel! 🎉');
                                                    speak('Yes! You found the N-controlled vowel!');
                                                    setTimeout(() => fetchChallengeData('n-controlled'), 2000);
                                                } else {
                                                    setFeedback('Oops! No N-controlled vowel here.');
                                                    speak('Not quite. This word does not have an N-controlled vowel.');
                                                }
                                            }}
                                            style={{ background: '#10b981', flex: 1 }}
                                        >
                                            YES
                                        </button>
                                        <button
                                            className="mobile-btn"
                                            onClick={() => {
                                                if (!challenge.hasNControlled) {
                                                    setFeedback('Correct! No N-controlled vowel! 🎉');
                                                    speak('That is correct! No N-controlled vowel.');
                                                    setTimeout(() => fetchChallengeData('n-controlled'), 2000);
                                                } else {
                                                    setFeedback('Oops! It DOES have one!');
                                                    speak('Look closer! It does have an N-controlled vowel.');
                                                }
                                            }}
                                            style={{ background: '#ef4444', flex: 1 }}
                                        >
                                            NO
                                        </button>
                                    </div>
                                    <div style={{ marginTop: '20px', fontSize: '18px', color: feedback.includes('Correct') ? '#10b981' : '#ef4444', textAlign: 'center' }}>
                                        {feedback}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {mode !== 'digraph' && mode !== 'games' && mode !== 'spell' && mode !== 'syllable' && mode !== 'story' && mode !== 'vowel-sort' && mode !== 'r-controlled' && mode !== 'n-controlled' && (
                        <>
                            <h2 style={{ textAlign: 'center' }}>Coming Soon!</h2>
                            <p style={{ textAlign: 'center', color: '#a0a0a0' }}>This activity is being built.</p>
                        </>
                    )}
                </div>
            </div >
        );
    }

    // Main Menu
    return (
        <div className="mobile-app">
            <div className="mobile-header">
                <div className="app-title-mobile">🦉 WORD WHIZ KIDS v1.1</div>
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

                    <button className="mobile-btn"
                        onClick={() => setMode('games')}
                        style={{ background: gamesUnlocked ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : '#334155', opacity: gamesUnlocked ? 1 : 0.7 }}
                    >
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>{gamesUnlocked ? '🎮' : '🔒'}</div>
                        {language === 'en' ? 'Game Room' : 'Sala de Juegos'}
                    </button>

                    <button className="mobile-btn" onClick={() => setMode('spell')}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>📝</div>
                        {language === 'en' ? 'Word Builder' : 'Constructor de Palabras'}
                    </button>
                    <button className="mobile-btn" onClick={() => { setChallenge(null); setLoading(false); setMode('syllable'); }}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>🧩</div>
                        {language === 'en' ? 'Syllable Savvy' : 'Sílabas Sabias'}
                    </button>
                    <button className="mobile-btn" onClick={() => { setChallenge(null); setLoading(false); setMode('story'); }}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>📖</div>
                        {language === 'en' ? 'Story Spark' : 'Chispa de Historia'}
                    </button>
                    <button className="mobile-btn" onClick={() => { setChallenge(null); setLoading(false); setMode('vowel-sort'); }}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>📊</div>
                        {language === 'en' ? 'Vowel Sort' : 'Clasificar Vocales'}
                    </button>
                    <button className="mobile-btn" onClick={() => { setChallenge(null); setLoading(false); setMode('r-controlled'); }}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>🅁</div>
                        {language === 'en' ? 'R-Controlled' : 'Vocales con R'}
                    </button>
                    <button className="mobile-btn" onClick={() => { setChallenge(null); setLoading(false); setMode('n-controlled'); }}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>🅝</div>
                        {language === 'en' ? 'N-Controlled' : 'Vocales con N'}
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
