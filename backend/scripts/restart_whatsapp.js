require('dotenv').config();
const axios = require('axios');

/**
 * Script de Maintenance WhatsApp (WAHA)
 * Utilisation: 
 *   node scripts/restart_whatsapp.js          -> Redémarrage simple (Conserve la connexion)
 *   node scripts/restart_whatsapp.js --reset  -> Réinitialisation complète (Efface tout)
 */

const WAHA_URL = process.env.WAHA_URL || 'https://aha-whatsapp-algerie.onrender.com';
const WAHA_API_KEY = process.env.WAHA_API_KEY;
const WAHA_SESSION = process.env.WAHA_SESSION || 'default';
const isReset = process.argv.includes('--reset');

const headers = {
    'Content-Type': 'application/json',
    ...(WAHA_API_KEY && { 'X-Api-Key': WAHA_API_KEY })
};

async function maintenance() {
    console.log(`\n--- 🔄 Maintenance WhatsApp [${WAHA_SESSION}] ---`);
    if (isReset) console.log("⚠️ MODE RESET : La session sera effacée !");
    console.log(`📍 URL: ${WAHA_URL}`);

    try {
        // 1. Arrêt
        console.log(`\n1️⃣ Arrêt de la session...`);
        try {
            await axios.post(`${WAHA_URL}/api/sessions/stop`, { name: WAHA_SESSION }, { headers, timeout: 10000 });
            console.log("✅ Session arrêtée.");
        } catch (e) {
            console.log("ℹ️ La session était déjà arrêtée.");
        }

        // 2. Nettoyage (Uniquement si --reset)
        if (isReset) {
            console.log(`2️⃣ Nettoyage Profond (Reset)...`);
            try {
                await axios.delete(`${WAHA_URL}/api/sessions/${WAHA_SESSION}`, { headers, timeout: 10000 });
                console.log("✅ Session supprimée du serveur.");
            } catch (e) {
                console.log("ℹ️ Rien à supprimer.");
            }
        } else {
            console.log(`2️⃣ Conservation des données.`);
        }

        // 3. Pause
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 4. Démarrage
        console.log(`3️⃣ Démarrage de la session...`);
        const startResponse = await axios.post(`${WAHA_URL}/api/sessions/start`,
            { name: WAHA_SESSION },
            { headers, timeout: 15000 }
        );
        console.log("✅ Signal de démarrage envoyé !");

        console.log(`\n--- 🏁 PROCÉDURE TERMINÉE ---`);
        console.log(`ℹ️ Statut actuel : ${startResponse.data.status}`);

        if (isReset || startResponse.data.status === 'SCAN_QR_CODE') {
            console.log(`📸 ACTION REQUISE : Surveillez les LOGS Render pour scanner le QR Code.`);
        } else {
            console.log(`✅ Attendez 30s : si le disque Render fonctionne, elle passera en WORKING toute seule.`);
        }

    } catch (error) {
        console.error(`\n❌ Erreur:`, error.response?.data || error.message);
    }
}

maintenance();
