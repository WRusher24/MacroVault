"use client";

import { useActionState, useState } from "react";
import { saveProfileAction } from "@/lib/actions/profile";
import { emptyFormState } from "@/lib/actions/state";
import { calculateTdeeWithBodyFat } from "@/lib/calc/tdee";
import { ACTIVITY_LEVELS, GENDERS, type Gender } from "@/lib/constants";
import type { ProfileView } from "@/lib/data/profile";
import { Button, Field, Input, SectionHeader, Select, Stat } from "@/components/ui";
import { cn, fmt } from "@/lib/utils";

function num(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ProfileForm({ profile }: { profile: ProfileView | null }) {
  const [state, formAction, pending] = useActionState(
    saveProfileAction,
    emptyFormState
  );

  const [gender, setGender] = useState<Gender>(
    (profile?.gender as Gender) ?? "male"
  );
  const [age, setAge] = useState(profile ? String(profile.age) : "30");
  const [heightCm, setHeightCm] = useState(
    profile ? String(profile.heightCm) : "175"
  );
  const [weightKg, setWeightKg] = useState(
    profile ? String(profile.weightKg) : "75"
  );
  const [bodyFatPct, setBodyFatPct] = useState(
    profile?.bodyFatPct != null ? String(profile.bodyFatPct) : ""
  );
  const [activityLevel, setActivityLevel] = useState(
    profile?.activityLevel ?? "moderate"
  );

  const metrics = calculateTdeeWithBodyFat({
    gender,
    age: num(age),
    heightCm: num(heightCm),
    weightKg: num(weightKg),
    bodyFatPct: bodyFatPct ? num(bodyFatPct) : null,
    activityLevel,
  });

  return (
    <form action={formAction} className="space-y-4">
      <SectionHeader
        title="Body metrics & TDEE"
        subtitle="Used for maintenance calories and plan math"
      />

      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">Gender</p>
        <div className="grid grid-cols-2 gap-2">
          {GENDERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setGender(option.value)}
              className={cn(
                "h-11 rounded-xl border text-sm font-medium transition-colors tap",
                gender === option.value
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-line text-muted hover:text-ink"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="gender" value={gender} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Age (years)" htmlFor="ageInput">
          <Input
            id="ageInput"
            name="age"
            inputMode="numeric"
            value={age}
            onChange={(event) => setAge(event.target.value.replace(/[^0-9]/g, ""))}
            required
          />
        </Field>
        <Field label="Height (cm)" htmlFor="heightInput">
          <Input
            id="heightInput"
            name="heightCm"
            inputMode="decimal"
            value={heightCm}
            onChange={(event) =>
              setHeightCm(event.target.value.replace(/[^0-9.]/g, ""))
            }
            required
          />
        </Field>
        <Field label="Weight (kg)" htmlFor="weightInput">
          <Input
            id="weightInput"
            name="weightKg"
            inputMode="decimal"
            value={weightKg}
            onChange={(event) =>
              setWeightKg(event.target.value.replace(/[^0-9.]/g, ""))
            }
            required
          />
        </Field>
        <Field label="Body fat % (optional)" htmlFor="bodyFatInput">
          <Input
            id="bodyFatInput"
            name="bodyFatPct"
            inputMode="decimal"
            value={bodyFatPct}
            onChange={(event) =>
              setBodyFatPct(event.target.value.replace(/[^0-9.]/g, ""))
            }
            placeholder="e.g. 18"
          />
        </Field>
      </div>

      <Field label="Activity level" htmlFor="activityInput">
        <Select
          id="activityInput"
          name="activityLevel"
          value={activityLevel}
          onChange={(event) => setActivityLevel(event.target.value)}
        >
          {ACTIVITY_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label} — {level.description}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="BMR" value={fmt(metrics.bmr)} sub="kcal / day" />
        <Stat label="TDEE" value={fmt(metrics.tdee)} sub="maintenance" tone="primary" />
        <Stat
          label="Lean mass"
          value={metrics.leanMassKg != null ? `${metrics.leanMassKg}` : "—"}
          sub="kg"
        />
      </div>

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
        {pending ? "Saving…" : "Save metrics"}
      </Button>
    </form>
  );
}
