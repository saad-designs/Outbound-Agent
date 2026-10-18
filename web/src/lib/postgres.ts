import { Pool } from "pg";

let pool: Pool | null = null;

export function getPostgresPool(): Pool | null {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL;

  if (connectionString && !connectionString.includes("your-project-id")) {
    try {
      pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false,
        },
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 5,
      });
      return pool;
    } catch (err) {
      console.warn("[BYSAAD] Failed to initialize PostgreSQL connection pool:", err);
      return null;
    }
  }

  return null;
}
