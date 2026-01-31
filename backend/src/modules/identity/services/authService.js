const db = require('../../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// IMPORT DES NOUVELLES FONCTIONS EMAILS (Template Pro)
const { sendVerificationEmail, send2FACode, sendResetPasswordEmail } = require('../../../shared/emailService');
// Service WhatsApp : WAHA uniquement (remplace Twilio)
const { send2FACode: sendWhatsApp2FA, sendSimpleMessage: sendWhatsAppMessage } = require('../../../shared/whatsappServiceWAHA');


const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Note: sendWhatsApp2FA est maintenant importé directement depuis whatsappServiceWAHA
// Plus besoin de fonction wrapper - WAHA remplace complètement Twilio

// 1. Inscription
async function register(data) {
    const { email, password, fullName, professionCardId, isOrg, orgName, orgTaxId, orgAddress, whatsappNumber, inviteToken } = data;

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    // NORMALISATION WHATSAPP (Correction des 0 excessifs pour tous les pays)
    let cleanWhatsApp = (whatsappNumber || '').replace(/[^0-9+]/g, '');

    // Si format +XXX... on vérifie si le chiffre après l'indicatif est un 0
    if (cleanWhatsApp.startsWith('+')) {
        // Liste des indicatifs connus (on peut faire plus simple : trouver le premier 0 après le début)
        // Mais restons prudents : si le numéro commence par +2130..., +330..., etc.
        // On cherche l'indicatif dans la chaîne
        const dialCodes = ['+213', '+33', '+44', '+216', '+212', '+1', '+971', '+966', '+974', '+49', '+34'];
        for (const code of dialCodes) {
            if (cleanWhatsApp.startsWith(code)) {
                let numberPart = cleanWhatsApp.replace(code, '');
                if (numberPart.startsWith('0')) {
                    numberPart = numberPart.substring(1);
                    cleanWhatsApp = code + numberPart;
                }
                break;
            }
        }
    }

    const checkUser = await db.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (checkUser.rows.length > 0) throw new Error('Cet email est déjà utilisé.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(cleanPassword, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const role = data.role || 'lawyer';

    const client = await db.pool.connect();

    try {
        await client.beginTransaction();

        let organizationId = null;

        // Si inscription via une invitation
        if (inviteToken) {
            console.log(`[Register] Traitement inviteToken: ${inviteToken}`);
            const inviteRes = await client.query(
                "SELECT organization_id FROM organization_invitations WHERE token = ? AND status = 'pending'",
                [inviteToken]
            );
            if (inviteRes.rows.length > 0) {
                organizationId = inviteRes.rows[0].organization_id;
                console.log(`[Register] Invitation trouvée ! Liaison à l'orgId: ${organizationId}`);
                // Marquer l'invitation comme acceptée
                await client.query("UPDATE organization_invitations SET status = 'accepted' WHERE token = ?", [inviteToken]);
            } else {
                console.warn("[Register] inviteToken invalide, expiré ou déjà utilisé.");
            }
        }

        // A. Création Organisation (Plan PRO par défaut)
        if (isOrg && orgName) {
            const orgRes = await client.query(
                "INSERT INTO organizations (name, tax_id, address, plan) VALUES (?, ?, ?, 'pro')",
                [orgName, orgTaxId, orgAddress]
            );
            // MySQL utilise insertId sur le résultat brut. Mais mon wrapper query renvoie {rows}.
            // Pour MySQL, execute renvoie [rows, fields]. 
            // Mon wrapper dans db.js renvoie {rows: rows}.
            // ATTENTION: Pour un INSERT, rows contient les infos de l'insertion (insertId, etc.) dans mysql2.
            organizationId = orgRes.rows.insertId;
        }

        // B. Création Utilisateur
        const userQuery = `
            INSERT INTO users 
            (email, password_hash, full_name, profession_card_id, role, verification_token, is_verified, is_active, organization_id, whatsapp_number)
            VALUES (?, ?, ?, ?, ?, ?, false, true, ?, ?)
        `;

        const userRes = await client.query(userQuery, [
            cleanEmail, passwordHash, fullName, professionCardId, role, verificationToken, organizationId, cleanWhatsApp
        ]);
        const userId = userRes.rows.insertId;

        // C. Abonnements : Tout le monde a un abo perso "free_trial" au départ
        await client.query("INSERT INTO subscriptions (user_id, plan, status, start_date) VALUES (?, 'free_trial', 'active', NOW())", [userId]);

        // D. Si créateur d'org, on le définit comme Owner
        if (organizationId) {
            await client.query("UPDATE organizations SET owner_id = ? WHERE id = ?", [userId, organizationId]);
        }

        await client.commit();

        // E. Envoi Email
        await sendVerificationEmail(cleanEmail, verificationToken);

        // F. Envoi Message WhatsApp de Bienvenue (Reminder Spam)
        const welcomeText = `👋 *Bienvenue sur Dz Legal AI !*\n\nMerci de votre inscription, *${fullName}*.\n\n📧 Un email de confirmation vient de vous être envoyé à *${cleanEmail}*.\n\n⚠️ *IMPORTANT* : Si vous ne le voyez pas, vérifiez bien votre dossier *SPAM / Courriers Indésirables*.\n\nÀ tout de suite sur la plateforme !`;
        await sendWhatsAppMessage(cleanWhatsApp, welcomeText);

        // On renvoie un objet minimal pour le user
        return { id: userId, email: cleanEmail, full_name: fullName, whatsapp_number: cleanWhatsApp };

    } catch (error) {
        await client.rollback();
        console.error("Erreur Inscription:", error);
        throw error;
    } finally {
        client.release();
    }
}

// 2. Validation Email
async function verifyEmail(token) {
    // MySQL UPDATE ne supporte pas RETURNING. On fait un SELECT après ou on récupère l'ID.
    const findUser = await db.query("SELECT id, email FROM users WHERE verification_token = ?", [token]);
    if (findUser.rows.length === 0) throw new Error("Jeton invalide.");

    const user = findUser.rows[0];
    await db.query("UPDATE users SET is_verified = true, verification_token = NULL WHERE id = ?", [user.id]);

    return user;
}

// 3. Connexion
async function login({ email, password }) {
    const cleanEmail = email.toLowerCase().trim();
    const result = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    const user = result.rows[0];

    if (!user) throw new Error('Email ou mot de passe incorrect.');
    if (!user.is_active) throw new Error("Compte désactivé.");
    if (!user.is_verified) throw new Error("Veuillez valider votre compte via l'email de confirmation envoyé lors de l'inscription.");

    const isMatch = await bcrypt.compare(password.trim(), user.password_hash);
    if (!isMatch) throw new Error('Email ou mot de passe incorrect.');

    const code = generateCode();

    // ✅ 1. Nettoyage AVANT création (évite suppression du nouveau code)
    await db.query("UPDATE users SET two_factor_secret = NULL, two_factor_expires = NULL WHERE two_factor_expires < NOW()");

    // ✅ 2. SQL calcule expiration dans fuseau horaire MySQL (évite décalage JavaScript)
    await db.query(
        "UPDATE users SET two_factor_secret = ?, two_factor_expires = TIMESTAMPADD(MINUTE, 10, NOW()) WHERE id = ?",
        [code, user.id]
    );

    // ✅ Envoi du Code : WhatsApp si disponible, sinon Email
    let sentViaWhatsApp = false;

    if (user.whatsapp_number && user.whatsapp_number.trim() !== '') {
        // Nettoyage et Normalisation du numéro AVANT envoi
        let phoneToSend = user.whatsapp_number.replace(/[^0-9]/g, '');
        if (phoneToSend.length === 10 && (phoneToSend.startsWith('05') || phoneToSend.startsWith('06') || phoneToSend.startsWith('07'))) {
            phoneToSend = '213' + phoneToSend.substring(1);
        }

        // Tentative WhatsApp
        const waResult = await sendWhatsApp2FA(phoneToSend, code);

        if (waResult && waResult.success) {
            sentViaWhatsApp = true;
            console.log(`[AUTH] ✅ Code 2FA envoyé via WhatsApp à ${user.whatsapp_number}`);
        } else {
            console.warn(`[AUTH] ⚠️  WhatsApp échoué pour ${user.whatsapp_number}, envoi par email...`);
            console.warn(`[AUTH] ⚠️  Raison: ${waResult?.error || 'Inconnu'}`);
            // ✅ Fallback email
            await send2FACode(user.email, code);
        }
    } else {
        // Pas de WhatsApp configuré → Email directement
        console.log(`[AUTH] ℹ️  Pas de WhatsApp pour ${user.email}, envoi par email`);
        await send2FACode(user.email, code);
    }

    return {
        requires2FA: true,
        userId: user.id,
        email: user.email,
        whatsappNumber: user.whatsapp_number,
        sentViaWhatsApp: sentViaWhatsApp
    };
}

// 4. Vérification 2FA + Héritage Plan
async function verifyTwoFactor(userId, code) {
    // REQUÊTE : Priorité Plan Organisation > Plan User (Admin) > Subscriptions Legacy > Free
    const query = `
        SELECT u.*, COALESCE(org.plan, u.plan, sub.plan, 'free_trial') as plan
        FROM users u
        LEFT JOIN organizations org ON u.organization_id = org.id AND org.is_active = true
        LEFT JOIN subscriptions sub ON u.id = sub.user_id
        WHERE u.id = ?
    `;

    const result = await db.query(query, [userId]);
    const user = result.rows[0];

    if (!user) throw new Error("Utilisateur introuvable.");
    if (user.two_factor_secret !== code) throw new Error("Code incorrect.");

    // Comparaison de date compatible MySQL : user.two_factor_expires est un objet Date
    if (new Date() > new Date(user.two_factor_expires)) throw new Error("Code expiré.");

    await db.query("UPDATE users SET two_factor_secret = NULL, two_factor_expires = NULL WHERE id = ?", [userId]);

    const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email, plan: user.plan },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    delete user.password_hash;
    delete user.two_factor_secret;
    return { user, token };
}

// 5. Get Me (Refresh Profil)
async function getMe(userId) {
    const query = `
        SELECT u.id, u.email, u.full_name, u.role, u.organization_id, u.is_active,
        COALESCE(org.plan, u.plan, sub.plan, 'free_trial') as plan
        FROM users u
        LEFT JOIN organizations org ON u.organization_id = org.id AND org.is_active = true
        LEFT JOIN subscriptions sub ON u.id = sub.user_id
        WHERE u.id = ?
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
}

// 6. Forgot Password
async function forgotPassword(email) {
    const cleanEmail = email.toLowerCase().trim();
    const userResult = await db.query('SELECT id, is_active FROM users WHERE email = ?', [cleanEmail]);

    if (userResult.rows.length > 0 && userResult.rows[0].is_active) {
        const token = crypto.randomBytes(32).toString('hex');
        // Utilisation de TIMESTAMPADD (MySQL) pour éviter les décalages de fuseaux horaires entre JS et DB
        await db.query(
            "UPDATE users SET reset_password_token = ?, reset_password_expires = TIMESTAMPADD(HOUR, 1, NOW()) WHERE email = ?",
            [token, cleanEmail]
        );

        // Email Reset (Nouveau Template)
        await sendResetPasswordEmail(cleanEmail, token);
    }
}

async function resetPassword(token, newPassword) {
    // NOW() fonctionne en MySQL
    const result = await db.query("SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()", [token]);
    if (result.rows.length === 0) throw new Error("Lien invalide.");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword.trim(), salt);
    await db.query("UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?", [hash, result.rows[0].id]);
    return { message: "Succès." };
}

module.exports = { register, verifyEmail, login, verifyTwoFactor, getMe, forgotPassword, resetPassword };