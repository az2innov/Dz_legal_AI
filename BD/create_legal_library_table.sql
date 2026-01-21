-- ========================================
-- Création de la table legal_library
-- Avec encodage UTF-8MB4 pour support arabe
-- ========================================

USE dz_legal_ai;

-- Supprimer la table si elle existe (ATTENTION : perte de données)
-- DROP TABLE IF EXISTS legal_library;

-- Créer la table avec le bon encodage
CREATE TABLE IF NOT EXISTS `legal_library` (
    `id` VARCHAR(10) PRIMARY KEY,
    `title` VARCHAR(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `lang` VARCHAR(5) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_size` INT DEFAULT NULL,
    `mime_type` VARCHAR(100) DEFAULT 'application/pdf',
    `file_content` LONGBLOB NULL,
    `gcs_uri` VARCHAR(512) NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_category` (`category`),
    INDEX `idx_lang` (`lang`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vérification
SHOW CREATE TABLE legal_library;

SELECT 'Table legal_library créée avec succès avec encodage UTF-8MB4' AS status;
