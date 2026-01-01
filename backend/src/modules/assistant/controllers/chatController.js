const ragService = require('../services/ragService');
const chatService = require('../services/chatService');

// --- 1. Nouvelle Conversation / Poser une question ---
const ask = async (req, res) => {
    try {
        const { query, history } = req.body;
        // On récupère sessionId s'il existe, sinon on en créera un
        let { sessionId } = req.body; 
        const userId = req.user.id; // Vient du middleware auth

        if (!query) return res.status(400).json({ error: "Question requise." });

        // A. Si pas de session ID, on crée une nouvelle session
        let isNewSession = false;
        if (!sessionId) {
            // On utilise le début de la question comme titre (limité à 50 chars)
            const title = query.length > 50 ? query.substring(0, 50) + "..." : query;
            const session = await chatService.createSession(userId, title);
            sessionId = session.id;
            isNewSession = true;
        }

        // B. Sauvegarde du message Utilisateur
        await chatService.saveMessage(sessionId, 'user', query);

        // C. Appel à l'IA (Google)
        // On passe 'history' si besoin pour le contexte immédiat
        const result = await ragService.askAssistant(query, history);

        // D. Sauvegarde de la réponse IA
        await chatService.saveMessage(sessionId, 'assistant', result.answer, result.sources);

        // E. Réponse au client avec l'ID de session (important pour la suite)
        res.json({
            status: 'success',
            data: {
                ...result,
                sessionId: sessionId,
                isNewSession: isNewSession
            }
        });

    } catch (error) {
        console.error("Erreur Chat:", error);
        res.status(500).json({ error: "Erreur lors du traitement." });
    }
};

// --- 2. Récupérer l'historique (Liste des sessions) ---
const getHistory = async (req, res) => {
    try {
        const sessions = await chatService.getUserSessions(req.user.id);
        res.json({ status: 'success', data: sessions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur récupération historique." });
    }
};

// --- 3. Récupérer les messages d'une session précise ---
const getSession = async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await chatService.getSessionMessages(id, req.user.id);
        res.json({ status: 'success', data: messages });
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: "Session introuvable." });
    }
};

// --- 4. Supprimer une session ---
const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        await chatService.deleteSession(id, req.user.id);
        res.json({ status: 'success', message: "Conversation supprimée." });
    } catch (error) {
        res.status(500).json({ error: "Erreur suppression." });
    }
};

module.exports = { ask, getHistory, getSession, deleteSession };