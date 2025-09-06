import mysql from 'mysql2/promise';

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

class DatabaseConnection {
  private pool: mysql.Pool;

  constructor(config: DatabaseConfig) {
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  async query(text: string, params?: any[]) {
    // Ensure params is always an array and filter out undefined values
    const cleanParams =
      params && Array.isArray(params)
        ? params.filter((p) => p !== undefined && p !== null)
        : [];
    console.log('Executing query:', text);
    console.log('With clean params:', cleanParams);

    const [rows] = await this.pool.execute(text, cleanParams);
    return { rows };
  }

  async close() {
    await this.pool.end();
  }
}

export default DatabaseConnection;
