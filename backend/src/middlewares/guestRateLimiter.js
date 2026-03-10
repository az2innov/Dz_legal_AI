const fs = require('fs');
const path = require('path');

// --- CONFIGURATION STOCKAGE PERSISTANT ---
// Sur un hébergement mutualisé, la mémoire (RAM) est effacée à chaque requête/redémarrage.
// On doit stocker les compteurs dans un fichier physique.
const STORAGE_DIR = path.join(process.cwd(), 'storage');
const LIMIT_FILE = path.join(STORAGE_DIR, 'guest_limits.json');

// Assurer que le dossier existe
if (!fs.existsSync(STORAGE_DIR)) {
    try { fs.mkdirSync(STORAGE_DIR, { recursive: true }); }
    catch (e) { console.error("Erreur création dossier storage:", e); }
}

// Fonction utilitaire pour lire/écrire
const getLimits = () => {
    try {
        if (!fs.existsSync(LIMIT_FILE)) return {};
        const data = fs.readFileSync(LIMIT_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Erreur lecture limites:", error);
        return {};
    }
};

const saveLimits = (limits) => {
    try {
        fs.writeFileSync(LIMIT_FILE, JSON.stringify(limits, null, 2));
    } catch (error) {
        console.error("Erreur écriture limites:", error);
    }
};

const guestRateLimiter = (req, res, next) => {
    // 1. Ignorer si utilisateur connecté (ou admin)
    if (req.user && req.user.role !== 'guest') {
        return next();
    }

    // 2. Récupérer l'ID Invité
    const guestId = req.headers['x-guest-id'];
    if (!guestId) {
        // Normalement bloqué par optionalAuth, mais sécurité
        return res.status(401).json({ error: "Guest ID manquant." });
    }

    // 3. Clé Unique (ID seul suffit si IP changeante/fausse)
    // On garde l'IP pour info mais on base le quota sur l'ID Navigateur.
    const clientIp = req.ip || req.connection.remoteAddress;
    const key = `guest:${guestId}`;

    const now = Date.now();
    const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 heures
    const MAX_REQUESTS = 3; // LIMITE STRICTE DE 3

    // 4. Lire le Fichier de Limites (Sync pour éviter conflits simples)
    let limits = getLimits();
    let record = limits[key];

    // 5. Initialisation ou Reset (Si périmé)
    if (!record || record.resetTime < now) {
        console.log(`[RateLimit] Nouveau compteur pour ${key}`);
        record = { count: 0, resetTime: now + WINDOW_MS, lastIp: clientIp };
    }

    // 6. Vérification Bloquante
    if (record.count >= MAX_REQUESTS) {
        console.log(`[RateLimit] BLOCKED: ${key} (${record.count}/${MAX_REQUESTS})`);
        return res.status(403).json({
            error: "Quota gratuit épuisé.",
            code: "GUEST_LIMIT_REACHED",
            message: "Vous avez atteint vos 3 questions gratuites. Créez un compte pour continuer !"
        });
    }

    // 7. Incrémentation & Sauvegarde
    record.count += 1;
    record.lastIp = clientIp; // Mise à jour IP pour traçabilité
    limits[key] = record;

    saveLimits(limits); // ÉCRIRE DANS LE FICHIER

    console.log(`[RateLimit] ALLOWED: ${key} (${record.count}/${MAX_REQUESTS})`);

    // Headers informatifs
    res.set('X-Guest-Limit', MAX_REQUESTS);
    res.set('X-Guest-Remaining', Math.max(0, MAX_REQUESTS - record.count));

    next();
};

module.exports = guestRateLimiter;
