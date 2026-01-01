const db = require('../../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../../../shared/emailService');

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Inscription
async function register({ email, password, fullName, professionCardId }) {
    const cleanEmail = email.toLowerCase().trim();
    // Sécurité : on enlève les espaces accidentels au début/fin
    const cleanPassword = password.trim();

    const checkUser = await db.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (checkUser.rows.length > 0) throw new Error('Cet email est déjà utilisé.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(cleanPassword, salt);
    
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // On insère le rôle par défaut 'lawyer' (ou 'other' selon votre logique métier, ici lawyer basé sur votre code précédent)
    // Vous pouvez changer 'lawyer' par 'other' si vous voulez que le défaut soit générique
    const query = `
        INSERT INTO users (email, password_hash, full_name, profession_card_id, role, verification_token, is_verified, is_active)
        VALUES ($1, $2, $3, $4, 'lawyer', $5, false, true)
        RETURNING id, email, full_name;
    `;
    
    const result = await db.query(query, [cleanEmail, passwordHash, fullName, professionCardId, verificationToken]);
    const user = result.rows[0];

    await sendVerificationEmail(cleanEmail, verificationToken);

    return user;
}

// Helper: Envoi email validation
async function sendVerificationEmail(email, token) {
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await sendEmail(
        email,
        "Confirmez votre compte Lexya",
        `Cliquez ici : ${link}`,
        `<h3>Bienvenue,</h3><p>Confirmez votre email : <a href="${link}">Confirmer</a></p>`
    );
}

// 2. Validation Email
async function verifyEmail(token) {
    const result = await db.query(
        "UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING id, email",
        [token]
    );
    if (result.rows.length === 0) throw new Error("Jeton invalide.");
    return result.rows[0];
}

// 3. Connexion (Avec Vérification Active + 2FA)
async function login({ email, password }) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    console.log(`🔍 Login pour: '${cleanEmail}'`);
    
    // On récupère aussi is_active dans la requête
    const result = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    const user = result.rows[0];

    if (!user) {
        console.log("❌ User introuvable.");
        throw new Error('Email ou mot de passe incorrect.');
    }

    // --- SÉCURITÉ : COMPTE DÉSACTIVÉ ---
    if (!user.is_active) {
        console.log("⛔ Compte désactivé par l'admin.");
        throw new Error("Votre compte a été désactivé par l'administrateur. Contactez le support.");
    }
    // -----------------------------------

    // Vérif compte vérifié
    if (user.is_verified === false) {
        console.log("⚠️ Compte non vérifié.");
        throw new Error("Veuillez confirmer votre email avant de vous connecter.");
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password_hash);
    console.log(`🔐 Mot de passe valide ? ${isMatch}`);

    if (!isMatch) throw new Error('Email ou mot de passe incorrect.');

    // 2FA Logic
    const code = generateCode();
    const expires = new Date(Date.now() + 10 * 60000); 

    await db.query(
        "UPDATE users SET two_factor_secret = $1, two_factor_expires = $2 WHERE id = $3",
        [code, expires, user.id]
    );

    try {
        await sendEmail(
            cleanEmail,
            "Code Lexya",
            `Code: ${code}`,
            `<p>Votre code de connexion est : <b>${code}</b></p>`
        );
    } catch(e) {
        console.error("Erreur envoi mail 2FA (Mailtrap saturé ?), mais on continue le process 2FA.");
    }

    return { requires2FA: true, userId: user.id, email: user.email };
}

// 4. Vérif 2FA
async function verifyTwoFactor(userId, code) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    // Double sécurité : même au stade 2FA, si le compte a été désactivé entre temps
    if (!user.is_active) {
        throw new Error("Compte désactivé.");
    }

    if (!user || user.two_factor_secret !== code) throw new Error("Code incorrect.");
    if (new Date() > new Date(user.two_factor_expires)) throw new Error("Code expiré.");

    await db.query("UPDATE users SET two_factor_secret = NULL, two_factor_expires = NULL WHERE id = $1", [userId]);

    const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
    delete user.password_hash;
    delete user.two_factor_secret;
    return { user, token };
}

// 5. Forgot Pass
async function forgotPassword(email) {
    const cleanEmail = email.toLowerCase().trim();
    const userResult = await db.query('SELECT id, is_active FROM users WHERE email = $1', [cleanEmail]);
    
    if (userResult.rows.length > 0) {
        // Optionnel : empêcher le reset si le compte est banni
        if (!userResult.rows[0].is_active) return; 

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60000);
        await db.query("UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3", [token, expires, cleanEmail]);
        const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await sendEmail(cleanEmail, "Reset Password", link, `<a href="${link}">Réinitialiser le mot de passe</a>`);
    }
}

// 6. Reset Pass
async function resetPassword(token, newPassword) {
    const cleanPassword = newPassword.trim();

    const result = await db.query(
        "SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()",
        [token]
    );

    if (result.rows.length === 0) throw new Error("Lien invalide ou expiré.");

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(cleanPassword, salt);

    // On débloque le compte (is_verified = true) car l'user a prouvé son identité par mail
    // On laisse is_active tel quel (si un admin l'a banni, le reset mdp ne doit pas le débannir)
    await db.query(
        `UPDATE users 
         SET password_hash = $1, 
             reset_password_token = NULL, 
             reset_password_expires = NULL,
             is_verified = true 
         WHERE id = $2`,
        [hash, result.rows[0].id]
    );

    return { message: "Succès." };
}

module.exports = { register, verifyEmail, login, verifyTwoFactor, forgotPassword, resetPassword };