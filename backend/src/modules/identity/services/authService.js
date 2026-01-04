const db = require('../../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// IMPORT DES NOUVELLES FONCTIONS EMAILS (Template Pro)
const { sendVerificationEmail, send2FACode, sendResetPasswordEmail } = require('../../../shared/emailService');

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Inscription
async function register(data) {
    const { email, password, fullName, professionCardId, isOrg, orgName, orgTaxId, orgAddress } = data;
    
    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    const checkUser = await db.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (checkUser.rows.length > 0) throw new Error('Cet email est déjà utilisé.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(cleanPassword, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const role = data.role || 'lawyer';

    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');

        let organizationId = null;

        // A. Création Organisation (Plan PRO par défaut)
        if (isOrg && orgName) {
            const orgRes = await client.query(
                "INSERT INTO organizations (name, tax_id, address, plan) VALUES ($1, $2, $3, 'pro') RETURNING id",
                [orgName, orgTaxId, orgAddress]
            );
            organizationId = orgRes.rows[0].id;
        }

        // B. Création Utilisateur
        const userQuery = `
            INSERT INTO users 
            (email, password_hash, full_name, profession_card_id, role, verification_token, is_verified, is_active, organization_id)
            VALUES ($1, $2, $3, $4, $5, $6, false, true, $7)
            RETURNING id, email, full_name;
        `;
        
        const userRes = await client.query(userQuery, [
            cleanEmail, passwordHash, fullName, professionCardId, role, verificationToken, organizationId
        ]);
        const user = userRes.rows[0];

        // C. Abonnements : Tout le monde a un abo perso "free_trial" au départ
        await client.query("INSERT INTO subscriptions (user_id, plan, status, start_date) VALUES ($1, 'free_trial', 'active', NOW())", [user.id]);

        // D. Si créateur d'org, on le définit comme Owner
        if (organizationId) {
            await client.query("UPDATE organizations SET owner_id = $1 WHERE id = $2", [user.id, organizationId]);
        }

        await client.query('COMMIT'); 
        
        // E. Envoi Email (Nouveau Template)
        await sendVerificationEmail(cleanEmail, verificationToken);

        return user;

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erreur Inscription:", error);
        throw error;
    } finally {
        client.release();
    }
}

// 2. Validation Email
async function verifyEmail(token) {
    const result = await db.query("UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING id, email", [token]);
    if (result.rows.length === 0) throw new Error("Jeton invalide.");
    return result.rows[0];
}

// 3. Connexion
async function login({ email, password }) {
    const cleanEmail = email.toLowerCase().trim();
    const result = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    const user = result.rows[0];

    if (!user) throw new Error('Email ou mot de passe incorrect.');
    if (!user.is_active) throw new Error("Compte désactivé.");

    const isMatch = await bcrypt.compare(password.trim(), user.password_hash);
    if (!isMatch) throw new Error('Email ou mot de passe incorrect.');

    const code = generateCode();
    const expires = new Date(Date.now() + 10 * 60000); 
    await db.query("UPDATE users SET two_factor_secret = $1, two_factor_expires = $2 WHERE id = $3", [code, expires, user.id]);
    
    // Email 2FA (Nouveau Template)
    await send2FACode(cleanEmail, code);

    return { requires2FA: true, userId: user.id, email: user.email };
}

// 4. Vérification 2FA + Héritage Plan
async function verifyTwoFactor(userId, code) {
    // REQUÊTE : Priorité Plan Organisation > Plan Perso > Free
    const query = `
        SELECT u.*, COALESCE(org.plan, sub.plan, 'free_trial') as plan
        FROM users u
        LEFT JOIN organizations org ON u.organization_id = org.id AND org.is_active = true
        LEFT JOIN subscriptions sub ON u.id = sub.user_id
        WHERE u.id = $1
    `;

    const result = await db.query(query, [userId]);
    const user = result.rows[0];

    if (!user) throw new Error("Utilisateur introuvable.");
    if (user.two_factor_secret !== code) throw new Error("Code incorrect.");
    if (new Date() > new Date(user.two_factor_expires)) throw new Error("Code expiré.");

    await db.query("UPDATE users SET two_factor_secret = NULL, two_factor_expires = NULL WHERE id = $1", [userId]);

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
        COALESCE(org.plan, sub.plan, 'free_trial') as plan
        FROM users u
        LEFT JOIN organizations org ON u.organization_id = org.id AND org.is_active = true
        LEFT JOIN subscriptions sub ON u.id = sub.user_id
        WHERE u.id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
}

// 6. Forgot Password
async function forgotPassword(email) {
    const cleanEmail = email.toLowerCase().trim();
    const userResult = await db.query('SELECT id, is_active FROM users WHERE email = $1', [cleanEmail]);
    
    if (userResult.rows.length > 0 && userResult.rows[0].is_active) {
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60000);
        await db.query("UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3", [token, expires, cleanEmail]);
        
        // Email Reset (Nouveau Template)
        await sendResetPasswordEmail(cleanEmail, token);
    }
}

async function resetPassword(token, newPassword) {
    const result = await db.query("SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()", [token]);
    if (result.rows.length === 0) throw new Error("Lien invalide.");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword.trim(), salt);
    await db.query("UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2", [hash, result.rows[0].id]);
    return { message: "Succès." };
}

module.exports = { register, verifyEmail, login, verifyTwoFactor, getMe, forgotPassword, resetPassword };