// backend/debug-pass.js
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME ? process.env.DB_NAME.trim() : 'legal_dz',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testPasswordFlow() {
    console.log("🔵 TEST DE HACHAGE ET STOCKAGE");
    
    const testEmail = "debug@test.com";
    const testPass = "Test1234!";

    try {
        // 1. Nettoyage
        await pool.query("DELETE FROM users WHERE email = $1", [testEmail]);

        // 2. Hachage
        console.log(`1. Mot de passe clair : '${testPass}' (Longueur: ${testPass.length})`);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(testPass, salt);
        console.log(`2. Hash généré : ${hash} (Longueur: ${hash.length})`);

        // 3. Insertion en base
        console.log("3. Insertion en base...");
        const insertRes = await pool.query(
            "INSERT INTO users (email, password_hash, full_name, is_verified) VALUES ($1, $2, 'Debug User', true) RETURNING password_hash",
            [testEmail, hash]
        );
        const storedHash = insertRes.rows[0].password_hash;
        console.log(`4. Hash relu depuis la DB : ${storedHash} (Longueur: ${storedHash.length})`);

        // 4. Vérification d'intégrité
        if (hash !== storedHash) {
            console.error("❌ ERREUR CRITIQUE : La base de données a modifié le hash !");
            console.error("Vérifiez que la colonne password_hash est bien VARCHAR(255).");
            process.exit(1);
        } else {
            console.log("✅ Intégrité DB : OK (Le hash n'a pas changé).");
        }

        // 5. Comparaison Bcrypt
        const isMatch = await bcrypt.compare(testPass, storedHash);
        console.log(`5. Test de comparaison : ${isMatch ? "✅ SUCCÈS" : "❌ ÉCHEC"}`);

    } catch (err) {
        console.error("🚨 Erreur :", err);
    } finally {
        await pool.end();
    }
}

testPasswordFlow();