import DatabaseConnection from './connection';

export class QueryService {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async findById(table: string, id: number | string) {
    const query = `SELECT * FROM ${table} WHERE id = $1`;
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  async findAll(table: string, limit = 100, offset = 0) {
    const query = `SELECT * FROM ${table} LIMIT $1 OFFSET $2`;
    const result = await this.db.query(query, [limit, offset]);
    return result.rows;
  }

  async findWhere(table: string, conditions: Record<string, any>) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ');

    const query = `SELECT * FROM ${table} WHERE ${whereClause}`;
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async insert(table: string, data: Record<string, any>) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');

    const query = `INSERT INTO ${table} (${keys.join(
      ', '
    )}) VALUES (${placeholders}) RETURNING *`;
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async update(table: string, id: number | string, data: Record<string, any>) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const query = `UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`;
    const result = await this.db.query(query, [id, ...values]);
    return result.rows[0];
  }

  async delete(table: string, id: number | string) {
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const result = await this.db.query(query, [id]);
    return result.rows[0];
  }

  async customQuery(query: string, params?: any[]) {
    const result = await this.db.query(query, params);
    return result.rows;
  }
}
