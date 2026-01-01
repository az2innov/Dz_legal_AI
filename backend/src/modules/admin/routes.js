const express = require('express');
const router = express.Router();

// Configuration BDD
const db = require('../../config/db'); 

// Middlewares
const { protect } = require('../../middlewares/authMiddleware');
const { requireAdmin } = require('../../middlewares/adminMiddleware');

// ==========================================
// 1. GESTION DES UTILISATEURS
// ==========================================

// 1.1 Liste des utilisateurs
router.get('/users', protect, requireAdmin, async (req, res) => {
    try {
        const users = await db.query(`
            SELECT u.id, u.email, u.full_name, u.role, u.is_active, u.created_at, s.plan, s.status
            FROM users u
            LEFT JOIN subscriptions s ON u.id = s.user_id
            ORDER BY u.created_at DESC
        `);
        res.json({ status: 'success', data: users.rows });
    } catch (error) {
        console.error("Erreur get users:", error.message);
        res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
    }
});

// 1.2 Mettre à jour l'abonnement (Upgrade/Downgrade)
router.post('/upgrade', protect, requireAdmin, async (req, res) => {
    try {
        const { userId, plan } = req.body;
        
        if (!userId || !plan) {
            return res.status(400).json({ error: "UserId et Plan requis" });
        }

        console.log(`[ADMIN] Changement plan User ${userId} vers : ${plan}`);

        // 1. Vérifier si un abonnement existe déjà
        const existingSub = await db.query("SELECT id FROM subscriptions WHERE user_id = $1", [userId]);

        if (existingSub.rows.length > 0) {
            // UPDATE : Mise à jour du plan existant
            // Note: Assurez-vous que la colonne 'plan' en BDD accepte la valeur 'free' (VARCHAR)
            await db.query(
                "UPDATE subscriptions SET plan = $1, status = 'active' WHERE user_id = $2",
                [plan, userId]
            );
        } else {
            // INSERT : Création d'un nouvel abonnement
            await db.query(
                "INSERT INTO subscriptions (user_id, plan, status, start_date) VALUES ($1, $2, 'active', NOW())",
                [userId, plan]
            );
        }

        console.log("✅ Plan mis à jour avec succès");
        res.json({ status: 'success', message: `Utilisateur passé en ${plan}` });

    } catch (error) {
        console.error("❌ ERREUR SQL UPGRADE:", error.message);
        // Cela affichera "invalid input value for enum" si vous n'avez pas fait la commande SQL
        res.status(500).json({ error: "Erreur serveur. Vérifiez que la BDD accepte la valeur '" + req.body.plan + "'." });
    }
});

// 1.3 Activer / Désactiver un utilisateur
router.patch('/users/:id/status', protect, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body; 

        await db.query("UPDATE users SET is_active = $1 WHERE id = $2", [isActive, id]);
        
        res.json({ status: 'success', message: isActive ? "Utilisateur activé." : "Utilisateur bloqué." });
    } catch (error) {
        console.error("Erreur status user:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 1.4 Supprimer un utilisateur
router.delete('/users/:id', protect, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM users WHERE id = $1", [id]);
        
        res.json({ status: 'success', message: "Utilisateur supprimé définitivement." });
    } catch (error) {
        console.error("Erreur delete user:", error.message);
        res.status(500).json({ error: error.message });
    }
});


// ==========================================
// 2. GESTION DES ORGANISATIONS (CABINETS)
// ==========================================

// 2.1 Liste des Organisations
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
        console.error("Erreur get orgs:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 2.2 Changer le plan d'une organisation
router.post('/organizations/upgrade', protect, requireAdmin, async (req, res) => {
    try {
        const { orgId, plan } = req.body;

        if (!orgId || !plan) {
            return res.status(400).json({ error: "OrgId et Plan requis" });
        }

        // Assurez-vous d'avoir ajouté la colonne 'plan' dans organizations via SQL
        await db.query("UPDATE organizations SET plan = $1 WHERE id = $2", [plan, orgId]);

        res.json({ status: 'success', message: `Organisation passée en ${plan}` });
    } catch (error) {
        console.error("Erreur upgrade org:", error.message);
        res.status(500).json({ error: "Impossible de modifier l'abonnement du cabinet." });
    }
});

// 2.3 Activer / Désactiver une organisation
router.patch('/organizations/:id/status', protect, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        // Assurez-vous d'avoir ajouté la colonne 'is_active' dans organizations via SQL
        await db.query("UPDATE organizations SET is_active = $1 WHERE id = $2", [isActive, id]);
        
        res.json({ status: 'success', message: isActive ? "Cabinet activé." : "Cabinet suspendu." });
    } catch (error) {
        console.error("Erreur status org:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 2.4 Supprimer une organisation
router.delete('/organizations/:id', protect, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM organizations WHERE id = $1", [id]);
        
        res.json({ status: 'success', message: "Organisation supprimée définitivement." });
    } catch (error) {
        console.error("Erreur delete org:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;