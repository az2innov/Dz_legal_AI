const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware Hybride : Accepte Token JWT OU Guest ID
const optionalProtect = async (req, res, next) => {
    let token;

    // 1. Essai Authentification Classique (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const userRes = await db.query(
                "SELECT id, role, email, is_active, organization_id FROM users WHERE id = ?",
                [decoded.id]
            );

            const currentUser = userRes.rows[0];

            if (currentUser && currentUser.is_active) {
                req.user = currentUser; // Utilisateur connecté standard
                return next(); // Succès
            }
        } catch (error) {
            // Si token invalide, on ne bloque pas tout de suite, on check le mode invité
            console.warn("Token invalide ou expiré, tentative Guest Mode...");
        }
    }

    // 2. Essai Mode Invité (Si pas de user connecté)
    const guestId = req.headers['x-guest-id'];

    // Modification Vision 3.17 : On accepte aussi les IDs générés manuellement (fallback "guest_...")
    // et pas seulement les UUID stricts.
    if (guestId && guestId.trim().length > 0) {
        req.user = {
            id: guestId.startsWith('guest_') ? guestId : `guest_${guestId}`, // On s'assure d'avoir un prefixe pour distinguer
            role: 'guest',
            is_active: true
        };
        return next(); // Succès Mode Invité
    }

    // 3. Echec Total
    res.status(401).json({ error: "Authentification requise (Token ou Guest ID)." });
};

module.exports = { optionalProtect };
