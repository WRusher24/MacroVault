import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";

/**
 * Local verification harness. Spins up an in-memory PostgreSQL (PGlite),
 * applies the Drizzle migrations, loads the Hebrew seed file
 * (`foods_drinks_seed.json`) and exercises the core relational paths.
 * No external database required.
 *
 * Run with:  npx tsx scripts/verify-db.ts
 */

// Mirrors CATEGORY_MAP in scripts/seed.ts: Hebrew category -> English taxonomy.
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
  if (!mapped) throw new Error(`Unmapped seed category: "${hebrew}".`);
  return mapped;
}

async function main() {
  const pg = new PGlite();
  const root = process.cwd();

  // 1. Apply migrations in order.
  const migrationDir = resolve(root, "drizzle");
  const migrationFiles = readdirSync(migrationDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    const sql = readFileSync(resolve(migrationDir, file), "utf8");
    await pg.exec(sql);
    console.log(`✓ applied migration ${file}`);
  }

  // 2. Load the JSON seed into the foods table.
  const foods = JSON.parse(
    readFileSync(resolve(root, "foods_drinks_seed.json"), "utf8")
  ) as Array<{
    name: string;
    category: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }>;

  const CHUNK = 200;
  for (let i = 0; i < foods.length; i += CHUNK) {
    const rows = foods.slice(i, i + CHUNK);
    const values = rows
      .map(
        (f, j) =>
          `(${i + j + 1}, '${f.name.replace(/'/g, "''")}', '${mapCategory(
            f.category
          ).replace(/'/g, "''")}', ${f.calories}, ${f.protein_g}, ${f.carbs_g}, ${
            f.fat_g
          }, false)`
      )
      .join(",");
    await pg.exec(
      `INSERT INTO foods (id, name, category, calories, protein_g, carbs_g, fat_g, is_custom) VALUES ${values} ON CONFLICT (id) DO NOTHING;`
    );
  }
  console.log(`✓ seeded ${foods.length} foods`);

  // 3. Assertions.
  const total = await pg.query<{ count: number }>(
    "SELECT count(*)::int AS count FROM foods WHERE is_custom = false"
  );
  assert(
    total.rows[0].count === foods.length,
    `expected ${foods.length} shared foods, got ${total.rows[0].count}`
  );

  const byCategory = await pg.query<{ category: string; count: number }>(
    "SELECT category, count(*)::int AS count FROM foods GROUP BY category ORDER BY category"
  );
  console.log("  categories:", byCategory.rows.map((r) => `${r.category}=${r.count}`).join(", "));

  // 4. Full relational flow: user -> profile -> plan -> meal -> entries.
  await pg.exec(`
    INSERT INTO users (email, password_hash, display_name) VALUES ('a@b.com', 'hash', 'Tester');
    INSERT INTO profiles (user_id, gender, age, height_cm, weight_kg, body_fat_pct, activity_level, bmr, tdee)
      VALUES (1, 'male', 30, 180, 80, 18, 'moderate', 1780, 2759);
    INSERT INTO plans (user_id, name, goal_type, start_weight_kg, target_weight_kg, daily_calories, tdee_at_creation, status, started_at)
      VALUES (1, 'Spring Cut', 'cut', 80, 75, 2200, 2759, 'active', CURRENT_DATE - 9);
    INSERT INTO meals (user_id, log_date, name) VALUES (1, CURRENT_DATE, 'Breakfast');
    INSERT INTO log_entries (user_id, log_date, meal_id, food_id, food_name, grams, calories, protein_g, carbs_g, fat_g)
      VALUES (1, CURRENT_DATE, 1, 1, 'Chicken Breast, raw', 200, 240, 45, 0, 5.2),
             (1, CURRENT_DATE - 1, NULL, 2, 'Chicken Breast, grilled', 150, 247.5, 46.5, 0, 5.4);
  `);

  const dayTotals = await pg.query<{ calories: string; protein: string }>(`
    SELECT coalesce(sum(calories),0)::text AS calories, coalesce(sum(protein_g),0)::text AS protein
    FROM log_entries WHERE user_id = 1 AND log_date = CURRENT_DATE
  `);
  assert(Number(dayTotals.rows[0].calories) === 240, "day calorie aggregation failed");
  console.log(`✓ day totals: ${dayTotals.rows[0].calories} kcal, ${dayTotals.rows[0].protein}g protein`);

  const topFrequent = await pg.query<{ name: string; uses: number }>(`
    SELECT f.name, count(*)::int AS uses
    FROM log_entries le JOIN foods f ON f.id = le.food_id
    WHERE le.user_id = 1
    GROUP BY f.id ORDER BY count(*) DESC LIMIT 3
  `);
  console.log(
    "✓ top frequent:",
    topFrequent.rows.map((r) => `${r.name} (${r.uses})`).join(", ")
  );

  const dailyIntakes = await pg.query<{ date: string; intake: string }>(`
    SELECT log_date::text AS date, sum(calories)::text AS intake
    FROM log_entries WHERE user_id = 1
    GROUP BY log_date ORDER BY log_date
  `);
  const cumulative = dailyIntakes.rows.reduce(
    (sum, row) => sum + Number(row.intake) - 2759,
    0
  );
  console.log(`✓ cumulative delta over ${dailyIntakes.rows.length} days: ${Math.round(cumulative)} kcal`);
  assert(cumulative < 0, "cut plan should show a cumulative deficit");

  await pg.close();
  console.log("\nAll verification checks passed.");
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

main().catch((error) => {
  console.error("Verification failed:", error);
  process.exit(1);
});
