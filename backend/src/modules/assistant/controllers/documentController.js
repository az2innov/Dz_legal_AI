const analyzeService = require('../services/analyzeService');
const documentService = require('../services/documentService');
const documentConversation = require('../models/documentConversation');
const fs = require('fs');
const path = require('path');

// 1. Upload et Analyse (Avec Stockage Permanent)
const uploadAndAnalyze = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Aucun fichier fourni." });

        const userId = req.user.id;
        const prompt = req.body.prompt || "Analyse ce document juridique.";

        // --- LOGIQUE DE DÉPLACEMENT VERS 'storage/' ---
        const tempPath = req.file.path;
        // Utilisez un chemin absolu basé sur __dirname pour la fiabilité
        const targetDir = path.resolve(__dirname, '../../../../storage');

        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Nom de fichier unique pour éviter les collisions
        const fileName = `${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
        const finalPath = path.join(targetDir, fileName);

        // Déplacement du fichier
        fs.renameSync(tempPath, finalPath);

        // Mise à jour de l'objet req.file pour que le service utilise le bon chemin
        req.file.path = finalPath;
        // ----------------------------------------------------

        // Appel IA
        const analysisResult = await analyzeService.analyzeDocument(finalPath, req.file.mimetype, prompt);

        // Sauvegarde BDD (On stocke le chemin final 'storage/...')
        const savedDoc = await documentService.saveDocument(userId, req.file, analysisResult);

        // SECURITY FIX: Empêcher le cache
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

        res.json({
            status: 'success',
            data: savedDoc
        });

    } catch (error) {
        // DIAGNOSTIC COMPLET DANS FICHIER
        const debugPath = path.resolve(__dirname, '../../../../debug_docs.txt');
        const timestamp = new Date().toISOString();
        const errorMsg = `\n[${timestamp}] 🚨 ERREUR DOC:\nMsg: ${error.message}\nStack: ${error.stack}\n`;
        console.error(errorMsg);
        try { fs.appendFileSync(debugPath, errorMsg); } catch (e) { }

        // Nettoyage si échec
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        res.status(500).json({ error: error.message });
    }
};

const listDocuments = async (req, res) => {
    try {
        // SECURITY FIX: Empêcher le cache NGINX/Browser pour éviter les fuites entre utilisateurs
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

        const docs = await documentService.getUserDocuments(req.user.id);
        res.json({ status: 'success', data: docs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Voir un document (Ré-afficher l'analyse + Historique de conversation)
const getDocument = async (req, res) => {
    try {
        const doc = await documentService.getDocumentById(req.params.id, req.user.id);

        // ===== NOUVEAU : Récupérer l'historique de conversation =====
        const conversationHistory = await documentConversation.getConversationHistory(req.params.id, req.user.id);
        doc.conversation_history = conversationHistory;
        // ============================================================

        // SECURITY FIX: Empêcher le cache
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

        res.json({ status: 'success', data: doc });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

// 4. Supprimer (+ Supprimer l'historique de conversation)
const deleteDocument = async (req, res) => {
    try {
        // ===== NOUVEAU : Supprimer l'historique avant de supprimer le document =====
        await documentConversation.deleteConversationHistory(req.params.id, req.user.id);
        // ===========================================================================

        await documentService.deleteDocument(req.params.id, req.user.id);
        res.json({ status: 'success', message: "Supprimé." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Chat avec le document (+ Sauvegarde automatique de la conversation)
const askDocument = async (req, res) => {
    try {
        const { docId, question, history } = req.body;
        const userId = req.user.id;

        if (!docId || !question) return res.status(400).json({ error: "ID document et question requis." });

        // A. Récupérer les infos du document en base
        const doc = await documentService.getDocumentById(docId, userId);

        // B. Vérifier que le fichier physique existe
        if (!doc.gcs_path || !fs.existsSync(doc.gcs_path)) {
            return res.status(404).json({ error: "Le fichier source est introuvable sur le serveur." });
        }

        // C. Appel à l'IA
        const answer = await analyzeService.chatWithDocument(doc.gcs_path, doc.mime_type, question, history);

        // ===== NOUVEAU : Sauvegarder la question et la réponse dans l'historique =====
        try {
            await documentConversation.saveMessage(userId, docId, 'user', question, 0);
            await documentConversation.saveMessage(userId, docId, 'assistant', answer, 0);
            console.log(`💾 Conversation sauvegardée pour doc ${docId}`);
        } catch (saveError) {
            console.error('⚠️ Erreur sauvegarde conversation (non bloquant):', saveError);
            // On continue même si la sauvegarde échoue, pour ne pas bloquer l'utilisateur
        }
        // =============================================================================

        // SECURITY FIX: Empêcher le cache
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

        res.json({ status: 'success', data: { answer } });

    } catch (error) {
        console.error("Erreur Chat Doc:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { uploadAndAnalyze, listDocuments, getDocument, deleteDocument, askDocument };