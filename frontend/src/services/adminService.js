import axios from 'axios';
import authService from './authService';
import { API_ENDPOINTS } from '../utils/apiConfig';

const API_URL = API_ENDPOINTS.admin;

const getHeaders = () => ({
    headers: {
        'Authorization': `Bearer ${authService.getToken()}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    }
});

const adminService = {
    // Stats Dashboard
    getDashboardStats: async () => {
        const timestamp = new Date().getTime();
        const response = await axios.get(`${API_URL}/stats?_t=${timestamp}`, getHeaders());
        return response.data.data;
    },

    // Users
    getAllUsers: async () => {
        const timestamp = new Date().getTime();
        const response = await axios.get(`${API_URL}/users?_t=${timestamp}`, getHeaders());
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
        const timestamp = new Date().getTime();
        const response = await axios.get(`${API_URL}/organizations?_t=${timestamp}`, getHeaders());
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
    },

    // Plan Change Requests
    getPlanRequests: async (status = 'pending') => {
        const timestamp = new Date().getTime();
        const response = await axios.get(`${API_URL}/plan-requests?status=${status}&_t=${timestamp}`, getHeaders());
        return response.data.data;
    },
    approvePlanRequest: async (requestId, adminNotes) => {
        const response = await axios.post(`${API_URL}/approve-plan-request/${requestId}`, {
            adminNotes
        }, getHeaders());
        return response.data;
    },

    rejectPlanRequest: async (requestId, adminNotes) => {
        const response = await axios.post(`${API_URL}/reject-plan-request/${requestId}`, {
            adminNotes
        }, getHeaders());
        return response.data;
    },

    // News / Carousel
    getNewsSlides: async () => {
        const timestamp = new Date().getTime();
        const response = await axios.get(`${API_URL}/news-slides?_t=${timestamp}`, getHeaders());
        return Array.isArray(response.data) ? response.data : [];
    },
    createNewsSlide: async (slideData) => {
        const response = await axios.post(`${API_URL}/news-slides`, slideData, getHeaders());
        return response.data;
    },
    updateNewsSlide: async (id, slideData) => {
        const response = await axios.put(`${API_URL}/news-slides/${id}`, slideData, getHeaders());
        return response.data;
    },
    deleteNewsSlide: async (id) => {
        const response = await axios.delete(`${API_URL}/news-slides/${id}`, getHeaders());
        return response.data;
    }
};

export default adminService;