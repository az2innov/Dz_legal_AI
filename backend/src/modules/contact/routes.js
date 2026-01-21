const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configuration du transporteur email
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true' || false,
        auth: {
            user: process.env.EMAIL_USER || process.env.SMTP_USER,
            pass: process.env.EMAIL_PASS || process.env.SMTP_PASSWORD
        }
    });
};

// POST /api/contact/sales - Formulaire de contact commercial
router.post('/sales', async (req, res) => {
    try {
        const { name, email, company, phone, message } = req.body;

        // Validation
        if (!name || !email || !company || !phone || !message) {
            return res.status(400).json({
                error: 'Tous les champs sont requis'
            });
        }

        const transporter = createTransporter();

        // Email à l'équipe commerciale
        const salesEmailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER,
            to: 'contact@dz-legal-ai.com',
            subject: `Nouvelle demande commerciale - ${company}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">Nouvelle Demande Commerciale</h1>
                        <p style="color: #f0f0f0; margin: 10px 0 0 0;">Plan Organisation</p>
                    </div>
                    
                    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h2 style="color: #333; margin-top: 0;">Informations du contact</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #666;">Nom :</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #333;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #666;">Email :</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #666;">Entreprise :</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #333;">${company}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; font-weight: bold; color: #666;">Téléphone :</td>
                                    <td style="padding: 10px;"><a href="tel:${phone}" style="color: #667eea; text-decoration: none;">${phone}</a></td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px;">
                            <h2 style="color: #333; margin-top: 0;">Message</h2>
                            <div style="color: #555; line-height: 1.6; white-space: pre-wrap;">${message}</div>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; text-align: center;">
                            <p style="margin: 0; color: #666; font-size: 14px;">
                                Répondre rapidement pour convertir cette opportunité !
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} DZ Legal AI - Plateforme d'assistant juridique intelligent</p>
                    </div>
                </div>
            `
        };

        // Email de confirmation au demandeur
        const confirmationEmailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER,
            to: email,
            subject: 'Nous avons bien reçu votre demande - DZ Legal AI',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">Merci pour votre intérêt !</h1>
                    </div>
                    
                    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                        <div style="background: white; padding: 25px; border-radius: 8px;">
                            <p style="color: #333; font-size: 16px; line-height: 1.6;">Bonjour <strong>${name}</strong>,</p>
                            
                            <p style="color: #555; line-height: 1.6;">
                                Nous avons bien reçu votre demande concernant notre plan <strong>Organisation</strong>.
                            </p>
                            
                            <div style="background: #f3f4f6; padding: 15px; border-left: 4px solid #667eea; border-radius: 4px; margin: 20px 0;">
                                <p style="margin: 0; color: #666; font-size: 14px;">
                                    <strong>Entreprise :</strong> ${company}<br>
                                    <strong>Email :</strong> ${email}<br>
                                    <strong>Téléphone :</strong> ${phone}
                                </p>
                            </div>
                            
                            <p style="color: #555; line-height: 1.6;">
                                Notre équipe commerciale va étudier votre demande et vous contacter dans les <strong>24 heures</strong> pour discuter de vos besoins spécifiques.
                            </p>
                            
                            <p style="color: #555; line-height: 1.6;">
                                En attendant, n'hésitez pas à explorer notre plateforme et à consulter notre documentation.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://dz-legal-ai.com" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                    Visiter notre site
                                </a>
                            </div>
                            
                            <p style="color: #555; line-height: 1.6;">
                                Cordialement,<br>
                                <strong>L'équipe DZ Legal AI</strong>
                            </p>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; color: #856404; font-size: 14px;">
                                📧 Pour toute question urgente : <a href="mailto:contact@dz-legal-ai.com" style="color: #667eea;">contact@dz-legal-ai.com</a>
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} DZ Legal AI - Plateforme d'assistant juridique intelligent</p>
                        <p style="margin: 5px 0;">
                            <a href="https://dz-legal-ai.com" style="color: #667eea; text-decoration: none;">Site web</a> | 
                            <a href="https://dz-legal-ai.com/pricing" style="color: #667eea; text-decoration: none;">Tarifs</a> | 
                            <a href="https://dz-legal-ai.com/faq" style="color: #667eea; text-decoration: none;">FAQ</a>
                        </p>
                    </div>
                </div>
            `
        };

        // Envoi de l'email à l'équipe commerciale
        let salesEmailSent = false;
        let confirmationEmailSent = false;

        try {
            await transporter.sendMail(salesEmailOptions);
            salesEmailSent = true;
            console.log(`[Contact Sales] ✅ Email envoyé à l'équipe commerciale`);
        } catch (emailError) {
            console.error('[Contact Sales] ❌ Erreur envoi email équipe:', emailError.message);
        }

        // Délai de 2 secondes
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoi de l'email de confirmation au demandeur
        try {
            await transporter.sendMail(confirmationEmailOptions);
            confirmationEmailSent = true;
            console.log(`[Contact Sales] ✅ Email de confirmation envoyé à ${email}`);
        } catch (emailError) {
            console.error('[Contact Sales] ❌ Erreur envoi confirmation:', emailError.message);
        }

        console.log(`[Contact Sales] Demande de ${name} (${company}) - Sales: ${salesEmailSent}, Confirmation: ${confirmationEmailSent}`);

        res.json({
            success: true,
            message: 'Votre demande a été envoyée avec succès'
        });

    } catch (error) {
        console.error('[Contact Sales] Erreur:', error);
        res.status(500).json({
            error: 'Erreur lors de l\'envoi du message'
        });
    }
});

