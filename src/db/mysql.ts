import mysql, { type Pool, type QueryResult, type RowDataPacket } from "mysql2/promise";
import { env } from "../config/env.js";

export const pool: Pool = mysql.createPool({
  host: env.MYSQL_HOST,
  port: env.MYSQL_PORT,
  database: env.MYSQL_DATABASE,
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  connectionLimit: env.MYSQL_CONNECTION_LIMIT,
  waitForConnections: true,
  namedPlaceholders: false,
  charset: "utf8mb4"
});

export async function query<T extends QueryResult = RowDataPacket[]>(
  sql: string,
  params: unknown[] = []
): Promise<T> {
  const [rows] = await pool.execute<T>(sql, params);
  return rows;
}
