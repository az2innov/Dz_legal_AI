const orgService = require('../services/orgService');

const create = async (req, res) => {
    try {
        const { name, taxId, address } = req.body;
        const org = await orgService.createOrganization(req.user.id, name, taxId, address);
        res.json({ status: 'success', data: org });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const invite = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await orgService.inviteMember(req.user.id, email);
        res.json({ status: 'success', data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getTeam = async (req, res) => {
    try {
        const members = await orgService.getTeamMembers(req.user.id);
        res.json({ status: 'success', data: members });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- NOUVEAU : Supprimer un membre ---
const removeMember = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const memberIdToDelete = req.params.id; // Récupéré depuis la route /members/:id

        const result = await orgService.removeMember(ownerId, memberIdToDelete);
        
        res.json({ status: 'success', message: result });
    } catch (error) {
        // 403 si pas autorisé, 400 si erreur logique
        res.status(400).json({ error: error.message });
    }
};

module.exports = { create, invite, getTeam, removeMember };