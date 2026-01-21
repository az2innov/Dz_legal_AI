/**
 * WhatsApp Messaging Service
 * For marketing and prospection purposes, sending 2FA codes.
 */

const twilio = require('twilio');

// Configuration Twilio (assurez-vous que ces variables sont dans votre .env)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'; // Défaut sandbox

let client;
const fs = require('fs');
const path = require('path');
const debugFile = path.join(__dirname, '../../debug_twilio.txt');

try {
    if (accountSid && authToken) {
        client = twilio(accountSid, authToken);
        const msg = `\n[${new Date().toISOString()}] ✅ Twilio Init: SID=${accountSid.substring(0, 6)}... From=${fromWhatsApp}\n`;
        console.log(msg);
        try { fs.appendFileSync(debugFile, msg); } catch (e) { }
    } else {
        const msg = `\n[${new Date().toISOString()}] ⚠️ Twilio Missing Credentials\n`;
        console.warn(msg);
        try { fs.appendFileSync(debugFile, msg); } catch (e) { }
    }
} catch (err) {
    const msg = `\n[${new Date().toISOString()}] ❌ Twilio Error: ${err.message}\n`;
    console.error(msg);
    try { fs.appendFileSync(debugFile, msg); } catch (e) { }
}

async function sendWhatsApp2FA(whatsappNumber, code) {
    try {
        console.log(`[WhatsApp Service] Attempting to send 2FA code to: ${whatsappNumber}`);

        if (!client) {
            console.warn("⚠️ [WhatsApp Service] TWILIO CONFIG MISSING. Falling back to SIMULATION.");
            console.warn("   -> Make sure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are set in your .env or Environment Variables.");
            console.log(`   -> 🔢 CODE DE TEST (WhatsApp Simulation) : ${code}`);
            return { success: true, simulated: true };
        }

        // Note : Pour WhatsApp, le numéro doit être au format E.164 (ex: +213560383640)
        // Et précédé de 'whatsapp:' dans l'appel Twilio
        const message = await client.messages.create({
            body: `Votre code de vérification Dz Legal AI est : ${code}. Ce code expire dans 2 minutes.`,
            from: `whatsapp:${fromWhatsApp}`,
            to: `whatsapp:${whatsappNumber}`
        });

        console.log(`[WhatsApp Service] Message sent! SID: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error("Error sending WhatsApp message via Twilio:", error);
        throw new Error("Échec de l'envoi du message WhatsApp. Vérifiez la configuration.");
    }
}

module.exports = { sendWhatsApp2FA };
