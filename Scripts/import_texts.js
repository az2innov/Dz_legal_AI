const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const textsData = [
    { title: "القانون التجاري", category: "commerce", lang: "ar", file: "code_com_ar.pdf" },
    { title: "القانون العضوي للانتخابات", category: "electoral", lang: "ar", file: "code_electoral_ar.pdf" },
    { title: "قانون الأسرة", category: "family", lang: "ar", file: "code_famille_ar.pdf" },
    { title: "قانون القضاء العسكري", category: "military", lang: "ar", file: "code_justice_militaire_ar.pdf" },
    { title: "قانون العقوبات", category: "penal", lang: "ar", file: "Code_penal_ar.pdf" },
    { title: "قانون الإجراءات الجزائية", category: "procedure_penal", lang: "ar", file: "code_procedure_panale_ar.pdf" },
    { title: "الدستور", category: "constitution", lang: "ar", file: "constitution_ar.pdf" },
    { title: "Code de procédure civile et administrative", category: "procedure_civil", lang: "fr", file: "code_civil_Admin_fr.pdf" },
    { title: "Code des collectivités territoriales", category: "admin", lang: "fr", file: "code_collectivites_territoriales_fr.pdf" },
    { title: "Code du commerce", category: "commerce", lang: "fr", file: "code_com_fr.pdf" },
    { title: "Code électoral", category: "electoral", lang: "fr", file: "code_electoral_fr.pdf" },
    { title: "Code de la famille", category: "family", lang: "fr", file: "code_famille_fr.pdf" },
    { title: "Code de l'information", category: "info", lang: "fr", file: "code_information_fr.pdf" },
    { title: "Code de la justice militaire", category: "military", lang: "fr", file: "code_justice_militaire_fr.pdf" },
    { title: "Code des marchés publics", category: "public_market", lang: "fr", file: "code_marche_publics_fr.pdf" },
    { title: "Code de la nationalité", category: "civil", lang: "fr", file: "code_nationalite_fr.pdf" },
    { title: "Code pénal", category: "penal", lang: "fr", file: "Code_penal_fr.pdf" },
    { title: "Code des pensions militaires", category: "military", lang: "fr", file: "code_pensions_militaire_fr.pdf" },
    { title: "Code de procédure pénale", category: "procedure_penal", lang: "fr", file: "code_procedure_panale_fr.pdf" },
    { title: "Constitution", category: "constitution", lang: "fr", file: "constitution_fr.pdf" },
];

async function runImport() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'dz_legal_ai'
    });

    console.log("🚀 Début de l'importation des PDF en BLOB...");

    // On vide la table pour éviter les doublons lors des tests
    await connection.execute("DELETE FROM legal_library");

    for (const item of textsData) {
        // Chemin vers le fichier dans le dossier public du frontend
        const filePath = path.join(__dirname, '..', 'frontend', 'public', item.file);

        if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            const stats = fs.statSync(filePath);

            await connection.execute(
                "INSERT INTO legal_library (title, category, lang, file_name, file_content, file_size) VALUES (?, ?, ?, ?, ?, ?)",
                [item.title, item.category, item.lang, item.file, fileBuffer, stats.size]
            );
            console.log(`✅ Importé : ${item.title} (${item.file})`);
        } else {
            console.warn(`⚠️ Fichier introuvable : ${filePath}`);
        }
    }

    console.log("✨ Importation terminée !");
    await connection.end();
}

runImport().catch(err => console.error("❌ Erreur d'import :", err));
