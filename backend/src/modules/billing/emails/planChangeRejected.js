/**
 * Template email : Demande de changement de plan rejetée
 * Envoyé à l'utilisateur quand l'admin rejette la demande
 */

const nodemailer = require('nodemailer');
const { PAYMENT_INFO } = require('../config/pricing');

// Configuration du transporteur
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Envoyer l'email de demande rejetée
 * @param {string} userEmail - Email du destinataire
 * @param {object} data - Données de la demande
 */
async function sendPlanChangeRejectedEmail(userEmail, data) {
    const { fullName, adminNotes, requestId } = data;

    // HTML du mail
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Informations requises - Demande de plan</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #DC2626;
            margin: 0;
            font-size: 24px;
        }
        .warning-badge {
            background: #FEF2F2;
            border: 2px solid #DC2626;
            color: #991B1B;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .warning-badge .icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .warning-badge h2 {
            margin: 10px 0;
            color: #DC2626;
        }
        .content {
            margin-top: 20px;
        }
        .reason-box {
            background: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .reason-box h3 {
            color: #92400E;
            margin-top: 0;
        }
        .reason-box p {
            color: #78350F;
            font-size: 15px;
        }
        .help-box {
            background: #EFF6FF;
            border: 2px solid #3B82F6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .help-box h3 {
            color: #1E40AF;
            margin-top: 0;
        }
        .help-box ul {
            color: #1E3A8A;
            padding-left: 20px;
        }
        .help-box ul li {
            margin: 8px 0;
        }
        .cta-button {
            display: inline-block;
            background: #4F46E5;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 15px 0;
            font-weight: bold;
        }
        .contact-box {
            background: #F9FAFB;
            border: 1px solid #D1D5DB;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .contact-box h3 {
            color: #374151;
            margin-top: 0;
        }
        .contact-info {
            font-size: 16px;
            color: #4F46E5;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="warning-badge">
            <div class="icon">⚠️</div>
            <h2>Informations requises</h2>
            <p style="font-size: 14px; margin: 5px 0;">Concernant votre demande de changement de plan</p>
        </div>
        
        <div class="content">
            <p>Bonjour <strong>${fullName}</strong>,</p>
            
            <p>Nous avons examiné votre demande de changement de plan, mais malheureusement nous ne pouvons pas la valider pour le moment.</p>
            
            <div class="reason-box">
                <h3>📋 Raison du refus</h3>
                <p><strong>${adminNotes}</strong></p>
            </div>
            
            <div class="help-box">
                <h3>🔧 Comment résoudre ce problème ?</h3>
                <p>Pour que nous puissions traiter votre demande, veuillez :</p>
                <ul>
                    <li>Vérifier que votre justificatif de paiement est bien lisible</li>
                    <li>Vous assurer que le montant correspond à celui indiqué</li>
                    <li>Vérifier que votre nom et le numéro de demande apparaissent sur le justificatif</li>
                    <li>Si nécessaire, effectuer à nouveau le paiement avec les bonnes informations</li>
                </ul>
            </div>
            
            <p>Vous pouvez :</p>
            <ol>
                <li>Nous renvoyer un justificatif corrigé/complété par email</li>
                <li>Créer une nouvelle demande de changement de plan depuis votre tableau de bord</li>
                <li>Nous contacter pour obtenir de l'aide</li>
            </ol>
            
            <div class="contact-box">
                <h3>💬 Besoin d'aide ?</h3>
                <p>Notre équipe est là pour vous aider !</p>
                <p class="contact-info">
                    📧 ${PAYMENT_INFO.adminEmail}<br>
                    📞 ${PAYMENT_INFO.office.phone}
                </p>
                <p style="font-size: 12px; color: #6B7280; margin-top: 10px;">
                    Horaires : ${PAYMENT_INFO.office.hours}
                </p>
            </div>
            
            <p style="margin-top: 30px;">Nous restons à votre entière disposition pour toute question ou clarification.</p>
            
            <p>Cordialement,<br>
            <strong>L'équipe Dz-Legal-AI</strong></p>
        </div>
        
        <div class="footer">
            <p>Demande #${requestId || 'N/A'}</p>
            <p>© 2026 Dz-Legal-AI - Assistant intelligent pour le droit algérien</p>
            <p>Cité Issad Abbas N°194, El Alia, Oued Smar 16059, Alger</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    // Version texte brut
    const textContent = `
⚠️ INFORMATIONS REQUISES - Demande de changement de plan

Bonjour ${fullName},

Nous avons examiné votre demande de changement de plan, mais malheureusement nous ne pouvons pas la valider pour le moment.

RAISON DU REFUS :
${adminNotes}

COMMENT RÉSOUDRE CE PROBLÈME ?

Pour que nous puissions traiter votre demande, veuillez :

1. Vérifier que votre justificatif de paiement est bien lisible
2. Vous assurer que le montant correspond à celui indiqué
3. Vérifier que votre nom et le numéro de demande apparaissent sur le justificatif
4. Si nécessaire, effectuer à nouveau le paiement avec les bonnes informations

VOUS POUVEZ :
- Nous renvoyer un justificatif corrigé/complété par email
- Créer une nouvelle demande depuis votre tableau de bord
- Nous contacter pour obtenir de l'aide

BESOIN D'AIDE ?
Email : ${PAYMENT_INFO.adminEmail}
Téléphone : ${PAYMENT_INFO.office.phone}
Horaires : ${PAYMENT_INFO.office.hours}

Nous restons à votre entière disposition.

Cordialement,
L'équipe Dz-Legal-AI

---
Demande #${requestId || 'N/A'}
    `.trim();

    // Options du mail
    const mailOptions = {
        from: `"Dz-Legal-AI" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: '⚠️ Action requise - Demande de changement de plan',
        text: textContent,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email rejet envoyé à ${userEmail} (Message ID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Erreur envoi email rejet:', error);
        throw error;
    }
}

module.exports = { sendPlanChangeRejectedEmail };
