// Fichier: backend/server.js

require('dotenv').config();

// Chargement de l'application Express
const app = require('./src/app');
const db = require('./src/config/db');

// Antigravity fournit automatiquement process.env.PORT
const PORT = process.env.PORT || 3001;

// Test de la connexion DB avant de lancer le serveur
const startServer = async () => {
    try {
        // Vérification simple que PostgreSQL répond
        const res = await db.query('SELECT NOW()');
        console.log(`✅ Base de données connectée : ${res.rows[0].now}`);

        app.listen(PORT, () => {
            console.log(`🚀 Serveur lancé sur le port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Impossible de se connecter à la base de données :', err);
        process.exit(1);
    }
};

startServer();