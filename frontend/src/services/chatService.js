import axios from 'axios';
import authService from './authService';
import { API_ENDPOINTS } from '../utils/apiConfig';

const API_URL = API_ENDPOINTS.assistant;

// Configuration automatique du Header (Token OU Guest ID)
const getAuthHeaders = () => {
    const token = authService.getToken();
    const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        // Mode Invité : Si pas de token, on regarde si un ID Invité existe
        const guestId = localStorage.getItem('guest_id');
        if (guestId) {
            headers['X-Guest-ID'] = guestId;
        }
    }

    return { headers };
};

// 1. Envoyer un message (Nouvelle ou Ancienne session)
const sendMessage = async (query, sessionId = null, mode = 'chat', history = []) => {
    // Si on a un sessionId, on l'ajoute au payload
    const payload = { query, mode, history };
    if (sessionId) {
        payload.sessionId = sessionId;
    }

    const response = await axios.post(`${API_URL}/chat`, payload, getAuthHeaders());
    return response.data;
};

// 2. Récupérer la liste des conversations (Historique)
const getSessions = async () => {
    const timestamp = new Date().getTime();
    const response = await axios.get(`${API_URL}/sessions?_t=${timestamp}`, getAuthHeaders());
    return response.data.data;
};

// 3. Récupérer les messages d'une conversation précise
const getSessionMessages = async (sessionId) => {
    const timestamp = new Date().getTime();
    const response = await axios.get(`${API_URL}/sessions/${sessionId}?_t=${timestamp}`, getAuthHeaders());
    return response.data.data;
};

// 4. Supprimer une conversation
const deleteSession = async (sessionId) => {
    const response = await axios.delete(`${API_URL}/sessions/${sessionId}`, getAuthHeaders());
    return response.data;
};

export default {
    sendMessage,
    getSessions,
    getSessionMessages,
    deleteSession
};