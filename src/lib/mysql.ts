import mysql from 'mysql2/promise';

// Connection pool for maximum performance and efficiency
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 25,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds timeout for connections
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

/**
 * Safely escapes a MySQL identifier (table/column name) with backticks.
 */
function escapeId(id: string): string {
  return '`' + id.replace(/`/g, '``') + '`';
}

/**
 * Executes a MySQL query and returns the results.
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  try {
    const [results] = await pool.query(sql, params);
    return results as T[];
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('MySQL Connection Refused: Please ensure your database is running.');
    }
    console.error('MySQL Query Error:', { sql, params, error: error.message });
    throw error;
  }
}

/**
 * Shorthand for simple SELECT * FROM table
 */
export async function getAll<T = any>(table: string): Promise<T[]> {
  return query<T>(`SELECT * FROM ${escapeId(table)} ORDER BY created_at DESC`);
}

/**
 * Shorthand for selecting a single record by field
 */
export async function getOne<T = any>(table: string, field: string, value: any): Promise<T | null> {
  const results = await query<T>(`SELECT * FROM ${escapeId(table)} WHERE ${escapeId(field)} = ? LIMIT 1`, [value]);
  return results.length > 0 ? results[0] : null;
}

/**
 * Inserts a record into a table
 */
export async function insert(table: string, data: Record<string, any>) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const cols = keys.map(escapeId).join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const sql = `INSERT INTO ${escapeId(table)} (${cols}) VALUES (${placeholders})`;
  try {
    const [result] = await pool.query(sql, values);
    return result;
  } catch (error: any) {
    console.error('MySQL Insert Error:', { sql, error: error.message });
    throw error;
  }
}

/**
 * Updates a record in a table
 */
export async function update(table: string, data: Record<string, any>, idField: string, idValue: any) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map(k => `${escapeId(k)} = ?`).join(', ');
  const sql = `UPDATE ${escapeId(table)} SET ${setClause} WHERE ${escapeId(idField)} = ?`;
  try {
    const [result] = await pool.query(sql, [...values, idValue]);
    return result;
  } catch (error: any) {
    console.error('MySQL Update Error:', { sql, error: error.message });
    throw error;
  }
}

/**
 * Deletes a record from a table
 */
export async function remove(table: string, idField: string, idValue: any) {
  const sql = `DELETE FROM ${escapeId(table)} WHERE ${escapeId(idField)} = ?`;
  try {
    const [result] = await pool.query(sql, [idValue]);
    return result;
  } catch (error: any) {
    console.error('MySQL Delete Error:', { sql, error: error.message });
    throw error;
  }
}

export default {
  query,
  getAll,
  getOne,
  insert,
  update,
  remove,
};
