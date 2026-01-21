// src/modules/billing/controllers/usageController.js
const usageService = require('../services/usageService');

const getStats = async (req, res) => {
    try {
        // req.user.id vient du middleware 'protect'
        const stats = await usageService.getUsageStats(req.user.id);

        // ❌ DÉSACTIVER LE CACHE pour les données usage (données en temps réel)
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

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