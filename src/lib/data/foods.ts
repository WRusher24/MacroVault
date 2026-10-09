import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { foods, logEntries } from "@/lib/db/schema";
import { n } from "@/lib/utils";

export type FoodView = {
  id: number;
  name: string;
  category: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  isCustom: boolean;
};

export type FrequentFoodView = FoodView & { uses: number };

type FoodRow = typeof foods.$inferSelect;

function toFoodView(row: FoodRow): FoodView {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    calories: row.calories,
    proteinG: n(row.proteinG),
    carbsG: n(row.carbsG),
    fatG: n(row.fatG),
    isCustom: row.isCustom,
  };
}

/** Access rule: shared seed foods OR foods created by this user. */
function accessibleFoods(userId: number) {
  return or(eq(foods.isCustom, false), eq(foods.createdBy, userId));
}

export async function searchFoods(
  userId: number,
  query: string,
  options: { category?: string; limit?: number } = {}
): Promise<FoodView[]> {
  const limit = options.limit ?? 40;
  const q = query.trim();
  const filters = [accessibleFoods(userId)];

  if (q) {
    filters.push(ilike(foods.name, `%${q}%`));
  }
  if (options.category && options.category !== "All") {
    filters.push(eq(foods.category, options.category));
  }

  const rows = await db
    .select()
    .from(foods)
    .where(and(...filters))
    .orderBy(asc(foods.name))
    .limit(limit);

  return rows.map(toFoodView);
}

export async function getFoodById(
  userId: number,
  foodId: number
): Promise<FoodView | null> {
  const [row] = await db
    .select()
    .from(foods)
    .where(and(eq(foods.id, foodId), accessibleFoods(userId)))
    .limit(1);

  return row ? toFoodView(row) : null;
}

export async function listCustomFoods(userId: number): Promise<FoodView[]> {
  const rows = await db
    .select()
    .from(foods)
    .where(and(eq(foods.isCustom, true), eq(foods.createdBy, userId)))
    .orderBy(desc(foods.createdAt));

  return rows.map(toFoodView);
}

export async function categoryCounts(
  userId: number
): Promise<{ category: string; count: number }[]> {
  const rows = await db
    .select({
      category: foods.category,
      count: sql<number>`count(*)::int`,
    })
    .from(foods)
    .where(accessibleFoods(userId))
    .groupBy(foods.category)
    .orderBy(asc(foods.category));

  return rows;
}

/** Top most frequently logged foods — powers the smart suggestions rail. */
export async function getTopFrequentFoods(
  userId: number,
  limit = 3
): Promise<FrequentFoodView[]> {
  const rows = await db
    .select({
      id: foods.id,
      name: foods.name,
      category: foods.category,
      calories: foods.calories,
      proteinG: foods.proteinG,
      carbsG: foods.carbsG,
      fatG: foods.fatG,
      isCustom: foods.isCustom,
      uses: sql<number>`count(*)::int`,
    })
    .from(logEntries)
    .innerJoin(foods, eq(foods.id, logEntries.foodId))
    .where(eq(logEntries.userId, userId))
    .groupBy(foods.id)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    calories: row.calories,
    proteinG: n(row.proteinG),
    carbsG: n(row.carbsG),
    fatG: n(row.fatG),
    isCustom: row.isCustom,
    uses: row.uses,
  }));
}
