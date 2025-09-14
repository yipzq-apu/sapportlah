import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'sapportlah_db',
  waitForConnections: true,
  connectionLimit: 10, // Limit concurrent connections
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
