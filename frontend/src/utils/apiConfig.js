// frontend/src/utils/apiConfig.js

// Configuration dynamique de l'URL API
let BASE_URL;

if (import.meta.env.VITE_API_URL) {
    // Si une variable d'env est définie, l'utiliser (production)
    BASE_URL = import.meta.env.VITE_API_URL;
} else if (typeof window !== 'undefined') {
    // En développement : détecter automatiquement l'hôte et utiliser le port 3001
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    BASE_URL = `${protocol}//${hostname}:3001`;
} else {
    // Fallback
    BASE_URL = 'http://localhost:3001';
}

// Failsafe: Force HTTPS if it's the production domain
if (BASE_URL.includes('api.dz-legal-ai.com') && !BASE_URL.startsWith('https')) {
    BASE_URL = BASE_URL.replace('http://', 'https://');
}

export const API_ENDPOINTS = {
    auth: `${BASE_URL}/api/auth`,
    assistant: `${BASE_URL}/api/assistant`,
    billing: `${BASE_URL}/api/billing`,
    organization: `${BASE_URL}/api/organization`,
    admin: `${BASE_URL}/api/admin`,
    library: `${BASE_URL}/api/library`,
    files: `${BASE_URL}/files`,
    contactSales: `${BASE_URL}/api/contact/sales`,
    contactSupport: `${BASE_URL}/api/contact/support`
};

export default BASE_URL;
