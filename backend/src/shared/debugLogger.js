// backend/src/shared/debugLogger.js
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../debug_usage.log');

// Créer le fichier s'il n'existe pas
if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '=== DEBUG USAGE LOG ===\n\n', 'utf8');
}

function log(message, data = null) {
    const timestamp = new Date().toISOString();
    let logEntry = `[${timestamp}] ${message}`;

    if (data !== null) {
        logEntry += '\n' + JSON.stringify(data, null, 2);
    }

    logEntry += '\n---\n';

    // Écrire dans le fichier
    fs.appendFileSync(logFile, logEntry, 'utf8');

    // Également afficher dans la console
    console.log(message, data || '');
}

function clear() {
    fs.writeFileSync(logFile, `=== DEBUG USAGE LOG (Cleared at ${new Date().toISOString()}) ===\n\n`, 'utf8');
}

module.exports = { log, clear, logFile };
