import axios from 'axios';
import authService from './authService';

//const API_URL = 'http://localhost:3001/api/admin';
const API_URL = 'http://192.168.1.117:3001/api/admin';

const getHeaders = () => ({
    headers: { 'Authorization': `Bearer ${authService.getToken()}` }
});

const adminService = {
    // Stats Dashboard
    getDashboardStats: async () => {
        const response = await axios.get(`${API_URL}/stats`, getHeaders());
        return response.data.data;
    },

    // Users
    getAllUsers: async () => {
        const response = await axios.get(`${API_URL}/users`, getHeaders());
        return response.data.data;
    },
    upgradeUser: async (userId, plan) => {
        const response = await axios.post(`${API_URL}/upgrade`, { userId, plan }, getHeaders());
        return response.data;
    },
    toggleUserStatus: async (userId, isActive) => {
        const response = await axios.patch(`${API_URL}/users/${userId}/status`, { isActive }, getHeaders());
        return response.data;
    },
    deleteUser: async (userId) => {
        const response = await axios.delete(`${API_URL}/users/${userId}`, getHeaders());
        return response.data;
    },

    // Organizations
    getAllOrganizations: async () => {
        const response = await axios.get(`${API_URL}/organizations`, getHeaders());
        return response.data.data;
    },
    upgradeOrganization: async (orgId, plan) => {
        const response = await axios.post(`${API_URL}/organizations/upgrade`, { orgId, plan }, getHeaders());
        return response.data;
    },
    toggleOrgStatus: async (orgId, isActive) => {
        const response = await axios.patch(`${API_URL}/organizations/${orgId}/status`, { isActive }, getHeaders());
        return response.data;
    },
    deleteOrganization: async (orgId) => {
        const response = await axios.delete(`${API_URL}/organizations/${orgId}`, getHeaders());
        return response.data;
    }
};

export default adminService;