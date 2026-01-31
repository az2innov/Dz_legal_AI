const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const fs = require('fs');

const debugFile = path.resolve(__dirname, '../../../../debug_rag.txt');

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

// Configuration
// Using Google AI Studio (API Key) instead of Vertex AI (IAM)
// This solves the persistent 404/IAM block on the Cloud Project.

async function getSearchAnchors(query, isArabic) {
    try {
        if (!process.env.GOOGLE_API_KEY) {
            logToDebug("INTENT SERVICE ERROR", "Missing GOOGLE_API_KEY env var");
            return null;
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

        // "gemini-flash-latest" is the evergreen alias.
        // We allow override via .env for future-proofing (e.g., pinning to "gemini-2.0-flash").
        const MODEL_ID = process.env.GOOGLE_MODEL_NAME || 'gemini-flash-latest';

        const model = genAI.getGenerativeModel({
            model: MODEL_ID,
            generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        });

        const systemInstruction = isArabic
            ? `You are an expert Algerian Legal Keyword Extractor.
Task: Analyze the user's question and identify the specific Algerian Law Code or Legal Text that governs this topic.
Rules:
1. PRIORITIZE specific Laws/Ordinances over the Constitution.
2. FOR NATIONALITY: Always use "الأمر 70-86" (Code de la Nationalité). IGNORE "Constitution" or "Presidency" eligibility rules unless explicitly asked.
3. OUTPUT: JSON only.

Output Format:
{
  "targetCode": "Name of the Law + Number",
  "keywords": "3-5 technical keywords (Arabic)",
  "intent": "Category"
}

Example 1 (Nationalité):
User: "كيف أحصل على الجنسية؟"
Output: { "targetCode": "قانون الجنسية (الأمر 70-86)", "keywords": "اكتساب الجنسية التجنس الزواج الولادة الإقامة", "intent": "Nationality" }

Example 2 (General):
User: "شروط الطلاق"
Output: { "targetCode": "قانون الأسرة 84-11", "keywords": "الخلع الطلاق بالتراضي النشوز", "intent": "Family" }`
            : `You are an expert Algerian Legal Keyword Extractor.
Task: Analyze the user's question and identify the specific Algerian Law Code or Legal Text that governs this topic.
Rules:
1. PRIORITIZE specific Laws/Ordinances over the Constitution.
2. FOR NATIONALITY: Always use "Ordonnance 70-86" (Code de la Nationalité). IGNORE "Constitution" or "Presidency" eligibility rules unless explicitly asked.
3. OUTPUT: JSON only.

Output Format:
{
  "targetCode": "Name of the Law + Number",
  "keywords": "3-5 technical keywords (French)",
  "intent": "Category"
}

Example 1 (Nationalité):
User: "Comment avoir la nationalité ?"
Output: { "targetCode": "Code de la Nationalité (Ordonnance 70-86)", "keywords": "Acquisition Naturalisation Mariage Filiation Résidence", "intent": "Nationality" }

Example 2 (General):
User: "Comment divorcer ?"
Output: { "targetCode": "Code de la Famille 84-11", "keywords": "Divorce Khoul procédure conciliation", "intent": "Family" }`;

        // Note: GoogleGenerativeAI puts system instruction in the model config or prompt.
        // For 'gemini-1.5' family, systemInstruction is supported in getGenerativeModel,
        // but here we are using a simplified flow.
        // We will prepend it to the user prompt if systemInstruction config isn't behaving,
        // BUT the proper way is to init the model with systemInstruction.

        // Re-initializing model with instruction for correctness
        const modelWithInstruction = genAI.getGenerativeModel({
            model: MODEL_ID,
            systemInstruction: systemInstruction,
            generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        });

        logToDebug("INTENT REQUEST (API-KEY)", { model: MODEL_ID, query, isArabic });

        const result = await modelWithInstruction.generateContent(query);
        const response = await result.response;
        let content = response.text();

        if (!content) {
            logToDebug("INTENT SERVICE NULL RESPONSE", response);
            return null;
        }

        // Cleanup markdown if present (e.g. ```json ... ```)
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        logToDebug("INTENT SERVICE SUCCESS", content);

        return JSON.parse(content);

    } catch (error) {
        logToDebug("INTENT SERVICE ERROR EXCEPTION", error.message);
        console.error("⚠️ Intent Service Error:", error.message);
        // Fallback or retry could happen here, but for now we return null
        return null;
    }
}

module.exports = { getSearchAnchors };
