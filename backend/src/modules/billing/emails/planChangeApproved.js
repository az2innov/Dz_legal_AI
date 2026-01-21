/**
 * Template email : Demande de changement de plan approuvée
 * Envoyé à l'utilisateur quand l'admin approuve la demande
 */

const nodemailer = require('nodemailer');

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
 * Envoyer l'email de demande approuvée
 * @param {string} userEmail - Email du destinataire
 * @param {object} data - Données de la demande
 */
async function sendPlanChangeApprovedEmail(userEmail, data) {
    const { fullName, requestedPlan, adminNotes, requestId } = data;

    // Labels des plans en français
    const planLabels = {
        free: 'Gratuit',
        basic: 'Basic',
        premium: 'Premium',
        pro: 'Pro'
    };

    const planLabel = planLabels[requestedPlan] || requestedPlan;

    // Décrire les avantages du plan
    const planFeatures = {
        free: ['5 conversations/mois', '2 documents/mois'],
        basic: ['50 conversations/mois', '20 documents/mois', 'Support par email'],
        premium: ['200 conversations/mois', '100 documents/mois', 'Support prioritaire', 'Historique illimité'],
        pro: ['Conversations illimitées', 'Documents illimités', 'Support VIP 24/7', 'API accès', 'Fonctionnalités avancées']
    };

    const features = planFeatures[requestedPlan] || [];

    // HTML du mail
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plan activé avec succès</title>
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
            color: #10B981;
            margin: 0;
            font-size: 28px;
        }
        .success-badge {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
        }
        .success-badge h2 {
            margin: 0;
            font-size: 32px;
        }
        .success-badge p {
            margin: 10px 0 0 0;
            font-size: 18px;
            opacity: 0.9;
        }
        .content {
            margin-top: 20px;
        }
        .features-box {
            background: #F0FDF4;
            border: 2px solid #10B981;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .features-box h3 {
            color: #065F46;
            margin-top: 0;
        }
        .features-list {
            list-style: none;
            padding: 0;
        }
        .features-list li {
            padding: 8px 0;
            padding-left: 30px;
            position: relative;
        }
        .features-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10B981;
            font-weight: bold;
            font-size: 20px;
        }
        .admin-note {
            background: #F3F4F6;
            border-left: 4px solid #6B7280;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .admin-note h4 {
            margin-top: 0;
            color: #374151;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
        }
        .cta-section {
            text-align: center;
            margin: 30px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 12px;
        }
        .celebration {
            text-align: center;
            font-size: 48px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="celebration">🎉</div>
        
        <div class="header">
            <h1>✅ Votre plan a été activé !</h1>
        </div>
        
        <div class="success-badge">
            <h2>Plan ${planLabel}</h2>
            <p>Maintenant actif sur votre compte</p>
        </div>
        
        <div class="content">
            <p>Bonjour <strong>${fullName}</strong>,</p>
            
            <p>Bonne nouvelle ! 🎊</p>
            
            <p>Votre paiement a été vérifié et votre plan a été mis à jour avec succès.</p>
            
            ${features.length > 0 ? `
            <div class="features-box">
                <h3>🚀 Vos nouveaux avantages</h3>
                <ul class="features-list">
                    ${features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${adminNotes ? `
            <div class="admin-note">
                <h4>📝 Note de l'équipe</h4>
                <p>${adminNotes}</p>
            </div>
            ` : ''}
            
            <div class="cta-section">
                <p style="font-size: 18px; margin-bottom: 10px;">Profitez dès maintenant de toutes vos fonctionnalités !</p>
                <a href="https://dz-legal-ai.com/dashboard" class="cta-button">
                    Accéder à mon tableau de bord →
                </a>
            </div>
            
            <p style="margin-top: 30px;">Vous pouvez dès à présent profiter de toutes les fonctionnalités de votre nouveau plan.</p>
            
            <p>Besoin d'aide ? N'hésitez pas à nous contacter à <a href="mailto:support@dz-legal-ai.com" style="color: #4F46E5;">support@dz-legal-ai.com</a></p>
            
            <p style="margin-top: 30px;">Merci pour votre confiance ! 🙏</p>
            
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
✅ VOTRE PLAN A ÉTÉ ACTIVÉ !

Bonjour ${fullName},

Bonne nouvelle ! 🎉

Votre paiement a été vérifié et votre plan ${planLabel} a été activé avec succès.

${features.length > 0 ? `
VOS NOUVEAUX AVANTAGES :
${features.map(f => `✓ ${f}`).join('\n')}
` : ''}

${adminNotes ? `
Note de l'équipe :
${adminNotes}
` : ''}

Connectez-vous dès maintenant à votre tableau de bord :
https://dz-legal-ai.com/dashboard

Besoin d'aide ? Contactez-nous : support@dz-legal-ai.com

Merci pour votre confiance !

Cordialement,
L'équipe Dz-Legal-AI

---
Demande #${requestId || 'N/A'}
    `.trim();

    // Options du mail
    const mailOptions = {
        from: `"Dz-Legal-AI" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `✅ Votre plan ${planLabel} a été activé !`,
        text: textContent,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email approbation envoyé à ${userEmail} (Message ID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Erreur envoi email approbation:', error);
        throw error;
    }
}

module.exports = { sendPlanChangeApprovedEmail };
