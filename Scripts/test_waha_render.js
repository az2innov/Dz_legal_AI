/**
 * Script de test pour WAHA sur Render
 * Ce script teste l'intégration de WAHA déployé sur Render.com
 */

const wahaService = require('./src/shared/whatsappServiceWAHA');

console.log('🔍 Test de connexion WAHA sur Render...\n');

async function runTests() {
    try {
        // Test 1: Vérifier le statut de la session
        console.log('📋 Test 1: Vérification du statut de la session...');
        const status = await wahaService.checkWAHAStatus();

        if (status.success) {
            console.log('✅ Session WAHA trouvée !');
            console.log('   Status:', status.status);
            console.log('   Détails:', JSON.stringify(status.data, null, 2));
        } else {
            console.log('❌ Erreur de statut:', status.error);
            console.log('\n⚠️  La session pourrait ne pas exister. Tentative de démarrage...');

            const startResult = await wahaService.startWAHASession();
            if (startResult.success) {
                console.log('✅ Session démarrée avec succès !');
            } else {
                console.log('❌ Impossible de démarrer la session:', startResult.error);
            }
        }

        console.log('\n---\n');

        // Test 2: Envoi d'un message de test
        console.log('📤 Test 2: Envoi d\'un message de test...');
        console.log('⚠️  NOTE: Mettez ici un AUTRE numéro que le vôtre pour le test');

        // Numéro de test (format international sans le +)
        const testNumber = '447551814980'; // Numéro UK du test PowerShell
        const testCode = '123456';

        console.log(`   📞 Destinataire: +${testNumber}`);
        console.log(`   🔢 Code de test: ${testCode}`);

        // Tentative d'envoi
        const result = await wahaService.send2FACode(`+${testNumber}`, testCode);

        if (result.success) {
            console.log('\n✅ Message envoyé avec succès !');
            console.log('   Message ID:', result.messageId);
            console.log('   Timestamp:', new Date(result.timestamp).toLocaleString('fr-FR'));
        } else {
            console.log('\n❌ Échec de l\'envoi');
        }

        console.log('\n---\n');
        console.log('✅ TESTS TERMINÉS !');
        console.log('\n💡 Pour tester avec un autre numéro, modifiez la variable "testNumber" dans ce fichier.');

    } catch (error) {
        console.error('\n❌ ERREUR LORS DES TESTS:');
        console.error('   Message:', error.message);
        console.error('   Stack:', error.stack);

        console.log('\n📝 Vérifications recommandées:');
        console.log('   1. WAHA est bien déployé sur Render');
        console.log('   2. L\'URL est correcte: https://aha-whatsapp-algerie.onrender.com');
        console.log('   3. La clé API est correcte: azerty#123');
        console.log('   4. La session "default" existe et est connectée');
        console.log('   5. Le QR code a bien été scanné avec votre numéro WhatsApp');
    }
}

// Exécution des tests
runTests();
