// src/middlewares/quotaMiddleware.js
const usageService = require('../modules/billing/services/usageService');

const checkQuota = (type) => {
    return async (req, res, next) => {
        try {
            // SÉCURITÉ : Vérification robuste de l'utilisateur
            // Si req.user est absent (ex: échec silencieux middleware auth), on évite le crash
            if (!req.user) {
                // Si c'est un invité avec un header valide, on laisse passer (double check)
                if (req.headers['x-guest-id']) return next();

                // Sinon erreur auth
                return res.status(401).json({ error: "Utilisateur non identifié." });
            }

            // SKIP pour les Invités (Géré par guestRateLimiter)
            if (req.user.role === 'guest') {
                return next();
            }

            const userId = req.user.id; // Maintenant sûr

            if (type === 'chat') {
                await usageService.checkAndIncrementChat(userId);
            } else if (type === 'document') {
                await usageService.checkAndIncrementDoc(userId);
            }
            next();
        } catch (error) {
            // Renvoie une erreur 403 (Interdit)
            console.error("[Quota] Erreur:", error);
            res.status(403).json({
                error: "Quota dépassé",
                message: error.message,
                isUpgradeRequired: true
            });
        }
    };
};

module.exports = { checkQuota };