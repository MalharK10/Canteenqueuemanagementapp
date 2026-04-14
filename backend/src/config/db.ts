import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
function parseSslEnabled(value: string | undefined): boolean {
  if (!value) return true;
  return !['false', '0', 'no'].includes(value.toLowerCase());
}

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export const pool = new Pool(
  hasDatabaseUrl
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'canteen',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        ssl: { rejectUnauthorized: false },
      },
);

export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function connectDB(): Promise<void> {
  await pool.query('SELECT 1');
  console.log('Connected to PostgreSQL');
}
