const analyzeService = require('../services/analyzeService');
const documentService = require('../services/documentService');
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
        // Le dossier storage doit être à la racine du projet backend
        const targetDir = path.join(process.cwd(), 'storage');
        
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

        res.json({
            status: 'success',
            data: savedDoc
        });

    } catch (error) {
        console.error("🚨 Erreur Analyse:", error);
        // Nettoyage si échec (supprimer le fichier temporaire s'il existe encore)
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch(e) {}
        }
        res.status(500).json({ error: error.message });
    }
};

// 2. Lister les documents
const listDocuments = async (req, res) => {
    try {
        const docs = await documentService.getUserDocuments(req.user.id);
        res.json({ status: 'success', data: docs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Voir un document (Ré-afficher l'analyse)
const getDocument = async (req, res) => {
    try {
        const doc = await documentService.getDocumentById(req.params.id, req.user.id);
        res.json({ status: 'success', data: doc });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

// 4. Supprimer
const deleteDocument = async (req, res) => {
    try {
        await documentService.deleteDocument(req.params.id, req.user.id);
        res.json({ status: 'success', message: "Supprimé." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. NOUVEAU : Chat avec le document
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

        res.json({ status: 'success', data: { answer } });

    } catch (error) {
        console.error("Erreur Chat Doc:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { uploadAndAnalyze, listDocuments, getDocument, deleteDocument, askDocument };