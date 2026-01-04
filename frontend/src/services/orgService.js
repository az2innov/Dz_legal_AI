import axios from 'axios';
import authService from './authService';

// URL de base de votre API
//const API_URL = 'http://localhost:3001/api/organization';
const API_URL = 'http://192.168.1.117:3001/api/organization';
// Fonction pour récupérer le token JWT
const getConfig = () => {
    const token = authService.getToken();
    return {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

const orgService = {
    // 1. Créer le cabinet
    createOrganization: async (orgData) => {
        const response = await axios.post(`${API_URL}/create`, orgData, getConfig());
        return response.data;
    },

    // 2. Récupérer l'équipe (C'est ici que ça bloquait probablement)
    getTeam: async () => {
        const response = await axios.get(`${API_URL}/team`, getConfig());
        // Avant : return response.data.data; (qui était un tableau)
        // Maintenant : response.data.data contient { ownerId, members }
        return response.data.data; 
    },

    // 3. Inviter un membre
    inviteMember: async (email) => {
        const response = await axios.post(`${API_URL}/invite`, { email }, getConfig());
        return response.data;
    },

    // 4. Supprimer un membre
    removeMember: async (memberId) => {
        const response = await axios.delete(`${API_URL}/members/${memberId}`, getConfig());
        return response.data;
    }
};

export default orgService;