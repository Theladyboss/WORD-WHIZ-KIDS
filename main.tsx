import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#333',
            color: 'white',
            fontFamily: 'sans-serif'
        }}>
            <h1 style={{ fontSize: '3rem', color: '#4ade80' }}>✅ SYSTEM RESET SUCCESSFUL</h1>
            <p style={{ fontSize: '1.5rem' }}>v2.5 - Safe Mode</p>
            <p>The application has been reset to a safe state.</p>
            <button
                onClick={() => window.location.reload()}
                style={{
                    marginTop: '20px',
                    padding: '15px 30px',
                    fontSize: '1.2rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer'
                }}>
                Reload App
            </button>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);

    // Hide overlay
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
}
