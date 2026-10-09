import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq, sql } from "drizzle-orm";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { foods } from "../src/lib/db/schema";

// The seed file carries Hebrew names/categories but no ids. Names are stored
// verbatim (the data is Hebrew); categories are normalized to the app's English
// taxonomy so the English UI filters and the custom-food dropdown keep working.
type SeedFood = {
  name: string;
  category: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

const CATEGORY_MAP: Record<string, string> = {
  "חלבונים": "Proteins",
  "דגנים": "Grains",
  "פירות": "Fruits",
  "ירקות": "Vegetables",
  "מוצרי חלב": "Dairy",
  "שומנים": "Fats",
  "חטיפים": "Snacks",
  "מאכלים מוכנים": "Prepared Foods",
  "משקאות": "Beverages",
};

function mapCategory(hebrew: string): string {
  const mapped = CATEGORY_MAP[hebrew];
  if (!mapped) {
    throw new Error(
      `Unmapped seed category: "${hebrew}". Add it to CATEGORY_MAP and FOOD_CATEGORIES.`
    );
  }
  return mapped;
}

const CHUNK_SIZE = 200;

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

  const seedPath = resolve(process.cwd(), "foods_drinks_seed.json");
  const seed = JSON.parse(readFileSync(seedPath, "utf8")) as SeedFood[];
  console.log(`Loaded ${seed.length} foods from foods_drinks_seed.json`);

  const values = seed.map((food, index) => ({
    // The seed file has no ids, so assign stable sequential ids.
    id: index + 1,
    name: food.name,
    category: mapCategory(food.category),
    calories: Math.round(food.calories),
    proteinG: food.protein_g.toFixed(1),
    carbsG: food.carbs_g.toFixed(1),
    fatG: food.fat_g.toFixed(1),
    isCustom: false,
    createdBy: null,
  }));

  // Replace the shared food set atomically. Custom foods (is_custom = true) are
  // left untouched; log history survives because log_entries snapshots food_name
  // and its food_id FK is ON DELETE SET NULL.
  await db.transaction(async (tx) => {
    await tx.delete(foods).where(eq(foods.isCustom, false));

    let processed = 0;
    for (let index = 0; index < values.length; index += CHUNK_SIZE) {
      const chunk = values.slice(index, index + CHUNK_SIZE);
      await tx.insert(foods).values(chunk);
      processed += chunk.length;
      console.log(`  seeded ${processed}/${values.length}`);
    }

    await tx.execute(
      sql`SELECT setval(pg_get_serial_sequence('foods', 'id'), GREATEST((SELECT MAX(id) FROM foods), 1))`
    );
  });

  const result = await client<{ count: string }[]>`
    SELECT count(*)::text AS count FROM foods WHERE is_custom = false
  `;
  console.log(`Seed complete. Shared foods in database: ${result[0]?.count ?? "?"}`);

  await client.end();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
