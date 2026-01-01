// src/middlewares/quotaMiddleware.js
const usageService = require('../modules/billing/services/usageService');

const checkQuota = (type) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            if (type === 'chat') {
                await usageService.checkAndIncrementChat(userId);
            } else if (type === 'document') {
                await usageService.checkAndIncrementDoc(userId);
            }
            next();
        } catch (error) {
            // Renvoie une erreur 403 (Interdit) avec le message clair défini dans le service
            res.status(403).json({ 
                error: "Quota dépassé", 
                message: error.message, // Ici ce sera "Votre quota quotidien..."
                isUpgradeRequired: true 
            });
        }
    };
};

module.exports = { checkQuota };