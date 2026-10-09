"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logEntries, meals } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getFoodById } from "@/lib/data/foods";
import { scaleToGrams } from "@/lib/calc/tdee";
import { mealSchema, firstError } from "@/lib/validation";
import type { ActionResult, FormState } from "./state";

function revalidateLogPaths(): void {
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/plans");
}

export async function addLogEntryAction(input: {
  logDate: string;
  foodId: number;
  grams: number;
  mealId: number | null;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session expired." };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.logDate)) {
    return { ok: false, error: "Invalid date." };
  }
  if (!Number.isFinite(input.grams) || input.grams < 1 || input.grams > 5000) {
    return { ok: false, error: "Enter a weight between 1 and 5000 grams." };
  }

  const food = await getFoodById(user.id, input.foodId);
  if (!food) return { ok: false, error: "That food could not be found." };

  if (input.mealId !== null) {
    const [meal] = await db
      .select({ id: meals.id })
      .from(meals)
      .where(and(eq(meals.id, input.mealId), eq(meals.userId, user.id)))
      .limit(1);
    if (!meal) return { ok: false, error: "That meal could not be found." };
  }

  const macros = scaleToGrams(food, input.grams);

  await db.insert(logEntries).values({
    userId: user.id,
    logDate: input.logDate,
    mealId: input.mealId,
    foodId: food.id,
    foodName: food.name,
    grams: input.grams.toFixed(1),
    calories: macros.calories.toFixed(1),
    proteinG: macros.proteinG.toFixed(1),
    carbsG: macros.carbsG.toFixed(1),
    fatG: macros.fatG.toFixed(1),
  });

  revalidateLogPaths();
  return { ok: true, message: `${food.name} logged.` };
}

export async function createMealAction(input: {
  name: string;
  logDate: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session expired." };

  const parsed = mealSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };

  await db.insert(meals).values({
    userId: user.id,
    name: parsed.data.name,
    logDate: parsed.data.logDate,
  });

  revalidateLogPaths();
  return { ok: true, message: `${parsed.data.name} created.` };
}

export async function deleteMealAction(id: number): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session expired." };

  await db.delete(meals).where(and(eq(meals.id, id), eq(meals.userId, user.id)));
  revalidateLogPaths();
  return { ok: true };
}

export async function deleteLogEntryAction(id: number): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session expired." };

  await db
    .delete(logEntries)
    .where(and(eq(logEntries.id, id), eq(logEntries.userId, user.id)));
  revalidateLogPaths();
  return { ok: true };
}

export async function updateLogEntryAction(input: {
  id: number;
  grams: number;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session expired." };
  if (!Number.isFinite(input.grams) || input.grams < 1 || input.grams > 5000) {
    return { ok: false, error: "Enter a weight between 1 and 5000 grams." };
  }

  const [entry] = await db
    .select()
    .from(logEntries)
    .where(and(eq(logEntries.id, input.id), eq(logEntries.userId, user.id)))
    .limit(1);

  if (!entry) return { ok: false, error: "Entry not found." };

  // Recompute from the stored per-100g values preserved on the food row when
  // available; otherwise scale from the previous entry's per-gram density.
  const food = await getFoodById(user.id, entry.foodId ?? 0);
  if (food) {
    const macros = scaleToGrams(food, input.grams);
    await db
      .update(logEntries)
      .set({
        grams: input.grams.toFixed(1),
        calories: macros.calories.toFixed(1),
        proteinG: macros.proteinG.toFixed(1),
        carbsG: macros.carbsG.toFixed(1),
        fatG: macros.fatG.toFixed(1),
      })
      .where(eq(logEntries.id, entry.id));
  } else {
    const perGram = 100 / (Number(entry.grams) || 100);
    await db
      .update(logEntries)
      .set({
        grams: input.grams.toFixed(1),
        calories: (Number(entry.calories) * perGram * (input.grams / 100)).toFixed(1),
        proteinG: (Number(entry.proteinG) * perGram * (input.grams / 100)).toFixed(1),
        carbsG: (Number(entry.carbsG) * perGram * (input.grams / 100)).toFixed(1),
        fatG: (Number(entry.fatG) * perGram * (input.grams / 100)).toFixed(1),
      })
      .where(eq(logEntries.id, entry.id));
  }

  revalidateLogPaths();
  return { ok: true };
}
