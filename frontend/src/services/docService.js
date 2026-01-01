import axios from 'axios';
import authService from './authService';

// L'URL de base pour le module assistant
const API_URL = 'http://localhost:3001/api/assistant';

// Helper pour récupérer les headers avec le token JWT à jour
const getHeaders = () => ({
    headers: { 
        'Authorization': `Bearer ${authService.getToken()}`,
        'Content-Type': 'application/json'
    }
});

/**
 * Upload et analyse d'un nouveau document (PDF/Image)
 * @param {File} file - Le fichier brut
 * @param {string} prompt - Instruction pour l'IA
 */
const uploadDocument = async (file, prompt) => {
    const formData = new FormData();
    formData.append('document', file);
    if (prompt) formData.append('prompt', prompt);

    // Note: Pour l'upload, on doit laisser axios gérer le Content-Type (multipart)
    const response = await axios.post(`${API_URL}/analyze`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${authService.getToken()}`
        }
    });
    return response.data.data;
};

/**
 * Récupérer la liste des documents de l'utilisateur
 */
const getDocuments = async () => {
    const response = await axios.get(`${API_URL}/documents`, getHeaders());
    return response.data.data;
};

/**
 * Récupérer les détails d'un document spécifique
 */
const getDocumentById = async (id) => {
    const response = await axios.get(`${API_URL}/documents/${id}`, getHeaders());
    return response.data.data;
};

/**
 * Supprimer un document
 */
const deleteDocument = async (id) => {
    await axios.delete(`${API_URL}/documents/${id}`, getHeaders());
};

/**
 * Discuter avec un document spécifique (Chat with PDF)
 * @param {string} docId - L'ID du document en base
 * @param {string} question - La question de l'utilisateur
 * @param {Array} history - (Optionnel) Historique de la conversation locale
 */
const askDocument = async (docId, question, history = []) => {
    const response = await axios.post(`${API_URL}/documents/chat`, {
        docId,
        question,
        history
    }, getHeaders());
    
    return response.data.data;
};

export default {
    uploadDocument,
    getDocuments,
    getDocumentById,
    deleteDocument,
    askDocument // Nouvelle fonction critique
};