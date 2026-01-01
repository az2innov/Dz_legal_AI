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

// Initialisation
const app = express();

// --- Middlewares Globaux ---

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } 
}));
app.use(morgan('dev'));

// Configuration CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'La politique CORS interdit l\'accès depuis cette origine : ' + origin;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    // --- CORRECTION ICI : AJOUT DE 'PATCH' ---
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    // ----------------------------------------
    allowedHeaders: ['Content-Type', 'Authorization']
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