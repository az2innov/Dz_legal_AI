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
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
}

async function sendWhatsApp2FA(whatsappNumber, code) {
    try {
        console.log(`[WhatsApp Service] Attempting to send 2FA code to: ${whatsappNumber}`);

        if (!client) {
            console.warn("[WhatsApp Service] Twilio not configured. Falling back to console log.");
            console.log(`CODE DE TEST (WhatsApp Simulation) : ${code}`);
            return { success: true, simulated: true };
        }

        // Note : Pour WhatsApp, le numéro doit être au format E.164 (ex: +213560383640)
        // Et précédé de 'whatsapp:' dans l'appel Twilio
        const message = await client.messages.create({
            body: `Votre code de vérification Dz Legal AI est : ${code}. Ce code expire dans 10 minutes.`,
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
