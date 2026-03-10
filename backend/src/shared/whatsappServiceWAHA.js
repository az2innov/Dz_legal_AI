/**
 * WhatsApp Service via WAHA (Self-Hosted)
 * Alternative à Twilio pour utiliser un numéro algérien
 */

const axios = require('axios');

// Configuration WAHA - Instance Render
const WAHA_URL = process.env.WAHA_URL || 'https://aha-whatsapp-algerie.onrender.com';
const WAHA_SESSION = process.env.WAHA_SESSION || 'default';
const WAHA_API_KEY = process.env.WAHA_API_KEY || ''; // Vide par défaut - WAHA Render sans auth

/**
 * Envoyer un code 2FA via WhatsApp avec WAHA
 * @param {string} phoneNumber - Format: +213XXXXXXXXX ou 213XXXXXXXXX
 * @param {string} code - Code 2FA à envoyer
 */
async function send2FACode(phoneNumber, code) {
    try {
        console.log(`[WAHA] Tentative d'envoi du code 2FA à: ${phoneNumber}`);
        console.log(`[WAHA] URL: ${WAHA_URL}`);
        console.log(`[WAHA] Session: ${WAHA_SESSION}`);

        // Nettoyer le numéro de téléphone (enlever +, espaces, tirets)
        let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

        // Correction automatique pour les numéros algériens (05, 06, 07 -> 213)
        // Ex: 0772190927 -> 213772190927
        if (cleanNumber.length === 10 && (cleanNumber.startsWith('05') || cleanNumber.startsWith('06') || cleanNumber.startsWith('07'))) {
            cleanNumber = '213' + cleanNumber.substring(1);
            console.log(`[WAHA] 🔄 Numéro algérien formaté: ${cleanNumber}`);
        }

        // Format WhatsApp : numéro@c.us
        const chatId = `${cleanNumber}@c.us`;

        // Message
        const message = `🔐 *Dz Legal AI - Code de vérification*\n\nVotre code de vérification est : *${code}*\n\n⏰ Ce code expire dans 2 minutes.\n\n_Si vous n'avez pas demandé ce code, ignorez ce message._`;

        // Headers
        const headers = {
            'Content-Type': 'application/json'
        };

        // Ajouter la clé API si configurée
        if (WAHA_API_KEY) {
            headers['X-Api-Key'] = WAHA_API_KEY;
        }

        // ✅ Timeout réduit à 3 secondes pour ne pas bloquer
        const response = await axios.post(
            `${WAHA_URL}/api/sendText`,
            {
                session: WAHA_SESSION,
                chatId: chatId,
                text: message
            },
            {
                timeout: 15000, // ✅ 15 secondes au lieu de 3 (Render free tier peut être lent)
                headers: headers
            }
        );

        console.log(`[WAHA] ✅ Message envoyé avec succès:`, {
            to: phoneNumber,
            chatId: chatId,
            messageId: response.data?.id,
            status: response.status
        });

        return {
            success: true,
            messageId: response.data?.id || null,
            timestamp: response.data?.timestamp || Date.now()
        };

    } catch (error) {
        console.error('[WAHA] ❌ Erreur envoi WhatsApp:', {
            error: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data
        });

        // ✅ NE PAS BLOQUER - Juste logger et retourner échec
        if (error.code === 'ECONNREFUSED') {
            console.error('[WAHA] ❌ Impossible de se connecter au serveur WAHA.');
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            console.error('[WAHA] ❌ Timeout (3s) - WAHA trop lent.');
        } else if (error.response?.status === 404) {
            console.error('[WAHA] ❌ Session WAHA introuvable:', WAHA_SESSION);
        } else if (error.response?.status === 401 || error.response?.status === 403) {
            console.error('[WAHA] ❌ Erreur d\'authentification WAHA.');
        }

        // ✅ Retourner échec au lieu de throw
        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
}

/**
 * Vérifier l'état de la session WAHA
 */
async function checkWAHAStatus() {
    try {
        console.log(`[WAHA] Vérification du statut de la session: ${WAHA_SESSION}`);

        const headers = {
            'Content-Type': 'application/json'
        };

        if (WAHA_API_KEY) {
            headers['X-Api-Key'] = WAHA_API_KEY;
        }

        const response = await axios.get(
            `${WAHA_URL}/api/sessions/${WAHA_SESSION}`,
            {
                timeout: 5000,
                headers: headers
            }
        );

        console.log(`[WAHA] Statut de la session: ${response.data?.status}`);

        return {
            success: true,
            status: response.data?.status || 'UNKNOWN',
            data: response.data
        };
    } catch (error) {
        console.error('[WAHA] ❌ Erreur vérification statut:', {
            error: error.message,
            code: error.code,
            status: error.response?.status
        });

        return {
            success: false,
            status: 'ERROR',
            error: error.message
        };
    }
}

/**
 * Démarrer une session WAHA (si elle n'existe pas)
 */
async function startWAHASession() {
    try {
        console.log(`[WAHA] Démarrage de la session: ${WAHA_SESSION}`);

        const headers = {
            'Content-Type': 'application/json'
        };

        if (WAHA_API_KEY) {
            headers['X-Api-Key'] = WAHA_API_KEY;
        }

        const response = await axios.post(
            `${WAHA_URL}/api/sessions/start`,
            {
                name: WAHA_SESSION,
                config: {
                    proxy: null,
                    webhooks: []
                }
            },
            {
                timeout: 10000,
                headers: headers
            }
        );

        console.log(`[WAHA] ✅ Session démarrée:`, response.data);

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('[WAHA] ❌ Erreur démarrage session:', {
            error: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data
        });

        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Arrêter une session WAHA
 */
async function stopWAHASession() {
    try {
        console.log(`[WAHA] Arrêt de la session: ${WAHA_SESSION}`);

        const headers = { 'Content-Type': 'application/json' };
        if (WAHA_API_KEY) headers['X-Api-Key'] = WAHA_API_KEY;

        const response = await axios.post(
            `${WAHA_URL}/api/sessions/stop`,
            { name: WAHA_SESSION },
            { timeout: 10000, headers: headers }
        );

        console.log(`[WAHA] ✅ Session arrêtée:`, response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('[WAHA] ❌ Erreur arrêt session:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Supprimer une session WAHA (Agressif)
 */
async function deleteWAHASession() {
    try {
        console.log(`[WAHA] Suppression de la session: ${WAHA_SESSION}`);

        const headers = { 'Content-Type': 'application/json' };
        if (WAHA_API_KEY) headers['X-Api-Key'] = WAHA_API_KEY;

        const response = await axios.delete(
            `${WAHA_URL}/api/sessions/${WAHA_SESSION}`,
            { timeout: 10000, headers: headers }
        );

        console.log(`[WAHA] ✅ Session supprimée:`, response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('[WAHA] ❌ Erreur suppression session:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Envoyer un message texte simple via WhatsApp
 * @param {string} phoneNumber - Format international
 * @param {string} text - Contenu du message
 */
async function sendSimpleMessage(phoneNumber, text) {
    try {
        let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanNumber.length === 10 && (cleanNumber.startsWith('05') || cleanNumber.startsWith('06') || cleanNumber.startsWith('07'))) {
            cleanNumber = '213' + cleanNumber.substring(1);
        }
        const chatId = `${cleanNumber}@c.us`;

        const headers = { 'Content-Type': 'application/json' };
        if (WAHA_API_KEY) headers['X-Api-Key'] = WAHA_API_KEY;

        const response = await axios.post(
            `${WAHA_URL}/api/sendText`,
            { session: WAHA_SESSION, chatId: chatId, text: text },
            { timeout: 15000, headers: headers }
        );

        return { success: true, messageId: response.data?.id };
    } catch (error) {
        console.error('[WAHA] ❌ Erreur sendSimpleMessage:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports = {
    send2FACode,
    sendSimpleMessage,
    checkWAHAStatus,
    startWAHASession,
    stopWAHASession,
    deleteWAHASession
};
