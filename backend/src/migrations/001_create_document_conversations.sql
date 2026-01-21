-- Migration: Créer la table document_conversations
-- Date: 2026-01-15
-- Description: Historiser les conversations Q&A entre l'utilisateur et ses documents

CREATE TABLE IF NOT EXISTS document_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    document_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_document FOREIGN KEY (document_id) REFERENCES user_documents(id) ON DELETE CASCADE
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_doc_conv ON document_conversations(document_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_doc_conv ON document_conversations(user_id, document_id);

-- Commentaires
COMMENT ON TABLE document_conversations IS 'Historique des conversations avec les documents';
COMMENT ON COLUMN document_conversations.role IS 'user ou assistant';
COMMENT ON COLUMN document_conversations.content IS 'Question ou réponse';
COMMENT ON COLUMN document_conversations.tokens_used IS 'Nombre de tokens utilisés pour cette réponse (0 pour les questions)';
