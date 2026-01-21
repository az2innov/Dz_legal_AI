const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { Storage } = require('@google-cloud/storage');

// Configuration Google Cloud Storage (optionnel si les fichiers sont publics)
const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: process.env.GCP_KEY_FILE
});
const bucketName = 'legaldz';

// 1. Liste des textes
router.get('/', async (req, res) => {
    try {
        console.log("[Library] Récupération de la liste des textes...");
        const result = await db.query(
            "SELECT id, title, category, lang, file_name, file_size, gcs_uri FROM legal_library WHERE is_active = 1 ORDER BY title ASC"
        );
        console.log(`[Library] ${result.rows.length} textes trouvés.`);
        res.json({ status: 'success', data: result.rows });
    } catch (error) {
        console.error("[Library] Erreur SQL:", error.message);
        res.status(500).json({ error: "Erreur lors de la récupération de la bibliothèque" });
    }
});

// 2. Téléchargement / Lecture du PDF
router.get('/download/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Récupérer les infos du document
        const result = await db.query(
            "SELECT file_content, file_name, mime_type, gcs_uri FROM legal_library WHERE id = ?",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Document introuvable" });
        }

        const doc = result.rows[0];

        // STRATÉGIE 1 : Si le fichier est dans Google Cloud Storage
        if (doc.gcs_uri && !doc.file_content) {
            console.log(`[Library] Redirection vers GCS: ${doc.gcs_uri}`);

            // Option A : Redirection directe (si les fichiers GCS sont publics)
            const publicUrl = doc.gcs_uri.replace('gs://legaldz/', 'https://storage.googleapis.com/legaldz/');
            return res.redirect(publicUrl);

            // Option B : Servir via le backend (si les fichiers ne sont pas publics)
            // const fileName = doc.gcs_uri.replace('gs://legaldz/', '');
            // const file = storage.bucket(bucketName).file(fileName);
            // res.setHeader('Content-Type', doc.mime_type || 'application/pdf');
            // res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
            // file.createReadStream().pipe(res);
        }
        // STRATÉGIE 2 : Si le fichier est dans MySQL
        else if (doc.file_content) {
            console.log(`[Library] Servir depuis MySQL: ${doc.file_name}`);
            res.setHeader('Content-Type', doc.mime_type || 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
            res.send(doc.file_content);
        }
        else {
            return res.status(404).json({ error: "Fichier introuvable" });
        }

    } catch (error) {
        console.error("Erreur téléchargement:", error);
        res.status(500).json({ error: "Erreur lors du téléchargement" });
    }
});

module.exports = router;
