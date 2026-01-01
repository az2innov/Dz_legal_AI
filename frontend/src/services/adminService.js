import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:3001/api/admin';

const getHeaders = () => ({
    headers: { 'Authorization': `Bearer ${authService.getToken()}` }
});

// ... (Fonctions Users inchangées) ...

const getAllUsers = async () => {
    const response = await axios.get(`${API_URL}/users`, getHeaders());
    return response.data.data;
};
const upgradeUser = async (userId, plan) => {
    const response = await axios.post(`${API_URL}/upgrade`, { userId, plan }, getHeaders());
    return response.data;
};
const toggleUserStatus = async (userId, isActive) => {
    const response = await axios.patch(`${API_URL}/users/${userId}/status`, { isActive }, getHeaders());
    return response.data;
};
const deleteUser = async (userId) => {
    const response = await axios.delete(`${API_URL}/users/${userId}`, getHeaders());
    return response.data;
};

// --- GESTION ORGANISATIONS ---

const getAllOrganizations = async () => {
    const response = await axios.get(`${API_URL}/organizations`, getHeaders());
    return response.data.data;
};

const upgradeOrganization = async (orgId, plan) => {
    const response = await axios.post(`${API_URL}/organizations/upgrade`, { orgId, plan }, getHeaders());
    return response.data;
};

// NOUVEAU : Activer / Désactiver une organisation
const toggleOrgStatus = async (orgId, isActive) => {
    const response = await axios.patch(`${API_URL}/organizations/${orgId}/status`, { isActive }, getHeaders());
    return response.data;
};

// NOUVEAU : Supprimer une organisation
const deleteOrganization = async (orgId) => {
    const response = await axios.delete(`${API_URL}/organizations/${orgId}`, getHeaders());
    return response.data;
};

export default {
    getAllUsers,
    upgradeUser,
    toggleUserStatus,
    deleteUser,
    getAllOrganizations,
    upgradeOrganization,
    toggleOrgStatus,   // Export ajouté
    deleteOrganization // Export ajouté
};