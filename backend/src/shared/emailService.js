const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- TEMPLATE HTML PROFESSIONNEL ---
const getHtmlTemplate = (title, bodyContent, actionLink = null, actionText = null) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px; }
            .content { padding: 40px; color: #334155; line-height: 1.7; font-size: 16px; }
            .h-title { color: #2563eb; font-size: 22px; margin-top: 0; margin-bottom: 20px; font-weight: 600; }
            .btn-container { text-align: center; margin: 30px 0; }
            .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2); transition: background-color 0.3s; }
            .btn:hover { background-color: #1d4ed8; }
            .code-box { background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            .footer a { color: #2563eb; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Dz Legal AI</h1> 
            </div>
            <div class="content">
                <h2 class="h-title">${title}</h2>
                <div>${bodyContent}</div>
                
                ${actionLink ? `<div class="btn-container"><a href="${actionLink}" class="btn">${actionText || 'Accéder'}</a></div>` : ''}
                
                ${actionLink ? `<p style="margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">Si le bouton ne fonctionne pas, copiez ce lien : <br> <span style="word-break: break-all;">${actionLink}</span></p>` : ''}
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Dz Legal AI. L'Assistant Juridique Intelligent.<br>
                Ceci est un message automatique, merci de ne pas y répondre.
            </div>
        </div>
    </body>
    </html>
    `;
};

// Fonction de base (interne)
const sendBaseEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Dz Legal AI" <${process.env.EMAIL_FROM || 'no-reply@dzlegal.ai'}>`,
      to, subject, text, html
    });
    console.log("📧 Email envoyé à %s : %s", to, info.messageId);
    return info;
  } catch (error) {
    console.error("🚨 Erreur envoi email :", error);
    // On ne throw pas l'erreur pour ne pas bloquer l'app si le mail échoue
  }
};

// --- FONCTIONS EXPORTÉES (API PROPRE) ---

const sendVerificationEmail = async (email, token) => {
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const html = getHtmlTemplate(
        "Bienvenue sur Dz Legal AI",
        "<p>Merci de rejoindre la première plateforme d'intelligence juridique en Algérie. Pour activer votre compte et sécuriser vos accès, veuillez confirmer votre adresse email.</p>",
        link,
        "Activer mon compte"
    );
    await sendBaseEmail(email, "Activation de votre compte - Dz Legal AI", `Lien: ${link}`, html);
};

const send2FACode = async (email, code) => {
    const html = getHtmlTemplate(
        "Code de vérification",
        `<p>Une tentative de connexion a été détectée sur votre compte.</p>
         <p>Voici votre code de sécurité unique :</p>
         <div class="code-box">${code}</div>
         <p>Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`
    );
    await sendBaseEmail(email, `Votre code : ${code}`, `Code: ${code}`, html);
};

const sendResetPasswordEmail = async (email, token) => {
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = getHtmlTemplate(
        "Réinitialisation du mot de passe",
        "<p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en définir un nouveau.</p>",
        link,
        "Changer mon mot de passe"
    );
    await sendBaseEmail(email, "Récupération de mot de passe", `Lien: ${link}`, html);
};

const sendInvitationEmail = async (email, token) => {
    const link = `${process.env.FRONTEND_URL}/register?invite=${token}`;
    const html = getHtmlTemplate(
        "Invitation à rejoindre un Groupe",
        "<p>Vous avez été invité à collaborer sur l'espace de travail d'un cabinet juridique sur Dz Legal AI.</p><p>Créez votre compte dès maintenant pour accéder aux dossiers partagés.</p>",
        link,
        "Rejoindre l'équipe"
    );
    await sendBaseEmail(email, "Invitation - Dz Legal AI", `Lien: ${link}`, html);
};

// Export pour compatibilité si 'sendEmail' est utilisé ailleurs
const sendEmail = sendBaseEmail; 

module.exports = { 
    sendEmail, 
    sendVerificationEmail, 
    send2FACode, 
    sendResetPasswordEmail, 
    sendInvitationEmail 
};