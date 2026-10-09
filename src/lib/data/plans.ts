import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { n } from "@/lib/utils";

export type PlanView = {
  id: number;
  name: string;
  goalType: string;
  startWeightKg: number;
  targetWeightKg: number | null;
  startBodyFatPct: number | null;
  targetBodyFatPct: number | null;
  dailyCalories: number;
  tdeeAtCreation: number;
  status: string;
  startedAt: string;
  closedAt: Date | null;
  archivedAt: Date | null;
  notes: string | null;
  createdAt: Date;
};

type PlanRow = typeof plans.$inferSelect;

function toPlanView(row: PlanRow): PlanView {
  return {
    id: row.id,
    name: row.name,
    goalType: row.goalType,
    startWeightKg: n(row.startWeightKg),
    targetWeightKg: row.targetWeightKg === null ? null : n(row.targetWeightKg),
    startBodyFatPct: row.startBodyFatPct === null ? null : n(row.startBodyFatPct),
    targetBodyFatPct: row.targetBodyFatPct === null ? null : n(row.targetBodyFatPct),
    dailyCalories: row.dailyCalories,
    tdeeAtCreation: row.tdeeAtCreation,
    status: row.status,
    startedAt: row.startedAt,
    closedAt: row.closedAt,
    archivedAt: row.archivedAt,
    notes: row.notes,
    createdAt: row.createdAt,
  };
}

export async function listPlans(userId: number): Promise<PlanView[]> {
  const rows = await db
    .select()
    .from(plans)
    .where(eq(plans.userId, userId))
    .orderBy(desc(plans.createdAt));

  return rows.map(toPlanView);
}

export async function getPlan(
  userId: number,
  planId: number
): Promise<PlanView | null> {
  const [row] = await db
    .select()
    .from(plans)
    .where(and(eq(plans.userId, userId), eq(plans.id, planId)))
    .limit(1);

  return row ? toPlanView(row) : null;
}

export async function getActivePlan(userId: number): Promise<PlanView | null> {
  const [row] = await db
    .select()
    .from(plans)
    .where(and(eq(plans.userId, userId), eq(plans.status, "active")))
    .orderBy(desc(plans.createdAt))
    .limit(1);

  return row ? toPlanView(row) : null;
}

export function partitionPlans(all: PlanView[]): {
  active: PlanView[];
  closed: PlanView[];
  archived: PlanView[];
} {
  return {
    active: all.filter((plan) => plan.status === "active"),
    closed: all.filter((plan) => plan.status === "closed"),
    archived: all.filter((plan) => plan.status === "archived"),
  };
}
