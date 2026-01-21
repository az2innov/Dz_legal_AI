const db = require('../../config/db');

/**
 * Récupère les slides actifs pour l'affichage publique (Landing Page)
 */
/**
 * Récupère les slides actifs pour l'affichage publique (Landing Page)
 * Filtre par langue (query parametre ?lang=fr ou ?lang=ar)
 */
exports.getPublicSlides = async (req, res) => {
    try {
        const lang = req.query.lang || 'fr'; // Langue par défaut
        const query = `
            SELECT id, title, description, image_url, link_url, language 
            FROM news_slides 
            WHERE is_active = true AND language = ?
            ORDER BY display_order ASC, created_at DESC
        `;
        const { rows } = await db.query(query, [lang]);
        res.json(rows);
    } catch (error) {
        console.error('Erreur getPublicSlides:', error);
        res.status(500).json({ error: "Erreur lors de la récupération des actualités." });
    }
};

/**
 * Récupère tous les slides (actifs et inactifs) pour l'admin
 */
exports.getAllSlides = async (req, res) => {
    try {
        const query = `SELECT * FROM news_slides ORDER BY created_at DESC`;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Erreur getAllSlides:', error);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

/**
 * Ajoute un nouveau slide
 */
exports.createSlide = async (req, res) => {
    const { title, description, image_url, link_url, is_active, display_order, language } = req.body;

    if (!title || !image_url) {
        return res.status(400).json({ error: "Titre et URL de l'image sont requis." });
    }

    try {
        const query = `
            INSERT INTO news_slides (title, language, description, image_url, link_url, is_active, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            title,
            language || 'fr',
            description || '',
            image_url,
            link_url || '',
            is_active ? 1 : 0,
            display_order || 0
        ];

        const { rows } = await db.query(query, values);

        res.status(201).json({
            message: "Slide ajouté avec succès",
            id: rows.insertId
        });
    } catch (error) {
        console.error('Erreur createSlide:', error);
        res.status(500).json({ error: "Impossible de créer le slide." });
    }
};

/**
 * Met à jour un slide
 */
exports.updateSlide = async (req, res) => {
    const { id } = req.params;
    const { title, description, image_url, link_url, is_active, display_order, language } = req.body;

    try {
        const query = `
            UPDATE news_slides 
            SET title = ?, language = ?, description = ?, image_url = ?, link_url = ?, is_active = ?, display_order = ?
            WHERE id = ?
        `;
        const values = [
            title,
            language || 'fr',
            description,
            image_url,
            link_url,
            is_active ? 1 : 0,
            display_order,
            id
        ];

        await db.query(query, values);
        res.json({ message: "Slide mis à jour avec succès" });
    } catch (error) {
        console.error('Erreur updateSlide:', error);
        res.status(500).json({ error: "Erreur lors de la mise à jour." });
    }
};

/**
 * Supprime un slide
 */
exports.deleteSlide = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM news_slides WHERE id = ?', [id]);
        res.json({ message: "Slide supprimé" });
    } catch (error) {
        console.error('Erreur deleteSlide:', error);
        res.status(500).json({ error: "Erreur lors de la suppression." });
    }
};
