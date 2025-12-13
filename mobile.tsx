import React from "react";
import { createRoot } from "react-dom/client";

const MobileApp = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#020617',
            color: 'white',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            padding: '20px'
        }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Word Whiz Mobile</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Starting up...</p>
            <div style={{
                marginTop: '20px',
                width: '40px',
                height: '40px',
                border: '4px solid #3b82f6',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(<MobileApp />);
}
