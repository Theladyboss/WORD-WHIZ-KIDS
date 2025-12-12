import React from "react";
import { createRoot } from "react-dom/client";

const App = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            color: 'white',
            fontSize: '2rem',
            fontFamily: 'sans-serif',
            background: '#020617'
        }}>
            <h1>✅ System Check: Online</h1>
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
