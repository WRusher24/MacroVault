import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

type Pool = ReturnType<typeof postgres>;

type DbCache = {
  client: Pool | null;
  db: Database | null;
};

// Cache on globalThis so Next.js hot reloads do not leak connection pools.
const globalForDb = globalThis as unknown as { __macrovaultCache?: DbCache };
const cache: DbCache = (globalForDb.__macrovaultCache ??= {
  client: null,
  db: null,
});

function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string."
    );
  }
  return url;
}

function initialize(): Database {
  const url = connectionString();
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  const client = postgres(url, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false, // keeps the client compatible with Neon's PgBouncer pooler
    ssl: isLocal ? false : "require",
  });
  cache.client = client;
  cache.db = drizzle(client, { schema });
  return cache.db;
}

function instance(): Database {
  return cache.db ?? initialize();
}

/**
 * Lazily initialised Drizzle client. Connections are only opened on first use,
 * which lets the application build without a database present.
 */
export const db: Database = new Proxy({} as Database, {
  get(_target, property) {
    const target = instance();
    const value = Reflect.get(target, property, target);
    return typeof value === "function" ? value.bind(target) : value;
  },
});

export function getSqlClient(): Pool {
  instance();
  return cache.client as Pool;
}

export * from "./schema";
