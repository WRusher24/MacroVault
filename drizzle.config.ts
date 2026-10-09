import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load local env files for the CLI (Next.js loads these automatically at runtime).
config({ path: ".env.local" });
config({ path: ".env" });

// `generate` only inspects the schema and does not connect, so an empty URL is
// tolerated here; `push`, `migrate` and `studio` require a real DATABASE_URL.
const connectionString = process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
});
