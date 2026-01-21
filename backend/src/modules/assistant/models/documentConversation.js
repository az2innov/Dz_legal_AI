const db = require('../../../config/db');

/**
 * Model pour gérer les conversations avec les documents (VERSION MYSQL)
 * Chaque message (question ou réponse) est sauvegardé individuellement
 */

/**
 * Sauvegarder un message (question de l'utilisateur ou réponse de l'IA)
 * @param {number} userId - ID de l'utilisateur
 * @param {number} documentId - ID du document
 * @param {string} role - 'user' ou 'assistant'
 * @param {string} content - Le contenu du message
 * @param {number} tokensUsed - Nombre de tokens utilisés (optionnel, pour les réponses IA)
 * @returns {Object} Le message sauvegardé
 */
const saveMessage = async (userId, documentId, role, content, tokensUsed = 0) => {
    const query = `
        INSERT INTO document_conversations 
        (user_id, document_id, role, content, tokens_used)
        VALUES (?, ?, ?, ?, ?)
    `;

    try {
        const result = await db.query(query, [userId, documentId, role, content, tokensUsed]);
        // MySQL retourne insertId, on refait un SELECT pour récupérer la ligne
        const selectQuery = `SELECT * FROM document_conversations WHERE id = ?`;
        const selectResult = await db.query(selectQuery, [result.rows.insertId]);
        return selectResult.rows[0];
    } catch (error) {
        console.error('Erreur saveMessage:', error);
        throw error;
    }
};

/**
 * Récupérer tout l'historique de conversation d'un document
 * @param {number} documentId - ID du document
 * @param {number} userId - ID de l'utilisateur (pour sécurité)
 * @returns {Array} Liste des messages ordonnés chronologiquement
 */
const getConversationHistory = async (documentId, userId) => {
    const query = `
        SELECT id, role, content, tokens_used, created_at
        FROM document_conversations
        WHERE document_id = ? AND user_id = ?
        ORDER BY created_at ASC
    `;

    try {
        const result = await db.query(query, [documentId, userId]);
        return result.rows;
    } catch (error) {
        console.error('Erreur getConversationHistory:', error);
        throw error;
    }
};

/**
 * Supprimer tout l'historique de conversation d'un document
 * Utilisé lors de la suppression du document
 * @param {number} documentId - ID du document
 * @param {number} userId - ID de l'utilisateur (pour sécurité)
 */
const deleteConversationHistory = async (documentId, userId) => {
    const query = `
        DELETE FROM document_conversations
        WHERE document_id = ? AND user_id = ?
    `;

    try {
        await db.query(query, [documentId, userId]);
    } catch (error) {
        console.error('Erreur deleteConversationHistory:', error);
        throw error;
    }
};

/**
 * Obtenir les statistiques d'un document
 * @param {number} documentId - ID du document
 * @param {number} userId - ID de l'utilisateur
 * @returns {Object} Statistiques (nombre de messages, tokens utilisés, etc.)
 */
const getDocumentStats = async (documentId, userId) => {
    const query = `
        SELECT 
            COUNT(*) as total_messages,
            SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_questions,
            SUM(CASE WHEN role = 'assistant' THEN 1 ELSE 0 END) as ai_responses,
            SUM(tokens_used) as total_tokens
        FROM document_conversations
        WHERE document_id = ? AND user_id = ?
    `;

    try {
        const result = await db.query(query, [documentId, userId]);
        return result.rows[0];
    } catch (error) {
        console.error('Erreur getDocumentStats:', error);
        throw error;
    }
};

module.exports = {
    saveMessage,
    getConversationHistory,
    deleteConversationHistory,
    getDocumentStats
};
