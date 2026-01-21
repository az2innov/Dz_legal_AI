// Test pour comparer les différents comptages
const db = require('./src/config/db');

async function testChatCounts() {
    try {
        const userId = 7; // L'utilisateur de test

        console.log('🧪 Test des différents comptages de chats...\n');

        // 1. COUNT AUJOURD'HUI (quota quotidien)
        const todayResult = await db.query(`
            SELECT COUNT(*) as count 
            FROM chat_sessions 
            WHERE user_id = ? 
            AND DATE(created_at) = CURRENT_DATE
        `, [userId]);
        console.log('📅 Chats créés AUJOURD\'HUI:', todayResult.rows[0]?.count);

        // 2. COUNT TOTAL (tous les chats)
        const totalResult = await db.query(`
            SELECT COUNT(*) as count 
            FROM chat_sessions 
            WHERE user_id = ?
        `, [userId]);
        console.log('📊 Chats TOTAL (tous):', totalResult.rows[0]?.count);

        // 3. COUNT CE MOIS
        const monthResult = await db.query(`
            SELECT COUNT(*) as count 
            FROM chat_sessions 
            WHERE user_id = ? 
            AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURRENT_DATE, '%Y-%m')
        `, [userId]);
        console.log('📆 Chats créés CE MOIS:', monthResult.rows[0]?.count);

        // 4. Regardons les dates réelles
        const datesResult = await db.query(`
            SELECT id, DATE(created_at) as date, created_at
            FROM chat_sessions 
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        `, [userId]);
        console.log('\n📋 Les 10 derniers chats (avec dates):');
        datesResult.rows.forEach(row => {
            console.log(`  - ID ${row.id}: ${row.date} (${row.created_at})`);
        });

        // 5. Vérifier la date actuelle du serveur
        const dateResult = await db.query('SELECT CURRENT_DATE as today, NOW() as now');
        console.log('\n🕐 Date serveur MySQL:');
        console.log('  - CURRENT_DATE:', dateResult.rows[0].today);
        console.log('  - NOW():', dateResult.rows[0].now);

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

testChatCounts();
