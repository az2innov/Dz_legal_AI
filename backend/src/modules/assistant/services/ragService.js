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

    try {
        if (!PROJECT_ID || !DATA_STORE_ID) throw new Error("Configuration Google manquante (.env)");

        const token = await getAccessToken();
        // On garde l'URL DataStore qui fonctionne
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
                    ignoreNonSummarySeekingQuery: false,
                    
                    modelPromptSpec: {
                        preamble: `
أنت مساعد قانوني جزائري خبير.
${promptContext}

تعليمات للإجابة (Instructions):
1. ابدأ الإجابة بجملة كاملة وواضحة.
2. لخص العقوبات والإجراءات في نقاط (Bullet points) لتكون واضحة.
3. اذكر السنوات والغرامات بدقة.
4. إذا لم تجد المعلومة (مثل ميزانية 2024)، قل فقط: "عذراً، هذه المعلومة غير متوفرة في النصوص الحالية."

اللغة:
- أجب بنفس لغة السؤال (العربية للعربية، الفرنسية للفرنسية).
                        `
                    }
                }
            }
        };

        const response = await axios.post(url, requestBody, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        const data = response.data;
        const results = data.results || [];
        
        // Message par défaut
        const FALLBACK_MSG = isArabicUser 
            ? "عذراً، هذه المعلومة غير متوفرة في النصوص القانونية الحالية."
            : "Désolé, cette information n'est pas disponible dans les textes juridiques actuels.";
            
        let answer = FALLBACK_MSG;
        let shouldHideSources = false;

        // Traitement intelligent de la réponse
        if (data.summary && data.summary.summarySkippedReasons && data.summary.summarySkippedReasons.length > 0) {
            shouldHideSources = true;
        } 
        else if (data.summary && data.summary.summaryText) {
            answer = data.summary.summaryText;
            
            // Filtre de refus (Réactivé pour la production)
            const refusalPhrases = [
                "غير متوفرة", "لا توجد معلومات", "Désolé", "pas disponible", 
                "Je ne peux pas répondre", "عذراً"
            ];
            
            // Si la réponse commence par une excuse ou contient une phrase de refus explicite
            if (refusalPhrases.some(phrase => answer.includes(phrase))) {
                // On vérifie si c'est un refus total ou partiel
                // Pour l'instant, on considère que si ça parle de "non disponible", on cache les sources pour être propre
                // sauf si la réponse est longue (plus de 100 chars), ce qui veut dire qu'il a trouvé des choses mais pas tout.
                if (answer.length < 100) {
                    shouldHideSources = true;
                    answer = FALLBACK_MSG;
                }
            }
        } else {
            shouldHideSources = true;
        }

        // Formatage des sources
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

                return {
                    id: index + 1,
                    title: docTitle,
                    contentPreview: snippet,
                    link: publicLink
                };
            }));
        }

        return { answer, sources };

    } catch (error) {
        console.error("🚨 ERREUR RAG SERVICE:", error.response ? error.response.data : error.message);
        throw new Error("Erreur service IA");
    }
}

module.exports = { askAssistant };