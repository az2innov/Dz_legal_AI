require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3306
};

async function checkDuplicates() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to DB');

        console.log('\n--- Duplicate Titles ---');
        const [duplicates] = await connection.execute(`
            SELECT title, lang, COUNT(*) as count, GROUP_CONCAT(id) as ids
            FROM legal_library
            GROUP BY title, lang
            HAVING count > 1
        `);

        if (duplicates.length === 0) {
            console.log('No duplicates found by (title, lang).');
        } else {
            duplicates.forEach(d => {
                console.log(`Title: "${d.title}" [${d.lang}] - Count: ${d.count} - IDs: ${d.ids}`);
            });
        }

        console.log('\n--- Journal Entries ---');
        const [journals] = await connection.execute(`
            SELECT id, title, lang, category
            FROM legal_library
            WHERE title LIKE '%Journal officiel%' OR title LIKE '%الجريدة الرسمية%'
            ORDER BY id
        `);
        journals.forEach(j => {
            console.log(`ID: ${j.id} | Lang: ${j.lang} | Title: ${j.title}`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkDuplicates();
