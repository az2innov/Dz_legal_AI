require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'dz_legal_ai',
    port: process.env.MYSQL_PORT || 3306,
    charset: 'utf8mb4'
};

// IDs des documents à supprimer
const idsToDelete = [
    '0000013', // Communiqué de la réunion du Gouvernement-07-01-2026
    '0000014', // Communiqué de la réunion du Gouvernement-23-12-2025
    '0000015', // Communiqué de la réunion du Gouvernement-17-12-2025
    '0000016', // Communiqué de la réunion du Gouvernement-09-12-2025
    '0000083', // بيان اجتماع الحكومة 07-01-2026
    '0000084', // بيان اجتماع الحكومة 23-12-2025
    '0000085', // بيان اجتماع الحكومة 17-12-2025
    '0000086'  // بيان اجتماع الحكومة 09-12-2025
];

async function deleteDocuments() {
    let connection;

    try {
        console.log('🔌 Connexion à la base de données...\n');
        connection = await mysql.createConnection(dbConfig);

        console.log('🗑️  Suppression des communiqués de réunions du gouvernement...\n');

        let deleted = 0;
        let notFound = 0;

        for (const id of idsToDelete) {
            try {
                // Vérifier si le document existe
                const [docs] = await connection.execute(
                    'SELECT id, title FROM legal_library WHERE id = ?',
                    [id]
                );

                if (docs.length === 0) {
                    console.log(`⚠️  Document ${id} non trouvé`);
                    notFound++;
                    continue;
                }

                // Supprimer le document
                await connection.execute('DELETE FROM legal_library WHERE id = ?', [id]);
                deleted++;
                console.log(`✅ Supprimé: ${id} - ${docs[0].title}`);

            } catch (err) {
                console.error(`❌ Erreur pour ${id}:`, err.message);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 RÉSUMÉ');
        console.log('='.repeat(60));
        console.log(`✅ Documents supprimés: ${deleted}`);
        console.log(`⚠️  Documents non trouvés: ${notFound}`);
        console.log(`📚 Total traité: ${deleted + notFound}/${idsToDelete.length}`);
        console.log('='.repeat(60));

        // Afficher le nouveau total
        const [total] = await connection.execute('SELECT COUNT(*) as count FROM legal_library');
        console.log(`\n📈 Nombre total de documents restants: ${total[0].count}`);

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
deleteDocuments().then(() => {
    console.log('\n✨ Suppression terminée avec succès!');
    process.exit(0);
}).catch((error) => {
    console.error('💥 Erreur:', error);
    process.exit(1);
});
