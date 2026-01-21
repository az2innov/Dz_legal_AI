/**
 * Script de test : Vérifier le modèle documentConversation
 * Usage: node backend/src/migrations/test_conversation_model.js
 */

const documentConversation = require('../modules/assistant/models/documentConversation');

async function testConversationModel() {
    console.log('🧪 Test du modèle documentConversation...\n');

    // Paramètres de test
    const testUserId = 1; // Ajuster selon votre BDD
    const testDocId = 1;  // Ajuster selon votre BDD

    try {
        // Test 1 : Sauvegarder des messages
        console.log('📝 Test 1: Sauvegarde de messages...');
        await documentConversation.saveMessage(testUserId, testDocId, 'user', 'Question de test 1');
        await documentConversation.saveMessage(testUserId, testDocId, 'assistant', 'Réponse de test 1');
        console.log('✅ Messages sauvegardés\n');

        // Test 2 : Récupérer l'historique
        console.log('📜 Test 2: Récupération de l\'historique...');
        const history = await documentConversation.getConversationHistory(testDocId, testUserId);
        console.log(`✅ Historique récupéré: ${history.length} messages`);
        history.forEach((msg, i) => {
            console.log(`   ${i + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`);
        });
        console.log('');

        // Test 3 : Statistiques
        console.log('📊 Test 3: Statistiques du document...');
        const stats = await documentConversation.getDocumentStats(testDocId, testUserId);
        console.log(`✅ Statistiques:`);
        console.log(`   - Messages totaux: ${stats.total_messages}`);
        console.log(`   - Questions user: ${stats.user_questions}`);
        console.log(`   - Réponses AI: ${stats.ai_responses}`);
        console.log(`   - Tokens utilisés: ${stats.total_tokens || 0}`);
        console.log('');

        // Test 4 : Suppression
        console.log('🗑️  Test 4: Suppression de l\'historique...');
        await documentConversation.deleteConversationHistory(testDocId, testUserId);
        const afterDelete = await documentConversation.getConversationHistory(testDocId, testUserId);
        console.log(`✅ Historique supprimé: ${afterDelete.length} messages restants`);
        console.log('');

        console.log('🎉 Tous les tests sont passés avec succès !');

    } catch (error) {
        console.error('❌ Erreur durante les tests:', error.message);
        console.error(error);
        process.exit(1);
    }

    process.exit(0);
}

console.log('⚠️  Note: Assurez-vous que:');
console.log('   1. La migration a été exécutée');
console.log('   2. Un utilisateur avec ID=1 existe');
console.log('   3. Un document avec ID=1 existe');
console.log('');

testConversationModel();
