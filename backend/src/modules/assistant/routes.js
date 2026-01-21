// src/modules/assistant/routes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');

// Import des contrôleurs
const chatController = require('./controllers/chatController');
const documentController = require('./controllers/documentController');

// Import des middlewares
const { protect } = require('../../middlewares/authMiddleware');
const { checkQuota } = require('../../middlewares/quotaMiddleware'); // <-- IMPORT AJOUTÉ

// Configuration Multer
const path = require('path');
const fs = require('fs');

// Configuration Multer Robuste pour cPanel
// On définit un dossier absolu à la racine du projet backend
const uploadDir = path.resolve(__dirname, '../../../uploads');

// Créer le dossier s'il n'existe pas (Sécurité)
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`[Multer] Dossier uploads créé : ${uploadDir}`);
    } catch (err) {
        console.error(`[Multer] Erreur création dossier : ${err.message}`);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Nom de fichier sécurisé
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, uniqueSuffix + '-' + safeName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ============================================================
// ROUTES CHAT (Historique & RAG)
// ============================================================

// 1. Poser une question (Payant : 1 crédit chat)
router.post('/chat', protect, checkQuota('chat'), chatController.ask);

// 2. Historique (Gratuit)
router.get('/sessions', protect, chatController.getHistory);
router.get('/sessions/:id', protect, chatController.getSession);
router.delete('/sessions/:id', protect, chatController.deleteSession);


// ============================================================
// ROUTES DOCUMENTS (Bibliothèque)
// ============================================================

// 1. Analyser un document (Payant : 1 crédit document)
router.post('/analyze', protect, checkQuota('document'), upload.single('document'), documentController.uploadAndAnalyze);

// 2. Discuter avec un document (Payant : 1 crédit chat)
router.post('/documents/chat', protect, checkQuota('chat'), documentController.askDocument);

// 3. Gestion bibliothèque (Gratuit)
router.get('/documents', protect, documentController.listDocuments);
router.get('/documents/:id', protect, documentController.getDocument);
router.delete('/documents/:id', protect, documentController.deleteDocument);

module.exports = router;