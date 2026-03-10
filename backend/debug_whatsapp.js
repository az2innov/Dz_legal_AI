/**
 * Dz Legal AI - WhatsApp Connectivity Recovery
 * Ce script va tenter de réparer la session WhatsApp sur Render.
 * Usage: node debug_whatsapp.js
 */
require('dotenv').config();
const { checkWAHAStatus, startWAHASession, deleteWAHASession } = require('./src/shared/whatsappServiceWAHA');

async function debug() {
    console.log("--- 🕵️ Diagnostic de Récupération WhatsApp ---");

    // 1. Vérification du statut actuel
    let status = await checkWAHAStatus();
    console.log(`\nStatut actuel de la session : [${status.status || 'INCONNU'}]`);

    // Cas d'échec : FAILED, STOPPED, ou Erreur technique
    if (!status.success || ['FAILED', 'STOPPED', 'ERROR'].includes(status.status)) {
        console.log("\n⚠️ La session est instable ou arrêtée. Déclenchement d'une réinitialisation complète...");

        // 2. Suppression de la session existante pour nettoyer les données corrompues
        console.log("Nettoyage en cours...");
        await deleteWAHASession();
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 3. Redémarrage propre
        console.log("Démarrage d'une nouvelle session...");
        const start = await startWAHASession();

        if (!start.success) {
            console.log("❌ Impossible de démarrer la session. Vérifiez vos logs Render.");
            return;
        }

        console.log("✅ Session démarrée. Initialisation en cours...");
        console.log("Attente de 15 secondes pour stabiliser la connexion...");
        await new Promise(resolve => setTimeout(resolve, 15000));

        // On revérifie le statut après initialisation
        status = await checkWAHAStatus();
        console.log(`Nouveau statut : [${status.status}]`);
    }

    // 4. Instructions selon le statut final
    if (['SCAN_QR_CODE', 'STARTING'].includes(status.status)) {
        console.log("\n📸 ACTION REQUISE : SCAN DU CODE QR");
        console.log("La session est prête mais n'est pas liée à votre téléphone.");
        console.log("1. Ouvrez WhatsApp sur votre téléphone.");
        console.log("2. Allez dans Réglages > Appareils connectés.");
        console.log("3. Cliquez sur l'URL suivante pour scanner le QR Code :");
        const URL = process.env.WAHA_URL || 'https://aha-whatsapp-algerie.onrender.com';
        console.log(`👉 ${URL}/dashboard/#/sessions/default`);
    } else if (status.status === 'WORKING' || status.status === 'CONNECTED') {
        console.log("\n✅ RÉUSSITE ! Votre WhatsApp est connecté et prêt à envoyer des codes.");
    } else {
        console.log("\n⏳ Re-tentative... Relancez ce script dans 30 secondes si le statut ne change pas.");
    }
}

debug().catch(err => {
    console.error("\n❌ Erreur fatale du script :");
    console.error(err);
});
