// backend/check-models.js
const axios = require('axios');
const path = require('path');
require('dotenv').config(); // Charge votre .env

const API_KEY = process.env.GOOGLE_API_KEY;

async function listModels() {
    console.log("🔍 Interrogation de Google pour connaître les modèles valides...");
    
    if (!API_KEY) {
        console.error("❌ Erreur : Pas de GOOGLE_API_KEY dans le fichier .env");
        return;
    }

    try {
        // On interroge l'API standard pour lister les modèles
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await axios.get(url);
        
        console.log("\n✅ MODÈLES DISPONIBLES POUR VOTRE CLÉ :");
        console.log("---------------------------------------");
        
        const models = response.data.models || [];
        const geminiModels = models.filter(m => m.name.includes('gemini'));
        
        if (geminiModels.length === 0) {
            console.log("⚠️ Aucun modèle Gemini trouvé. Votre clé API est peut-être restreinte.");
        } else {
            geminiModels.forEach(m => {
                // On affiche le nom exact qu'il faut utiliser dans le code
                console.log(`👉 ${m.name.replace('models/', '')}`); 
                console.log(`   (Supporte: ${m.supportedGenerationMethods.join(', ')})`);
                console.log("-");
            });
        }

    } catch (error) {
        console.error("\n❌ ERREUR :");
        console.error(error.response ? error.response.data : error.message);
    }
}

listModels();