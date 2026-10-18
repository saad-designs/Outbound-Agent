import { Pool } from "pg";

let pool: Pool | null = null;

function normalizeConnectionString(raw: string): string {
  let conn = raw.trim();

  // Strip sslmode query params so pg options govern SSL behavior
  if (conn.includes("?")) {
    const [base, query] = conn.split("?");
    const filteredParams = query
      .split("&")
      .filter((p) => !p.toLowerCase().startsWith("sslmode="))
      .join("&");
    conn = filteredParams ? `${base}?${filteredParams}` : base;
  }

  // If this is an IPv6-only direct Supabase host (db.<ref>.supabase.co),
  // automatically map to the IPv4 connection pooler to prevent ENOTFOUND / Network Unreachable
  const directMatch = conn.match(/:\/\/([^:]+):([^@]+)@db\.([a-z0-9]+)\.supabase\.co(?::\d+)?\/(.+)/);
  if (directMatch) {
    const [, , password, projectRef, dbname] = directMatch;
    conn = `postgresql://postgres.${projectRef}:${password}@aws-0-ap-southeast-2.pooler.supabase.com:6543/${dbname}`;
  }

  return conn;
}

export function getPostgresPool(): Pool | null {
  if (pool) return pool;

  const rawUrl = process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL;

  if (rawUrl && !rawUrl.includes("your-project-id")) {
    try {
      const connectionString = normalizeConnectionString(rawUrl);

      pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false,
        },
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 5,
      });

      pool.on("error", (err) => {
        console.warn("[BYSAAD] Unexpected error on idle PostgreSQL client:", err.message);
      });

      return pool;
    } catch (err) {
      console.warn("[BYSAAD] Failed to initialize PostgreSQL connection pool:", err);
      return null;
    }
  }

  return null;
}
