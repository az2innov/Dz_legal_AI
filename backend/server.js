// Fichier: backend/server.js

require('dotenv').config();
// Attention aux chemins : on pointe vers le dossier src
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 3001;

// Test de la connexion DB avant de lancer le serveur
const startServer = async () => {
    try {
        console.log(`[Startup] Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`[Startup] Port target: ${PORT}`);

        // Simple requête pour vérifier que Postgres répond (Note: the comment says Postgres but it uses MySQL)
        console.log(`[Startup] Testing Database connection...`);
        const res = await db.query('SELECT NOW()');
        console.log(`✅ Base de données connectée.`);

        app.listen(PORT, () => {
            console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Impossible de se connecter à la base de données :', err);
        process.exit(1);
    }
};

startServer();