// src/modules/billing/services/usageService.js
const db = require('../../../config/db');
require('dotenv').config();

// --- 1. CONFIGURATION DES LIMITES ---
const LIMITS = {
    free_trial: {
        chat_daily: 3,
        doc_monthly: 1
    },
    basic: {
        chat_daily: 20,
        doc_monthly: 10
    },
    premium: {
        chat_daily: 200,
        doc_monthly: 50
    },
    pro: {
        chat_daily: 1000, // Groupe
        doc_monthly: 200
    },
    organization: {
        chat_daily: 1000,
        doc_monthly: 200
    }
};

async function getUsageRecord(userId) {
    let result = await db.query("SELECT * FROM user_usage WHERE user_id = $1", [userId]);
    if (result.rows.length === 0) {
        // Initialisation si pas d'entrée
        result = await db.query("INSERT INTO user_usage (user_id, chat_count_daily, doc_count_monthly) VALUES ($1, 0, 0) RETURNING *", [userId]);
    }
    return result.rows[0];
}

// --- 2. FONCTION CORRIGÉE : RÉCUPÉRATION DU PLAN (HÉRITAGE) ---
async function getUserPlan(userId) {
    const query = `
        SELECT 
            -- PRIORITÉ : Plan Organisation (si active) > Plan Perso (si actif) > Free
            COALESCE(org.plan, sub.plan, 'free_trial') as effective_plan
        FROM users u
        LEFT JOIN organizations org ON u.organization_id = org.id AND org.is_active = true
        LEFT JOIN subscriptions sub ON u.id = sub.user_id AND sub.status = 'active'
        WHERE u.id = $1
    `;

    const result = await db.query(query, [userId]);

    // Si aucun résultat (ne devrait pas arriver), fallback sur free_trial
    return result.rows.length > 0 ? result.rows[0].effective_plan : 'free_trial';
}

/**
 * Vérifie le Quota CHAT
 */
async function checkAndIncrementChat(userId) {
    const plan = await getUserPlan(userId);
    // Si le plan 'pro' n'est pas dans LIMITS, on fallback sur free_trial (d'où l'importance de l'étape 1)
    const limit = LIMITS[plan]?.chat_daily || LIMITS['free_trial'].chat_daily;
    const usage = await getUsageRecord(userId);

    const today = new Date().toISOString().split('T')[0];
    // Gestion du cas où last_chat_reset est null
    const lastResetDate = usage.last_chat_reset ? new Date(usage.last_chat_reset).toISOString().split('T')[0] : null;

    // Reset journalier
    if (today !== lastResetDate) {
        await db.query("UPDATE user_usage SET chat_count_daily = 1, last_chat_reset = CURRENT_DATE WHERE user_id = $1", [userId]);
        return { used: 1, limit };
    }

    // Vérification
    if (usage.chat_count_daily >= limit) {
        throw new Error("Votre quota quotidien de discussions est épuisé.");
    }

    // Incrément
    await db.query("UPDATE user_usage SET chat_count_daily = chat_count_daily + 1 WHERE user_id = $1", [userId]);
    return { used: usage.chat_count_daily + 1, limit };
}

/**
 * Vérifie le Quota DOCUMENTS
 */
async function checkAndIncrementDoc(userId) {
    const plan = await getUserPlan(userId);
    const limit = LIMITS[plan]?.doc_monthly || LIMITS['free_trial'].doc_monthly;
    const usage = await getUsageRecord(userId);

    const today = new Date();
    const lastReset = usage.last_doc_reset ? new Date(usage.last_doc_reset) : new Date(0);

    // Reset mensuel (Si mois différent ou année différente)
    if (today.getMonth() !== lastReset.getMonth() || today.getFullYear() !== lastReset.getFullYear()) {
        await db.query("UPDATE user_usage SET doc_count_monthly = 1, last_doc_reset = CURRENT_DATE WHERE user_id = $1", [userId]);
        return { used: 1, limit };
    }

    // Vérification
    if (usage.doc_count_monthly >= limit) {
        throw new Error("Votre quota mensuel d'analyse de documents est épuisé.");
    }

    // Incrément
    await db.query("UPDATE user_usage SET doc_count_monthly = doc_count_monthly + 1 WHERE user_id = $1", [userId]);
    return { used: usage.doc_count_monthly + 1, limit };
}

// Récupération des stats pour le Dashboard
async function getUsageStats(userId) {
    const plan = await getUserPlan(userId);
    const usage = await getUsageRecord(userId);

    const limits = LIMITS[plan] || LIMITS['free_trial'];

    return {
        plan, // Renvoie 'pro' ou 'free_trial'
        chat: { used: usage.chat_count_daily || 0, limit: limits.chat_daily },
        docs: { used: usage.doc_count_monthly || 0, limit: limits.doc_monthly }
    };
}

module.exports = { checkAndIncrementChat, checkAndIncrementDoc, getUsageStats };