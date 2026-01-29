import React from 'react';
import { createRoot } from 'react-dom/client';
import FreedomAi from './FreedomAi';

// Force unregister service workers to clear old cache
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
            console.log('Unregistering SW:', registration);
            registration.unregister();
        }
    });
}

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <FreedomAi />
        </React.StrictMode>
    );
}
