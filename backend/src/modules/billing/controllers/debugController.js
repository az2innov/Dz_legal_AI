// backend/src/modules/billing/controllers/debugController.js
const debugLogger = require('../../shared/debugLogger');
const fs = require('fs');

const viewLogs = (req, res) => {
    try {
        const logs = fs.readFileSync(debugLogger.logFile, 'utf8');
        res.set('Content-Type', 'text/plain');
        res.send(logs);
    } catch (error) {
        res.status(500).send('Erreur lors de la lecture des logs: ' + error.message);
    }
};

const clearLogs = (req, res) => {
    try {
        debugLogger.clear();
        res.json({ status: 'success', message: 'Logs effacés' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'effacement des logs' });
    }
};

module.exports = { viewLogs, clearLogs };
