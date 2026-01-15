/// <reference types="vite/client" />
import { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { dataManager } from './services/DataManager';
import { StudentProfileBuilder } from './services/StudentProfileBuilder';
import { OFFLINE_DATA } from './offlineData';
import './App.css';

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
    section?: string;
}

const STUDENTS: Student[] = [
    // Section 92200-26
    { id: 10, name: "Cali R.", icon: "🌈", color: "#8b5cf6", pin: "261", section: "92200-26" },
    { id: 14, name: "David V.", icon: "🦖", color: "#64748b", pin: "262", section: "92200-26" },
    { id: 1, name: "Fabricio B.", icon: "🚀", color: "#ef4444", pin: "263", section: "92200-26" },
    { id: 12, name: "Fareeha S.", icon: "🌙", color: "#06b6d4", pin: "264", section: "92200-26" },
    { id: 4, name: "Harmony C.", icon: "🎵", color: "#f59e0b", pin: "265", section: "92200-26" },
    { id: 13, name: "Jakai T.", icon: "🏀", color: "#10b981", pin: "266", section: "92200-26" },
    { id: 2, name: "Keyon B.", icon: "🎮", color: "#3b82f6", pin: "267", section: "92200-26" },
    { id: 3, name: "Lael B.", icon: "🎨", color: "#10b981", pin: "268", section: "92200-26" },
    { id: 8, name: "Lawrence L.", icon: "🦁", color: "#d946ef", pin: "269", section: "92200-26" },
    { id: 5, name: "Liana C.", icon: "🦄", color: "#8b5cf6", pin: "2610", section: "92200-26" },
    { id: 9, name: "Myhkal R.", icon: "🐯", color: "#f97316", pin: "2611", section: "92200-26" },
    { id: 11, name: "Naeem S.", icon: "⚽", color: "#f59e0b", pin: "2612", section: "92200-26" },
    { id: 6, name: "Nova D.", icon: "🌟", color: "#06b6d4", pin: "2613", section: "92200-26" },
    { id: 7, name: "Zamiah J.", icon: "🦋", color: "#ec4899", pin: "2614", section: "92200-26" },

    // Section 92200-21
    { id: 18, name: "Ana B.", icon: "✨", color: "#f59e0b", pin: "211", section: "92200-21" },
    { id: 25, name: "Ariana T.", icon: "🎤", color: "#f59e0b", pin: "212", section: "92200-21" },
    { id: 27, name: "Carter W.", icon: "✈️", color: "#10b981", pin: "213", section: "92200-21" },
    { id: 24, name: "Cherish L.", icon: "💖", color: "#8b5cf6", pin: "214", section: "92200-21" },
    { id: 21, name: "Christopher H.", icon: "🚒", color: "#ec4899", pin: "215", section: "92200-21" },
    { id: 26, name: "Derick T.", icon: "🎸", color: "#06b6d4", pin: "216", section: "92200-21" },
    { id: 17, name: "Desmond B.", icon: "🛡️", color: "#10b981", pin: "217", section: "92200-21" },
    { id: 23, name: "Ja'miah I.", icon: "🎀", color: "#f97316", pin: "218", section: "92200-21" },
    { id: 28, name: "Julian W.", icon: "🛸", color: "#64748b", pin: "219", section: "92200-21" },
    { id: 22, name: "Kayden H.", icon: "🏎️", color: "#d946ef", pin: "2110", section: "92200-21" },
    { id: 20, name: "Kyngston B.", icon: "👑", color: "#06b6d4", pin: "2111", section: "92200-21" },
    { id: 16, name: "Lesly A.", icon: "🌺", color: "#3b82f6", pin: "2112", section: "92200-21" },
    { id: 19, name: "Nazir B.", icon: "🧭", color: "#8b5cf6", pin: "2113", section: "92200-21" },
    { id: 15, name: "Tru A.", icon: "⚡", color: "#ef4444", pin: "2114", section: "92200-21" },

    // Section 92200-22
    { id: 41, name: "Aiyana T.", icon: "🦋", color: "#10b981", pin: "221", section: "92200-22" },
    { id: 30, name: "Allison C.", icon: "🎨", color: "#3b82f6", pin: "222", section: "92200-22" },
    { id: 29, name: "Ava C.", icon: "🩰", color: "#ef4444", pin: "223", section: "92200-22" },
    { id: 37, name: "Aytana O.", icon: "🌻", color: "#f97316", pin: "224", section: "92200-22" },
    { id: 40, name: "Brayden T.", icon: "🤖", color: "#06b6d4", pin: "225", section: "92200-22" },
    { id: 34, name: "Breon M.", icon: "🚲", color: "#06b6d4", pin: "226", section: "92200-22" },
    { id: 39, name: "Chloe R.", icon: "🧁", color: "#f59e0b", pin: "227", section: "92200-22" },
    { id: 31, name: "Corey J.", icon: "🏈", color: "#10b981", pin: "228", section: "92200-22" },
    { id: 35, name: "James M.", icon: "🐸", color: "#ec4899", pin: "229", section: "92200-22" },
    { id: 32, name: "Maurice L.", icon: "🎮", color: "#f59e0b", pin: "2210", section: "92200-22" },
    { id: 33, name: "Melanie M.", icon: "🍦", color: "#8b5cf6", pin: "2211", section: "92200-22" },
    { id: 38, name: "Nova R.", icon: "⭐", color: "#8b5cf6", pin: "2212", section: "92200-22" },
    { id: 42, name: "Raevon W.", icon: "🏃", color: "#64748b", pin: "2213", section: "92200-22" },
    { id: 36, name: "Wayne M.", icon: "🛹", color: "#d946ef", pin: "2214", section: "92200-22" },

    // Section 92200-23
    { id: 52, name: "Alma Q.", icon: "🧚‍♀️", color: "#8b5cf6", pin: "231", section: "92200-23" },
    { id: 48, name: "Amar J.", icon: "🏈", color: "#06b6d4", pin: "232", section: "92200-23" },
    { id: 47, name: "Ashton H.", icon: "🏀", color: "#8b5cf6", pin: "233", section: "92200-23" },
    { id: 45, name: "Bella G.", icon: "🐞", color: "#10b981", pin: "234", section: "92200-23" },
    { id: 44, name: "Brian C.", icon: "🕶️", color: "#3b82f6", pin: "235", section: "92200-23" },
    { id: 55, name: "Bria' S.", icon: "💎", color: "#10b981", pin: "236", section: "92200-23" },
    { id: 54, name: "Christin R.", icon: "🎮", color: "#06b6d4", pin: "237", section: "92200-23" },
    { id: 43, name: "Douglas C.", icon: "🧢", color: "#ef4444", pin: "238", section: "92200-23" },
    { id: 50, name: "Gianna M.", icon: "🌸", color: "#d946ef", pin: "239", section: "92200-23" },
    { id: 46, name: "Jazelle H.", icon: "🦄", color: "#f59e0b", pin: "2310", section: "92200-23" },
    { id: 53, name: "Nyomi R.", icon: "🍩", color: "#f59e0b", pin: "2311", section: "92200-23" },
    { id: 49, name: "Oliver M.", icon: "🦁", color: "#ec4899", pin: "2312", section: "92200-23" },
    { id: 51, name: "Sophia O.", icon: "🧜‍♀️", color: "#f97316", pin: "2313", section: "92200-23" },
    { id: 56, name: "Zakari T.", icon: "🏆", color: "#64748b", pin: "2314", section: "92200-23" },

    // Section 92200-24
    { id: 70, name: "Aubree W.", icon: "🦄", color: "#64748b", pin: "241", section: "92200-24" },
    { id: 67, name: "Davon P.", icon: "🎮", color: "#f59e0b", pin: "242", section: "92200-24" },
    { id: 63, name: "Jackson D.", icon: "🎸", color: "#ec4899", pin: "243", section: "92200-24" },
    { id: 61, name: "Juan C.", icon: "⚽", color: "#8b5cf6", pin: "244", section: "92200-24" },
    { id: 65, name: "Magali M.", icon: "🌺", color: "#f97316", pin: "245", section: "92200-24" },
    { id: 69, name: "Marli W.", icon: "🍭", color: "#10b981", pin: "246", section: "92200-24" },
    { id: 60, name: "Namir C.", icon: "🏎️", color: "#f59e0b", pin: "247", section: "92200-24" },
    { id: 68, name: "Nasir R.", icon: "🚀", color: "#06b6d4", pin: "248", section: "92200-24" },
    { id: 62, name: "Noah D.", icon: "🦕", color: "#06b6d4", pin: "249", section: "92200-24" },
    { id: 57, name: "Reagan A.", icon: "🎀", color: "#ef4444", pin: "2410", section: "92200-24" },
    { id: 66, name: "Savoy P.", icon: "🏀", color: "#8b5cf6", pin: "2411", section: "92200-24" },
    { id: 58, name: "Sofia A.", icon: "🐱", color: "#3b82f6", pin: "2412", section: "92200-24" },
    { id: 59, name: "Xi'airah C.", icon: "👑", color: "#10b981", pin: "2413", section: "92200-24" },
    { id: 64, name: "Zianya F.", icon: "🦋", color: "#d946ef", pin: "2414", section: "92200-24" },

    // Section 92200-25
    { id: 82, name: "Axel P.", icon: "🎸", color: "#06b6d4", pin: "251", section: "92200-25" },
    { id: 74, name: "Brien B.", icon: "🏈", color: "#f59e0b", pin: "252", section: "92200-25" },
    { id: 80, name: "Christie M.", icon: "💎", color: "#8b5cf6", pin: "253", section: "92200-25" },
    { id: 81, name: "Dayron O.", icon: "🚲", color: "#f59e0b", pin: "254", section: "92200-25" },
    { id: 83, name: "Emjai T.", icon: "🌈", color: "#10b981", pin: "255", section: "92200-25" },
    { id: 77, name: "Fernanda M.", icon: "🌻", color: "#ec4899", pin: "256", section: "92200-25" },
    { id: 79, name: "Jasmine M.", icon: "🌸", color: "#f97316", pin: "257", section: "92200-25" },
    { id: 76, name: "Jazmine C.", icon: "🎤", color: "#06b6d4", pin: "258", section: "92200-25" },
    { id: 73, name: "Kalia B.", icon: "🩰", color: "#10b981", pin: "259", section: "92200-25" },
    { id: 72, name: "Krhee B.", icon: "🎨", color: "#3b82f6", pin: "2510", section: "92200-25" },
    { id: 71, name: "Krystian A.", icon: "🕹️", color: "#ef4444", pin: "2511", section: "92200-25" },
    { id: 85, name: "Nadir W.", icon: "🛡️", color: "#ef4444", pin: "2512", section: "92200-25" },
    { id: 78, name: "Ruth D.", icon: "📚", color: "#d946ef", pin: "2513", section: "92200-25" },
    { id: 75, name: "Ryan B.", icon: "⚽", color: "#8b5cf6", pin: "2514", section: "92200-25" },
    { id: 84, name: "Zyaire T.", icon: "🛹", color: "#64748b", pin: "2515", section: "92200-25" },

    // Staff & Guest
    { id: 900, name: "Teacher", icon: "🎓", color: "#d946ef", pin: "2001", section: "Staff" },
    { id: 901, name: "Guest", icon: "👤", color: "#22c55e", pin: "1234", section: "Guest" },

    // New Grade Levels
    { id: 902, name: "1st Grade Guest", icon: "🍎", color: "#f97316", pin: "1001", section: "1st-Grade" },
    { id: 903, name: "Kinder Guest", icon: "🧸", color: "#10b981", pin: "0001", section: "Kindergarten" },
    { id: 904, name: "Pre-K Guest", icon: "🎨", color: "#ec4899", pin: "0000", section: "Pre-K" },
    { id: 905, name: "3rd Grade Guest", icon: "📚", color: "#3b82f6", pin: "3001", section: "3rd-Grade" },
];

