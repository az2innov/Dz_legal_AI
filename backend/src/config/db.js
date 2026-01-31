const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'dz_legal_ai',
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z', // Force UTC pour éviter les décalages de dates
  flags: '-FOUND_ROWS', // Désactive certains caches MySQL
  supportBigNumbers: true,
  bigNumberStrings: false
});

console.log(`--- 🐬 Mode MySQL Activé --- (Host: ${process.env.MYSQL_HOST || 'localhost'})`);

/**
 * Nettoie les paramètres pour MySQL : transforme undefined en null
 */
const sanitizeParams = (params) => {
  if (!params) return [];
  return params.map(p => p === undefined ? null : p);
};

module.exports = {
  /**
   * Wrapper pour garder la compatibilité avec pg (result.rows)
   * Utilise query au lieu de execute pour éviter le cache des prepared statements
   */
  query: async (sql, params) => {
    const [rows] = await pool.query(sql, sanitizeParams(params));
    // Pour MySQL, rows est soit un tableau (SELECT) soit un ResultSetHeader (INSERT/UPDATE/DELETE)
    // On simule rowCount pour la compatibilité avec pg
    return {
      rows: rows,
      rowCount: rows.affectedRows || rows.length || 0
    };
  },

  /**
   * Pour les transactions
   */
  pool: {
    connect: async () => {
      const connection = await pool.getConnection();
      return {
        query: async (sql, params) => {
          const [rows] = await connection.query(sql, sanitizeParams(params));
          return {
            rows: rows,
            rowCount: rows.affectedRows || rows.length || 0
          };
        },
        release: () => connection.release(),
        beginTransaction: () => connection.beginTransaction(),
        commit: () => connection.commit(),
        rollback: () => connection.rollback(),
      };
    }
  }
};



