import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth';

// Inscription
const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  if (response.data.data) {
    // On ne connecte pas auto après register, on demande de se loguer
    return response.data.data;
  }
};

// Connexion
const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  
  if (response.data.data) {
    // On sauvegarde le token et l'user dans le stockage local
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    localStorage.setItem('token', response.data.data.token);
  }
  
  return response.data.data;
};

// Déconnexion
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Récupérer l'user actuel
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const getToken = () => {
  return localStorage.getItem('token');
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  getToken
};