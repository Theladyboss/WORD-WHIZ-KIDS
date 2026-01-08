/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { OFFLINE_DATA } from './offlineData';
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
    { id: 1, name: 'Kyngston', icon: '👑', color: '#ef4444', pin: '201' },
    { id: 2, name: 'Carter', icon: '🚀', color: '#3b82f6', pin: '202' },
    { id: 3, name: 'Nazir', icon: '🧭', color: '#10b981', pin: '203' },
    { id: 4, name: 'Derick', icon: '⚡', color: '#f59e0b', pin: '204' },
    { id: 5, name: 'Desmond', icon: '🛡️', color: '#8b5cf6', pin: '205' },
    { id: 6, name: 'James', icon: '🐸', color: '#06b6d4', pin: '206' },
    { id: 7, name: 'Ana', icon: '🌟', color: '#ec4899', pin: '207' },
    { id: 8, name: 'Teacher', icon: '🎓', color: '#64748b', pin: '2001' },
    { id: 9, name: 'Jasmine', icon: '🌸', color: '#d946ef', pin: '208' },
    { id: 10, name: 'Axel', icon: '🎸', color: '#f97316', pin: '209' },
    { id: 11, name: 'Jazelle', icon: '🦄', color: '#8b5cf6', pin: '210' },
    { id: 12, name: 'Oliver', icon: '🦁', color: '#f59e0b', pin: '211' },
    { id: 13, name: 'Zianya', icon: '🦋', color: '#06b6d4', pin: '212' },
    { id: 14, name: 'Noah', icon: '🦖', color: '#10b981', pin: '213' },
    { id: 15, name: 'Teacher 2', icon: '👩‍🏫', color: '#64748b', pin: '2002' },
    { id: 16, name: 'Teacher 3', icon: '👨‍🏫', color: '#64748b', pin: '2003' },
    { id: 17, name: 'Teacher 4', icon: '🍎', color: '#64748b', pin: '2004' },
    { id: 18, name: 'Teacher 5', icon: '📚', color: '#64748b', pin: '2005' },
    { id: 19, name: 'Teacher 6', icon: '✏️', color: '#64748b', pin: '2006' },
    { id: 99, name: 'Guest', icon: '👤', color: '#64748b', pin: '1234' },
];

function App() {
    const [student, setStudent] = useState<Student | null>(null);
    const [targetStudent, setTargetStudent] = useState<Student | null>(null);
    const [showPinPad, setShowPinPad] = useState(false);
    const [enteredPin, setEnteredPin] = useState('');
    const [mode, setMode] = useState<string>('menu');
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speak = async (text: string) => {
        setIsSpeaking(true);
        try {
            const resp = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: { role: 'user', parts: [{ text: `Please say: ${text}` }] },
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
        if (enteredPin.length === 4) {
            if (targetStudent && enteredPin === targetStudent.pin) {
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
                </div>

                <div className="mobile-content">
                    <h2 style={{ textAlign: 'center', margin: '20px 0', fontSize: '20px', fontWeight: 600 }}>
                        Select Your Profile
                    </h2>

                    <button
                        className="mobile-btn"
                        onClick={() => speak('Hi! I am Wally, your AI learning companion!')}
                        style={{ marginBottom: '20px' }}
                    >
                        👋 Meet Wally
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
                            <h3 style={{ textAlign: 'center', margin: 0 }}>Enter PIN for {targetStudent.name}</h3>
                            <div className="pin-display">
                                {enteredPin.split('').map((_, i) => '●').join(' ') || '_ _ _ _'}
                            </div>
                            <div className="pin-grid">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                    <button key={num} className="pin-btn" onClick={() => handlePinEnter(num.toString())}>
                                        {num}
                                    </button>
                                ))}
                                <button className="pin-btn" onClick={handlePinClear} style={{ fontSize: '16px', fontWeight: 600 }}>
                                    Clear
                                </button>
                                <button className="pin-btn" onClick={() => handlePinEnter('0')}>
                                    0
                                </button>
                                <button
                                    className="pin-btn"
                                    onClick={handlePinSubmit}
                                    style={{
                                        background: enteredPin.length === 4 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                                        borderColor: enteredPin.length === 4 ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                                        color: enteredPin.length === 4 ? '#10b981' : '#ffffff'
                                    }}
                                >
                                    ✓
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Main Menu
    return (
        <div className="mobile-app">
            <div className="mobile-header">
                <div className="app-title-mobile">🦉 WORD WHIZ KIDS</div>
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
                    {student.name} →
                </button>
            </div>

            <div className="mobile-content">
                <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '20px' }}>
                    Select Activity
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button className="mobile-btn" onClick={() => setMode('digraph')}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔍</div>
                        Digraph Detective
                    </button>
                    <button className="mobile-btn" onClick={() => setMode('spell')}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>📝</div>
                        Word Builder
                    </button>
                    <button className="mobile-btn" onClick={() => setMode('syllable')}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>🧩</div>
                        Syllable Savvy
                    </button>
                    <button className="mobile-btn" onClick={() => setMode('story')}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>📖</div>
                        Story Spark
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
