// src/modules/billing/services/usageService.js
const db = require('../../../config/db');
require('dotenv').config(); // Important pour lire le .env ici si appelé isolément

// --- CONFIGURATION DES LIMITES VIA .ENV ---
// On utilise parseInt pour convertir les chaînes du .env en nombres
// La valeur après || est la valeur par défaut si le .env est vide
const LIMITS = {
    free_trial: { 
        chat_daily: parseInt(process.env.LIMIT_FREE_CHAT_DAILY) || 3, 
        doc_monthly: parseInt(process.env.LIMIT_FREE_DOC_MONTHLY) || 1 
    },
    basic: { 
        chat_daily: parseInt(process.env.LIMIT_BASIC_CHAT_DAILY) || 50, 
        doc_monthly: parseInt(process.env.LIMIT_BASIC_DOC_MONTHLY) || 10 
    },
    premium: { 
        chat_daily: 999999, // Illimité
        doc_monthly: 999999 // Illimité
    }
};

async function getUsageRecord(userId) {
    let result = await db.query("SELECT * FROM user_usage WHERE user_id = $1", [userId]);
    if (result.rows.length === 0) {
        result = await db.query("INSERT INTO user_usage (user_id) VALUES ($1) RETURNING *", [userId]);
    }
    return result.rows[0];
}

async function getUserPlan(userId) {
    const sub = await db.query("SELECT plan FROM subscriptions WHERE user_id = $1 AND status = 'active'", [userId]);
    return sub.rows.length > 0 ? sub.rows[0].plan : 'free_trial';
}

/**
 * Vérifie le Quota CHAT
 */
async function checkAndIncrementChat(userId) {
    const plan = await getUserPlan(userId);
    const limit = LIMITS[plan]?.chat_daily || 3;
    const usage = await getUsageRecord(userId);

    const today = new Date().toISOString().split('T')[0];
    const lastResetDate = usage.last_chat_reset ? new Date(usage.last_chat_reset).toISOString().split('T')[0] : null;

    // Reset journalier
    if (today !== lastResetDate) {
        await db.query("UPDATE user_usage SET chat_count_daily = 1, last_chat_reset = CURRENT_DATE WHERE user_id = $1", [userId]);
        return { used: 1, limit };
    }

    // Vérification
    if (usage.chat_count_daily >= limit) {
        // Message d'erreur clair pour l'utilisateur
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
    const limit = LIMITS[plan]?.doc_monthly || 1;
    const usage = await getUsageRecord(userId);

    const today = new Date();
    const lastReset = new Date(usage.last_doc_reset || 0);

    // Reset mensuel
    if (today.getMonth() !== lastReset.getMonth() || today.getFullYear() !== lastReset.getFullYear()) {
        await db.query("UPDATE user_usage SET doc_count_monthly = 1, last_doc_reset = CURRENT_DATE WHERE user_id = $1", [userId]);
        return { used: 1, limit };
    }

    // Vérification
    if (usage.doc_count_monthly >= limit) {
        // Message d'erreur clair pour l'utilisateur
        throw new Error("Votre quota mensuel d'analyse de documents est épuisé.");
    }

    // Incrément
    await db.query("UPDATE user_usage SET doc_count_monthly = doc_count_monthly + 1 WHERE user_id = $1", [userId]);
    return { used: usage.doc_count_monthly + 1, limit };
}

async function getUsageStats(userId) {
    const plan = await getUserPlan(userId);
    const usage = await getUsageRecord(userId);
    return {
        plan,
        chat: { used: usage.chat_count_daily, limit: LIMITS[plan]?.chat_daily || 3 },
        docs: { used: usage.doc_count_monthly, limit: LIMITS[plan]?.doc_monthly || 1 }
    };
}

module.exports = { checkAndIncrementChat, checkAndIncrementDoc, getUsageStats };