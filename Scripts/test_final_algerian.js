/**
 * Test Final avec Numéro Algérien
 * Ce test envoie un code vers votre propre numéro pour validation finale
 */

const wahaService = require('./src/shared/whatsappServiceWAHA');

console.log('📱 Test Final : Envoi vers Numéro Algérien\n');
console.log('='.repeat(50));

async function testFinalAlgerian() {
    try {
        // Votre numéro algérien (celui configuré dans WAHA)
        // IMPORTANT: Changez ce numéro pour un AUTRE numéro de test
        const yourAlgerianNumber = '+213560383640'; // Votre numéro principal
        const testCode = Math.floor(100000 + Math.random() * 900000).toString();

        console.log('\n📋 Informations du test:');
        console.log('   Destinataire:', yourAlgerianNumber);
        console.log('   Code généré:', testCode);
        console.log('   Instance WAHA: https://aha-whatsapp-algerie.onrender.com');
        console.log('   Session: default\n');

        // Vérifier d'abord le statut de la session
        console.log('🔍 Vérification de la session WAHA...');
        const status = await wahaService.checkWAHAStatus();

        if (status.success && status.status === 'WORKING') {
            console.log('   ✅ Session active et connectée');
            console.log('   📱 Numéro WhatsApp lié:', status.data?.me?.id);
            console.log('   👤 Nom du compte:', status.data?.me?.pushName);
        } else {
            console.log('   ❌ Session non disponible:', status.status);
            throw new Error('Session WAHA non disponible');
        }

        console.log('\n📤 Envoi du code 2FA...');
        const result = await wahaService.send2FACode(yourAlgerianNumber, testCode);

        if (result.success) {
            console.log('\n' + '='.repeat(50));
            console.log('✅ MESSAGE ENVOYÉ AVEC SUCCÈS !');
            console.log('='.repeat(50));
            console.log('\n📊 Détails de l\'envoi:');
            console.log('   Service utilisé: WAHA (Render)');
            console.log('   Destinataire:', yourAlgerianNumber);
            console.log('   Code envoyé:', testCode);
            console.log('   Message ID:', result.messageId || 'N/A');
            console.log('   Timestamp:', new Date(result.timestamp).toLocaleString('fr-FR'));

            console.log('\n📱 VÉRIFIEZ VOTRE WHATSAPP !');
            console.log('   Vous devriez recevoir un message avec le code:', testCode);

            console.log('\n✅ VALIDATION RÉUSSIE !');
            console.log('\n🎉 WAHA est maintenant prêt pour la production !');
            console.log('\nProchaines étapes:');
            console.log('   1. Tester le login complet via le frontend');
            console.log('   2. Vérifier les logs lors de l\'utilisation réelle');
            console.log('   3. Déployer en production si tout fonctionne');

        } else {
            console.log('\n❌ Échec de l\'envoi');
        }

    } catch (error) {
        console.error('\n' + '='.repeat(50));
        console.error('❌ ERREUR LORS DU TEST');
        console.error('='.repeat(50));
        console.error('\nDétails de l\'erreur:');
        console.error('   Message:', error.message);

        console.log('\n📋 Vérifications recommandées:');
        console.log('   1. La session WAHA est-elle connectée ?');
        console.log('      → https://aha-whatsapp-algerie.onrender.com/dashboard');
        console.log('   2. Le numéro WhatsApp +213560383640 est-il actif ?');
        console.log('   3. L\'instance Render est-elle réveillée ?');
        console.log('   4. La clé API est-elle correcte ?');

        console.log('\nPour debugger:');
        console.log('   - Vérifier les logs Render');
        console.log('   - Tester manuellement l\'API avec curl');
        console.log('   - Exécuter: node test_waha_render.js');
    }
}

console.log('\n⚠️  NOTE IMPORTANTE:');
console.log('Ce test va envoyer un message à votre propre numéro WhatsApp.');
console.log('Si vous voulez tester avec un AUTRE numéro, modifiez');
console.log('la variable "yourAlgerianNumber" à la ligne 12.\n');

// Exécution du test
testFinalAlgerian();
