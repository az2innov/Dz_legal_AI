const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Import de la DB nécessaire

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // --- CORRECTION 2 : Vérification temps réel en BDD ---
            // On récupère l'état actuel de l'utilisateur
            const userRes = await db.query(
                "SELECT id, role, email, is_active, organization_id FROM users WHERE id = $1", 
                [decoded.id]
            );

            const currentUser = userRes.rows[0];

            if (!currentUser) {
                return res.status(401).json({ error: 'Utilisateur introuvable.' });
            }

            // Si l'admin a bloqué le compte, on rejette la requête (403 Forbidden)
            if (!currentUser.is_active) {
                return res.status(403).json({ error: "Votre compte a été désactivé." });
            }
            // -----------------------------------------------------

            req.user = currentUser;
            next();

        } catch (error) {
            console.error("Auth Error:", error.message);
            res.status(401).json({ error: 'Non autorisé, token invalide.' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Accès non autorisé, pas de token.' });
    }
};

module.exports = { protect };