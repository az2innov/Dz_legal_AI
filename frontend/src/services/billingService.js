import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:3001/api/billing';

const getHeaders = () => ({
    headers: { 'Authorization': `Bearer ${authService.getToken()}` }
});

const getUsage = async () => {
    try {
        const response = await axios.get(`${API_URL}/usage`, getHeaders());
        return response.data.data;
    } catch (error) {
        console.error("Erreur Billing:", error);
        return null;
    }
};

export default { getUsage };