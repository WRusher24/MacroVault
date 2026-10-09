import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string."
    );
  }
  return url;
}

/**
 * Alternative seeding path for teams that prefer shipping a raw SQL artifact.
 * Executes foods_seed.sql statement-by-statement (the generated file contains
 * no semicolons inside string literals).
 */
async function main() {
  const url = requireDatabaseUrl();
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  const client = postgres(url, {
    max: 1,
    prepare: false,
    ssl: isLocal ? false : "require",
  });

  const sqlPath = resolve(process.cwd(), "foods_seed.sql");
  const raw = readFileSync(sqlPath, "utf8");

  const statements = raw
    .split(";")
    .map((statement) =>
      statement
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim()
    )
    .filter((statement) => statement.length > 0);

  console.log(`Executing ${statements.length} SQL statements from foods_seed.sql …`);

  for (const [index, statement] of statements.entries()) {
    await client.unsafe(statement);
    console.log(`  statement ${index + 1}/${statements.length} done`);
  }

  const result = await client<{ count: string }[]>`
    SELECT count(*)::text AS count FROM foods
  `;
  console.log(`SQL seed complete. Foods in database: ${result[0]?.count ?? "?"}`);

  await client.end();
}

main().catch((error) => {
  console.error("SQL seed failed:", error);
  process.exit(1);
});
