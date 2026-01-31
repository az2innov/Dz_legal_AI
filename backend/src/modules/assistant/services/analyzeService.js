const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

const apiKey = process.env.GOOGLE_API_KEY;

// On garde le modèle qui a fonctionné pour vous (2.0 Flash est très bon pour le multilingue)
const modelName = 'gemini-2.0-flash';

// Initialisation du client
const genAI = new GoogleGenerativeAI(apiKey);

// Fonction utilitaire pour savoir si on doit forcer l'arabe
function isArabic(text) {
    return /[\u0600-\u06FF]/.test(text);
}

/**
 * Analyse initiale d'un document (Résumé)
 */
async function analyzeDocument(filePath, mimeType, userPrompt) {
    console.log(`[Analyze] Fichier : ${path.basename(filePath)}`);

    // Détection de la langue demandée via le prompt de l'utilisateur
    const targetLang = isArabic(userPrompt) ? "ARABE" : "FRANÇAIS";
    console.log(`[Analyze] Langue cible détectée : ${targetLang}`);

    try {
        if (!apiKey) throw new Error("Clé API Google manquante.");

        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
        });

        const fileBuffer = fs.readFileSync(filePath);
        const fileBase64 = fileBuffer.toString('base64');

        // PROMPT RENFORCÉ POUR LA TRADUCTION
        const prompt = `
Rôle : Assistant juridique expert en droit algérien.
Tâche : Analyse le document juridique ci-joint.

Instruction de l'utilisateur : "${userPrompt}"

RÈGLES IMPÉRATIVES DE LANGUE ET FORMAT :
1. L'utilisateur veut une réponse en : ${targetLang}.
2. FORMATAGE MARKDOWN OBLIGATOIRE :
   - Titres Sections : ### Titre
   - Listes : - Item
   - Important : **Gras**
3. Si le document est en Français mais que la langue demandée est ARABE : Tu DOIS TRADUIRE le résumé en ARABE.

Structure de la réponse attendue :
### 📄 Nature du document
[Type de document, dates, parties prenantes]

### 🔑 Points Clés
- [Point 1]
- [Point 2]

### ⚖️ Références Juridiques
- [Articles cités...]

### ⚠️ Analyse des Risques (Si applicable)
- [Risque identifié...]
        `;

        const imageParts = [{
            inlineData: { data: fileBase64, mimeType: mimeType }
        }];

        console.log("📤 Envoi à Gemini (Analyse)...");
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();

        console.log("✅ Analyse réussie !");
        return text;

    } catch (error) {
        console.error("🚨 Erreur GenAI:", error.message);
        throw new Error("Erreur lors de l'analyse du document.");
    }
}

/**
 * Chat avec un document existant
 */
async function chatWithDocument(filePath, mimeType, question, history = []) {
    console.log(`[ChatDoc] Question sur : ${path.basename(filePath)}`);

    try {
        if (!fs.existsSync(filePath)) {
            throw new Error("Le fichier source n'est plus disponible sur le serveur.");
        }

        const model = genAI.getGenerativeModel({ model: modelName });

        const fileBuffer = fs.readFileSync(filePath);
        const fileBase64 = fileBuffer.toString('base64');

        // Détection de la langue de la question
        const targetLang = isArabic(question) ? "ARABE" : "FRANÇAIS";

        // Construction de l'historique
        let promptHistory = "";
        if (history && history.length > 0) {
            promptHistory = "Historique de la conversation :\n" + history.map(msg =>
                `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'} : ${msg.content}`
            ).join("\n") + "\n\n";
        }

        // PROMPT RENFORCÉ POUR LE CHAT
        const prompt = `
Rôle : Tu es un assistant juridique expert.
Contexte : L'utilisateur te pose une question sur le document PDF ci-joint.

Historique :
${promptHistory}

Nouvelle Question : "${question}"

RÈGLES ABSOLUES :
1. Langue de réponse OBLIGATOIRE : ${targetLang}.
2. FORMATAGE : Utilise le MARKDOWN pour structurer ta réponse.
   - Utilise des **titres** (## ou ###) pour séparer les sections.
   - Utilise des **listes à puces** (-) pour énumérer les points.
   - Mets en **gras** les termes clés ou numéros d'articles.
   - IMPORTANT : Pour les textes de loi, insère DEUX SAUTS DE LIGNE (\n\n) avant chaque nouvel Article (Art. X, Article 1...).
   - Interdit de faire un bloc compact. Aère le texte au maximum.
3. Si le document est en Français et la question en Arabe -> TRADUIS ta réponse en Arabe.
4. Réponds directement à la question en utilisant le contenu du PDF.
5. Si la réponse n'est pas dans le document, dis le clairement.
        `;

        const imageParts = [{
            inlineData: { data: fileBase64, mimeType: mimeType }
        }];

        console.log(`📤 Envoi à Gemini (Chat ${targetLang})...`);
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("🚨 Erreur Chat Document:", error.message);
        throw new Error("Impossible de discuter avec ce document.");
    }
}

module.exports = { analyzeDocument, chatWithDocument };