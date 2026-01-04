import axios from 'axios';
import authService from './authService';

// const API_URL = 'http://localhost:3001/api/assistant';
const API_URL = 'http://192.168.1.117:3001/api/assistant';

// Configuration automatique du Header avec le Token
const getAuthHeaders = () => {
    const token = authService.getToken();
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

// 1. Envoyer un message (Nouvelle ou Ancienne session)
const sendMessage = async (query, sessionId = null) => {
    // Si on a un sessionId, on l'ajoute au payload
    const payload = { query };
    if (sessionId) {
        payload.sessionId = sessionId;
    }

    const response = await axios.post(`${API_URL}/chat`, payload, getAuthHeaders());
    return response.data;
};

// 2. Récupérer la liste des conversations (Historique)
const getSessions = async () => {
    const response = await axios.get(`${API_URL}/sessions`, getAuthHeaders());
    return response.data.data;
};

// 3. Récupérer les messages d'une conversation précise
const getSessionMessages = async (sessionId) => {
    const response = await axios.get(`${API_URL}/sessions/${sessionId}`, getAuthHeaders());
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