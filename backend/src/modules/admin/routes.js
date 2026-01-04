const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { protect } = require('../../middlewares/authMiddleware');
const { requireAdmin } = require('../../middlewares/adminMiddleware');

// --- 0. DASHBOARD STATS (NOUVEAU) ---
router.get('/stats', protect, requireAdmin, async (req, res) => {
    try {
        // 1. Chiffres globaux
        const counts = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as users_count,
                (SELECT COUNT(*) FROM organizations) as orgs_count,
                (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days') as new_users_count
        `);

        // 2. Derniers inscrits
        const recentUsers = await db.query(`
            SELECT id, full_name, email, whatsapp_number, created_at, role 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        // 3. Abonnements expirants (Basé sur start_date pour l'exemple, ou end_date si vous l'avez)
        const expiringSubs = await db.query(`
            SELECT u.email, s.plan, s.start_date
            FROM subscriptions s
            JOIN users u ON s.user_id = u.id
            WHERE s.status = 'active'
            ORDER BY s.start_date ASC
            LIMIT 5
        `);

        res.json({
            status: 'success',
            data: {
                counts: counts.rows[0],
                recentUsers: recentUsers.rows,
                expiringSubs: expiringSubs.rows
            }
        });
    } catch (error) {
        console.error("Erreur stats admin:", error.message);
        res.status(500).json({ error: "Erreur chargement stats" });
    }
});

// --- 1. GESTION UTILISATEURS ---

router.get('/users', protect, requireAdmin, async (req, res) => {
    try {
        const users = await db.query(`
            SELECT u.id, u.email, u.full_name, u.whatsapp_number, u.role, u.is_active, u.created_at, s.plan, s.status
            FROM users u
            LEFT JOIN subscriptions s ON u.id = s.user_id
            ORDER BY u.created_at DESC
        `);
        res.json({ status: 'success', data: users.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/upgrade', protect, requireAdmin, async (req, res) => {
    try {
        const { userId, plan } = req.body;
        if (!userId || !plan) return res.status(400).json({ error: "Données manquantes" });

        const existingSub = await db.query("SELECT id FROM subscriptions WHERE user_id = $1", [userId]);

        if (existingSub.rows.length > 0) {
            await db.query("UPDATE subscriptions SET plan = $1, status = 'active' WHERE user_id = $2", [plan, userId]);
        } else {
            await db.query("INSERT INTO subscriptions (user_id, plan, status, start_date) VALUES ($1, $2, 'active', NOW())", [userId, plan]);
        }
        res.json({ status: 'success', message: `Utilisateur passé en ${plan}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur maj plan user" });
    }
});

router.patch('/users/:id/status', protect, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        await db.query("UPDATE users SET is_active = $1 WHERE id = $2", [isActive, id]);
        res.json({ status: 'success', message: "Statut mis à jour" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/users/:id', protect, requireAdmin, async (req, res) => {
    try {
        await db.query("DELETE FROM users WHERE id = $1", [req.params.id]);
        res.json({ status: 'success', message: "Utilisateur supprimé" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 2. GESTION ORGANISATIONS ---

router.get('/organizations', protect, requireAdmin, async (req, res) => {
    try {
        const orgs = await db.query(`
            SELECT o.*, u.email as owner_email, u.full_name as owner_name,
            (SELECT COUNT(*) FROM users WHERE organization_id = o.id) as member_count
            FROM organizations o
            LEFT JOIN users u ON o.owner_id = u.id
            ORDER BY o.created_at DESC
        `);
        res.json({ status: 'success', data: orgs.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/organizations/upgrade', protect, requireAdmin, async (req, res) => {
    try {
        const { orgId, plan } = req.body;
        await db.query("UPDATE organizations SET plan = $1 WHERE id = $2", [plan, orgId]);
        res.json({ status: 'success', message: `Organisation passée en ${plan}` });
    } catch (error) {
        res.status(500).json({ error: "Erreur maj plan org" });
    }
});

router.patch('/organizations/:id/status', protect, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        await db.query("UPDATE organizations SET is_active = $1 WHERE id = $2", [isActive, id]);
        res.json({ status: 'success', message: "Statut org mis à jour" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/organizations/:id', protect, requireAdmin, async (req, res) => {
    try {
        await db.query("DELETE FROM organizations WHERE id = $1", [req.params.id]);
        res.json({ status: 'success', message: "Organisation supprimée" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;