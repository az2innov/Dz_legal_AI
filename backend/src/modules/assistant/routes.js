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
const upload = multer({ 
    dest: 'uploads/', 
    limits: { fileSize: 10 * 1024 * 1024 }, 
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