const SECTION_NAMES: { [key: string]: string } = {
    '92200-21': 'Ms. Bond',
    '92200-22': 'Mrs. Coley',
    '92200-23': 'Ms. Cummings',
    '92200-24': 'Ms. Sidamon',
    '92200-25': 'Ms. Fletcher',
    '92200-26': 'Ms. Jugasan',
    '1st-Grade': '1st Grade Educators',
    'Kindergarten': 'Kindergarten',
    'Pre-K': 'Pre-K / Early Learners',
    '3rd-Grade': '3rd Grade Educators',
    'Guest': 'Guest Portal',
    'Staff': 'Staff Portal',
};

const ClassSelection = ({ onSelect, language }: { onSelect: (section: string) => void, language: 'en' | 'es' }) => {
    const sections = Array.from(new Set(STUDENTS.map(s => s.section)))
        .filter(s => s && s !== 'Staff' && s !== 'Guest' && s !== '1st-Grade' && s !== 'Kindergarten' && s !== 'Pre-K' && s !== '3rd-Grade')
        .sort((a, b) => {
            const numA = parseInt(a?.split('-')[1] || '999');
            const numB = parseInt(b?.split('-')[1] || '999');
            return numA - numB;
        });

    const getTheme = (index: number) => {
        const themes = ['card-theme-blue', 'card-theme-purple', 'card-theme-pink', 'card-theme-green', 'card-theme-orange', 'card-theme-cyan'];
        return themes[index % themes.length];
    };

    return (
        <div className="mobile-content">
            <h2 className="vibrant-title">
                {language === 'en' ? 'SELECT YOUR CLASS' : 'SELECCIONA TU CLASE'}
            </h2>
            <div className="teacher-grid">
                {sections.map((section, index) => (
                    <div
                        key={section}
                        className={`teacher-card ${getTheme(index)}`}
                        onClick={() => section && onSelect(section)}
                    >
                        <div className="teacher-icon">🏫</div>
                        <div className="teacher-name">
                            {SECTION_NAMES[section!] || 'Teacher'}
                        </div>
                        <div className="teacher-section">Section: {section}</div>
                    </div>
                ))}

                {/* Pre-K Card */}
                <div className="teacher-card card-theme-pink" onClick={() => onSelect('Pre-K')} style={{ '--card-color-1': '#ec4899', '--card-color-2': '#f472b6' } as React.CSSProperties}>
                    <div className="teacher-icon">🎨</div>
                    <div className="teacher-name">Pre-K</div>
                    <div className="teacher-section">Early Learners</div>
                </div>

                {/* Kindergarten Card */}
                <div className="teacher-card card-theme-green" onClick={() => onSelect('Kindergarten')} style={{ '--card-color-1': '#10b981', '--card-color-2': '#34d399' } as React.CSSProperties}>
                    <div className="teacher-icon">🧸</div>
                    <div className="teacher-name">Kindergarten</div>
                    <div className="teacher-section">Kinder</div>
                </div>

                {/* 1st Grade Card */}
                <div className="teacher-card card-theme-orange" onClick={() => onSelect('1st-Grade')} style={{ '--card-color-1': '#f97316', '--card-color-2': '#fbbf24' } as React.CSSProperties}>
                    <div className="teacher-icon">🍎</div>
                    <div className="teacher-name">1st Grade</div>
                    <div className="teacher-section">Grade 1</div>
                </div>

                {/* 3rd Grade Card */}
                <div className="teacher-card card-theme-blue" onClick={() => onSelect('3rd-Grade')} style={{ '--card-color-1': '#3b82f6', '--card-color-2': '#60a5fa' } as React.CSSProperties}>
                    <div className="teacher-icon">📚</div>
                    <div className="teacher-name">3rd Grade</div>
                    <div className="teacher-section">Grade 3</div>
                </div>

                {/* Guest Portal Card */}
                <div className="teacher-card card-theme-cyan" onClick={() => onSelect('Guest')} style={{ '--card-color-1': '#06b6d4', '--card-color-2': '#22d3ee' } as React.CSSProperties}>
                    <div className="teacher-icon">👤</div>
                    <div className="teacher-name">Guest Portal</div>
                    <div className="teacher-section">Guest Access</div>
                </div>

                {/* Staff Portal Card */}
                <div className="teacher-card card-theme-purple" onClick={() => onSelect('Staff')} style={{ '--card-color-1': '#6366f1', '--card-color-2': '#8b5cf6' } as React.CSSProperties}>
                    <div className="teacher-icon">🎓</div>
                    <div className="teacher-name">{language === 'en' ? 'Staff Portal' : 'Portal Personal'}</div>
                    <div className="teacher-section">{language === 'en' ? 'Admin Access' : 'Acceso Admin'}</div>
                </div>
            </div>
        </div>
    );
};

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
    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    // Game State
    const [challenge, setChallenge] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState(0);

    // Whack-a-Vowel State
    const [whackGrid, setWhackGrid] = useState<string[]>(Array(9).fill(''));
    const [activeWhack, setActiveWhack] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [timerActive, setTimerActive] = useState(false);
    const [userInput, setUserInput] = useState(''); // For Word Builder and Story Spark
    const [usedWords, setUsedWords] = useState<Set<string>>(new Set()); // Track used words to avoid repetition


    const fetchChallengeData = async (selectedMode: string) => {
        setLoading(true);
        setFeedback('');
        setChallenge(null);
        setUserInput('');

        // Try AI generation first if configured
        if (ai && student) {
            try {
                let prompt = "";
                const langInstruction = language === 'es' ? "Generate the content in Spanish." : "";
                const excludeList = Array.from(usedWords).join(", ");

                // Grade Level Logic
                let gradeLevel = "2nd grader";
                if (student.section === '1st-Grade') gradeLevel = "1st grader";
                if (student.section === 'Kindergarten') gradeLevel = "Kindergarten student";
                if (student.section === 'Pre-K') gradeLevel = "Pre-Schooler (keep it very simple)";
                if (student.section === '3rd-Grade') gradeLevel = "3rd grader (make it slightly challenging)";

                if (selectedMode === 'digraph') {
                    prompt = `Generate a digraph challenge for a ${gradeLevel} named ${student.name}. ${langInstruction}
                    Pick a word with 'sh', 'ch', 'th', or 'wh'.
                    Do NOT use these words: ${excludeList}.
                    Do NOT ask about syllables. Focus ONLY on the missing sound.
                    Return JSON: { "word": "string", "missing": "string", "context": "sentence using the word", "phoneme": "the sound (e.g. sh)" }.`;
                } else if (selectedMode === 'spell') {
                    prompt = `Generate a spelling word for a ${gradeLevel} named ${student.name}. ${langInstruction}
                    Do NOT use these words: ${excludeList}.
                    Return JSON: { "word": "string", "context": "sentence" }.`;
                } else if (selectedMode === 'syllable') {
                    prompt = `Generate a challenge about ${gradeLevel} syllable types (Open, Closed, VCE). ${langInstruction}
                    Focus on breaking words into syllables. Do NOT use these words: ${excludeList}.
                    Return JSON: { "word": "string", "syllables": ["syl", "la", "ble"], "count": number, "context": "sentence using the word", "type": "VCE, Open, or Closed" }.`;
                } else if (selectedMode === 'story') {
                    prompt = `Write a 2-sentence story starter about ${student.name} suitable for a ${gradeLevel}. ${langInstruction}
                    Return JSON: { "starter": "string" }.`;
                }

                if (prompt) {
                    const aiCall = ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: prompt,
                        config: { responseMimeType: 'application/json' }
                    });

                    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("AI Timeout")), 8000));
                    const resp: any = await Promise.race([aiCall, timeout]);
                    const json = JSON.parse(resp.text || "{}");

                    if (json.word || json.starter) {
                        if (json.word) setUsedWords(prev => new Set(prev).add(json.word));
                        setChallenge(json);

                        // Speak logic
                        if (selectedMode === 'digraph') {
                            const missing = json.missing || "";
                            const isEnd = json.word.toLowerCase().endsWith(missing.toLowerCase());
                            const question = isEnd ? `What sound ends the word ${json.word}?` : `What sound starts the word ${json.word}?`;
                            speak(`Okay ${student.name}. Listen carefully. The word is ${json.word}. ${json.context}. ${question}`);
                        } else if (selectedMode === 'spell') {
                            speak(`Spell the word ${json.word}. ${json.context}`);
                        } else if (selectedMode === 'syllable') {
                            speak(`How many syllables do you hear in the word ${json.word}? ${json.context}`);
                        } else if (selectedMode === 'story') {
                            speak(json.starter + " What happens next?");
                        }

                        setLoading(false);
                        return; // Success!
                    }
                }
            } catch (e) {
                console.error("AI Error, falling back to offline data", e);
            }
        }

        // Fallback to offline data
        try {
            const useOfflineData = () => {
                const modeMap: Record<string, string> = {
                    'spell': 'spell',
                    'syllable': 'syllable',
                    'story': 'story',
                    'vowel-sort': 'vowelSort',
                    'r-controlled': 'rControlled',
                    'n-controlled': 'nControlled',
                    'schwa': 'schwa',
                    'vce': 'vce',
                    'contractions': 'contractions',
                    'dictation': 'dictation',
                    'teacher-curriculum': 'teacher-curriculum',
                    'chunk-blend': 'chunk-blend'
                };
                const dataKey = modeMap[selectedMode] || 'digraph';
                const dataList = (OFFLINE_DATA as any)[dataKey];

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

                try {
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
                    }
                } catch (innerError: any) {
                    console.error("Error setting challenge or speaking:", innerError);
                    setFeedback("Error starting task. Please try again.");
                }
                setLoading(false);
            };

            // Always use offline data for reliability
            useOfflineData();
        } catch (error: any) {
            console.error("Error in fetchChallengeData:", error);
            setFeedback("Error loading task. Please try again.");
            setLoading(false);
        }
    };

    const checkAnswer = (answer: string) => {
        if (!challenge) return;
        if (answer === challenge.missing) {
            setFeedback('Correct! 🎉');
            speak("That is correct! Great job!");

            // AI Adaptive Praise
            if (ai && student) {
                (async () => {
                    try {
                        const prompt = `Student ${student.name} got "${challenge.word}" correct. Generate a short, specific praise (1 sentence).`;
                        const result = await ai.models.generateContent({
                            model: 'gemini-2.5-flash',
                            contents: prompt,
                            config: { responseMimeType: 'text/plain' }
                        });
                        const text = result.text;
                        if (text) setTimeout(() => speak(text), 2000);
                    } catch (e) { console.error(e); }
                })();
            }

            setTimeout(() => {
                fetchChallengeData('digraph');
            }, 4000); // Increased delay to allow AI speech
        } else {
            setFeedback('Try again!');
            speak(`Not quite. The word is ${challenge.word}.`);

            // AI Adaptive Hint
            if (ai && student) {
                (async () => {
                    try {
                        const prompt = `Student ${student.name} missed "${challenge.word}". They picked "${answer}" but needed "${challenge.missing}". 
                        Generate a short (1 sentence) hint. 
                        Use phrases like "Take your time, ${student.name}" or "Slow down and sound it out".`;
                        const result = await ai.models.generateContent({
                            model: 'gemini-2.5-flash',
                            contents: prompt,
                            config: { responseMimeType: 'text/plain' }
                        });
                        const text = result.text;
                        if (text) setTimeout(() => speak(text), 2500);
                    } catch (e) { console.error(e); }
                })();
            }
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
                // Prefer British Female voices
                const voice = voices.find(v =>
                    (v.lang.includes('GB') || v.lang.includes('UK')) &&
                    v.name.toLowerCase().includes('female')
                ) ||
                    voices.find(v => v.lang.includes('GB') || v.lang.includes('UK')) ||
                    voices.find(v => v.name.toLowerCase().includes('female')) ||
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

                // AI Personalized Greeting
                const playGreeting = async () => {
                    try {
                        if (ai) {
                            const context = StudentProfileBuilder.getStudentContext(targetStudent.name, targetStudent.pin);
                            const prompt = `You are Wally, a friendly owl tutor. The student is ${targetStudent.name}. 
                            Context: ${context}. 
                            Give a warm, short (1 sentence) greeting. 
                            If they have high accuracy, praise them. If they struggled, encourage them.`;

                            const result = await ai.models.generateContent({
                                model: 'gemini-2.5-flash',
                                contents: prompt,
                                config: { responseMimeType: 'text/plain' }
                            });
                            const text = result.text || `Welcome, ${targetStudent.name}! Let's learn together!`;
                            speak(text);
                        } else {
                            speak(`Welcome, ${targetStudent.name}! Let's learn together!`);
                        }
                    } catch (e) {
                        console.error("AI Greeting Error", e);
                        speak(`Welcome, ${targetStudent.name}! Let's learn together!`);
                    }
                };
                playGreeting();

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

    // Roster View
    if (!student) {
        return (
            <div className="mobile-app">
                <div className="mobile-header">
                    <div className="app-title-mobile">🦉 WORD WHIZ KIDS v1.1</div>
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

                {!selectedSection ? (
                    <ClassSelection onSelect={setSelectedSection} language={language} />
                ) : (
                    <div className="mobile-content">
                        <button className="mobile-btn" onClick={() => setSelectedSection(null)} style={{ marginBottom: '20px', background: '#475569' }}>
                            ⬅ Back to Classes
                        </button>

                        <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', fontSize: '20px', fontWeight: 600 }}>
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
                            {STUDENTS.filter(s => s.section === selectedSection).map((s) => (
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
                )}

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
                            {!loading && <div className="wally-mobile" style={{ fontSize: '48px', animation: isSpeaking ? 'bounce 1s infinite' : 'none' }}>🦉</div>}

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
                            <h2 style={{ textAlign: 'center', color: '#ec4899' }}>Story Spark 📖</h2>

                            {!challenge && !loading && (
                                <button className="mobile-btn" onClick={() => fetchChallengeData('story')} style={{ background: '#3b82f6', marginTop: '40px' }}>
                                    Start Task
                                </button>
                            )}

                            {loading && <div className="wally-mobile" style={{ fontSize: '48px', animation: 'bounce 1s infinite' }}>🦉</div>}

                            {challenge && challenge.starter && (
                                <>
                                    <div style={{ fontSize: '18px', margin: '20px 0', textAlign: 'center', lineHeight: '1.6', fontStyle: 'italic' }}>
                                        "{challenge.starter}"
                                    </div>

                                    <p style={{ textAlign: 'center', color: '#a0a0a0', marginBottom: '20px' }}>
                                        {language === 'en' ? 'What happens next? Tell the story!' : '¿Qué pasa después? ¡Cuenta la historia!'}
                                    </p>

                                    <button
                                        className="mobile-btn"
                                        onClick={() => {
                                            setFeedback('Great imagination! 🎉');
                                            speak('That sounds like a wonderful story!');
                                            setTimeout(() => fetchChallengeData('story'), 3000);
                                        }}
                                        style={{ background: '#10b981' }}
                                    >
                                        {language === 'en' ? 'Next Story' : 'Siguiente Historia'}
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="mobile-app">
            <div className="mobile-header">
                <div className="app-title-mobile">🦉 WORD WHIZ KIDS</div>
            </div>
            <div className="mobile-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div className="loading-mobile">
                    <div className="spinner-mobile"></div>
                    <div>Loading...</div>
                </div>
            </div>
        </div>
    );
}

export default App;
