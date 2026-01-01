// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Vérification que le nom de la DB n'a pas d'espaces (erreur fréquente)
const dbName = process.env.DB_NAME ? process.env.DB_NAME.trim() : 'legal_dz';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: dbName,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // Optimisation : nombre max de clients dans le pool
  max: 20, 
  idleTimeoutMillis: 30000,
});

// Écouteur d'événements pour le debug
pool.on('connect', () => {
  // Optionnel : décommentez pour voir chaque connexion
  // console.log('Base de données connectée avec succès');
});

pool.on('error', (err) => {
  console.error('Erreur inattendue sur le client PostgreSQL', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // <--- Assurez-vous que ceci est bien exporté
};