require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

async function downloadQR() {
    const WAHA_URL = process.env.WAHA_URL || 'https://aha-whatsapp-algerie.onrender.com';
    const WAHA_API_KEY = process.env.WAHA_API_KEY;
    const WAHA_SESSION = 'default';

    console.log("--- 📸 Téléchargement du QR Code WhatsApp ---");

    try {
        const response = await axios.get(`${WAHA_URL}/api/${WAHA_SESSION}/auth/qr`, {
            headers: { 'X-Api-Key': WAHA_API_KEY },
            responseType: 'arraybuffer'
        });

        const path = './whatsapp_qr.png';
        fs.writeFileSync(path, response.data);
        console.log(`\n✅ SUCCÈS : QR Code enregistré dans : ${path}`);
    } catch (error) {
        console.error("\n❌ Erreur :", error.response?.data?.message || error.message);
        if (error.response?.status === 404) {
            console.log("Le QR Code n'est peut-être pas encore généré. Réessayez dans 10 secondes.");
        }
    }
}

downloadQR();