// POST /api/contact/support - Formulaire de contact support (FAQ)
router.post('/support', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                error: 'Tous les champs sont requis'
            });
        }

        const transporter = createTransporter();

        // Email à l'équipe support
        const supportEmailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER,
            to: 'support@dz-legal-ai.com',
            subject: `[Support] ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">Nouvelle Demande de Support</h1>
                        <p style="color: #f0f0f0; margin: 10px 0 0 0;">FAQ / Support général</p>
                    </div>
                    
                    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h2 style="color: #333; margin-top: 0;">Informations de contact</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #666;">Nom :</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #333;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #666;">Email :</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${email}" style="color: #22c55e; text-decoration: none;">${email}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; font-weight: bold; color: #666;">Sujet :</td>
                                    <td style="padding: 10px; color: #333;">${subject}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px;">
                            <h2 style="color: #333; margin-top: 0;">Message</h2>
                            <div style="color: #555; line-height: 1.6; white-space: pre-wrap;">${message}</div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} DZ Legal AI</p>
                    </div>
                </div>
            `
        };

        // Email de confirmation
        const confirmationEmailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER,
            to: email,
            subject: 'Votre message a bien été reçu - DZ Legal AI',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">Merci de nous avoir contactés !</h1>
                    </div>
                    
                    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                        <div style="background: white; padding: 25px; border-radius: 8px;">
                            <p style="color: #333; font-size: 16px; line-height: 1.6;">Bonjour <strong>${name}</strong>,</p>
                            
                            <p style="color: #555; line-height: 1.6;">
                                Nous avons bien reçu votre message concernant : <strong>${subject}</strong>
                            </p>
                            
                            <div style="background: #f3f4f6; padding: 15px; border-left: 4px solid #22c55e; border-radius: 4px; margin: 20px 0;">
                                <p style="margin: 0; color: #666; font-size: 14px;">
                                    Notre équipe support va traiter votre demande et vous répondra dans les meilleurs délais.
                                </p>
                            </div>
                            
                            <p style="color: #555; line-height: 1.6;">
                                En attendant, vous pouvez consulter notre <a href="https://dz-legal-ai.com/faq" style="color: #22c55e; text-decoration: none;">FAQ</a> pour trouver des réponses rapides à vos questions.
                            </p>
                            
                            <p style="color: #555; line-height: 1.6;">
                                Cordialement,<br>
                                <strong>L'équipe DZ Legal AI</strong>
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} DZ Legal AI</p>
                    </div>
                </div>
            `
        };

        // Envoi de l'email à l'équipe support
        let supportEmailSent = false;
        let confirmationEmailSent = false;

        try {
            await transporter.sendMail(supportEmailOptions);
            supportEmailSent = true;
            console.log(`[Contact Support] ✅ Email envoyé à l'équipe support`);
        } catch (emailError) {
            console.error('[Contact Support] ❌ Erreur envoi email équipe:', emailError.message);
        }

        // Délai de 2 secondes
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoi de l'email de confirmation au demandeur
        try {
            await transporter.sendMail(confirmationEmailOptions);
            confirmationEmailSent = true;
            console.log(`[Contact Support] ✅ Email de confirmation envoyé à ${email}`);
        } catch (emailError) {
            console.error('[Contact Support] ❌ Erreur envoi confirmation:', emailError.message);
        }

        console.log(`[Contact Support] Message de ${name} - Support: ${supportEmailSent}, Confirmation: ${confirmationEmailSent}`);

        res.json({
            success: true,
            message: 'Votre message a été envoyé avec succès'
        });

    } catch (error) {
        console.error('[Contact Support] Erreur:', error);
        res.status(500).json({
            error: 'Erreur lors de l\'envoi du message'
        });
    }
});

module.exports = router;
