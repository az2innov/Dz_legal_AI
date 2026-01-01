import axios from 'axios';

// URL de l'API Backend (Assurez-vous que le port correspond à votre backend)
const API_URL = 'http://localhost:3001/api/auth';

/**
 * Inscription d'un nouvel utilisateur
 */
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

/**
 * Connexion (Étape 1)
 */
const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  
  // Cas rare : Si le login réussit DIRECTEMENT (sans 2FA)
  if (response.data.status === 'success' && response.data.data && response.data.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    localStorage.setItem('token', response.data.data.token);
  }
  
  return response.data;
};

/**
 * Vérification du Code 2FA (Étape 2)
 */
const verify2FA = async (userId, code) => {
  const response = await axios.post(`${API_URL}/verify-2fa`, { userId, code });
  
  // Si le code est bon, le serveur renvoie le token
  if (response.data.status === 'success' && response.data.data && response.data.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    localStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};

/**
 * Vérification de l'email (Click sur le lien dans le mail)
 * C'est la fonction qui manquait pour éviter la page blanche.
 */
const verifyEmail = async (token) => {
  const response = await axios.post(`${API_URL}/verify-email`, { token });
  return response.data;
};

/**
 * Mot de passe oublié (Demande de lien)
 */
const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

/**
 * Réinitialisation du mot de passe (Nouveau mot de passe)
 */
const resetPassword = async (token, password) => {
  const response = await axios.post(`${API_URL}/reset-password`, { token, password });
  return response.data;
};

/**
 * Déconnexion
 */
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.reload();
};

/**
 * Helpers
 */
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};

const getToken = () => {
  return localStorage.getItem('token');
};

export default {
  register,
  login,
  verify2FA,
  verifyEmail, // <-- Ajouté ici
  forgotPassword,
  resetPassword,
  logout,
  getCurrentUser,
  getToken
};