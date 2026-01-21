// src/modules/billing/services/usageService.js
const db = require('../../../config/db');
require('dotenv').config();

// --- 1. CONFIGURATION DES LIMITES (Mensuelles) ---
// Les limites représentent maintenant le nombre de QUESTIONS par mois
const LIMITS = {
    free_trial: {
        chat_monthly: 10,       // 10 questions/mois (gratuit - test)
        doc_monthly: 1          // 1 doc/mois
    },
    basic: {
        chat_monthly: 600,      // 600 questions/mois
        doc_monthly: 10         // 10 docs/mois
    },
    premium: {
        chat_monthly: 6000,     // 6000 questions/mois
        doc_monthly: 50         // 50 docs/mois
    },
    pro: {
        chat_monthly: 30000,    // 30000 questions/mois (partagées)
        doc_monthly: 200        // 200 docs/mois (partagés)
    },
    organization: {
        chat_monthly: 30000,    // 30000 questions/mois (partagées)
        doc_monthly: 200        // 200 docs/mois (partagés)
    }
};

async function getUsageRecord(userId) {
    let result = await db.query("SELECT * FROM user_usage WHERE user_id = ?", [userId]);
    if (result.rows.length === 0) {
        // Initialisation si pas d'entrée
        const initRes = await db.query("INSERT INTO user_usage (user_id, chat_count_daily, doc_count_monthly) VALUES (?, 0, 0)", [userId]);
        const insertId = initRes.rows.insertId;
        result = await db.query("SELECT * FROM user_usage WHERE id = ?", [insertId]);
    }
    return result.rows[0];
}

// --- 2. FONCTION CORRIGÉE : RÉCUPÉRATION DU PLAN (HÉRITAGE) ---
async function getUserPlan(userId) {
    const query = `
        SELECT 
            -- PRIORITÉ : Plan Organisation (si active) > Plan User (Admin) > Subscriptions > Free
            COALESCE(org.plan, u.plan, sub.plan, 'free_trial') as effective_plan
        FROM users u
        LEFT JOIN organizations org ON u.organization_id = org.id AND org.is_active = true
        LEFT JOIN subscriptions sub ON u.id = sub.user_id AND sub.status = 'active'
        WHERE u.id = ?
    `;

    const result = await db.query(query, [userId]);

    // Si aucun résultat (ne devrait pas arriver), fallback sur free_trial
    return result.rows.length > 0 ? result.rows[0].effective_plan : 'free_trial';
}

/**
 * Vérifie le Quota CHAT
 */
async function checkAndIncrementChat(userId) {
    console.log(`[QUOTA v2.0] checkAndIncrementChat called for user ${userId}`);
    const plan = await getUserPlan(userId);
    const limit = LIMITS[plan]?.chat_daily || LIMITS['free_trial'].chat_daily;

    // 1. Reset automatique via SQL si nouvelle journée
    await db.query(`
        UPDATE user_usage 
        SET chat_count_daily = 0, last_chat_reset = CURRENT_DATE 
        WHERE user_id = ? 
        AND (last_chat_reset IS NULL OR last_chat_reset < CURRENT_DATE)
    `, [userId]);

    // 2. Lecture usage à jour (APRÈS reset éventuel)
    const usage = await getUsageRecord(userId);

    // 3. Vérification quota
    if (usage.chat_count_daily >= limit) {
        throw new Error("Votre quota quotidien de discussions est épuisé.");
    }

    // 4. Incrément
    await db.query("UPDATE user_usage SET chat_count_daily = chat_count_daily + 1 WHERE user_id = ?", [userId]);

    return { used: usage.chat_count_daily + 1, limit };
}

/**
 * Vérifie le Quota DOCUMENTS
 */
async function checkAndIncrementDoc(userId) {
    const plan = await getUserPlan(userId);
    const limit = LIMITS[plan]?.doc_monthly || LIMITS['free_trial'].doc_monthly;

    // 1. Reset automatique via SQL (Mois différent)
    await db.query(`
        UPDATE user_usage 
        SET doc_count_monthly = 0, last_doc_reset = CURRENT_DATE 
        WHERE user_id = ? 
        AND (
            last_doc_reset IS NULL 
            OR DATE_FORMAT(last_doc_reset, '%Y-%m') != DATE_FORMAT(CURRENT_DATE, '%Y-%m')
        )
    `, [userId]);

    // 2. Lecture usage à jour (APRÈS reset éventuel)
    const usage = await getUsageRecord(userId);

    // 3. Vérification quota
    if (usage.doc_count_monthly >= limit) {
        throw new Error("Votre quota mensuel d'analyse de documents est épuisé.");
    }

    // 4. Incrément
    await db.query("UPDATE user_usage SET doc_count_monthly = doc_count_monthly + 1 WHERE user_id = ?", [userId]);

    return { used: usage.doc_count_monthly + 1, limit };
}

// Récupération des stats pour le Dashboard
async function getUsageStats(userId) {
    const plan = await getUserPlan(userId);

    // ✅ COMPTAGE RÉEL depuis les tables sources (pas de compteur user_usage)

    // 1. Compter les MESSAGES (questions) posés CE MOIS-CI par l'utilisateur
    // On compte uniquement les messages role='user' (pas les réponses de l'IA)
    const chatResult = await db.query(`
        SELECT COUNT(*) as count 
        FROM chat_messages cm
        JOIN chat_sessions cs ON cm.session_id = cs.id
        WHERE cs.user_id = ? 
        AND cm.role = 'user'
        AND DATE_FORMAT(cm.created_at, '%Y-%m') = DATE_FORMAT(CURRENT_DATE, '%Y-%m')
    `, [userId]);
    const chatCountThisMonth = chatResult.rows[0]?.count || 0;

    // 2. Compter les DOCUMENTS créés CE MOIS-CI depuis user_documents
    const docResult = await db.query(`
        SELECT COUNT(*) as count 
        FROM user_documents 
        WHERE user_id = ? 
        AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURRENT_DATE, '%Y-%m')
    `, [userId]);
    const docCountThisMonth = docResult.rows[0]?.count || 0;

    const limits = LIMITS[plan] || LIMITS['free_trial'];

    return {
        plan,
        chat: { used: chatCountThisMonth, limit: limits.chat_monthly },
        docs: { used: docCountThisMonth, limit: limits.doc_monthly }
    };
}

module.exports = { checkAndIncrementChat, checkAndIncrementDoc, getUsageStats };