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

function logToDebug(title, data) {
    const timestamp = new Date().toISOString();
    const formattedData = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
    const logEntry = `\n[${timestamp}] === ${title.toUpperCase()} ===\n${formattedData}\n------------------------------------------\n`;
    try {
        fs.appendFileSync(debugFile, logEntry);
    } catch (e) {
        console.error("❌ Erreur Log File:", e.message);
    }
}

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

async function askAssistant(query, historyInput = [], modeParam = 'expert') {
    // 1. Parsing de l'historique
    let historyArr = [];
    if (Array.isArray(historyInput)) {
        historyArr = historyInput;
    } else if (typeof historyInput === 'string' && historyInput.trim() !== "") {
        try {
            // Si c'est une string JSON (cas rare)
            if (historyInput.startsWith('[')) historyArr = JSON.parse(historyInput);
            else historyArr = [{ role: 'user', content: historyInput }]; // Fallback
        } catch (e) {
            historyArr = [];
        }
    }

    const isArabicUser = isArabicText(query);

    // 2. Stratégie de Recherche Contextuelle (Refinement)
    let searchQuery = query;
    const cleanQuery = query.trim();
    const lowerQuery = cleanQuery.toLowerCase();

    // Mots-clés indiquant une suite/précision (Refinement Intent)
    const refinementKeywords = [
        'simple', 'simplifi', 'résum', 'clair', 'expliqu', 'précis', 'détail',
        'oui', 'non', 'pourquoi', 'comment', 'et pour', 'dans ce cas', 'c\'est faux',
        'pas compris', 'peux-tu', 'pouvez-vous', 'donne-moi', 'dis-moi',
        'بسيط', 'لخص', 'شرح', 'وضح', 'نعم', 'لا', 'لماذا', 'كيف'
    ];

    const isRefinement = cleanQuery.split(' ').length < 15 || refinementKeywords.some(kw => lowerQuery.includes(kw));

    // Si c'est un raffinement, on récupère le contexte de la DERNIÈRE question utilisateur pertinente
    if (isRefinement && historyArr.length > 0) {
        // Trouver le dernier message user
        const lastUserMsg = [...historyArr].reverse().find(m => m.role === 'user');
        if (lastUserMsg && lastUserMsg.content) {
            // On combine pour la recherche vectorielle uniquement
            // Ex: "Comment importer ?" (Search) -> "Simplifie" (Search = "Comment importer ? Simplifie")
            searchQuery = `${lastUserMsg.content} ${query}`;
            console.log(`[Google RAG] 🔄 Refinement detected. Contextual Search: "${searchQuery}"`);
        }
    }

    // Construction du Prompt Context (Pour LLM)
    let promptContext = "";
    if (historyArr.length > 0) {
        const historyText = historyArr.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: "${m.content}"`).join('\n');
        promptContext = isArabicUser
            ? `سياق المحادثة السابقة:\n${historyText}\n`
            : `CONTEXTE DE LA CONVERSATION:\n${historyText}\n`;
    }

    console.log(`[Google RAG] Query: "${searchQuery}" (Mode: ${modeParam})`);

    try {
        if (!PROJECT_ID || !DATA_STORE_ID) throw new Error("Configuration Google manquante (.env)");

        const token = await getAccessToken();
        const url = `https://${LOCATION}-discoveryengine.googleapis.com/v1beta/projects/${PROJECT_ID}/locations/${LOCATION}/collections/default_collection/dataStores/${DATA_STORE_ID}/servingConfigs/default_search:search`;

        const { getSearchAnchors } = require('./intentService');

        // DÉTERMINATION DU MODE
        // On respecte le choix de l'utilisateur (Chat ou Expert). 
        // L'historique ne doit pas forcer le passage en mode Expert.
        let mode = modeParam || 'chat';
        if (mode === 'assistant') mode = 'chat'; // Normalisation pour le contrôleur Guest

        // --- VISION 3.0 : DYNAMIC INTENT EXPANSION ---
        let ragSearchQuery = searchQuery.replace(/[؟?]/g, ' ').replace(/\s+/g, ' ').trim();

        // Appel asynchrone à l'Intent Service
        try {
            logToDebug("INTENT ANALYSIS", "analyzing...");
            // On utilise la query d'origine pour l'intent, ou la search si courte
            let intentData = await getSearchAnchors(searchQuery, isArabicUser);
            if (intentData) {
                logToDebug("INTENT RESULT", intentData);
                const anchor = intentData.targetCode ? `${intentData.targetCode}` : "";
                const keywords = intentData.keywords || "";
                if (anchor || keywords) {
                    ragSearchQuery += ` (${anchor} ${keywords})`;
                }
            }
        } catch (err) {
            console.error("Intent Service Failed:", err.message);
        }

        if (isArabicUser) {
            if (!ragSearchQuery.includes("الجزائر")) ragSearchQuery += " الجزائر";
        } else {
            if (!ragSearchQuery.toLowerCase().includes("algérie")) ragSearchQuery += " Algérie";
        }

        // LOGGING
        logToDebug("RAG SEARCH QUERY", {
            originalQuery: query,
            finalRagQuery: ragSearchQuery,
            isArabic: isArabicUser,
            mode: mode
        });

        const isSimpleRequest = query.toLowerCase().includes('simplif') || query.toLowerCase().includes('simple') || query.toLowerCase().includes('résum') || (isArabicUser && query.includes('بسيط'));

        const requestBody = {
            query: ragSearchQuery,
            pageSize: 20,
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
                            ? (isSimpleRequest
                                ? `أنت مساعد قانوني ذكي. المستخدم طلب إجابة بسيطة ومباشرة.
                                
                                INSTRUCTIONS :
                                1. Commence OBLIGATOIREMENT par : "Oui", "Non", ou "Oui, mais...".
                                2. Sois concret : Si le montant dépasse les seuils cités, dis que c'est taxable.
                                3. Évite le jargon (pas de "Arrêté interministériel" ou "Article 213"). Parle de "la loi".
                                4. Fais 2-3 phrases maximum.
                                5. Sers-toi des textes ci-dessous ET du CONTEXTE DE LA CONVERSATION PRÉCÉDENTE pour répondre.
                                
                                ${promptContext}`
                                : (mode === 'chat'
                                    ? `أنت "المساعد الذكي" لـ Dz Legal AI.
                                    مهمتك: تقديم ملخص واضح ومفيد للمعلومات الموجودة في النصوص.
                                    - تجنب المقدمات الطويلة (مثل "بصفتي...").
                                    - ادخل في صلب الموضوع مباشرة.
                                    - إذا كانت النصوص تحتوي على الإجابة (مثل شروط أو خطوات)، اذكرها بوضوح واختصار.
                                    - استشهد بالمصادر [1] عند الضرورة.
                                    ${promptContext}`
                                    : `أنت "المستشار القانوني الخبير" لـ Dz Legal AI.
                                    
                                    **الهيكلة الإلزامية:**
                                    1. **🔍 السند القانوني**: اذكر المواد بدقة.
                                    2. **⚖️ التحليل القانوني**: شرح الشروط.
                                    3. **✅ خطة العمل**: الخطوات العملية.

                                    ${promptContext}`))
                            : (isSimpleRequest
                                ? `Tu es un assistant juridique clair et pédagogique. L'utilisateur veut une réponse SIMPLE.
                                
                                INSTRUCTIONS :
                                1. Commence OBLIGATOIREMENT par : "Oui", "Non", ou "Oui, mais...".
                                2. Sois concret : Si le montant dépasse les seuils cités, dis que c'est taxable.
                                3. Évite le jargon. Parle de "la loi".
                                4. Fais 2-3 phrases maximum.
                                5. Sers-toi des textes ci-dessous ET du CONTEXTE DE LA CONVERSATION PRÉCÉDENTE pour répondre.
                                
                                ${promptContext}`
                                : (mode === 'chat'
                                    ? `Tu es l'Assistant de Dz Legal AI.
                                    IMPORTANT : Ne commence jamais par "En tant que...". Entre directement dans le sujet.
                                    
                                    Ton objectif : Fournir une synthèse claire et utile des informations trouvées.
                                    - Utilise les textes ci-dessous pour répondre.
                                    - Si les textes contiennent la réponse, résume-la bien.
                                    - Cite les sources entre crochets [1] si pertinent.
                                    ${promptContext}`
                                    : `Tu es le Conseiller Juridique Expert.
                                    IMPORTANT : Ne commence jamais par "En tant que...". Sois professionnel et direct.
                                    
                                    **INSTRUCTIONS :**
                                    1. Cite les articles précis trouvés (Base Légale).
                                    2. Explique les règles juridiques clairement.
                                    3. Indique les démarches concrètes si applicable.

                                    ${promptContext}`))
                    }
                }
            }
        };

        // LOGGING DU PREAMBLE (Vision 2.1.1)
        logToDebug("PREAMBLE SENT TO AI", requestBody.contentSearchSpec.summarySpec.modelPromptSpec.preamble);

        const response = await axios.post(url, requestBody, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        const data = response.data;
        const results = data.results || [];

        // LOGGING DES RÉSULTATS RÉELS (Vision 2.1.1)
        const simplifiedResults = results.slice(0, 5).map((r, i) => ({
            rank: i + 1,
            title: r.document?.derivedStructData?.title || "SANS TITRE",
            link: r.document?.derivedStructData?.link || "SANS LIEN",
            snippet: r.document?.derivedStructData?.snippets?.[0]?.snippet?.substring(0, 200) + "..."
        }));
        logToDebug("TOP 5 RAG RESULTS FROM GOOGLE", simplifiedResults);

        const FALLBACK_MSG = isArabicUser
            ? "عذراً، هذه المعلومة غير متوفرة في النصوص القانونية الحالية."
            : "Désolé, cette information n'est pas disponible dans les textes juridiques actuels.";

        let answer = FALLBACK_MSG;
        let shouldHideSources = false;

        // --- FALLBACK LOGIC FOR SIMPLE REQUESTS (CONTEXT LOSS FIX) ---
        // Si Google RAG refuse de répondre (Summary Skipped) MAIS que c'est une demande de simplification (Refinement)
        // ET qu'on a de l'historique -> On force une génération locale avec Gemini Pro Flash
        if (isSimpleRequest && historyArr.length > 0 &&
            (data.summary?.summarySkippedReasons?.length > 0 || !data.summary?.summaryText)) {

            console.log("⚠️ [RAG Fallback] Summary Skipped on Simple Request. Attempting Gemini Context Generation...");

            try {
                // On importe Gemini uniquement ici pour pas alourdir l'init
                const { GoogleGenerativeAI } = require('@google/generative-ai');
                const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

                const fallbackPrompt = isArabicUser
                    ? `المستخدم يسأل: "${query}"
                       بناءً على المحادثة السابقة فقط:
                       ${promptContext}
                       
                       أعطِ إجابة بسيطة ومباشرة (نعم/لا/توضيح موجز).`
                    : `L'utilisateur demande : "${query}"
                       CONTEXTE : La recherche documentaire n'a rien donné, mais l'utilisateur demande une simplification de la réponse précédente.
                       
                       D'après l'historique ci-dessous :
                       ${promptContext}
                       
                       Réponds SIMPLEMENT à sa demande (Oui/Non/Résumé). Fais court.`;

                const result = await model.generateContent(fallbackPrompt);
                const fbResponse = await result.response;
                const fbText = fbResponse.text();

                if (fbText) {
                    answer = fbText;
                    shouldHideSources = true; // Pas de nouvelles sources
                    console.log("✅ [RAG Fallback] Gemini Success:", answer);
                }
            } catch (fbError) {
                console.error("❌ [RAG Fallback] Failed:", fbError.message);
            }

        } else if (data.summary && data.summary.summarySkippedReasons && data.summary.summarySkippedReasons.length > 0) {
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
                "reformuler", "comprendre votre question", "pas compris", "ليس لدي معلومات",
                "documents fournis ne contiennent pas", "ne détaillent pas comment", "ne mentionnent pas la procédure",
                "ne cite pas", "n'est pas mentionnée", "l'état actuel de ma base documentaire",
                "النصوص القانونية المتوفرة لا تشير", "تعذر العثور", "لا تتضمن الوثائق"
            ];

            // Si l'IA commence par une phrase de refus, on cache systématiquement les sources (bruit)
            if (answer === FALLBACK_MSG || refusalPhrases.some(phrase => answer.toLowerCase().includes(phrase.toLowerCase()))) {
                // EXCEPTION ARABE (Vision 2.0.8) : On ne cache PAS les sources en arabe sauf si c'est le message de fallback total
                // Cela permet d'afficher les références même si l'IA est prudente
                if (!isArabicUser || answer === FALLBACK_MSG) {
                    shouldHideSources = true;
                }

                // Si c'est un mini-message de refus de l'IA (hallucination de politesse), on remplace par le fallback propre
                if (answer.length < 100 && answer !== FALLBACK_MSG) {
                    answer = FALLBACK_MSG;
                }
            }
        } else {
            shouldHideSources = true;
        }

        let sources = [];
        if (!shouldHideSources && results.length > 0) {
            // --- DYNAMIC CITATION MAPPING (Vision 2.0.2 - Fixed Grouping & Filtering) ---

            // 1. Extraire TOUS les indices numériques cités, même groupés (ex: [1, 2, 8])
            const citedIndices = new Set();
            const bracketMatches = answer.matchAll(/\[([\d,\s]+)\]/g);
            for (const match of bracketMatches) {
                const nums = match[1].split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                nums.forEach(n => citedIndices.add(n));
            }

            // 2. Pré-sélectionner les candidats (cités + top 3 pour garantie de base)
            const candidateIndices = [...new Set([...citedIndices, 1, 2, 3])]
                .filter(i => i > 0 && i <= results.length)
                .sort((a, b) => a - b);

            // 3. Pré-générer les sources et filtrer les "vides" IMMEDIATELY
            const validSourcesData = [];
            for (const origIdx of candidateIndices) {
                const result = results[origIdx - 1];
                const docData = result.document.derivedStructData || {};

                let snippet = "";
                if (result.document.derivedStructData.extractive_segments?.length > 0) {
                    snippet = result.document.derivedStructData.extractive_segments[0].content;
                } else if (docData.snippets?.length > 0) {
                    snippet = docData.snippets[0].snippet;
                }
                snippet = snippet.replace(/<\/?[^>]+(>|$)/g, "").trim();

                // On ne garde que si le snippet est substantiel (> 10 chars)
                if (snippet.length > 10) {
                    validSourcesData.push({
                        origIndex: origIdx,
                        snippet: snippet,
                        result: result,
                        docData: docData
                    });
                }

                // Limite de 10 sources max pour l'affichage
                if (validSourcesData.length >= 10) break;
            }

            // 4. Créer le mapping (Index Origine -> Nouvel Index) basé sur le tableau filtré
            const indexMap = {};
            validSourcesData.forEach((src, newIdx) => {
                indexMap[src.origIndex] = newIdx + 1;
            });

            // 5. Mettre à jour les citations dans le texte (Support Groupes & Espaces)
            // On utilise une approche plus agressive pour attraper les [1, 2, 3] ou [1,2,3]
            answer = answer.replace(/\[([\d\s,]+)\]/g, (match, content) => {
                const nums = content.split(/[,\s]+/).map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                const mappedNums = nums
                    .map(n => indexMap[n])
                    .filter(n => n !== undefined);

                // On garde un format propre [1, 2]
                return mappedNums.length > 0 ? `[${mappedNums.join(', ')}]` : "";
            });

            // 6. Finaliser les objets sources pour le frontend
            sources = await Promise.all(validSourcesData.map(async (src, newIdx) => {
                const { result, docData, snippet } = src;
                const index = newIdx + 1;

                let docTitle = docData.title || "";
                const fileName = docData.link ? path.basename(docData.link) : "Document";
                if (!docTitle || docTitle.includes('www.') || docTitle.includes('http')) docTitle = fileName;
                docTitle = docTitle.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');
                if (docTitle.toLowerCase().includes('journal officiel')) docTitle = docTitle.replace(/journal officiel/gi, 'JO');

                const publicLink = await generateSignedUrl(docData.link);
                let pageNumber = null;
                if (result.document.derivedStructData.extractive_segments?.length > 0) {
                    const segment = result.document.derivedStructData.extractive_segments[0];
                    pageNumber = segment.pageNumber || segment.page_number || (segment.page_index !== undefined ? segment.page_index + 1 : null);
                }

                // --- GESTION DES ARTICLES ---
                let articleNum = null;
                let searchArt = null;
                const artMatchFr = snippet.match(/Art(?:icle)?[^\d]{0,10}(\d+|1er)/i);
                const artMatchAr = snippet.match(/(?:المادة|مادة)[^\d]{0,10}(\d+)/);
                if (artMatchFr) articleNum = artMatchFr[1];
                else if (artMatchAr) articleNum = artMatchAr[1];

                if (articleNum) {
                    const words = snippet.replace(/\s+/g, ' ').trim().split(' ');
                    const artWord = isArabicUser ? 'المادة' : 'Art.';
                    const artIdx = words.findIndex(w => w.includes(articleNum) && (w.toLowerCase().includes('art') || w.includes('المادة') || w.includes('مادة')));
                    if (artIdx !== -1) {
                        const context = words.slice(artIdx + 1, artIdx + 6).join(' ');
                        searchArt = `${artWord} ${articleNum}${isArabicUser ? '' : '.'} — ${context}`;
                    } else {
                        searchArt = `${artWord} ${articleNum}`;
                    }
                }

                let shortLabel = articleNum
                    ? (isArabicUser ? `المادة ${articleNum} - ${docTitle}` : `Art. ${articleNum} - ${docTitle}`)
                    : docTitle;

                let fragments = [];
                if (pageNumber) fragments.push(`page=${pageNumber}`);
                if (searchArt) fragments.push(`search="${encodeURIComponent(searchArt.replace(/["']/g, ' '))}"`);

                let finalLink = publicLink;
                if (fragments.length > 0) finalLink = finalLink.split('#')[0] + `#${fragments.join('&')}`;

                let contentPreview = snippet;
                if (contentPreview.length > 250) contentPreview = contentPreview.substring(0, 250) + "...";

                return {
                    id: index,
                    title: docTitle,
                    shortLabel: shortLabel,
                    contentPreview: contentPreview,
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