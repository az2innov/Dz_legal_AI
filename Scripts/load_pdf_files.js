require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'dz_legal_ai',
    port: process.env.MYSQL_PORT || 3306,
    charset: 'utf8mb4'
};

// Chemin vers le dossier contenant les PDFs
const PDF_FOLDER = 'D:/Textes';

async function loadPDFsToDatabase() {
    let connection;

    try {
        console.log('🔌 Connexion à la base de données...');
        console.log(`   Host: ${dbConfig.host}`);
        console.log(`   Database: ${dbConfig.database}\n`);

        connection = await mysql.createConnection(dbConfig);

        console.log(`📁 Lecture du dossier: ${PDF_FOLDER}`);

        let files;
        try {
            files = await fs.readdir(PDF_FOLDER);
        } catch (error) {
            console.error(`❌ Erreur: Impossible d'accéder au dossier ${PDF_FOLDER}`);
            console.error(`   Vérifiez que le dossier existe et contient les fichiers PDF.`);
            process.exit(1);
        }

        const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
        console.log(`📄 ${pdfFiles.length} fichiers PDF trouvés\n`);

        if (pdfFiles.length === 0) {
            console.log('⚠️  Aucun fichier PDF trouvé dans le dossier.');
            process.exit(0);
        }

        let loaded = 0;
        let skipped = 0;
        let errors = 0;
        let totalSize = 0;

        console.log('📦 Chargement des fichiers PDF...\n');

        for (const file of pdfFiles) {
            try {
                // Extraire l'ID du nom de fichier (ex: 0000001.pdf -> 0000001)
                const docId = path.basename(file, '.pdf');

                // Vérifier si le document existe dans la base
                const [docs] = await connection.execute(
                    'SELECT id, title FROM legal_library WHERE id = ?',
                    [docId]
                );

                if (docs.length === 0) {
                    console.log(`⚠️  Document ${docId} non trouvé dans la base - ignoré`);
                    skipped++;
                    continue;
                }

                const filePath = path.join(PDF_FOLDER, file);
                const stats = await fs.stat(filePath);
                const fileBuffer = await fs.readFile(filePath);

                // Mettre à jour l'enregistrement avec le contenu du fichier
                await connection.execute(`
                    UPDATE legal_library 
                    SET file_content = ?, 
                        file_size = ?,
                        mime_type = 'application/pdf'
                    WHERE id = ?
                `, [fileBuffer, stats.size, docId]);

                loaded++;
                totalSize += stats.size;

                // Afficher la progression tous les 10 documents
                if (loaded % 10 === 0) {
                    console.log(`   ${loaded}/${pdfFiles.length} fichiers chargés...`);
                }

            } catch (err) {
                errors++;
                console.error(`❌ Erreur pour ${file}:`, err.message);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 RÉSUMÉ DU CHARGEMENT');
        console.log('='.repeat(60));
        console.log(`✅ Fichiers chargés: ${loaded}`);
        console.log(`⚠️  Fichiers ignorés: ${skipped}`);
        console.log(`❌ Erreurs: ${errors}`);
        console.log(`📚 Total: ${loaded + skipped + errors}/${pdfFiles.length}`);
        console.log(`💾 Taille totale: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
        console.log('='.repeat(60));

        // Vérifier combien de documents ont leur contenu
        const [withContent] = await connection.execute(`
            SELECT COUNT(*) as count FROM legal_library WHERE file_content IS NOT NULL
        `);
        const [total] = await connection.execute(`
            SELECT COUNT(*) as count FROM legal_library
        `);

        console.log(`\n📈 Documents avec contenu PDF: ${withContent[0].count}/${total[0].count}`);

        if (withContent[0].count === total[0].count) {
            console.log('🎉 Tous les documents ont été chargés avec succès!');
        }

    } catch (error) {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔚 Connexion fermée.');
        }
    }
}

// Exécution du script
console.log('🚀 Démarrage du chargement des fichiers PDF...\n');

loadPDFsToDatabase().then(() => {
    console.log('\n✨ Script terminé avec succès!');
    process.exit(0);
}).catch((error) => {
    console.error('💥 Erreur lors de l\'exécution:', error);
    process.exit(1);
});
