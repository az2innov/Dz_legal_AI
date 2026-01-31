// Fichier: src/modules/assistant/services/ragService.js

const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
const debugFile = path.resolve(__dirname, '../../../../debug_rag.txt');

// Les variables d'environnement sont chargées au démarrage dans server.js

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = process.env.GOOGLE_LOCATION || 'global';
const DATA_STORE_ID = process.env.GOOGLE_DATA_STORE_ID;

// Chemin absolu robuste vers google-auth.json (backend/google-auth.json)
const KEY_PATH = path.resolve(__dirname, '../../../../google-auth.json');
console.log(`[Google Auth] Key Path: ${KEY_PATH}`);

const storage = new Storage({ keyFilename: KEY_PATH });

async function getAccessToken() {
    try {
        const auth = new GoogleAuth({
            keyFile: KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        return accessToken.token;
    } catch (error) {
        console.error("🚨 Erreur Auth Google:", error.message);
        throw error;
    }
}

async function generateSignedUrl(gsUri) {
    try {
        if (!gsUri) return '#';

        let bucketName, fileName;

        if (gsUri.startsWith('gs://')) {
            const parts = gsUri.replace('gs://', '').split('/');
            bucketName = parts[0];
            fileName = parts.slice(1).join('/');
        } else if (gsUri.includes('storage.googleapis.com')) {
            // Extraction depuis une URL publique GCS
            const urlObj = new URL(gsUri);
            const pathParts = urlObj.pathname.split('/').filter(p => p);
            bucketName = pathParts[0];
            fileName = pathParts.slice(1).join('/');
        } else {
            return gsUri; // C'est peut-être déjà un lien externe valide
        }

        const options = { version: 'v4', action: 'read', expires: Date.now() + 60 * 60 * 1000 };
        const [url] = await storage.bucket(bucketName).file(fileName).getSignedUrl(options);

        console.log(`[Google RAG] 📄 Link Re-signed: ${fileName} (Bucket: ${bucketName})`);
        return url;
    } catch (error) {
        console.error(`[Google RAG] ❌ Failed to sign URL for ${gsUri}:`, error.message);
        return '#';
    }
}

function isArabicText(text) {
    return /[\u0600-\u06FF]/.test(text);
}

async function askAssistant(query, historyInput = "") {
    let history = (typeof historyInput === 'string') ? historyInput : "";
    const isArabicUser = isArabicText(query);

    // Construction de la requête
    let searchQuery = query;
    let promptContext = "";

    if (history.trim() !== "") {
        searchQuery = `${history} ${query}`;
        promptContext = isArabicUser
            ? `سياق السؤال السابق: "${history}".`
            : `CONTEXTE PRÉCÉDENT: "${history}".`;
    }

    console.log(`[Google RAG] Question: "${searchQuery}"`);

    // --- DÉTECTION DES PHRASES SOCIALES / COURTES ---
    const socialKeywords = [
        "merci", "ok", "d'accord", "salut", "bonjour", "ça va", "pas besoin", "je comprends", "entendu", "parfait",
        "شكرا", "مرحبا", "أهلا", "بخير", "لا أحتاج", "تم", "فهمت"
    ];

    if (query.length < 50 && socialKeywords.some(kw => query.toLowerCase().includes(kw))) {
        return {
            answer: isArabicUser
                ? "على الرحب والسعة! هل يمكنني مساعدتك في أي شيء قانوني آخر؟"
                : "Je vous en prie ! Comment puis-je vous aider pour vos recherches juridiques ?",
            sources: []
        };
    }

    try {
        if (!PROJECT_ID || !DATA_STORE_ID) throw new Error("Configuration Google manquante (.env)");

        const token = await getAccessToken();
        const url = `https://${LOCATION}-discoveryengine.googleapis.com/v1beta/projects/${PROJECT_ID}/locations/${LOCATION}/collections/default_collection/dataStores/${DATA_STORE_ID}/servingConfigs/default_search:search`;

        const requestBody = {
            query: searchQuery,
            pageSize: 10,
            queryExpansionSpec: { condition: 'AUTO' },
            spellCorrectionSpec: { mode: 'AUTO' },
            contentSearchSpec: {
                snippetSpec: { returnSnippet: true },
                extractiveContentSpec: {
                    maxExtractiveAnswerCount: 1,
                    maxExtractiveSegmentCount: 5,
                    returnExtractiveSegmentScore: true
                },
                summarySpec: {
                    summaryResultCount: 10,
                    includeCitations: true,
                    ignoreAdversarialQuery: true,
                    ignoreNonSummarySeekingQuery: true,
                    modelPromptSpec: {
                        preamble: isArabicUser
                            ? `أنت مساعد قانوني جزائري خبير. أجابتك يجب أن تكون دقيقة ومبنية حصرياً على النصوص القانونية المتوفرة. 
                               إذا كانت الجملة لا تحتوي على سؤال قانوني أو كانت مجرد تحية أو كلام عام، لا تخترع معلومات قانونية.
                               إذا لم تجد إجابة مفيدة في النصوص، قل "عذراً، هذه المعلومة غير متوفرة".
                               ${promptContext}`
                            : `Tu es un assistant juridique algérien expert. Tes réponses doivent être précises et basées exclusivement sur les textes officiels fournis.
                               Si l'utilisateur ne pose pas de question juridique claire (ex: "merci", "pas besoin", "ok", "je comprends"), réponds poliment sans inventer de règles juridiques.
                               Si aucune information pertinente n'est trouvée, réponds simplement que l'information n'est pas disponible.
                               ${promptContext}`
                    }
                }
            }
        };

        const response = await axios.post(url, requestBody, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        const data = response.data;
        const results = data.results || [];

        const FALLBACK_MSG = isArabicUser
            ? "عذراً، هذه المعلومة غير متوفرة في النصوص القانونية الحالية."
            : "Désolé, cette information n'est pas disponible dans les textes juridiques actuels.";

        let answer = FALLBACK_MSG;
        let shouldHideSources = false;

        if (data.summary && data.summary.summarySkippedReasons && data.summary.summarySkippedReasons.length > 0) {
            shouldHideSources = true;
        }
        else if (data.summary && data.summary.summaryText) {
            answer = data.summary.summaryText;

            // Verrou supplémentaire : si la réponse est trop courte (ex: "Je comprends."),
            // c'est une hallucination de politesse de l'IA Google, on cache les sources.
            if (answer.trim().length < 40) {
                shouldHideSources = true;
            }

            const refusalPhrases = [
                "غير متوفرة", "لا توجد معلومات", "Désolé", "pas disponible", "Je ne peux pas répondre", "عذراً",
                "reformuler", "comprendre votre question", "pas compris", "ليس لدي معلومات"
            ];
            if (refusalPhrases.some(phrase => answer.toLowerCase().includes(phrase)) && answer.length < 200) {
                shouldHideSources = true;
                // Si l'IA a déjà formulé un message de "non-compréhension", on le garde mais on cache les sources
            }
        } else {
            shouldHideSources = true;
        }

        let sources = [];
        if (!shouldHideSources && results.length > 0) {
            sources = await Promise.all(results.slice(0, 5).map(async (result, index) => {
                const docData = result.document.derivedStructData || {};
                let docTitle = docData.title || "";
                const fileName = docData.link ? path.basename(docData.link) : "Document";

                // Nettoyage intelligent du titre
                if (!docTitle || docTitle.includes('www.') || docTitle.includes('http')) {
                    docTitle = fileName;
                }

                // Supprimer les extensions et nettoyer les séparateurs
                docTitle = docTitle.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');

                // Harmonisation des titres types (JO, Code, etc.)
                if (docTitle.toLowerCase().includes('journal officiel')) docTitle = docTitle.replace(/journal officiel/gi, 'JO');

                const publicLink = await generateSignedUrl(docData.link);
                let snippet = "";
                let pageNumber = null;

                if (result.document.derivedStructData.extractive_segments?.length > 0) {
                    const segment = result.document.derivedStructData.extractive_segments[0];
                    snippet = segment.content;
                    pageNumber = segment.pageNumber || segment.page_number || (segment.page_index !== undefined ? segment.page_index + 1 : null);
                } else if (docData.snippets?.length > 0) {
                    snippet = docData.snippets[0].snippet;
                }

                snippet = snippet.replace(/<\/?[^>]+(>|$)/g, "").trim();

                // --- GESTION DES ARTICLES (FR & AR) ---
                let articleNum = null;
                let searchArt = null;

                // Regex améliorée pour FR (Art. 12, Article 1, etc.)
                const artMatchFr = snippet.match(/Art(?:icle)?[^\d]{0,10}(\d+|1er)/i);
                // Regex pour AR (المادة 12, مادة 1, etc.)
                const artMatchAr = snippet.match(/(?:المادة|مادة)[^\d]{0,10}(\d+)/);

                if (artMatchFr) articleNum = artMatchFr[1];
                else if (artMatchAr) articleNum = artMatchAr[1];

                if (articleNum) {
                    // Nettoyage pour la recherche profonde
                    let cleanedSnippet = snippet.replace(/\s+/g, ' ').trim();
                    const words = cleanedSnippet.split(' ');
                    const artWord = isArabicUser ? 'المادة' : 'Art.';
                    const artIdx = words.findIndex(w => w.includes(articleNum) && (w.toLowerCase().includes('art') || w.includes('المادة') || w.includes('مادة')));

                    if (artIdx !== -1) {
                        const context = words.slice(artIdx + 1, artIdx + 6).join(' ');
                        searchArt = `${artWord} ${articleNum}${isArabicUser ? '' : '.'} — ${context}`;
                    } else {
                        searchArt = `${artWord} ${articleNum}`;
                    }
                }

                // --- LABEL COURT POUR L'UI ---
                let shortLabel = docTitle;
                if (articleNum) {
                    shortLabel = isArabicUser ? `المادة ${articleNum} - ${docTitle}` : `Art. ${articleNum} - ${docTitle}`;
                }

                // --- NAVIGATION FRAGMENTS ---
                let fragments = [];
                if (pageNumber) fragments.push(`page=${pageNumber}`);
                if (searchArt) fragments.push(`search="${encodeURIComponent(searchArt.replace(/["']/g, ' '))}"`);

                let finalLink = publicLink;
                if (fragments.length > 0) {
                    finalLink = finalLink.split('#')[0] + `#${fragments.join('&')}`;
                }

                if (snippet.length > 250) snippet = snippet.substring(0, 250) + "...";

                return {
                    id: index + 1,
                    title: docTitle,
                    shortLabel: shortLabel,
                    contentPreview: snippet,
                    link: finalLink,
                    page: pageNumber,
                    articleNum: articleNum,
                    searchArt: searchArt,
                    gsUri: docData.link
                };
            }));
        }

        return { answer, sources };

    } catch (error) {
        // LOG DÉTAILLÉ DE L'ERREUR DANS UN FICHIER
        const timestamp = new Date().toISOString();
        let errorLog = `\n[${timestamp}] 🚨 ERREUR RAG:\n`;

        if (error.response) {
            errorLog += `Status: ${error.response.status}\n`;
            errorLog += `Data: ${JSON.stringify(error.response.data, null, 2)}\n`;
        } else {
            errorLog += `Message: ${error.message}\n`;
            errorLog += `Stack: ${error.stack}\n`;
        }
        errorLog += `Config: Project=${PROJECT_ID}, Location=${LOCATION}, DataStore=${DATA_STORE_ID}\n`;

        console.error(errorLog);
        try { fs.appendFileSync(debugFile, errorLog); } catch (e) { /* ignore */ }

        throw new Error(`Erreur Google AI: ${error.message}`);
    }
}

module.exports = { askAssistant, generateSignedUrl };