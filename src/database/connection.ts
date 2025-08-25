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
    const [rows] = await this.pool.execute(text, params);
    return { rows };
  }

  async close() {
    await this.pool.end();
  }
}

export default DatabaseConnection;
