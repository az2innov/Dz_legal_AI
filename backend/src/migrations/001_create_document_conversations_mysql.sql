-- Migration: Créer la table document_conversations (VERSION MYSQL)
-- Date: 2026-01-15
-- Description: Historiser les conversations Q&A entre l'utilisateur et ses documents

CREATE TABLE IF NOT EXISTS document_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    document_id INT NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_doc_conv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_conv_document FOREIGN KEY (document_id) REFERENCES user_documents(id) ON DELETE CASCADE,
    
    -- Contrainte sur le role
    CONSTRAINT chk_role CHECK (role IN ('user', 'assistant'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index pour performance
CREATE INDEX idx_doc_conv ON document_conversations(document_id, created_at);
CREATE INDEX idx_user_doc_conv ON document_conversations(user_id, document_id);
