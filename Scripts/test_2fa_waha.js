/**
 * Test du flow 2FA complet avec WAHA
 * Ce script teste l'envoi de code 2FA via la fonction authService
 */

// Simuler l'environnement
process.env.NODE_ENV = 'test';

const authService = require('./src/modules/identity/services/authService');

console.log('🧪 Test du Flow 2FA avec WAHA\n');

async function test2FAFlow() {
    try {
        // Test d'envoi d'un code 2FA
        console.log('📤 Test : Envoi d\'un code 2FA...\n');

        // Numéro de test (à remplacer par un vrai numéro WhatsApp)
        const testPhoneNumber = '+447551814980'; // Numéro UK de votre test PowerShell
        const testCode = '654321';

        console.log(`📞 Numéro destinataire: ${testPhoneNumber}`);
        console.log(`🔢 Code de test: ${testCode}\n`);

        // Créer une fonction sendWhatsApp2FA accessible
        // Note: Cette fonction est maintenant définie dans authService.js
        // Pour la tester, nous allons utiliser directement whatsappServiceWAHA

        const wahaService = require('./src/shared/whatsappServiceWAHA');

        console.log('🔄 Envoi via WAHA...');
        const result = await wahaService.send2FACode(testPhoneNumber, testCode);

        if (result.success) {
            console.log('\n✅ CODE 2FA ENVOYÉ AVEC SUCCÈS !');
            console.log('   Service: WAHA (Render)');
            console.log('   Message ID:', result.messageId || 'N/A');
            console.log('   Timestamp:', new Date(result.timestamp).toLocaleString('fr-FR'));
        }

        console.log('\n---\n');
        console.log('✅ TEST DU FLOW 2FA TERMINÉ !');
        console.log('\n💡 Prochaines étapes:');
        console.log('   1. Vérifier la réception du message WhatsApp');
        console.log('   2. Tester le login complet avec un vrai utilisateur');
        console.log('   3. Vérifier les logs backend lors du login');

    } catch (error) {
        console.error('\n❌ ERREUR LORS DU TEST 2FA:');
        console.error('   Message:', error.message);
        console.error('   Stack:', error.stack);

        console.log('\n📝 Points de vérification:');
        console.log('   1. WAHA est bien accessible sur Render');
        console.log('   2. Les variables d\'environnement sont définies');
        console.log('   3. La session WhatsApp est connectée');
        console.log('   4. Le numéro de test est au bon format');
    }
}

// Exécution du test
test2FAFlow();
