const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// 1. Liste des textes
router.get('/', async (req, res) => {
    try {
        console.log("[Library] Récupération de la liste des textes...");
        const result = await db.query(
            "SELECT id, title, category, lang, file_name FROM legal_library WHERE is_active = 1 ORDER BY title ASC"
        );
        console.log(`[Library] ${result.rows.length} textes trouvés.`);
        res.json({ status: 'success', data: result.rows });
    } catch (error) {
        console.error("[Library] Erreur SQL:", error.message);
        res.status(500).json({ error: "Erreur lors de la récupération de la bibliothèque" });
    }
});

// 2. Téléchargement / Lecture du PDF (depuis MySQL)
router.get('/download/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`[Library] Téléchargement du document: ${id}`);

        // Récupérer le document depuis MySQL
        const result = await db.query(
            "SELECT file_content, file_name, mime_type FROM legal_library WHERE id = ?",
            [id]
        );

        if (result.rows.length === 0) {
            console.error(`[Library] Document introuvable: ${id}`);
            return res.status(404).json({ error: "Document introuvable" });
        }

        const doc = result.rows[0];

        // Vérifier que le contenu existe
        if (!doc.file_content) {
            console.error(`[Library] Contenu vide pour le document: ${id}`);
            return res.status(404).json({ error: "Contenu du document introuvable" });
        }

        console.log(`[Library] Envoi du document: ${doc.file_name} (${doc.file_content.length} bytes)`);

        // Configuration des headers pour l'affichage du PDF
        res.setHeader('Content-Type', doc.mime_type || 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
        res.setHeader('Content-Length', doc.file_content.length);

        // Envoi du binaire
        res.send(doc.file_content);

    } catch (error) {
        console.error("[Library] Erreur téléchargement:", error);
        res.status(500).json({ error: "Erreur lors du téléchargement" });
    }
});

module.exports = router;
