import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { env } from "../config/env.js";

export const pool: Pool = mysql.createPool({
  host: env.MYSQL_HOST,
  port: env.MYSQL_PORT,
  database: env.MYSQL_DATABASE,
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  connectionLimit: env.MYSQL_CONNECTION_LIMIT,
  waitForConnections: true,
  namedPlaceholders: true,
  charset: "utf8mb4"
});

export async function query<T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params: unknown[] = []
): Promise<T> {
  const [rows] = await pool.execute<T>(sql, params);
  return rows;
}
