/**
 * Script de migration : Créer la table document_conversations (MySQL)
 * Usage: node backend/src/migrations/run_migration.js
 */

const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    console.log('🚀 Démarrage de la migration document_conversations (MySQL)...');

    try {
        // Lire le fichier SQL MYSQL
        const migrationFile = path.join(__dirname, '001_create_document_conversations_mysql.sql');
        const sql = fs.readFileSync(migrationFile, 'utf8');

        // Séparer les statements (CREATE TABLE et CREATE INDEX)
        const statements = sql.split(';').filter(s => s.trim());

        // Exécuter chaque statement
        for (const statement of statements) {
            if (statement.trim()) {
                await db.query(statement);
            }
        }

        console.log('✅ Migration réussie !');
        console.log('   - Table document_conversations créée');
        console.log('   - Index créés pour performance');

        // Vérifier que la table existe
        const checkQuery = `SHOW TABLES LIKE 'document_conversations'`;
        const result = await db.query(checkQuery);

        if (result.rows.length > 0) {
            console.log('✅ Vérification: Table bien présente dans la base');

            // Afficher la structure
            const describeQuery = `DESCRIBE document_conversations`;
            const structure = await db.query(describeQuery);
            console.log('\n📋 Structure de la table:');
            structure.rows.forEach(col => {
                console.log(`   - ${col.Field} (${col.Type})`);
            });
        } else {
            console.error('❌ Erreur: La table n\'a pas été créée');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error.message);
        console.error(error);
        process.exit(1);
    }

    process.exit(0);
}

runMigration();
