import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getPlan } from "@/lib/data/plans";
import { getDailyIntakes } from "@/lib/data/logs";
import { computePlanProgress, projectGoal } from "@/lib/calc/tdee";
import {
  diffInDays,
  formatDateLong,
  formatDateShort,
  relativeDayLabel,
  todayIso,
  toIsoDate,
} from "@/lib/dates";
import { AppHeader } from "@/components/AppHeader";
import { PlanActions } from "@/components/plans/PlanActions";
import {
  Badge,
  Card,
  ProgressBar,
  SectionHeader,
  Stat,
} from "@/components/ui";
import { IconChevronLeft } from "@/components/icons";
import { fmt, round } from "@/lib/utils";

export const metadata = { title: "Plan" };

export default async function PlanDetailPage({
  params,
}: PageProps<"/plans/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const planId = Number(id);
  if (!Number.isInteger(planId) || planId <= 0) notFound();

  const plan = await getPlan(user.id, planId);
  if (!plan) notFound();

  const endSource = plan.closedAt ?? plan.archivedAt;
  const endDate = plan.status === "active" || !endSource ? todayIso() : toIsoDate(endSource);
  const intakes = await getDailyIntakes(user.id, plan.startedAt, endDate);

  const progress = computePlanProgress(
    plan.tdeeAtCreation,
    intakes.map((row) => ({ date: row.date, intake: row.intake, hasEntries: true }))
  );

  const projection = projectGoal({
    startWeightKg: plan.startWeightKg,
    targetWeightKg: plan.targetWeightKg,
    startBodyFatPct: plan.startBodyFatPct,
    targetBodyFatPct: plan.targetBodyFatPct,
    dailyCalories: plan.dailyCalories,
    tdee: plan.tdeeAtCreation,
  });

  const delta = plan.dailyCalories - plan.tdeeAtCreation;
  const state =
    Math.abs(delta) < 25 ? "maintenance" : delta < 0 ? "deficit" : "surplus";
  const stateTone =
    state === "deficit" ? "positive" : state === "surplus" ? "warning" : "neutral";

  const elapsedDays = diffInDays(plan.startedAt, endDate) + 1;
  const goalFat = projection.estimatedFatMassChangeKg;
  const achievedFat = Math.abs(progress.estimatedFatKg);
  const goalFatAbs = goalFat != null ? Math.abs(goalFat) : null;
  const progressPct =
    goalFatAbs && goalFatAbs > 0
      ? Math.min(100, (achievedFat / goalFatAbs) * 100)
      : null;

  const recent = [...intakes].reverse().slice(0, 10);

  return (
    <>
      <AppHeader
        title={plan.name}
        subtitle={`Started ${formatDateShort(plan.startedAt)}`}
        right={
          <Link
            href="/plans"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted tap hover:text-ink"
            aria-label="Back to plans"
          >
            <IconChevronLeft size={20} />
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <Badge tone={stateTone}>{plan.goalType}</Badge>
        <Badge tone={plan.status === "active" ? "primary" : "neutral"}>
          {plan.status}
        </Badge>
        {state !== "maintenance" ? (
          <span className="text-xs text-muted">
            {fmt(Math.abs(delta))} kcal {state} / day
          </span>
        ) : (
          <span className="text-xs text-muted">At maintenance</span>
        )}
      </div>

      <Card className="mb-4 space-y-3">
        <SectionHeader title="Plan setup" />
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Daily calories" value={fmt(plan.dailyCalories)} sub="kcal goal" />
          <Stat
            label="TDEE at creation"
            value={fmt(plan.tdeeAtCreation)}
            sub="kcal maintenance"
          />
          <Stat
            label="Start weight"
            value={`${plan.startWeightKg} kg`}
            sub={plan.startBodyFatPct != null ? `${plan.startBodyFatPct}% bf` : undefined}
          />
          <Stat
            label="Target"
            value={
              plan.targetWeightKg != null
                ? `${plan.targetWeightKg} kg`
                : plan.targetBodyFatPct != null
                  ? `${plan.targetBodyFatPct}% bf`
                  : "—"
            }
            sub={
              projection.resolvedTargetWeightKg != null && plan.targetWeightKg == null
                ? `≈ ${round(projection.resolvedTargetWeightKg, 1)} kg`
                : undefined
            }
          />
        </div>
        {projection.resolvedTargetWeightKg != null &&
        projection.estimatedWeeks != null ? (
          <p className="rounded-xl bg-elevated px-3 py-2 text-xs text-muted">
            Estimated{" "}
            <span className="font-semibold text-ink">
              {projection.estimatedWeeks} weeks
            </span>{" "}
            (~{projection.estimatedMonths} months) at{" "}
            {fmt(plan.dailyCalories)} kcal to reach{" "}
            {round(projection.resolvedTargetWeightKg, 1)} kg.
          </p>
        ) : null}
      </Card>

      <Card className="mb-4 space-y-4">
        <SectionHeader
          title="Cumulative progress"
          subtitle={`${elapsedDays} day${elapsedDays === 1 ? "" : "s"} in plan · ${progress.trackedDays} tracked`}
        />
        <div className="grid grid-cols-2 gap-2">
          <Stat
            label={progress.cumulativeDelta <= 0 ? "Total deficit" : "Total surplus"}
            value={`${fmt(Math.abs(progress.cumulativeDelta))}`}
            sub="kcal since start"
            tone={progress.cumulativeDelta <= 0 ? "positive" : "warning"}
          />
          <Stat
            label="Estimated fat change"
            value={`${progress.estimatedFatKg > 0 ? "+" : ""}${round(
              progress.estimatedFatKg,
              2
            )} kg`}
            sub="from calorie math"
            tone={progress.estimatedFatKg <= 0 ? "positive" : "warning"}
          />
          <Stat
            label="Deficit days"
            value={progress.deficitDays}
            sub="under TDEE"
            tone="positive"
          />
          <Stat
            label="Surplus days"
            value={progress.surplusDays}
            sub="over TDEE"
            tone="warning"
          />
        </div>

        {progressPct != null && goalFat != null ? (
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted">
              <span>
                {goalFat < 0 ? "Fat loss" : "Mass gain"} progress toward goal
              </span>
              <span className="tabular-nums">{round(progressPct, 0)}%</span>
            </div>
            <ProgressBar
              value={progressPct}
              max={100}
              tone={goalFat < 0 ? "positive" : "warning"}
            />
            <p className="mt-1 text-[11px] text-muted">
              {round(achievedFat, 2)} kg of {round(goalFatAbs ?? 0, 2)} kg
              estimated goal
            </p>
          </div>
        ) : null}

        {progress.averageIntake != null ? (
          <p className="text-xs text-muted">
            Average intake on tracked days:{" "}
            <span className="font-medium text-ink">
              {fmt(progress.averageIntake)} kcal
            </span>{" "}
            ({progress.averageDeltaPerTrackedDay != null
              ? `${fmt(Math.abs(progress.averageDeltaPerTrackedDay))} kcal ${
                  (progress.averageDeltaPerTrackedDay ?? 0) <= 0 ? "deficit" : "surplus"
                }`
              : ""}
            )
          </p>
        ) : (
          <p className="text-xs text-muted">
            No logged days yet. Start logging foods to build cumulative stats.
          </p>
        )}
      </Card>

      {recent.length > 0 ? (
        <Card className="mb-4">
          <SectionHeader title="Recent days" subtitle="Last 10 tracked days" />
          <div className="divide-y divide-line">
            {recent.map((row) => {
              const rowDelta = row.intake - plan.tdeeAtCreation;
              const over = rowDelta > 0;
              return (
                <Link
                  key={row.date}
                  href={`/dashboard?date=${row.date}`}
                  className="flex items-center justify-between py-2 tap"
                >
                  <span className="text-sm text-ink">
                    {relativeDayLabel(row.date)}
                  </span>
                  <span className="flex items-center gap-3 text-sm">
                    <span className="tabular-nums text-muted">
                      {fmt(row.intake)} kcal
                    </span>
                    <span
                      className={`w-16 text-right text-xs font-medium tabular-nums ${
                        over ? "text-warning" : "text-positive"
                      }`}
                    >
                      {over ? "+" : "−"}
                      {fmt(Math.abs(rowDelta))}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </Card>
      ) : null}

      {plan.notes ? (
        <Card className="mb-4">
          <SectionHeader title="Notes" />
          <p className="whitespace-pre-wrap text-sm text-muted">{plan.notes}</p>
        </Card>
      ) : null}

      <Card className="mb-4">
        <SectionHeader
          title="Manage"
          subtitle={`Created ${formatDateLong(toIsoDate(plan.createdAt))}`}
        />
        <PlanActions id={plan.id} status={plan.status} />
      </Card>
    </>
  );
}
