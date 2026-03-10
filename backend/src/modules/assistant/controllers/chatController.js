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

        // --- SPECIAL GUEST MODE ---
        if (req.user.role === 'guest') {
            console.log(`[Guest] Question de ${userId}: ${query}`);

            // 1. Appel AI direct (Pas de persistence BDD)
            // Force le mode "assistant" (standard) pour les invités -> pas d'expert
            const result = await ragService.askAssistant(query, history, 'assistant');

            return res.json({
                status: 'success',
                data: {
                    ...result,
                    sessionId: 'guest_session', // Dummy ID
                    isNewSession: false
                }
            });
        }
        // --------------------------

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

        // C. Récupération de l'historique pour le RAG (Contexte)
        let contextHistory = history; // Pour les invites, ca vient du body

        // Pour les utilisateurs connectés, on préfère la source de vérité BDD
        if (req.user.role !== 'guest' && sessionId) {
            try {
                const dbMessages = await chatService.getSessionMessages(sessionId, userId);
                // On prend les 6 derniers messages pour le contexte
                contextHistory = dbMessages.slice(-6).map(m => ({
                    role: m.role,
                    content: m.content
                }));
            } catch (e) {
                console.warn("Impossible de récupérer l'historique BDD pour le contexte RAG:", e.message);
            }
        }

        // D. Appel à l'IA (Google)
        // On passe 'contextHistory', 'query' et le 'mode' sélectionné
        const mode = req.body.mode || 'expert';
        const result = await ragService.askAssistant(query, contextHistory, mode);

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
        // ✅ Headers anti-cache pour éviter les sessions fantômes
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

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
        // ✅ Headers anti-cache pour éviter les messages obsolètes
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

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
        console.log(`[CONTROLLER] 🗑️ DELETE session ${id} demandée par user ${req.user.id}`);

        await chatService.deleteSession(id, req.user.id);

        console.log(`[CONTROLLER] ✅ DELETE session ${id} réussie`);
        res.json({ status: 'success', message: "Conversation supprimée." });
    } catch (error) {
        console.error(`[CONTROLLER] ❌ Erreur deleteSession pour session ${req.params.id}:`, error.message);
        console.error(`[CONTROLLER] ❌ Stack:`, error.stack);
        res.status(500).json({
            error: "Erreur suppression.",
            details: error.message  // Retourner le message d'erreur pour debug
        });
    }
};

module.exports = { ask, getHistory, getSession, deleteSession };