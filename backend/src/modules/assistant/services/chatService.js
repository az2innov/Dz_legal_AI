const db = require('../../../config/db');

// 1. Créer une nouvelle session
async function createSession(userId, title) {
    const sUserId = parseInt(userId);
    const defaultTitle = title || 'Nouvelle conversation';
    const result = await db.query(
        "INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)",
        [sUserId, defaultTitle]
    );
    const sessionId = result.rows.insertId;
    const sessionRes = await db.query("SELECT * FROM chat_sessions WHERE id = ?", [sessionId]);
    return sessionRes.rows[0];
}

// 2. Récupérer toutes les sessions d'un utilisateur
async function getUserSessions(userId) {
    const sUserId = parseInt(userId);
    const result = await db.query(
        "SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC",
        [sUserId]
    );
    return result.rows;
}

const ragService = require('./ragService');

// 3. Récupérer les messages d'une session (FORCAGE TYPES)
async function getSessionMessages(sessionId, userId) {
    const sId = parseInt(sessionId);
    const uId = parseInt(userId);

    const sessionCheck = await db.query(
        "SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?",
        [sId, uId]
    );

    if (sessionCheck.rows.length === 0) {
        console.warn(`[GET] Session ${sId} non trouvée en BDD pour User ${uId}`);
        throw new Error("Session introuvable.");
    }

    const result = await db.query(
        "SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC",
        [sId]
    );

    // ✅ RE-SIGNER LES URLS À LA VOLÉE POUR ÉVITER ExpiredToken
    return Promise.all(result.rows.map(async (msg) => {
        let parsedSources = [];
        if (msg.sources) {
            if (Array.isArray(msg.sources)) {
                parsedSources = msg.sources;
            } else if (typeof msg.sources === 'string' && msg.sources.trim() !== "") {
                try {
                    const parsed = JSON.parse(msg.sources);
                    parsedSources = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    parsedSources = [];
                }
            }
        }

        // Si on a des sources, on tente de re-signer l'URL (même si gsUri est absent, generateSignedUrl tentera avec src.link)
        if (parsedSources.length > 0) {
            parsedSources = await Promise.all(parsedSources.map(async (src) => {
                const uriToSign = src.gsUri || src.link;
                if (uriToSign && uriToSign !== '#') {
                    let newLink = await ragService.generateSignedUrl(uriToSign);

                    // --- RÉ-APPLIQUER LES FRAGMENTS DE NAVIGATION ---
                    let fragments = [];
                    if (src.page) fragments.push(`page=${src.page}`);

                    let articleNum = src.articleNum;
                    let searchArt = src.searchArt;

                    if (src.contentPreview) {
                        const artMatch = src.contentPreview.match(/Art[^\d]{1,10}(\d+|1er)/i);
                        if (artMatch) {
                            articleNum = artMatch[1];

                            // Nettoyage identique au ragService
                            let cleanedSnippet = src.contentPreview
                                .replace(/\s+([.,:!?;])/g, '$1')
                                .replace(/([(])\s+/g, '$1')
                                .replace(/\s+([)])/g, '$1')
                                .replace(/['’]\s+/g, "'")
                                .replace(/n[^\w]*°\s*/gi, "n° ")
                                .replace(/\s+/g, ' ')
                                .trim();

                            const wordsForContext = cleanedSnippet.split(/\s+/);
                            const artIdxInWords = wordsForContext.findIndex(w => w.toLowerCase().includes('art'));

                            if (artIdxInWords !== -1) {
                                let contextParts = wordsForContext.slice(artIdxInWords + 2, artIdxInWords + 7);
                                if (contextParts[0] === '.' || contextParts[0] === '—' || contextParts[0] === '-') contextParts.shift();

                                const context = contextParts.join(' ')
                                    .replace(/'/g, "’")
                                    .trim();

                                searchArt = `Art. ${articleNum}. — ${context}`;
                            } else {
                                searchArt = `Art. ${articleNum}. —`;
                            }
                        }
                    }

                    if (searchArt) {
                        const safeSearch = searchArt.replace(/["']/g, ' ').trim();
                        fragments.push(`search="${encodeURIComponent(safeSearch)}"`);
                    } else if (src.contentPreview && !src.page) {
                        const searchTerms = src.contentPreview.split(/\s+/).slice(0, 3).join(' ').replace(/["']/g, '');
                        if (searchTerms.length > 5) {
                            fragments.push(`search="${encodeURIComponent(searchTerms)}"`);
                        }
                    }

                    if (fragments.length > 0) {
                        const fragmentStr = fragments.join('&');
                        newLink = newLink.split('#')[0] + `#${fragmentStr}`;
                    }

                    return { ...src, link: newLink, articleNum, searchArt };
                }
                return src;
            }));
        }

        msg.sources = parsedSources;
        return msg;
    }));
}

// 4. Sauvegarder un message
async function saveMessage(sessionId, role, content, sources = []) {
    const sId = parseInt(sessionId);
    const safeSources = Array.isArray(sources) ? sources : [];

    const result = await db.query(
        "INSERT INTO chat_messages (session_id, role, content, sources) VALUES (?, ?, ?, ?)",
        [sId, role, content, JSON.stringify(safeSources)]
    );
    const messageId = result.rows.insertId;
    await db.query("UPDATE chat_sessions SET updated_at = NOW() WHERE id = ?", [sId]);

    const msgRes = await db.query("SELECT * FROM chat_messages WHERE id = ?", [messageId]);
    const savedMsg = msgRes.rows[0];

    if (savedMsg) {
        try {
            savedMsg.sources = typeof savedMsg.sources === 'string' ? JSON.parse(savedMsg.sources) : (savedMsg.sources || []);
        } catch (e) {
            savedMsg.sources = [];
        }
    }
    return savedMsg;
}

// 5. Mettre à jour le titre
async function updateSessionTitle(sessionId, title) {
    const sId = parseInt(sessionId);
    await db.query("UPDATE chat_sessions SET title = ? WHERE id = ?", [title, sId]);
}

// 6. Supprimer une session (VERSION FINALE ULTRA-LOGUÉE)
async function deleteSession(sessionId, userId) {
    const sId = parseInt(sessionId);
    const uId = parseInt(userId);

    console.log(`[DELETE] Exécution suppression pour Session:${sId}, User:${uId}`);

    // A. On vérifie si elle existe
    const findRes = await db.query("SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?", [sId, uId]);

    if (findRes.rows.length === 0) {
        console.error(`[DELETE] ÉCHEC: La session ${sId} n'existe pas pour l'user ${uId}`);
        throw new Error("Session introuvable.");
    }

    // B. Suppression des messages (on ne vérifie pas rowCount car il peut y avoir 0 messages)
    await db.query("DELETE FROM chat_messages WHERE session_id = ?", [sId]);

    // C. Suppression de la session
    const res = await db.query("DELETE FROM chat_sessions WHERE id = ? AND user_id = ?", [sId, uId]);

    if (res.rowCount === 0) {
        console.error(`[DELETE] ÉCHEC CRITIQUE: SQL n'a supprimé aucune ligne pour ID ${sId}`);
        throw new Error("Erreur SQL lors de la suppression.");
    }

    console.log(`[DELETE] SUCCÈS: Session ${sId} totalement supprimée.`);
    return { id: sId };
}

module.exports = {
    createSession,
    getUserSessions,
    getSessionMessages,
    saveMessage,
    updateSessionTitle,
    deleteSession
};