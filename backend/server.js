// Fichier: backend/server.js

require('dotenv').config();
// Attention aux chemins : on pointe vers le dossier src
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 3001;

// Test de la connexion DB avant de lancer le serveur
const startServer = async () => {
    try {
        // Simple requête pour vérifier que Postgres répond
        const res = await db.query('SELECT NOW()');
        console.log(`✅ Base de données connectée : ${res.rows[0].now}`);

        app.listen(PORT, () => {
            console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Impossible de se connecter à la base de données :', err);
        process.exit(1);
    }
};

startServer();