// src/modules/billing/controllers/usageController.js
const usageService = require('../services/usageService');

const getStats = async (req, res) => {
    try {
        // req.user.id vient du middleware 'protect'
        const stats = await usageService.getUsageStats(req.user.id);
        
        res.json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        console.error("Erreur Usage Stats:", error);
        res.status(500).json({ error: "Impossible de récupérer les statistiques." });
    }
};

module.exports = { getStats };