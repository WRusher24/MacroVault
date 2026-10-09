import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import type { PlanView } from "@/lib/data/plans";
import { IconTarget } from "@/components/icons";
import { fmt } from "@/lib/utils";

export function PlanBanner({ plan }: { plan: PlanView | null }) {
  if (!plan) {
    return (
      <Card className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">No active plan</p>
          <p className="text-[11px] text-muted">
            Track freely or create a cut / bulk plan.
          </p>
        </div>
        <Link
          href="/plans/new"
          className="shrink-0 rounded-xl bg-primary-soft px-3 py-2 text-xs font-medium text-primary tap"
        >
          Create plan
        </Link>
      </Card>
    );
  }

  const delta = plan.dailyCalories - plan.tdeeAtCreation;
  const state =
    Math.abs(delta) < 25 ? "maintenance" : delta < 0 ? "deficit" : "surplus";
  const tone = state === "deficit" ? "positive" : state === "surplus" ? "warning" : "neutral";

  return (
    <Link href={`/plans/${plan.id}`} className="mb-4 block tap">
      <Card className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <IconTarget size={16} className="text-primary" />
            <p className="truncate text-sm font-semibold text-ink">{plan.name}</p>
            <Badge tone={tone}>{state}</Badge>
          </div>
          <p className="mt-1 text-[11px] text-muted">
            {fmt(plan.dailyCalories)} kcal goal ·{" "}
            {state === "maintenance"
              ? "at maintenance"
              : `${fmt(Math.abs(delta))} kcal ${state}`}
          </p>
        </div>
        <span className="shrink-0 text-[11px] font-medium text-primary">
          View →
        </span>
      </Card>
    </Link>
  );
}
