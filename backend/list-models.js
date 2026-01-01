const { ModelServiceClient } = require('@google-cloud/aiplatform').v1;
const { GoogleAuth } = require('google-auth-library');
const path = require('path');

const PROJECT_ID = "459448636360"; // Votre ID
const KEY_PATH = path.join(__dirname, 'google-auth.json');

// Liste des régions probables à tester
const REGIONS_TO_TEST = ['us-central1', 'europe-west1', 'europe-west9', 'global'];

async function listModelsInRegion(location) {
    console.log(`\n🔎 Inspection de la région : ${location}...`);
    
    try {
        const client = new ModelServiceClient({
            apiEndpoint: `${location}-aiplatform.googleapis.com`,
            keyFilename: KEY_PATH
        });

        const parent = `projects/${PROJECT_ID}/locations/${location}`;
        
        // On demande la liste des "Publishers Models" (Gemini, etc.)
        // Note: L'API change parfois, on teste l'accès générique
        const [response] = await client.listPublishers({ parent });
        
        console.log(`✅ ACCÈS RÉUSSI à ${location} !`);
        console.log(`   (Cela signifie que cette région est active pour votre compte)`);
        return true;

    } catch (error) {
        // Si c'est une 404 ou une erreur DNS, la région est inaccessible
        // Si c'est une 403 (Permission), la clé est bonne mais pas les droits
        console.log(`❌ Echec sur ${location} : ${error.code || error.message.split(' ')[0]}`);
        return false;
    }
}

async function diagnose() {
    console.log("--- DIAGNOSTIC DES RÉGIONS VERTEX AI ---");
    
    // 1. Vérification de la clé JSON
    const fs = require('fs');
    const keyFile = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
    console.log(`🔑 Clé JSON chargée pour le projet : ${keyFile.project_id}`);
    
    if (keyFile.project_id !== PROJECT_ID) {
        console.error("🚨 ALERTE ROUGE : L'ID dans le fichier JSON ne correspond pas à 459448636360 !");
        console.error("   -> C'est la cause de l'erreur 404.");
        return;
    } else {
        console.log("✅ L'ID du projet correspond.");
    }

    console.log("\n--- Test des connexions ---");
    
    for (const region of REGIONS_TO_TEST) {
        await listModelsInRegion(region);
    }
}

diagnose();