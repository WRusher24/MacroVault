"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { foods } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getFoodById,
  searchFoods,
  type FoodView,
} from "@/lib/data/foods";
import { customFoodSchema, firstError } from "@/lib/validation";
import type { ActionResult, FormState } from "./state";

export async function createCustomFoodAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Your session expired. Please sign in again.", success: null };
  }

  const parsed = customFoodSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    calories: formData.get("calories"),
    proteinG: formData.get("proteinG"),
    carbsG: formData.get("carbsG"),
    fatG: formData.get("fatG"),
  });

  if (!parsed.success) {
    return { error: firstError(parsed.error), success: null };
  }

  const data = parsed.data;

  await db.insert(foods).values({
    name: data.name,
    category: data.category,
    calories: Math.round(data.calories),
    proteinG: data.proteinG.toFixed(1),
    carbsG: data.carbsG.toFixed(1),
    fatG: data.fatG.toFixed(1),
    isCustom: true,
    createdBy: user.id,
  });

  revalidatePath("/foods");
  revalidatePath("/dashboard");

  return { error: null, success: `"${data.name}" was added to your foods.` };
}

export async function deleteCustomFoodAction(id: number): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session expired." };

  await db
    .delete(foods)
    .where(
      and(eq(foods.id, id), eq(foods.isCustom, true), eq(foods.createdBy, user.id))
    );

  revalidatePath("/foods");
  return { ok: true };
}

/** Server action used by the client-side food picker for live search. */
export async function searchFoodsAction(
  query: string,
  category?: string
): Promise<FoodView[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return searchFoods(user.id, query, { category, limit: 30 });
}

export async function getFoodAction(id: number): Promise<FoodView | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getFoodById(user.id, id);
}
