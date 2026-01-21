// Test rapide du nouveau comptage de messages
const db = require('./src/config/db');

async function testMessageCounting() {
    try {
        const userId = 7; // L'utilisateur de test

        console.log('🧪 Test du nouveau comptage de MESSAGES...\n');

        // 1. Compter les MESSAGES ce mois
        const messagesResult = await db.query(`
            SELECT COUNT(*) as count 
            FROM chat_messages cm
            JOIN chat_sessions cs ON cm.session_id = cs.id
            WHERE cs.user_id = ? 
            AND cm.role = 'user'
            AND DATE_FORMAT(cm.created_at, '%Y-%m') = DATE_FORMAT(CURRENT_DATE, '%Y-%m')
        `, [userId]);

        console.log('📊 Nombre de MESSAGES (questions) ce mois:', messagesResult.rows[0]?.count);

        // 2. Pour comparaison : compter les CONVERSATIONS ce mois
        const conversationsResult = await db.query(`
            SELECT COUNT(*) as count 
            FROM chat_sessions 
            WHERE user_id = ?
            AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURRENT_DATE, '%Y-%m')
        `, [userId]);

        console.log('📊 Nombre de CONVERSATIONS ce mois:', conversationsResult.rows[0]?.count);

        // 3. Détails des dernières conversations
        const detailsResult = await db.query(`
            SELECT 
                cs.id as session_id, 
                cs.title,
                COUNT(cm.id) as message_count,
                DATE(cs.created_at) as date
            FROM chat_sessions cs
            LEFT JOIN chat_messages cm ON cs.id = cm.session_id AND cm.role = 'user'
            WHERE cs.user_id = ?
            AND DATE_FORMAT(cs.created_at, '%Y-%m') = DATE_FORMAT(CURRENT_DATE, '%Y-%m')
            GROUP BY cs.id
            ORDER BY cs.created_at DESC
            LIMIT 5
        `, [userId]);

        console.log('\n📋 Détails des 5 dernières conversations ce mois:');
        detailsResult.rows.forEach(row => {
            console.log(`  - Session ${row.session_id}: "${row.title}" (${row.message_count} messages) - ${row.date}`);
        });

        console.log('\n✅ Test terminé avec succès !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

testMessageCounting();
