import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: pg.Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0) {
      global._postgresPool = new pg.Pool({
        connectionString: process.env.DATABASE_URL.trim(),
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    } else {
      global._postgresPool = new pg.Pool({
        host: process.env.SQL_HOST || 'localhost',
        port: Number(process.env.SQL_PORT || 5432),
        user: String(process.env.SQL_USER || process.env.SQL_ADMIN_USER || 'postgres'),
        password: String(process.env.SQL_PASSWORD ?? process.env.SQL_ADMIN_PASSWORD ?? ''),
        database: process.env.SQL_DB_NAME || 'locora',
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    }

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });

export function getDb() {
  return db;
}

export { schema };
