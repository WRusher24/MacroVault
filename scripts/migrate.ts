import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string."
    );
  }
  return url;
}

async function main() {
  const url = requireDatabaseUrl();
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  const client = postgres(url, {
    max: 1,
    prepare: false,
    ssl: isLocal ? false : "require",
  });

  const db = drizzle(client);
  console.log("Applying migrations from ./drizzle …");
  await migrate(db, { migrationsFolder: "./drizzle" });
  await client.end();
  console.log("Migrations applied successfully.");
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
