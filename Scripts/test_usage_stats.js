// Test complet de getUsageStats avec un utilisateur de test
const { getUsageStats } = require('./src/modules/billing/services/usageService');
const db = require('./src/config/db');

async function testGetUsageStats() {
    try {
        console.log('🧪 Test de getUsageStats()...\n');

        // 1. Trouver un utilisateur existant
        const usersResult = await db.query('SELECT id, email, full_name FROM users LIMIT 5');

        if (usersResult.rows.length === 0) {
            console.log('⚠️  Aucun utilisateur trouvé dans la base de données locale.');
            console.log('💡 Créez un compte via l\'interface ou lancez ce test en production.\n');
            process.exit(0);
        }

        console.log('👥 Utilisateurs trouvés:', usersResult.rows.length);
        usersResult.rows.forEach(user => {
            console.log(`  - ID ${user.id}: ${user.email} (${user.full_name || 'Sans nom'})`);
        });

        // 2. Tester avec le premier utilisateur
        const testUserId = usersResult.rows[0].id;
        console.log(`\n🎯 Test avec l'utilisateur ID ${testUserId}...\n`);

        // 3. Appeler getUsageStats
        const stats = await getUsageStats(testUserId);

        console.log('📊 Résultat de getUsageStats():');
        console.log(JSON.stringify(stats, null, 2));

        // 4. Vérifications
        console.log('\n✅ Vérifications:');
        console.log(`  - Plan détecté: ${stats.plan}`);
        console.log(`  - Messages ce mois: ${stats.chat.used} / ${stats.chat.limit}`);
        console.log(`  - Documents ce mois: ${stats.docs.used} / ${stats.docs.limit}`);

        // 5. Compter manuellement pour validation
        const manualCount = await db.query(`
            SELECT COUNT(*) as count 
            FROM chat_messages cm
            JOIN chat_sessions cs ON cm.session_id = cs.id
            WHERE cs.user_id = ? 
            AND cm.role = 'user'
            AND DATE_FORMAT(cm.created_at, '%Y-%m') = DATE_FORMAT(CURRENT_DATE, '%Y-%m')
        `, [testUserId]);

        console.log(`  - Comptage SQL manuel: ${manualCount.rows[0]?.count || 0} messages`);

        if (stats.chat.used === (manualCount.rows[0]?.count || 0)) {
            console.log('\n✅ SUCCESS ! Le comptage fonctionne correctement !');
        } else {
            console.log('\n⚠️  WARNING : Différence entre getUsageStats et comptage manuel');
        }

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testGetUsageStats();
