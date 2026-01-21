/**
 * Template email : Demande de changement de plan créée
 * Envoyé à l'utilisateur avec les instructions de paiement
 */

const nodemailer = require('nodemailer');
const { PAYMENT_INFO } = require('../config/pricing');

// Configuration du transporteur (utilise la même config que les autres emails)
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
 * Envoyer l'email de demande créée avec instructions de paiement
 * @param {string} userEmail - Email du destinataire
 * @param {object} data - Données de la demande
 */
async function sendPlanChangeRequestEmail(userEmail, data) {
    const { fullName, currentPlan, requestedPlan, amount, paymentMethod, changeType, requestId } = data;

    // Labels des plans en français
    const planLabels = {
        free: 'Gratuit',
        basic: 'Basic',
        premium: 'Premium',
        pro: 'Pro'
    };

    const currentPlanLabel = planLabels[currentPlan] || currentPlan;
    const requestedPlanLabel = planLabels[requestedPlan] || requestedPlan;

    // HTML du mail
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demande de changement de plan</title>
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
            border-bottom: 3px solid #4F46E5;
        }
        .header h1 {
            color: #4F46E5;
            margin: 0;
            font-size: 24px;
        }
        .content {
            margin-top: 20px;
        }
        .summary-box {
            background: #F3F4F6;
            border-left: 4px solid #4F46E5;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .summary-box h3 {
            margin-top: 0;
            color: #4F46E5;
        }
        .plan-change {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            padding: 15px;
            background: #EEF2FF;
            border-radius: 8px;
            margin: 15px 0;
        }
        .plan-from {
            color: #6B7280;
        }
        .plan-to {
            color: #10B981;
        }
        .arrow {
            color: #4F46E5;
            font-size: 24px;
            margin: 0 10px;
        }
        .payment-section {
            background: #FEF3C7;
            border: 2px solid #F59E0B;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .payment-section h2 {
            color: #D97706;
            margin-top: 0;
        }
        .payment-option {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 3px solid #4F46E5;
        }
        .payment-option h4 {
            margin-top: 0;
            color: #4F46E5;
        }
        .payment-option p {
            margin: 5px 0;
            font-size: 14px;
        }
        .important-notice {
            background: #FEE2E2;
            border: 2px solid #EF4444;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .important-notice strong {
            color: #DC2626;
            font-size: 16px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            background: #4F46E5;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 15px 0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Demande de changement de plan</h1>
        </div>
        
        <div class="content">
            <p>Bonjour <strong>${fullName}</strong>,</p>
            
            <p>Votre demande de ${changeType === 'upgrade' ? 'mise à niveau' : 'changement'} de plan a bien été enregistrée.</p>
            
            <div class="plan-change">
                <span class="plan-from">${currentPlanLabel}</span>
                <span class="arrow">→</span>
                <span class="plan-to">${requestedPlanLabel}</span>
            </div>
            
            <div class="summary-box">
                <h3>📊 Récapitulatif de votre demande</h3>
                <p><strong>Plan actuel :</strong> ${currentPlanLabel}</p>
                <p><strong>Nouveau plan :</strong> ${requestedPlanLabel}</p>
                <p><strong>Montant à régler :</strong> <span style="font-size: 20px; color: #10B981;">${amount.toLocaleString('fr-FR')} DZD</span></p>
                ${paymentMethod ? `<p><strong>Méthode choisie :</strong> ${paymentMethod}</p>` : ''}
                <p><strong>Numéro de demande :</strong> #${requestId}</p>
            </div>
            
            ${amount > 0 ? `
            <div class="payment-section">
                <h2>💳 Options de Paiement</h2>
                <p>Choisissez la méthode de paiement qui vous convient le mieux :</p>
                
                <div class="payment-option">
                    <h4>1. 🏦 Virement Bancaire</h4>
                    <p><strong>Banque :</strong> ${PAYMENT_INFO.bank.name}</p>
                    <p><strong>RIB :</strong> ${PAYMENT_INFO.bank.rib}</p>
                    <p><strong>Bénéficiaire :</strong> ${PAYMENT_INFO.bank.accountHolder}</p>
                    <p><strong>Montant :</strong> ${amount.toLocaleString('fr-FR')} DZD</p>
                    <p style="color: #6B7280; font-size: 12px;">N'oubliez pas de mentionner votre nom et le numéro de demande #${requestId} dans le motif</p>
                </div>
                
                <div class="payment-option">
                    <h4>2. 🏧 Versement CPA</h4>
                    <p>Rendez-vous dans l'agence CPA la plus proche avec <strong>${amount.toLocaleString('fr-FR')} DZD</strong></p>
                    <p><a href="https://www.cpa-bank.dz/agences" target="_blank" style="color: #4F46E5;">📍 Trouver une agence CPA</a></p>
                </div>
                
                <div class="payment-option">
                    <h4>3. 💵 Espèces</h4>
                    <p><strong>Adresse :</strong> ${PAYMENT_INFO.office.address}</p>
                    <p><strong>Horaires :</strong> ${PAYMENT_INFO.office.hours}</p>
                    <p><strong>Téléphone :</strong> ${PAYMENT_INFO.office.phone}</p>
                </div>
                
                <div class="payment-option">
                    <h4>4. 📝 Chèque Bancaire</h4>
                    <p><strong>Ordre :</strong> ${PAYMENT_INFO.bank.accountHolder}</p>
                    <p><strong>Adresse :</strong> ${PAYMENT_INFO.office.address}</p>
                    <p>Merci de mentionner le numéro de demande #${requestId} au dos du chèque</p>
                </div>
            </div>
            
            <div class="important-notice">
                <p>⚠️ <strong>IMPORTANT</strong></p>
                <p>Après avoir effectué le paiement, envoyez votre justificatif (photo ou scan) à :</p>
                <p><strong style="font-size: 18px;">${PAYMENT_INFO.adminEmail}</strong></p>
                <p style="font-size: 12px; margin-top: 10px;">Mentionnez votre numéro de demande #${requestId} dans l'email</p>
            </div>
            
            <p style="text-align: center; color: #6B7280; margin-top: 20px;">
                <strong>Délai d'activation :</strong> ${PAYMENT_INFO.activationDelay} après vérification de votre paiement
            </p>
            ` : `
            <div style="background: #D1FAE5; border: 2px solid #10B981; border-radius: 8px; padding: 15px; text-align: center;">
                <p style="color: #065F46; font-size: 16px;">
                    ✅ <strong>Aucun paiement requis</strong> pour ce changement de plan.<br>
                    Votre demande sera traitée sous ${PAYMENT_INFO.activationDelay}.
                </p>
            </div>
            `}
            
            <p style="margin-top: 30px;">Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:${PAYMENT_INFO.adminEmail}" style="color: #4F46E5;">${PAYMENT_INFO.adminEmail}</a></p>
            
            <p>Cordialement,<br>
            <strong>L'équipe Dz-Legal-AI</strong></p>
        </div>
        
        <div class="footer">
            <p>© 2026 Dz-Legal-AI - Assistant intelligent pour le droit algérien</p>
            <p>Cité Issad Abbas N°194, El Alia, Oued Smar 16059, Alger</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    // Version texte brut (fallback)
    const textContent = `
Demande de changement de plan

Bonjour ${fullName},

Votre demande de ${changeType === 'upgrade' ? 'mise à niveau' : 'changement'} de plan a bien été enregistrée.

RÉCAPITULATIF :
- Plan actuel : ${currentPlanLabel}
- Nouveau plan : ${requestedPlanLabel}
- Montant à régler : ${amount.toLocaleString('fr-FR')} DZD
- Numéro de demande : #${requestId}

${amount > 0 ? `
OPTIONS DE PAIEMENT :

1. Virement bancaire
   Banque : ${PAYMENT_INFO.bank.name}
   RIB : ${PAYMENT_INFO.bank.rib}
   Bénéficiaire : ${PAYMENT_INFO.bank.accountHolder}

2. Versement CPA
   Rendez-vous dans une agence CPA avec ${amount.toLocaleString('fr-FR')} DZD

3. Espèces
   Adresse : ${PAYMENT_INFO.office.address}
   Horaires : ${PAYMENT_INFO.office.hours}

4. Chèque bancaire
   Ordre : ${PAYMENT_INFO.bank.accountHolder}
   Adresse : ${PAYMENT_INFO.office.address}

IMPORTANT :
Après paiement, envoyez votre justificatif à : ${PAYMENT_INFO.adminEmail}
Mentionnez le numéro de demande #${requestId}

Délai d'activation : ${PAYMENT_INFO.activationDelay}
` : `
✅ Aucun paiement requis pour ce changement.
Votre demande sera traitée sous ${PAYMENT_INFO.activationDelay}.
`}

Questions ? Contactez-nous : ${PAYMENT_INFO.adminEmail}

Cordialement,
L'équipe Dz-Legal-AI
    `.trim();

    // Options du mail
    const mailOptions = {
        from: `"Dz-Legal-AI" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `📋 Demande de changement de plan - ${currentPlanLabel} → ${requestedPlanLabel}`,
        text: textContent,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email demande créée envoyé à ${userEmail} (Message ID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Erreur envoi email demande créée:', error);
        throw error;
    }
}

module.exports = { sendPlanChangeRequestEmail };
