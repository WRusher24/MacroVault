import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { logEntries, meals } from "@/lib/db/schema";
import { n, round } from "@/lib/utils";
import { sumMacros, type MacroProfile } from "@/lib/calc/tdee";

export type EntryView = {
  id: number;
  mealId: number | null;
  foodId: number | null;
  foodName: string;
  grams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type MealView = {
  id: number;
  name: string;
  entries: EntryView[];
  totals: MacroProfile;
};

export type DayLog = {
  date: string;
  meals: MealView[];
  loose: EntryView[];
  totals: MacroProfile;
  entryCount: number;
};

export type DaySummary = {
  date: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  entryCount: number;
};

function toEntryView(row: typeof logEntries.$inferSelect): EntryView {
  return {
    id: row.id,
    mealId: row.mealId,
    foodId: row.foodId,
    foodName: row.foodName,
    grams: n(row.grams),
    calories: n(row.calories),
    proteinG: n(row.proteinG),
    carbsG: n(row.carbsG),
    fatG: n(row.fatG),
  };
}

function totalsOf(entries: EntryView[]): MacroProfile {
  return sumMacros(
    entries.map((entry) => ({
      calories: entry.calories,
      proteinG: entry.proteinG,
      carbsG: entry.carbsG,
      fatG: entry.fatG,
    }))
  );
}

export async function getDayLog(userId: number, date: string): Promise<DayLog> {
  const [mealRows, entryRows] = await Promise.all([
    db
      .select()
      .from(meals)
      .where(and(eq(meals.userId, userId), eq(meals.logDate, date)))
      .orderBy(asc(meals.createdAt)),
    db
      .select()
      .from(logEntries)
      .where(and(eq(logEntries.userId, userId), eq(logEntries.logDate, date)))
      .orderBy(asc(logEntries.createdAt)),
  ]);

  const entries = entryRows.map(toEntryView);
  const mealViews: MealView[] = mealRows.map((meal) => {
    const own = entries.filter((entry) => entry.mealId === meal.id);
    return { id: meal.id, name: meal.name, entries: own, totals: totalsOf(own) };
  });

  const loose = entries.filter((entry) => entry.mealId === null);

  return {
    date,
    meals: mealViews,
    loose,
    totals: totalsOf(entries),
    entryCount: entries.length,
  };
}

export async function getDayTotals(
  userId: number,
  date: string
): Promise<DaySummary> {
  const [row] = await db
    .select({
      calories: sql<string>`coalesce(sum(${logEntries.calories}), 0)`,
      proteinG: sql<string>`coalesce(sum(${logEntries.proteinG}), 0)`,
      carbsG: sql<string>`coalesce(sum(${logEntries.carbsG}), 0)`,
      fatG: sql<string>`coalesce(sum(${logEntries.fatG}), 0)`,
      entryCount: sql<number>`count(*)::int`,
    })
    .from(logEntries)
    .where(and(eq(logEntries.userId, userId), eq(logEntries.logDate, date)));

  return {
    date,
    calories: round(n(row?.calories), 0),
    proteinG: round(n(row?.proteinG), 1),
    carbsG: round(n(row?.carbsG), 1),
    fatG: round(n(row?.fatG), 1),
    entryCount: row?.entryCount ?? 0,
  };
}

export async function getHistoryDays(
  userId: number,
  limit = 90
): Promise<DaySummary[]> {
  const rows = await db
    .select({
      date: logEntries.logDate,
      calories: sql<string>`coalesce(sum(${logEntries.calories}), 0)`,
      proteinG: sql<string>`coalesce(sum(${logEntries.proteinG}), 0)`,
      carbsG: sql<string>`coalesce(sum(${logEntries.carbsG}), 0)`,
      fatG: sql<string>`coalesce(sum(${logEntries.fatG}), 0)`,
      entryCount: sql<number>`count(*)::int`,
    })
    .from(logEntries)
    .where(eq(logEntries.userId, userId))
    .groupBy(logEntries.logDate)
    .orderBy(desc(logEntries.logDate))
    .limit(limit);

  return rows.map((row) => ({
    date: row.date,
    calories: round(n(row.calories), 0),
    proteinG: round(n(row.proteinG), 1),
    carbsG: round(n(row.carbsG), 1),
    fatG: round(n(row.fatG), 1),
    entryCount: row.entryCount,
  }));
}

export async function getDailyIntakes(
  userId: number,
  fromIso: string,
  toIso: string
): Promise<{ date: string; intake: number }[]> {
  const rows = await db
    .select({
      date: logEntries.logDate,
      intake: sql<string>`coalesce(sum(${logEntries.calories}), 0)`,
    })
    .from(logEntries)
    .where(
      and(
        eq(logEntries.userId, userId),
        gte(logEntries.logDate, fromIso),
        lte(logEntries.logDate, toIso)
      )
    )
    .groupBy(logEntries.logDate)
    .orderBy(asc(logEntries.logDate));

  return rows.map((row) => ({ date: row.date, intake: round(n(row.intake), 0) }));
}
