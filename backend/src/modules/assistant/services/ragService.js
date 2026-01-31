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

async function askAssistant(query, historyInput = "", modeParam = 'expert') {
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

    console.log(`[Google RAG] Question: "${searchQuery}" (Mode: ${modeParam})`);

    try {
        if (!PROJECT_ID || !DATA_STORE_ID) throw new Error("Configuration Google manquante (.env)");

        const token = await getAccessToken();
        const url = `https://${LOCATION}-discoveryengine.googleapis.com/v1beta/projects/${PROJECT_ID}/locations/${LOCATION}/collections/default_collection/dataStores/${DATA_STORE_ID}/servingConfigs/default_search:search`;

        const { getSearchAnchors } = require('./intentService');

        // ... (imports remain)

        // ... (inside askAssistant)

        // DÉTERMINATION DU MODE (Expert par défaut si on est dans une suite de conversation)
        const mode = history.trim() !== "" ? 'expert' : modeParam;

        // --- VISION 3.0 : DYNAMIC INTENT EXPANSION ---
        // On remplace les boosters hardcodés par une analyse IA
        let ragSearchQuery = query.replace(/[؟?]/g, ' ').replace(/\s+/g, ' ').trim();

        // Appel asynchrone à l'Intent Service (Rapide ~500ms)
        // On ne bloque pas si ça échoue (fail-safe)
        let intentData = null;
        try {
            logToDebug("INTENT ANALYSIS", "analyzing...");
            intentData = await getSearchAnchors(query, isArabicUser);
            if (intentData) {
                logToDebug("INTENT RESULT", intentData);

                // Construction de la requête enrichie
                // Ex: "Comment divorcer ? (Loi 84-11 Code de la Famille Khoul Divorce)"
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

        // LOGGING DE LA REQUÊTE FINALE (Vision 2.1.1)
        logToDebug("RAG SEARCH QUERY", {
            originalQuery: query,
            finalRagQuery: ragSearchQuery,
            isArabic: isArabicUser,
            mode: mode
        });

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
                            ? (mode === 'chat'
                                ? `أنت "المساعد السريع" لـ Dz Legal AI. وظيفتك هي تقديم إجابات مباشرة ومفيدة بناءً على النصوص القانونية.
                                **القاعد الأساسية للرد:**
                                1. استخرج كافة التفاصيل المتاحة: الشروط، السلطات المختصة، والوثائق.
                                2. أعطِ الأولوية لمواد القوانين الخاصة (مثل القوانين العضوية والأوامر) على المواد العامة للدستور.
                                3. كن شاملاً ودقيقاً جداً في الأرقام والتفاصيل المذكورة في النصوص.
                                ${promptContext}`
                                : `أنت "المستشار القانوني الخبير" لـ Dz Legal AI.

                                **الهيكلة الإلزامية:**
                                1. **🔍 السند القانوني**: اذكر المواد بدقة (رقم المادة واسم القانون).
                                2. **⚖️ التحليل القانوني**: شرح الشروط المطلوبة والتحليل القانوني للنص.
                                3. **✅ خطة العمل**: الخطوات العملية والوثائق المطلوبة.

                                **سياسة حماية التفاصيل (هام جداً):**
                                1. لا تخلط بين "الشروط الأساسية" (مثل المدد القانونية) وبين "الإجراءات الإدارية". إذا وجدت الشروط، يجب ذكرها بالتفصيل.
                                2. إذا لم تجد الإجراءات الدقيقة، اعترف بذلك ولكن لا تخفِ المبادئ القانونية والمدد التي وجدتها.
                                3. كن شاملاً: اذكر السلطات المختصة والوثائق المطلوبة المذكورة في النصوص.
                                4. لا تذكر مواداً أو قوانين غير موجودة صراحة في المستندات.
                                
                                ${promptContext}`)
                            : (mode === 'chat'
                                ? `Tu es l'Assistant Rapide de Dz Legal AI. Ton rôle est de fournir des réponses claires, complètes et précises basées sur les textes fournis.
                                **RÈGLES :**
                                - Extrais TOUS les détails pertinents : durées, autorités, et modes de preuve.
                                - Si l'information est absente d'un document mais présente dans un autre, fais la synthèse.
                                - Évite la concision extrême au détriment de l'exhaustivité.
                                ${promptContext}`
                                : `Tu es le "Conseiller Juridique Expert" de Dz Legal AI. Ton ton doit être celui d'un juriste de haut niveau : rigoureux, académique et structuré. 

                                **STRUCTURE OBLIGATOIRE (Utilise ces titres exacts) :**
                                ### 🔍 Base Légale
                                Cite les articles de loi et textes réglementaires précis. Priorise les CODES sur la Constitution si possible.
                                ### ⚖️ Analyse Juridique
                                Détaille l'interprétation légale et les conséquences pour l'utilisateur.
                                ### ✅ Plan d'Action
                                Liste les démarches concrètes, pièces à fournir et délais.

                                **POLITIQUE DE PROTECTION DES DÉTAILS (CRITIQUE) :**
                                1. Ne confonds pas "Conditions de fond" (ex: durées légales) et "Procédure administrative". Si tu trouves les conditions, DÉTAILLE-LES obligatoirement.
                                2. Si tu ne trouves pas la procédure exacte, dis-le, mais NE CACHE PAS les principes légaux et les durées que tu as trouvés.
                                3. Sois EXHAUSTIF : Cite les autorités et les pièces justificatives mentionnées.
                                4. Ne cite JAMAIS d'articles ou de lois qui ne sont pas explicitement présents.
                                ${promptContext}`)
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