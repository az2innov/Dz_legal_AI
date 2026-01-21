const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { Storage } = require('@google-cloud/storage');

// Configuration Google Cloud Storage
// Utilise GOOGLE_CREDENTIALS_JSON qui pointe vers /home/dhkrwcvb/legal-api/google-auth.json
const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID || process.env.GOOGLE_PROJECT_ID,
    keyFilename: process.env.GOOGLE_CREDENTIALS_JSON
});
const bucketName = 'legaldz';

// 1. Liste des textes
router.get('/', async (req, res) => {
    try {
        console.log("[Library] Récupération de la liste des textes...");
        const result = await db.query(
            "SELECT id, title, category, lang, file_name, gcs_uri FROM legal_library WHERE is_active = 1 ORDER BY title ASC"
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

        console.log(`[Library] Téléchargement demandé pour: ${id}`);

        // Récupérer les infos du document
        const result = await db.query(
            "SELECT file_content, file_name, mime_type, gcs_uri FROM legal_library WHERE id = ?",
            [id]
        );

        if (result.rows.length === 0) {
            console.error(`[Library] Document introuvable: ${id}`);
            return res.status(404).json({ error: "Document introuvable" });
        }

        const doc = result.rows[0];

        // STRATÉGIE 1 : Si le fichier est dans Google Cloud Storage
        if (doc.gcs_uri && !doc.file_content) {
            console.log(`[Library] Streaming depuis GCS: ${doc.gcs_uri}`);

            try {
                // Streamer le fichier via le backend (bucket privé)
                const fileName = doc.gcs_uri.replace('gs://legaldz/', '');
                const file = storage.bucket(bucketName).file(fileName);

                // Vérifier que le fichier existe
                const [exists] = await file.exists();
                if (!exists) {
                    console.error(`[Library] Fichier introuvable dans GCS: ${fileName}`);
                    return res.status(404).json({ error: "Fichier introuvable dans le stockage" });
                }

                // Headers pour affichage PDF
                res.setHeader('Content-Type', doc.mime_type || 'application/pdf');
                res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);

                console.log(`[Library] Envoi du fichier: ${fileName}`);

                // Streamer le fichier
                file.createReadStream()
                    .on('error', (err) => {
                        console.error('[Library] Erreur GCS Stream:', err);
                        if (!res.headersSent) {
                            res.status(500).json({ error: 'Erreur lors du téléchargement depuis le stockage' });
                        }
                    })
                    .pipe(res);
            } catch (gcsError) {
                console.error('[Library] Erreur GCS:', gcsError);
                return res.status(500).json({ error: 'Erreur lors de l\'accès au stockage' });
            }
        }
        // STRATÉGIE 2 : Si le fichier est dans MySQL
        else if (doc.file_content) {
            console.log(`[Library] Servir depuis MySQL: ${doc.file_name}`);
            res.setHeader('Content-Type', doc.mime_type || 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
            res.send(doc.file_content);
        }
        else {
            console.error(`[Library] Aucun contenu disponible pour: ${id}`);
            return res.status(404).json({ error: "Fichier introuvable" });
        }

    } catch (error) {
        console.error("[Library] Erreur téléchargement:", error);
        res.status(500).json({ error: "Erreur lors du téléchargement" });
    }
});

module.exports = router;
