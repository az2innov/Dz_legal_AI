// ========================================
// Script d'importation des PDFs dans MySQL PRODUCTION
// Se connecte à la base de production depuis votre PC local
// ========================================

require('dotenv').config({ path: '.env.production' });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données PRODUCTION
const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3306,
    charset: 'utf8mb4'
};

// ⚠️ IMPORTANT : Modifier ce chemin vers le dossier contenant vos PDFs
const PDF_FOLDER = './pdfs'; // Ou le chemin absolu : 'C:/Users/vous/Documents/pdfs'

async function importPDFsToMySQL() {
    let connection;

    try {
        console.log('🔌 Connexion à la base de données PRODUCTION...');
        console.log(`   Serveur: ${dbConfig.host}`);
        console.log(`   Base: ${dbConfig.database}`);

        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connecté à la base de données PRODUCTION\n');

        // Vérifier que le dossier existe
        if (!fs.existsSync(PDF_FOLDER)) {
            console.error(`❌ Le dossier "${PDF_FOLDER}" n'existe pas !`);
            console.log(`📁 Créez le dossier et placez-y les 159 fichiers PDF nommés : 0000001.pdf, 0000002.pdf, etc.`);
            process.exit(1);
        }

        // Lire tous les fichiers PDF du dossier
        const files = fs.readdirSync(PDF_FOLDER).filter(f => f.endsWith('.pdf'));
        console.log(`📁 ${files.length} fichiers PDF trouvés dans "${PDF_FOLDER}"\n`);

        if (files.length === 0) {
            console.error('❌ Aucun fichier PDF trouvé dans le dossier !');
            process.exit(1);
        }

        // Confirmation avant d'uploader vers la production
        console.log('⚠️  ATTENTION : Vous allez uploader les PDFs vers la base de PRODUCTION !');
        console.log(`   Serveur: ${dbConfig.host}`);
        console.log(`   ${files.length} fichiers seront importés (~112 MB)\n`);

        // Attendre 3 secondes pour laisser le temps d'annuler
        console.log('   Démarrage dans 3 secondes... (Ctrl+C pour annuler)');
        await new Promise(resolve => setTimeout(resolve, 3000));

        let imported = 0;
        let updated = 0;
        let errors = 0;

        console.log('\n📦 Importation des PDFs dans la base de données PRODUCTION...\n');

        for (const file of files) {
            try {
                // Extraire l'ID du nom du fichier (ex: "0000001.pdf" → "0000001")
                const id = path.basename(file, '.pdf');
                const filePath = path.join(PDF_FOLDER, file);

                // Lire le fichier PDF en tant que Buffer
                const pdfBuffer = fs.readFileSync(filePath);
                const fileSize = pdfBuffer.length;

                // Mettre à jour l'enregistrement dans la base de données
                const [result] = await connection.execute(
                    `UPDATE legal_library 
                     SET file_content = ?, 
                         file_size = ?, 
                         mime_type = 'application/pdf'
                     WHERE id = ?`,
                    [pdfBuffer, fileSize, id]
                );

                if (result.affectedRows > 0) {
                    updated++;
                    const percent = ((updated / files.length) * 100).toFixed(1);
                    console.log(`✅ ${id}.pdf (${(fileSize / 1024).toFixed(2)} KB) - ${updated}/${files.length} (${percent}%)`);
                } else {
                    console.log(`⚠️  ${id}.pdf - Aucun enregistrement trouvé dans la base`);
                }

                imported++;

            } catch (err) {
                errors++;
                console.error(`❌ Erreur pour ${file}:`, err.message);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 RÉSUMÉ FINAL');
        console.log('='.repeat(60));
        console.log(`📁 Fichiers traités: ${imported}/${files.length}`);
        console.log(`✅ Enregistrements mis à jour: ${updated}`);
        console.log(`❌ Erreurs: ${errors}`);
        console.log('='.repeat(60));

        // Vérification finale
        const [stats] = await connection.execute(`
            SELECT 
                COUNT(*) as total,
                COUNT(file_content) as with_content,
                SUM(file_size) as total_size
            FROM legal_library
        `);

        console.log('\n📈 ÉTAT DE LA BASE DE DONNÉES PRODUCTION:');
        console.log('='.repeat(60));
        console.log(`Total de documents: ${stats[0].total}`);
        console.log(`Documents avec contenu: ${stats[0].with_content}`);
        console.log(`Taille totale: ${(stats[0].total_size / 1024 / 1024).toFixed(2)} MB`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Erreur fatale:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Assurez-vous que:');
            console.error('   1. Votre IP est autorisée dans "Remote MySQL" (cPanel)');
            console.error('   2. Les informations de connexion dans .env.production sont correctes');
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔚 Connexion fermée.');
        }
    }
}

// Lancer l'importation
importPDFsToMySQL().then(() => {
    console.log('\n✨ Importation terminée avec succès!');
    console.log('🚀 Les PDFs sont maintenant dans la base de production.');
    console.log('🌐 Testez sur : https://dz-legal-ai.com/textes-de-lois\n');
    process.exit(0);
}).catch((error) => {
    console.error('💥 Erreur:', error.message);
    process.exit(1);
});
