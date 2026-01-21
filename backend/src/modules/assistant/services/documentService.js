// src/modules/assistant/services/documentService.js

const db = require('../../../config/db');
const fs = require('fs');
const path = require('path');

// Helper pour récupérer l'ID de l'organisation de l'utilisateur
async function getUserOrgId(userId) {
    const res = await db.query("SELECT organization_id FROM users WHERE id = ?", [userId]);
    return res.rows[0]?.organization_id;
}

// 1. Sauvegarder un document après analyse
async function saveDocument(userId, file, analysisResult) {
    // file est l'objet renvoyé par Multer (filename, path, size...)

    const query = `
        INSERT INTO user_documents 
        (user_id, file_name, file_size_bytes, mime_type, gcs_path, ai_summary, processing_status)
        VALUES (?, ?, ?, ?, ?, ?, 'completed')
    `;

    const values = [
        userId,
        file.originalname,
        file.size,
        file.mimetype,
        file.path, // Chemin local vers le fichier (storage/...)
        analysisResult
    ];

    const insertRes = await db.query(query, values);
    const docId = insertRes.rows.insertId;

    const docRes = await db.query("SELECT * FROM user_documents WHERE id = ?", [docId]);
    return docRes.rows[0];
}

// 2. Récupérer la liste des documents (LOGIQUE B2B INTÉGRÉE)
async function getUserDocuments(userId) {
    const orgId = await getUserOrgId(userId);

    let query = "";
    let params = [];

    if (orgId) {
        // Mode Organisation : Je vois MES docs + ceux de mon ORG
        query = `
            SELECT d.id, d.file_name, d.created_at, u.full_name as author
            FROM user_documents d
            JOIN users u ON d.user_id = u.id
            WHERE d.user_id = ? OR u.organization_id = ?
            ORDER BY d.created_at DESC
        `;
        params = [userId, orgId];
    } else {
        // Mode Solo : Je ne vois que MES docs
        query = `
            SELECT id, file_name, created_at, 'Moi' as author 
            FROM user_documents 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `;
        params = [userId];
    }

    const result = await db.query(query, params);
    return result.rows;
}

// 3. Récupérer un document précis (LOGIQUE B2B INTÉGRÉE)
async function getDocumentById(docId, userId) {
    const orgId = await getUserOrgId(userId);

    let query = "";
    let params = [];

    if (orgId) {
        // Vérifie si le doc appartient à moi OU à quelqu'un de mon org
        query = `
            SELECT d.* 
            FROM user_documents d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = ? AND (d.user_id = ? OR u.organization_id = ?)
        `;
        params = [docId, userId, orgId];
    } else {
        // Vérification standard
        query = "SELECT * FROM user_documents WHERE id = ? AND user_id = ?";
        params = [docId, userId];
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
        throw new Error("Document introuvable ou accès refusé.");
    }

    return result.rows[0];
}

// 4. Supprimer un document
async function deleteDocument(docId, userId) {
    // On vérifie d'abord que c'est bien MON document (pas celui d'un collègue)
    const docCheck = await db.query(
        "SELECT * FROM user_documents WHERE id = ? AND user_id = ?",
        [docId, userId]
    );

    if (docCheck.rows.length === 0) {
        throw new Error("Document introuvable ou vous n'avez pas le droit de le supprimer.");
    }

    const doc = docCheck.rows[0];

    // Suppression BDD
    await db.query("DELETE FROM user_documents WHERE id = ?", [docId]);

    // Suppression Fichier Physique (Nettoyage)
    if (doc.gcs_path && fs.existsSync(doc.gcs_path)) {
        try {
            fs.unlinkSync(doc.gcs_path);
        } catch (err) {
            console.error("Erreur suppression fichier physique:", err);
        }
    }
    return { message: "Document supprimé." };
}

module.exports = {
    saveDocument,
    getUserDocuments,
    getDocumentById,
    deleteDocument
};