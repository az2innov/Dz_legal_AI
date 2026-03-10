// Fichier: backend/src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// --- Import des Routes Modulaires ---
const assistantRoutes = require('./modules/assistant/routes');
const identityRoutes = require('./modules/identity/routes');
const billingRoutes = require('./modules/billing/routes');
const organizationRoutes = require('./modules/organization/routes');
const adminRoutes = require('./modules/admin/routes');
const libraryRoutes = require('./modules/library/routes');
const contactRoutes = require('./modules/contact/routes');

// Initialisation
const app = express();

// Configuration Proxy (Pour Nginx/Passenger)
// Indispensable pour avoir la vraie IP du client (req.ip) et non 127.0.0.1
// Utile pour le rate limiter et les logs.
app.set('trust proxy', 1);

// --- Middlewares Globaux ---

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));

// Configuration CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://dz-legal-ai.com',
    'https://www.dz-legal-ai.com',
    'https://api.dz-legal-ai.com', // Ajout de l'API elle-même (parfois nécessaire)
    process.env.FRONTEND_URL
].filter(Boolean);


app.use(cors({
    origin: (origin, callback) => {
        // Autoriser les requêtes sans origine (comme les outils de test ou requêtes serveur à serveur)
        if (!origin) return callback(null, true);

        // Vérification plus souple
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.error(`[CORS] Bloqué: ${origin}`);
            // En production, on peut être plus souple temporairement si besoin, 
            // mais pour l'instant on garde la sécurité.
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'X-Guest-ID', 'X-Requested-With'],
    exposedHeaders: ['X-Guest-Limit', 'X-Guest-Remaining']
}));

// Parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- Route Fichiers Statiques ---
app.use('/files', express.static(path.join(process.cwd(), 'storage')));

// --- Route Health Check ---
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: '🚀 API LegalDZ AI (SaaS) est opérationnelle',
        version: '1.2.0'
    });
});

// --- Montage des Modules ---
app.use('/api/assistant', assistantRoutes);
app.use('/api/auth', identityRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/contact', contactRoutes);

// --- Gestion des Erreurs ---

app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
    console.error('🔥 Erreur Serveur :', err.stack);
    const message = process.env.NODE_ENV === 'production'
        ? 'Une erreur interne est survenue.'
        : err.message;

    res.status(500).json({ error: 'Internal Server Error', message: message });
});

module.exports = app;