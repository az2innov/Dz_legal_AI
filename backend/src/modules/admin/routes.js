const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { protect } = require('../../middlewares/authMiddleware');
const { requireAdmin } = require('../../middlewares/adminMiddleware');
const newsController = require('./newsController');

// --- 0. DASHBOARD STATS (NOUVEAU) ---
router.get('/stats', protect, requireAdmin, async (req, res) => {
    try {
        // ✅ Headers anti-cache pour forcer les données fraîches
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        // 1. Chiffres globaux
        const counts = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as users_count,
                (SELECT COUNT(*) FROM organizations) as orgs_count,
                (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL 7 DAY) as new_users_count
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
        console.log('[ADMIN] 📊 GET /users appelé');

        // ✅ Headers anti-cache pour forcer les données fraîches
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        const users = await db.query(`
            SELECT u.id, u.email, u.full_name, u.whatsapp_number, u.role, 
                   u.is_active, u.created_at, 
                   u.organization_id,
                   o.name as organization_name,
                   CASE 
                       WHEN u.organization_id IS NOT NULL THEN IFNULL(o.plan, 'free')
                       ELSE IFNULL(u.plan, 'free')
                   END as plan,
                   u.plan as individual_plan,
                   o.plan as organization_plan_source
            FROM users u
            LEFT JOIN organizations o ON u.organization_id = o.id
            ORDER BY u.created_at DESC
        `);

        console.log(`[ADMIN] ✅ ${users.rows.length} users récupérés`);

        res.json({ status: 'success', data: users.rows });
    } catch (error) {
        console.error('[ADMIN] ❌ Erreur get users:', error);
        console.error('[ADMIN] ❌ Stack:', error.stack);
        res.status(500).json({ error: error.message });
    }
});


router.post('/upgrade', protect, requireAdmin, async (req, res) => {
    try {
        const { userId, plan } = req.body;
        if (!userId || !plan) return res.status(400).json({ error: "Données manquantes" });

        console.log(`[ADMIN] 🔄 Upgrade user ${userId} to plan: ${plan}`);

        // ✅ SOLUTION : Mettre à jour directement users.plan
        const result = await db.query("UPDATE users SET plan = ? WHERE id = ?", [plan, userId]);

        if (result.rowCount === 0) {
            console.error(`[ADMIN] ❌ User ${userId} not found`);
            return res.status(404).json({ error: "Utilisateur introuvable" });
        }

        console.log(`[ADMIN] ✅ User ${userId} plan updated to ${plan}`);
        res.json({ status: 'success', message: `Plan mis à jour: ${plan}` });
    } catch (error) {
        console.error('[ADMIN] ❌ Erreur upgrade plan:', error);
        res.status(500).json({ error: "Erreur maj plan user" });
    }
});

router.patch('/users/:id/status', protect, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        await db.query("UPDATE users SET is_active = ? WHERE id = ?", [isActive, id]);
        res.json({ status: 'success', message: "Statut mis à jour" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/users/:id', protect, requireAdmin, async (req, res) => {
    try {
        await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
        res.json({ status: 'success', message: "Utilisateur supprimé" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 2. GESTION ORGANISATIONS ---

router.get('/organizations', protect, requireAdmin, async (req, res) => {
    try {
        // ✅ Headers anti-cache pour forcer les données fraîches
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

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
        await db.query("UPDATE organizations SET plan = ? WHERE id = ?", [plan, orgId]);
        res.json({ status: 'success', message: `Organisation passée en ${plan}` });
    } catch (error) {
        res.status(500).json({ error: "Erreur maj plan org" });
    }
});

router.patch('/organizations/:id/status', protect, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        await db.query("UPDATE organizations SET is_active = ? WHERE id = ?", [isActive, id]);
        res.json({ status: 'success', message: "Statut org mis à jour" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/organizations/:id', protect, requireAdmin, async (req, res) => {
    try {
        await db.query("DELETE FROM organizations WHERE id = ?", [req.params.id]);
        res.json({ status: 'success', message: "Organisation supprimée" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 3. GESTION DEMANDES DE CHANGEMENT DE PLAN ---

const planChangeController = require('../billing/controllers/planChangeController');

// Récupérer toutes les demandes de changement de plan
router.get('/plan-requests', protect, requireAdmin, planChangeController.getAllRequests);

// Obtenir les statistiques des demandes
router.get('/plan-requests/stats', protect, requireAdmin, planChangeController.getPlanRequestStats);

// Approuver une demande de changement de plan
router.post('/approve-plan-request/:id', protect, requireAdmin, planChangeController.approvePlanRequest);

// Rejeter une demande de changement de plan
router.post('/reject-plan-request/:id', protect, requireAdmin, planChangeController.rejectPlanRequest);

// --- ACTUALITÉS / CAROUSEL ---
router.get('/public/news-slides', newsController.getPublicSlides);
router.get('/news-slides', protect, requireAdmin, newsController.getAllSlides);
router.post('/news-slides', protect, requireAdmin, newsController.createSlide);
router.put('/news-slides/:id', protect, requireAdmin, newsController.updateSlide);
router.delete('/news-slides/:id', protect, requireAdmin, newsController.deleteSlide);

module.exports = router;
