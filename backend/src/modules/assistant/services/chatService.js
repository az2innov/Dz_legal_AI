const db = require('../../../config/db');

// 1. Créer une nouvelle session (nouvelle conversation)
async function createSession(userId, title) {
    const result = await db.query(
        "INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING *",
        [userId, title || 'Nouvelle conversation']
    );
    return result.rows[0];
}

// 2. Récupérer toutes les sessions d'un utilisateur (pour la Sidebar)
async function getUserSessions(userId) {
    const result = await db.query(
        "SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC",
        [userId]
    );
    return result.rows;
}

// 3. Récupérer les messages d'une session
async function getSessionMessages(sessionId, userId) {
    // Sécurité : on vérifie que la session appartient bien au user
    const sessionCheck = await db.query(
        "SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2",
        [sessionId, userId]
    );
    
    if (sessionCheck.rows.length === 0) throw new Error("Session introuvable ou accès refusé.");

    const result = await db.query(
        "SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC",
        [sessionId]
    );
    return result.rows;
}

// 4. Sauvegarder un message (User ou Assistant)
async function saveMessage(sessionId, role, content, sources = []) {
    const result = await db.query(
        `INSERT INTO chat_messages (session_id, role, content, sources) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [sessionId, role, content, JSON.stringify(sources)]
    );
    
    // Mettre à jour la date de modif de la session (pour l'ordre de tri)
    await db.query("UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1", [sessionId]);
    
    return result.rows[0];
}

// 5. Mettre à jour le titre d'une session (ex: après la 1ère question)
async function updateSessionTitle(sessionId, title) {
    await db.query("UPDATE chat_sessions SET title = $1 WHERE id = $2", [title, sessionId]);
}

// 6. Supprimer une session
async function deleteSession(sessionId, userId) {
    const result = await db.query(
        "DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2 RETURNING id",
        [sessionId, userId]
    );
    return result.rows[0];
}

module.exports = {
    createSession,
    getUserSessions,
    getSessionMessages,
    saveMessage,
    updateSessionTitle,
    deleteSession
};