// Fichier: src/modules/assistant/services/ragService.js

const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Chargement du .env depuis la racine
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const LOCATION = process.env.GOOGLE_LOCATION || 'global';
const DATA_STORE_ID = process.env.GOOGLE_DATA_STORE_ID;
const KEY_PATH = path.join(process.cwd(), 'google-auth.json');

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
        if (!gsUri || !gsUri.startsWith('gs://')) return '#';
        const parts = gsUri.replace('gs://', '').split('/');
        const bucketName = parts[0];
        const fileName = parts.slice(1).join('/');
        const options = { version: 'v4', action: 'read', expires: Date.now() + 60 * 60 * 1000 };
        const [url] = await storage.bucket(bucketName).file(fileName).getSignedUrl(options);
        return url;
    } catch (error) {
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

            const refusalPhrases = ["غير متوفرة", "لا توجد معلومات", "Désolé", "pas disponible", "Je ne peux pas répondre", "عذراً"];
            if (refusalPhrases.some(phrase => answer.includes(phrase)) && answer.length < 100) {
                shouldHideSources = true;
                answer = FALLBACK_MSG;
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
                if (!docTitle || docTitle.includes('www.') || docTitle.includes('http')) docTitle = fileName;
                docTitle = docTitle.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');

                const publicLink = await generateSignedUrl(docData.link);
                let snippet = "";
                if (result.document.derivedStructData.extractive_segments?.length > 0) {
                    snippet = result.document.derivedStructData.extractive_segments[0].content;
                } else if (docData.snippets?.length > 0) {
                    snippet = docData.snippets[0].snippet;
                }
                snippet = snippet.replace(/<\/?[^>]+(>|$)/g, "").trim();
                if (snippet.length > 200) snippet = snippet.substring(0, 200) + "...";

                return { id: index + 1, title: docTitle, contentPreview: snippet, link: publicLink };
            }));
        }

        return { answer, sources };

    } catch (error) {
        console.error("🚨 ERREUR RAG SERVICE:", error.response ? error.response.data : error.message);
        throw new Error("Erreur service IA");
    }
}

module.exports = { askAssistant };