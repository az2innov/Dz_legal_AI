import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import './i18n';

// --- Polyfill Object.hasOwn (Pour compatibilité anciens navigateurs) ---
if (!Object.hasOwn) {
  Object.hasOwn = (obj, propKey) => {
    return Object.prototype.hasOwnProperty.call(obj, propKey);
  };
}

import App from './App.jsx'
import { initGA } from './services/analyticsService';

// Initialisation GA4
initGA();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
