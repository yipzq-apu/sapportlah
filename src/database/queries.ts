import DatabaseConnection from './connection';

type QueryValue = string | number | boolean | null | undefined;
type QueryResult = {
  rows: Record<string, QueryValue>[];
  insertId?: number;
};

export class QueryService {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async findById(table: string, id: number | string) {
    const query = `SELECT * FROM ${table} WHERE id = ?`;
    const result = (await this.db.query(query, [id])) as QueryResult;
    return result.rows[0] || null;
  }

  async findAll(table: string, limit = 100, offset = 0) {
    const query = `SELECT * FROM ${table} LIMIT ? OFFSET ?`;
    const result = (await this.db.query(query, [limit, offset])) as QueryResult;
    return result.rows;
  }

  async findWhere(table: string, conditions: Record<string, QueryValue>) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map((key) => `${key} = ?`).join(' AND ');

    const query = `SELECT * FROM ${table} WHERE ${whereClause}`;
    const result = (await this.db.query(query, values)) as QueryResult;
    return result.rows;
  }

  async insert(table: string, data: Record<string, QueryValue>) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');

    const query = `INSERT INTO ${table} (${keys.join(
      ', ',
    )}) VALUES (${placeholders})`;
    const result = (await this.db.query(query, values)) as QueryResult;

    // Get the inserted record
    const insertId = result.insertId;
    return insertId ? await this.findById(table, insertId) : null;
  }

  async update(
    table: string,
    id: number | string,
    data: Record<string, QueryValue>,
  ) {
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

  async customQuery(query: string, params?: QueryValue[]) {
    // Ensure parameters are properly formatted
    const cleanParams =
      params && Array.isArray(params)
        ? params.filter((p) => p !== undefined && p !== null)
        : [];
    const result = (await this.db.query(query, cleanParams)) as QueryResult;
    return result.rows;
  }
}
