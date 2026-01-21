// Test rapide pour vérifier le format de retour de COUNT()
const db = require('./src/config/db');

async function testCount() {
    try {
        console.log('🧪 Test du format de retour COUNT()...\n');

        // Test 1 : COUNT simple
        const result = await db.query(`
            SELECT COUNT(*) as count 
            FROM chat_sessions 
            WHERE user_id = 7 
            AND DATE(created_at) = CURRENT_DATE
        `);

        console.log('📦 Result structure:', JSON.stringify(result, null, 2));
        console.log('📊 rows:', result.rows);
        console.log('📊 rows[0]:', result.rows[0]);
        console.log('📊 rows[0].count:', result.rows[0]?.count);
        console.log('📊 Type of count:', typeof result.rows[0]?.count);

        // Test 2 : COUNT avec alias différent
        const result2 = await db.query(`
            SELECT COUNT(*) as total
            FROM chat_sessions 
            WHERE user_id = 7
        `);

        console.log('\n📦 Result2 structure:', JSON.stringify(result2, null, 2));
        console.log('📊 rows[0].total:', result2.rows[0]?.total);

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

testCount();
