import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sapportlah_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

export const db = {
  async query(sql: string, params?: any[]) {
    try {
      // Use query instead of execute to avoid prepared statement issues
      const [rows] = await pool.query(sql, params || []);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      console.error('.....................');
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  },
};
