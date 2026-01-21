-- ========================================
-- Ajout de la colonne is_active
-- Pour harmoniser avec le code backend
-- ========================================

USE dz_legal_ai;

-- Ajouter la colonne is_active avec valeur par défaut 1 (actif)
ALTER TABLE `legal_library` 
ADD COLUMN `is_active` TINYINT(1) DEFAULT 1 
AFTER `gcs_uri`;

-- Ajouter l'index pour améliorer les performances
ALTER TABLE `legal_library`
ADD INDEX `idx_active` (`is_active`);

-- Vérification
SELECT 'Colonne is_active ajoutée avec succès' AS status;

-- Afficher la structure mise à jour
SHOW CREATE TABLE legal_library;
