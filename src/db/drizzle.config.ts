import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER;
const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD;
const port = Number(process.env.SQL_PORT || 5432);

if (!dbUrl && !sqlHost) {
  console.warn("Notice: Neither DATABASE_URL nor SQL_HOST is set in environment variables. Falling back to localhost.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: dbUrl
    ? { url: dbUrl }
    : {
        host: sqlHost || 'localhost',
        port: port,
        user: user || 'postgres',
        password: password || '',
        database: sqlDbName || 'locora',
        ssl: false,
      },
  verbose: true,
});
