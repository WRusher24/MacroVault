import { KCAL_PER_KG_FAT, activityFactor, type Gender } from "@/lib/constants";
import { round } from "@/lib/utils";

/* ==========================================================================
   BMR / TDEE
   Base Metabolic Rate uses the Mifflin-St Jeor equation, the current gold
   standard for estimating resting energy expenditure. Total Daily Energy
   Expenditure applies an activity multiplier. Katch-McArdle is also provided
   as a lean-mass based cross-check when body fat percentage is known.
   ========================================================================== */

export type BmrInput = {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
};

export type TdeeInput = BmrInput & { activityLevel: string };

export function calculateBmr({ gender, weightKg, heightCm, age }: BmrInput): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return round(base + (gender === "male" ? 5 : -161), 1);
}

export function calculateKatchBmr(leanMassKg: number): number {
  return round(370 + 21.6 * leanMassKg, 1);
}

export function calculateLeanMassKg(
  weightKg: number,
  bodyFatPct?: number | null
): number | null {
  if (bodyFatPct === null || bodyFatPct === undefined) return null;
  return round(weightKg * (1 - bodyFatPct / 100), 2);
}

export type TdeeResult = {
  bmr: number;
  tdee: number;
  activityFactor: number;
  leanMassKg: number | null;
  katchBmr: number | null;
  activityLevel: string;
};

export function calculateTdee(input: TdeeInput): TdeeResult {
  const factor = activityFactor(input.activityLevel);
  const bmr = calculateBmr(input);
  const leanMassKg = calculateLeanMassKg(input.weightKg, undefined);
  return {
    bmr,
    tdee: round(bmr * factor, 0),
    activityFactor: factor,
    leanMassKg,
    katchBmr: null,
    activityLevel: input.activityLevel,
  };
}

export function calculateTdeeWithBodyFat(
  input: TdeeInput & { bodyFatPct?: number | null }
): TdeeResult {
  const factor = activityFactor(input.activityLevel);
  const bmr = calculateBmr(input);
  const leanMassKg = calculateLeanMassKg(input.weightKg, input.bodyFatPct);
  return {
    bmr,
    tdee: round(bmr * factor, 0),
    activityFactor: factor,
    leanMassKg,
    katchBmr: leanMassKg !== null ? calculateKatchBmr(leanMassKg) : null,
    activityLevel: input.activityLevel,
  };
}

/* ==========================================================================
   Goal projection
   ========================================================================== */

export type ProjectionState = "deficit" | "surplus" | "maintenance";

export type GoalProjectionInput = {
  startWeightKg: number;
  targetWeightKg?: number | null;
  startBodyFatPct?: number | null;
  targetBodyFatPct?: number | null;
  dailyCalories: number;
  tdee: number;
};

export type GoalProjection = {
  state: ProjectionState;
  dailyDelta: number;
  magnitude: number;
  weeklyChangeKg: number;
  monthlyChangeKg: number;
  resolvedTargetWeightKg: number | null;
  totalWeightChangeKg: number | null;
  estimatedFatMassChangeKg: number | null;
  estimatedDays: number | null;
  estimatedWeeks: number | null;
  estimatedMonths: number | null;
  achievable: boolean;
  warnings: string[];
};

const MAINTENANCE_EPSILON = 25;

export function projectGoal(input: GoalProjectionInput): GoalProjection {
  const { startWeightKg, dailyCalories, tdee } = input;
  const warnings: string[] = [];

  const dailyDelta = round(dailyCalories - tdee, 0);
  const magnitude = Math.abs(dailyDelta);
  const state: ProjectionState =
    magnitude < MAINTENANCE_EPSILON
      ? "maintenance"
      : dailyDelta < 0
        ? "deficit"
        : "surplus";

  const weeklyChangeKg = round((dailyDelta * 7) / KCAL_PER_KG_FAT, 3);
  const monthlyChangeKg = round((dailyDelta * 30.44) / KCAL_PER_KG_FAT, 2);

  // Resolve the target weight either directly or from a target body fat %,
  // holding lean mass constant.
  let resolvedTargetWeightKg = input.targetWeightKg ?? null;
  if (
    resolvedTargetWeightKg === null &&
    input.targetBodyFatPct !== null &&
    input.targetBodyFatPct !== undefined &&
    input.startBodyFatPct !== null &&
    input.startBodyFatPct !== undefined
  ) {
    const leanMassKg = startWeightKg * (1 - input.startBodyFatPct / 100);
    if (input.targetBodyFatPct < 100) {
      resolvedTargetWeightKg = round(leanMassKg / (1 - input.targetBodyFatPct / 100), 1);
    }
  }

  let totalWeightChangeKg: number | null = null;
  let estimatedFatMassChangeKg: number | null = null;
  let estimatedDays: number | null = null;
  let estimatedWeeks: number | null = null;
  let estimatedMonths: number | null = null;
  let achievable = true;

  if (resolvedTargetWeightKg !== null) {
    totalWeightChangeKg = round(resolvedTargetWeightKg - startWeightKg, 1);
    const totalKcal = Math.abs(totalWeightChangeKg) * KCAL_PER_KG_FAT;
    estimatedFatMassChangeKg = round(totalWeightChangeKg, 1);

    if (Math.abs(totalWeightChangeKg) < 0.1) {
      warnings.push("You are already at your target weight.");
    } else if (state === "maintenance") {
      achievable = false;
      warnings.push(
        "At maintenance calories your weight will hold steady. Adjust intake to make progress."
      );
    } else if (
      Math.sign(totalWeightChangeKg) !== Math.sign(dailyDelta)
    ) {
      achievable = false;
      warnings.push(
        totalWeightChangeKg < 0
          ? "Your target requires weight loss but your calories create a surplus."
          : "Your target requires weight gain but your calories create a deficit."
      );
    } else {
      estimatedDays = Math.round(totalKcal / magnitude);
      estimatedWeeks = round(estimatedDays / 7, 1);
      estimatedMonths = round(estimatedDays / 30.44, 1);
    }
  }

  if (magnitude > 1000 && state !== "maintenance") {
    warnings.push(
      state === "deficit"
        ? "A deficit above 1,000 kcal/day is aggressive and hard to sustain."
        : "A surplus above 1,000 kcal/day may increase unnecessary fat gain."
    );
  }

  return {
    state,
    dailyDelta,
    magnitude,
    weeklyChangeKg,
    monthlyChangeKg,
    resolvedTargetWeightKg,
    totalWeightChangeKg,
    estimatedFatMassChangeKg,
    estimatedDays,
    estimatedWeeks,
    estimatedMonths,
    achievable,
    warnings,
  };
}

