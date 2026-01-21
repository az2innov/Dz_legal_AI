-- Migration pour ajouter la colonne langue aux actualités

-- 1. Ajouter la colonne language avec 'fr' comme valeur par défaut
ALTER TABLE news_slides
ADD COLUMN language VARCHAR(5) NOT NULL DEFAULT 'fr' AFTER title;

-- 2. Créer un index pour optimiser la recherche par langue et statut actif
CREATE INDEX idx_news_slides_lang_active ON news_slides (language, is_active);
