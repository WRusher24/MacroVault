"use client";

import { useActionState, useState } from "react";
import { createPlanAction } from "@/lib/actions/plans";
import { emptyFormState } from "@/lib/actions/state";
import { calculateTdeeWithBodyFat, projectGoal } from "@/lib/calc/tdee";
import { ACTIVITY_LEVELS, GENDERS, type Gender } from "@/lib/constants";
import type { ProfileView } from "@/lib/data/profile";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  SectionHeader,
  Select,
  Stat,
  Textarea,
} from "@/components/ui";
import { cn, fmt, round } from "@/lib/utils";

function num(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function PlanForm({
  profile,
  today,
}: {
  profile: ProfileView | null;
  today: string;
}) {
  const [state, formAction, pending] = useActionState(
    createPlanAction,
    emptyFormState
  );

  const [form, setForm] = useState({
    gender: (profile?.gender as Gender) ?? "male",
    age: profile ? String(profile.age) : "30",
    heightCm: profile ? String(profile.heightCm) : "175",
    weightKg: profile ? String(profile.weightKg) : "75",
    bodyFatPct: profile?.bodyFatPct != null ? String(profile.bodyFatPct) : "",
    activityLevel: profile?.activityLevel ?? "moderate",
    name: "",
    startedAt: today,
    targetWeightKg: "",
    targetBodyFatPct: "",
    dailyCalories: profile?.tdee != null ? String(Math.round(profile.tdee)) : "",
    notes: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const ageNum = num(form.age);
  const heightNum = num(form.heightCm);
  const weightNum = num(form.weightKg);
  const bodyFatNum = form.bodyFatPct ? num(form.bodyFatPct) : null;
  const dailyCalories = num(form.dailyCalories);

  const metrics = calculateTdeeWithBodyFat({
    gender: form.gender,
    age: ageNum,
    heightCm: heightNum,
    weightKg: weightNum,
    bodyFatPct: bodyFatNum,
    activityLevel: form.activityLevel,
  });

  const projection = projectGoal({
    startWeightKg: weightNum,
    targetWeightKg: form.targetWeightKg ? num(form.targetWeightKg) : null,
    startBodyFatPct: bodyFatNum,
    targetBodyFatPct: form.targetBodyFatPct ? num(form.targetBodyFatPct) : null,
    dailyCalories,
    tdee: metrics.tdee,
  });

  const goalType =
    projection.state === "deficit"
      ? "cut"
      : projection.state === "surplus"
        ? "bulk"
        : "maintain";

  const tone =
    projection.state === "deficit"
      ? "positive"
      : projection.state === "surplus"
        ? "warning"
        : "neutral";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="goalType" value={goalType} />
      <input type="hidden" name="tdee" value={metrics.tdee} />

      <Card className="space-y-4">
        <SectionHeader
          title="Your body metrics"
          subtitle="Powers your BMR and TDEE estimate"
        />

        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">Gender</p>
          <div className="grid grid-cols-2 gap-2">
            {GENDERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => set("gender", option.value)}
                className={cn(
                  "h-11 rounded-xl border text-sm font-medium transition-colors tap",
                  form.gender === option.value
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-line text-muted hover:text-ink"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="gender" value={form.gender} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Age (years)" htmlFor="ageInput">
            <Input
              id="ageInput"
              inputMode="numeric"
              value={form.age}
              onChange={(event) => set("age", event.target.value.replace(/[^0-9]/g, ""))}
            />
          </Field>
          <Field label="Height (cm)" htmlFor="heightInput">
            <Input
              id="heightInput"
              inputMode="decimal"
              value={form.heightCm}
              onChange={(event) =>
                set("heightCm", event.target.value.replace(/[^0-9.]/g, ""))
              }
            />
          </Field>
          <Field label="Weight (kg)" htmlFor="weightInput">
            <Input
              id="weightInput"
              inputMode="decimal"
              value={form.weightKg}
              onChange={(event) =>
                set("weightKg", event.target.value.replace(/[^0-9.]/g, ""))
              }
            />
          </Field>
          <Field label="Body fat % (optional)" htmlFor="bodyFatInput">
            <Input
              id="bodyFatInput"
              inputMode="decimal"
              value={form.bodyFatPct}
              onChange={(event) =>
                set("bodyFatPct", event.target.value.replace(/[^0-9.]/g, ""))
              }
              placeholder="e.g. 18"
            />
          </Field>
        </div>
        <input type="hidden" name="startBodyFatPct" value={form.bodyFatPct} />
        <input type="hidden" name="startWeightKg" value={form.weightKg} />

        <Field label="Activity level" htmlFor="activityInput">
          <Select
            id="activityInput"
            value={form.activityLevel}
            onChange={(event) => set("activityLevel", event.target.value)}
          >
            {ACTIVITY_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label} — {level.description}
              </option>
            ))}
          </Select>
        </Field>
        <input type="hidden" name="activityLevel" value={form.activityLevel} />

        <div className="grid grid-cols-3 gap-2">
          <Stat label="BMR" value={fmt(metrics.bmr)} sub="kcal / day" />
          <Stat
            label="TDEE"
            value={fmt(metrics.tdee)}
            sub="maintenance"
            tone="primary"
          />
          <Stat
            label="Lean mass"
            value={metrics.leanMassKg != null ? `${metrics.leanMassKg}` : "—"}
            sub="kg"
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <SectionHeader
          title="Your goal"
          subtitle="Set a plan name, target and daily calories"
        />

        <Field label="Plan name" htmlFor="nameInput">
          <Input
            id="nameInput"
            name="name"
            value={form.name}
            onChange={(event) => set("name", event.target.value)}
            placeholder="e.g. Summer cut 2026"
            maxLength={120}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date" htmlFor="startedAtInput">
            <Input
              id="startedAtInput"
              name="startedAt"
              type="date"
              value={form.startedAt}
              onChange={(event) => set("startedAt", event.target.value)}
              required
            />
          </Field>
          <Field label="Target weight (kg)" htmlFor="targetWeightInput">
            <Input
              id="targetWeightInput"
              name="targetWeightKg"
              inputMode="decimal"
              value={form.targetWeightKg}
              onChange={(event) =>
                set("targetWeightKg", event.target.value.replace(/[^0-9.]/g, ""))
              }
              placeholder="e.g. 72"
            />
          </Field>
          <Field
            label="Target body fat %"
            htmlFor="targetBodyFatInput"
            hint="Optional alternative to a target weight"
          >
            <Input
              id="targetBodyFatInput"
              name="targetBodyFatPct"
              inputMode="decimal"
              value={form.targetBodyFatPct}
              onChange={(event) =>
                set("targetBodyFatPct", event.target.value.replace(/[^0-9.]/g, ""))
              }
              placeholder="e.g. 12"
            />
          </Field>
          <Field label="Daily calories" htmlFor="dailyCaloriesInput">
            <Input
              id="dailyCaloriesInput"
              name="dailyCalories"
              inputMode="numeric"
              value={form.dailyCalories}
              onChange={(event) =>
                set("dailyCalories", event.target.value.replace(/[^0-9]/g, ""))
              }
              placeholder="kcal / day"
              required
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => set("dailyCalories", String(Math.round(metrics.tdee)))}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted tap hover:text-ink"
          >
            Set to maintenance ({fmt(metrics.tdee)})
          </button>
          <button
            type="button"
            onClick={() =>
              set(
                "dailyCalories",
                String(Math.max(500, Math.round(metrics.tdee) - 500))
              )
            }
            className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted tap hover:text-ink"
          >
            −500 kcal
          </button>
          <button
            type="button"
            onClick={() =>
              set("dailyCalories", String(Math.round(metrics.tdee) + 300))
            }
            className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted tap hover:text-ink"
          >
            +300 kcal
          </button>
        </div>

        <Field label="Notes (optional)" htmlFor="notesInput">
          <Textarea
            id="notesInput"
            name="notes"
            value={form.notes}
            onChange={(event) => set("notes", event.target.value)}
            placeholder="Training focus, refeed days, reminders…"
            maxLength={500}
          />
        </Field>
      </Card>

      <Card className="space-y-4">
        <SectionHeader title="Live projection" subtitle="Updates as you type" />

        <div className="flex items-center gap-2">
          <Badge tone={tone}>
            {projection.state === "maintenance"
              ? "Maintenance"
              : projection.state === "deficit"
                ? "Deficit"
                : "Surplus"}
          </Badge>
          {goalType !== "maintain" ? (
            <Badge tone="neutral">
              {fmt(projection.magnitude)} kcal / day{" "}
              {projection.state === "deficit" ? "under" : "over"} TDEE
            </Badge>
          ) : (
            <Badge tone="neutral">Eating at TDEE</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat
            label="Weekly change"
            value={`${projection.weeklyChangeKg > 0 ? "+" : ""}${round(
              projection.weeklyChangeKg,
              2
            )}`}
            sub="kg / week"
            tone={
              projection.weeklyChangeKg < 0
                ? "positive"
                : projection.weeklyChangeKg > 0
                  ? "warning"
                  : "ink"
            }
          />
          <Stat
            label="Monthly change"
            value={`${projection.monthlyChangeKg > 0 ? "+" : ""}${round(
              projection.monthlyChangeKg,
              2
            )}`}
            sub="kg / month"
            tone={
              projection.monthlyChangeKg < 0
                ? "positive"
                : projection.monthlyChangeKg > 0
                  ? "warning"
                  : "ink"
            }
          />
        </div>

        {projection.resolvedTargetWeightKg != null ? (
          <div className="rounded-xl border border-line bg-elevated p-3 text-sm">
            <p className="text-muted">
              Target weight{" "}
              <span className="font-semibold text-ink">
                {round(projection.resolvedTargetWeightKg, 1)} kg
              </span>
              {projection.estimatedWeeks != null ? (
                <>
                  {" "}
                  · estimated{" "}
                  <span className="font-semibold text-ink">
                    {projection.estimatedWeeks} weeks
                  </span>{" "}
                  (~{projection.estimatedMonths} months)
                </>
              ) : (
                " · adjust your calories to reach it"
              )}
            </p>
            {projection.estimatedFatMassChangeKg != null ? (
              <p className="mt-1 text-xs text-muted">
                Fat mass change to goal:{" "}
                <span className="font-medium text-ink">
                  {projection.estimatedFatMassChangeKg > 0 ? "+" : ""}
                  {round(projection.estimatedFatMassChangeKg, 1)} kg
                </span>
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-muted">
            Add a target weight or target body fat % to see an estimated timeframe.
          </p>
        )}

        {projection.warnings.length > 0 ? (
          <ul className="space-y-1">
            {projection.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>

      {state.error ? (
        <p className="rounded-xl bg-negative/10 px-3 py-2 text-xs font-medium text-negative">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-xl bg-positive/10 px-3 py-2 text-xs font-medium text-positive">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Start this plan"}
      </Button>
    </form>
  );
}
