const db = require('../../../config/db');

// 1. Créer une nouvelle session
async function createSession(userId, title) {
    const sUserId = parseInt(userId);
    const defaultTitle = title || 'Nouvelle conversation';
    const result = await db.query(
        "INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)",
        [sUserId, defaultTitle]
    );
    const sessionId = result.rows.insertId;
    const sessionRes = await db.query("SELECT * FROM chat_sessions WHERE id = ?", [sessionId]);
    return sessionRes.rows[0];
}

// 2. Récupérer toutes les sessions d'un utilisateur
async function getUserSessions(userId) {
    const sUserId = parseInt(userId);
    const result = await db.query(
        "SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC",
        [sUserId]
    );
    return result.rows;
}

// 3. Récupérer les messages d'une session (FORCAGE TYPES)
async function getSessionMessages(sessionId, userId) {
    const sId = parseInt(sessionId);
    const uId = parseInt(userId);

    const sessionCheck = await db.query(
        "SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?",
        [sId, uId]
    );

    if (sessionCheck.rows.length === 0) {
        console.warn(`[GET] Session ${sId} non trouvée en BDD pour User ${uId}`);
        throw new Error("Session introuvable.");
    }

    const result = await db.query(
        "SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC",
        [sId]
    );

    return result.rows.map(msg => {
        let parsedSources = [];
        if (msg.sources) {
            if (Array.isArray(msg.sources)) {
                parsedSources = msg.sources;
            } else if (typeof msg.sources === 'string' && msg.sources.trim() !== "") {
                try {
                    const parsed = JSON.parse(msg.sources);
                    parsedSources = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    parsedSources = [];
                }
            }
        }
        msg.sources = parsedSources;
        return msg;
    });
}

// 4. Sauvegarder un message
async function saveMessage(sessionId, role, content, sources = []) {
    const sId = parseInt(sessionId);
    const safeSources = Array.isArray(sources) ? sources : [];

    const result = await db.query(
        "INSERT INTO chat_messages (session_id, role, content, sources) VALUES (?, ?, ?, ?)",
        [sId, role, content, JSON.stringify(safeSources)]
    );
    const messageId = result.rows.insertId;
    await db.query("UPDATE chat_sessions SET updated_at = NOW() WHERE id = ?", [sId]);

    const msgRes = await db.query("SELECT * FROM chat_messages WHERE id = ?", [messageId]);
    const savedMsg = msgRes.rows[0];

    if (savedMsg) {
        try {
            savedMsg.sources = typeof savedMsg.sources === 'string' ? JSON.parse(savedMsg.sources) : (savedMsg.sources || []);
        } catch (e) {
            savedMsg.sources = [];
        }
    }
    return savedMsg;
}

// 5. Mettre à jour le titre
async function updateSessionTitle(sessionId, title) {
    const sId = parseInt(sessionId);
    await db.query("UPDATE chat_sessions SET title = ? WHERE id = ?", [title, sId]);
}

// 6. Supprimer une session (VERSION FINALE ULTRA-LOGUÉE)
async function deleteSession(sessionId, userId) {
    const sId = parseInt(sessionId);
    const uId = parseInt(userId);

    console.log(`[DELETE] Exécution suppression pour Session:${sId}, User:${uId}`);

    // A. On vérifie si elle existe
    const findRes = await db.query("SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?", [sId, uId]);

    if (findRes.rows.length === 0) {
        console.error(`[DELETE] ÉCHEC: La session ${sId} n'existe pas pour l'user ${uId}`);
        throw new Error("Session introuvable.");
    }

    // B. Suppression des messages (on ne vérifie pas rowCount car il peut y avoir 0 messages)
    await db.query("DELETE FROM chat_messages WHERE session_id = ?", [sId]);

    // C. Suppression de la session
    const res = await db.query("DELETE FROM chat_sessions WHERE id = ? AND user_id = ?", [sId, uId]);

    if (res.rowCount === 0) {
        console.error(`[DELETE] ÉCHEC CRITIQUE: SQL n'a supprimé aucune ligne pour ID ${sId}`);
        throw new Error("Erreur SQL lors de la suppression.");
    }

    console.log(`[DELETE] SUCCÈS: Session ${sId} totalement supprimée.`);
    return { id: sId };
}

module.exports = {
    createSession,
    getUserSessions,
    getSessionMessages,
    saveMessage,
    updateSessionTitle,
    deleteSession
};