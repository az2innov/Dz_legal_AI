import axios from 'axios';
import authService from './authService';
import { API_ENDPOINTS } from '../utils/apiConfig';

const API_URL = API_ENDPOINTS.billing;

const getHeaders = () => ({
    headers: { 'Authorization': `Bearer ${authService.getToken()}` }
});

const getUsage = async () => {
    try {
        // 🔄 Cache-busting : Ajouter timestamp pour forcer une nouvelle requête
        const timestamp = new Date().getTime();
        const response = await axios.get(`${API_URL}/usage?_t=${timestamp}`, {
            ...getHeaders(),
            headers: {
                ...getHeaders().headers,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Erreur Billing:", error);
        return null;
    }
};

export default { getUsage };