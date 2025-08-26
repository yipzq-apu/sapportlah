import DatabaseConnection from './connection';

export class QueryService {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async findById(table: string, id: number | string) {
    const query = `SELECT * FROM ${table} WHERE id = ?`;
    const result = await this.db.query(query, [id]);
    return (result as any).rows[0] || null;
  }

  async findAll(table: string, limit = 100, offset = 0) {
    const query = `SELECT * FROM ${table} LIMIT ? OFFSET ?`;
    const result = await this.db.query(query, [limit, offset]);
    return result.rows;
  }

  async findWhere(table: string, conditions: Record<string, any>) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map((key) => `${key} = ?`).join(' AND ');

    const query = `SELECT * FROM ${table} WHERE ${whereClause}`;
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async insert(table: string, data: Record<string, any>) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');

    const query = `INSERT INTO ${table} (${keys.join(
      ', '
    )}) VALUES (${placeholders})`;
    const result = await this.db.query(query, values);

    // Get the inserted record
    const insertId = (result.rows as any).insertId;
    return await this.findById(table, insertId);
  }

  async update(table: string, id: number | string, data: Record<string, any>) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key) => `${key} = ?`).join(', ');

    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    await this.db.query(query, [...values, id]);
    return await this.findById(table, id);
  }

  async delete(table: string, id: number | string) {
    const record = await this.findById(table, id);
    const query = `DELETE FROM ${table} WHERE id = ?`;
    await this.db.query(query, [id]);
    return record;
  }

  async customQuery(query: string, params?: any[]) {
    // Ensure parameters are properly formatted
    const cleanParams =
      params && Array.isArray(params)
        ? params.filter((p) => p !== undefined && p !== null)
        : [];
    const result = await this.db.query(query, cleanParams);
    return result.rows;
  }
}
