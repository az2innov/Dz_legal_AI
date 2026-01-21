const authService = require('../services/authService');

const register = async (req, res) => {
    try {
        console.log('--- Nouvelle tentative d\'inscription ---');
        console.log('Body:', req.body);
        const user = await authService.register(req.body);
        res.status(201).json({ status: 'success', message: 'Compte créé. Vérifiez vos emails.', data: user });
    } catch (error) {
        console.error("🔥 Erreur Inscription détaillée:", error);
        res.status(400).json({
            error: error.message || "Erreur inconnue lors de l'inscription.",
            details: error.stack
        });
    }
};

const verifyEmail = async (req, res) => {
    try {
        await authService.verifyEmail(req.body.token);
        res.json({ status: 'success', message: 'Email vérifié avec succès.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const result = await authService.login(req.body);
        // Si login réussit mais demande 2FA
        if (result.requires2FA) {
            const message = result.whatsappNumber
                ? `Code envoyé sur votre WhatsApp (${result.whatsappNumber})`
                : "Code envoyé par email.";
            return res.json({
                status: '2fa_required',
                userId: result.userId,
                whatsappNumber: result.whatsappNumber,
                message
            });
        }
        res.json({ status: 'success', data: result });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

const verify2FA = async (req, res) => {
    try {
        const { userId, code } = req.body;
        const result = await authService.verifyTwoFactor(userId, code);
        res.json({ status: 'success', data: result });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        await authService.forgotPassword(req.body.email);
        res.json({ status: 'success', message: 'Si le compte existe, un email a été envoyé.' });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur." });
    }
};

const resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.body.token, req.body.password);
        res.json({ status: 'success', message: 'Mot de passe mis à jour.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// --- CORRECTION MAJEURE ICI ---
const getMe = async (req, res) => {
    try {
        // On récupère l'ID depuis le token (middleware protect)
        // Mais on va chercher les infos fraiches (et le bon plan) en BDD
        const user = await authService.getMe(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        res.json({ status: 'success', user });
    } catch (error) {
        console.error("Erreur getMe:", error);
        res.status(500).json({ error: "Impossible de récupérer le profil." });
    }
};

module.exports = { register, verifyEmail, login, verify2FA, forgotPassword, resetPassword, getMe };