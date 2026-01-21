/**
 * Script de migration 002 - LOCAL ONLY
 * Table: plan_change_requests
 * Description: Gestion des demandes de changement de plan
 * Usage: node backend/src/migrations/run_migration_002_local.js
 */

const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement depuis le dossier backend
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// Import du système de base de données
const db = require('../config/db');

async function runMigration() {
    console.log('🚀 Début de la migration 002 : plan_change_requests');
    console.log('='.repeat(60));

    try {
        // Lire le fichier SQL
        const sqlPath = path.join(__dirname, '002_create_plan_change_requests.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        console.log(`📄 Fichier SQL chargé : ${sqlPath}\n`);

        // Nettoyer le SQL : retirer les commentaires
        const cleanedSQL = sqlContent
            .split('\n')
            .filter(line => {
                const trimmed = line.trim();
                return trimmed && !trimmed.startsWith('--');
            })
            .join('\n');

        // Séparer les commandes principales
        const commands = [];

        // 1. DROP TABLE
        const dropMatch = cleanedSQL.match(/DROP TABLE IF EXISTS plan_change_requests;/i);
        if (dropMatch) {
            commands.push({ type: 'DROP', sql: dropMatch[0] });
        }

        // 2. CREATE TABLE (tout depuis CREATE jusqu'au point-virgule après ENGINE)
        const createMatch = cleanedSQL.match(/CREATE TABLE plan_change_requests[\s\S]*?ENGINE=InnoDB[^;]*;/i);
        if (createMatch) {
            commands.push({ type: 'CREATE', sql: createMatch[0] });
        }

        console.log(`📝 ${commands.length} commandes SQL principales trouvées\n`);

        // Exécuter chaque commande
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];

            console.log(`⚙️  Exécution: ${command.type} TABLE...`);

            try {
                await db.query(command.sql);
                console.log(`   ✅ ${command.type} réussi\n`);
            } catch (err) {
                // Certains warnings sont normaux (table n'existait pas lors du DROP IF EXISTS)
                if (err.code === 'ER_BAD_TABLE_ERROR' && command.type === 'DROP') {
                    console.log(`   ⚠️  Table n'existait pas (c'est normal)\n`);
                } else {
                    throw err;
                }
            }
        }

        // Vérification finale
        console.log('='.repeat(60));
        console.log('🔍 Vérification de la table...\n');

        const result = await db.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'plan_change_requests'
        `);

        if (result.rows[0].count > 0) {
            console.log('✅ Table plan_change_requests créée avec succès!');

            // Afficher la structure
            const structure = await db.query('DESCRIBE plan_change_requests');
            console.log('\n📋 Structure de la table:');
            console.table(structure.rows);
        } else {
            console.log('❌ La table n\'a pas été créée');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Migration 002 terminée avec succès!');

    } catch (error) {
        console.error('\n' + '='.repeat(60));
        console.error('❌ Erreur lors de la migration:');
        console.error(error);
        console.error('='.repeat(60));
        process.exit(1);
    } finally {
        // Fermer la connexion à la base de données
        process.exit(0);
    }
}

// Exécuter la migration
runMigration();
