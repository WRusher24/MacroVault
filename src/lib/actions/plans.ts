"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { firstError, planSchema } from "@/lib/validation";
import type { ActionResult, FormState } from "./state";

function revalidatePlanPaths(id?: number): void {
  revalidatePath("/plans");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/plans/${id}`);
}

export async function createPlanAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Your session expired. Please sign in again.", success: null };
  }

  const parsed = planSchema.safeParse({
    name: formData.get("name"),
    goalType: formData.get("goalType"),
    startWeightKg: formData.get("startWeightKg"),
    targetWeightKg: formData.get("targetWeightKg") ?? "",
    startBodyFatPct: formData.get("startBodyFatPct") ?? "",
    targetBodyFatPct: formData.get("targetBodyFatPct") ?? "",
    dailyCalories: formData.get("dailyCalories"),
    tdee: formData.get("tdee"),
    startedAt: formData.get("startedAt"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { error: firstError(parsed.error), success: null };
  }

  const data = parsed.data;

  await db.insert(plans).values({
    userId: user.id,
    name: data.name,
    goalType: data.goalType,
    startWeightKg: data.startWeightKg.toFixed(1),
    targetWeightKg: data.targetWeightKg === null ? null : data.targetWeightKg.toFixed(1),
    startBodyFatPct:
      data.startBodyFatPct === null ? null : data.startBodyFatPct.toFixed(1),
    targetBodyFatPct:
      data.targetBodyFatPct === null ? null : data.targetBodyFatPct.toFixed(1),
    dailyCalories: data.dailyCalories,
    tdeeAtCreation: data.tdee,
    status: "active",
    startedAt: data.startedAt,
    notes: data.notes || null,
  });

  revalidatePlanPaths();
  return { error: null, success: `Plan "${data.name}" is now active.` };
}

export async function closePlanAction(id: number): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session expired." };

  await db
    .update(plans)
    .set({ status: "closed", closedAt: new Date() })
    .where(and(eq(plans.id, id), eq(plans.userId, user.id)));

  revalidatePlanPaths(id);
  return { ok: true, message: "Plan closed." };
}

export async function archivePlanAction(id: number): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session expired." };

  await db
    .update(plans)
    .set({ status: "archived", archivedAt: new Date() })
    .where(and(eq(plans.id, id), eq(plans.userId, user.id)));

  revalidatePlanPaths(id);
  return { ok: true, message: "Plan archived." };
}

export async function reopenPlanAction(id: number): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session expired." };

  await db
    .update(plans)
    .set({ status: "active", closedAt: null, archivedAt: null })
    .where(and(eq(plans.id, id), eq(plans.userId, user.id)));

  revalidatePlanPaths(id);
  return { ok: true, message: "Plan reactivated." };
}

export async function deletePlanAction(id: number): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session expired." };

  await db.delete(plans).where(and(eq(plans.id, id), eq(plans.userId, user.id)));

  revalidatePlanPaths();
  return { ok: true, message: "Plan deleted." };
}
