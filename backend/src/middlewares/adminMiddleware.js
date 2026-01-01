const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: "Accès refusé. Réservé aux administrateurs." });
    }
};

module.exports = { requireAdmin }; 