/* ==========================================================================
   Macro math
   ========================================================================== */

export type MacroProfile = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type FoodMacroSource = {
  calories: number | string;
  proteinG: number | string;
  carbsG: number | string;
  fatG: number | string;
};

/** Scale a per-100g food row to an arbitrary gram weight. */
export function scaleToGrams(food: FoodMacroSource, grams: number): MacroProfile {
  const factor = grams / 100;
  return {
    calories: round(Number(food.calories) * factor, 1),
    proteinG: round(Number(food.proteinG) * factor, 1),
    carbsG: round(Number(food.carbsG) * factor, 1),
    fatG: round(Number(food.fatG) * factor, 1),
  };
}

export function sumMacros(items: MacroProfile[]): MacroProfile {
  return items.reduce<MacroProfile>(
    (total, item) => ({
      calories: round(total.calories + item.calories, 1),
      proteinG: round(total.proteinG + item.proteinG, 1),
      carbsG: round(total.carbsG + item.carbsG, 1),
      fatG: round(total.fatG + item.fatG, 1),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
}

/** Distributive macro targets in grams for a calorie budget. */
export function macroTargets(
  calories: number,
  ratio: { protein: number; carbs: number; fat: number } = {
    protein: 0.3,
    carbs: 0.4,
    fat: 0.3,
  }
): { proteinG: number; carbsG: number; fatG: number } {
  return {
    proteinG: round((calories * ratio.protein) / 4, 0),
    carbsG: round((calories * ratio.carbs) / 4, 0),
    fatG: round((calories * ratio.fat) / 9, 0),
  };
}

/* ==========================================================================
   Plan progress (cumulative deficit / surplus)
   ========================================================================== */

export type PlannedDay = {
  date: string;
  intake: number;
  hasEntries: boolean;
};

export type PlanProgress = {
  trackedDays: number;
  deficitDays: number;
  surplusDays: number;
  maintenanceDays: number;
  cumulativeDelta: number;
  averageIntake: number | null;
  averageDeltaPerTrackedDay: number | null;
  estimatedFatKg: number;
  firstTrackedDate: string | null;
  lastTrackedDate: string | null;
};

export function computePlanProgress(tdee: number, days: PlannedDay[]): PlanProgress {
  const tracked = days.filter((day) => day.hasEntries);
  let cumulativeDelta = 0;
  let deficitDays = 0;
  let surplusDays = 0;
  let maintenanceDays = 0;
  let intakeSum = 0;

  for (const day of tracked) {
    const delta = day.intake - tdee;
    cumulativeDelta += delta;
    intakeSum += day.intake;
    if (Math.abs(delta) < MAINTENANCE_EPSILON) maintenanceDays += 1;
    else if (delta < 0) deficitDays += 1;
    else surplusDays += 1;
  }

  return {
    trackedDays: tracked.length,
    deficitDays,
    surplusDays,
    maintenanceDays,
    cumulativeDelta: round(cumulativeDelta, 0),
    averageIntake: tracked.length ? round(intakeSum / tracked.length, 0) : null,
    averageDeltaPerTrackedDay: tracked.length
      ? round(cumulativeDelta / tracked.length, 0)
      : null,
    estimatedFatKg: round(cumulativeDelta / KCAL_PER_KG_FAT, 2),
    firstTrackedDate: tracked.length ? tracked[0].date : null,
    lastTrackedDate: tracked.length ? tracked[tracked.length - 1].date : null,
  };
}
