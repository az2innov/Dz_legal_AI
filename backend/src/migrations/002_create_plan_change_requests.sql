-- ============================================================================
-- Migration 002 : Table plan_change_requests
-- Description : Gestion des demandes de changement de plan (upgrade/downgrade)
-- Date : 16 Janvier 2026
-- Utilisation : Peut être exécuté directement en PRODUCTION (MySQL/PhpMyAdmin)
-- ============================================================================

-- Suppression de la table si elle existe déjà (pour réinitialisation)
DROP TABLE IF EXISTS plan_change_requests;

-- Création de la table plan_change_requests
CREATE TABLE plan_change_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    current_plan VARCHAR(50) NOT NULL,
    requested_plan VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_method ENUM('virement', 'especes', 'cheque', 'cpa', 'autre') DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    user_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    approved_by INT NULL,
    
    -- Contraintes de clé étrangère
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Index pour améliorer les performances
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Vérification de la création
-- ============================================================================
SELECT 'Table plan_change_requests créée avec succès!' AS message;

-- Afficher la structure de la table
DESCRIBE plan_change_requests;
