"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { calculateTdeeWithBodyFat } from "@/lib/calc/tdee";
import { firstError, profileSchema } from "@/lib/validation";
import type { Gender } from "@/lib/constants";
import type { FormState } from "./state";

export async function saveProfileAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Your session expired. Please sign in again.", success: null };
  }

  const parsed = profileSchema.safeParse({
    gender: formData.get("gender"),
    age: formData.get("age"),
    heightCm: formData.get("heightCm"),
    weightKg: formData.get("weightKg"),
    bodyFatPct: formData.get("bodyFatPct") ?? "",
    activityLevel: formData.get("activityLevel"),
  });

  if (!parsed.success) {
    return { error: firstError(parsed.error), success: null };
  }

  const data = parsed.data;
  const metrics = calculateTdeeWithBodyFat({
    gender: data.gender as Gender,
    age: data.age,
    heightCm: data.heightCm,
    weightKg: data.weightKg,
    bodyFatPct: data.bodyFatPct,
    activityLevel: data.activityLevel,
  });

  const values = {
    gender: data.gender,
    age: data.age,
    heightCm: data.heightCm.toFixed(1),
    weightKg: data.weightKg.toFixed(1),
    bodyFatPct: data.bodyFatPct === null ? null : data.bodyFatPct.toFixed(1),
    activityLevel: data.activityLevel,
    bmr: metrics.bmr.toFixed(1),
    tdee: metrics.tdee.toFixed(1),
    updatedAt: new Date(),
  };

  await db
    .insert(profiles)
    .values({ userId: user.id, ...values })
    .onConflictDoUpdate({ target: profiles.userId, set: values });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/plans/new");
  revalidatePath("/plans");

  return { error: null, success: "Body metrics saved and TDEE recalculated." };
}
