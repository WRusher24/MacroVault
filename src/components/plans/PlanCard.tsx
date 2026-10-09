import Link from "next/link";
import type { PlanView } from "@/lib/data/plans";
import { Badge, Card } from "@/components/ui";
import { PlanActions } from "./PlanActions";
import { fmt } from "@/lib/utils";
import { formatDateShort } from "@/lib/dates";

export function PlanCard({ plan }: { plan: PlanView }) {
  const delta = plan.dailyCalories - plan.tdeeAtCreation;
  const state =
    Math.abs(delta) < 25 ? "maintenance" : delta < 0 ? "deficit" : "surplus";
  const tone =
    state === "deficit" ? "positive" : state === "surplus" ? "warning" : "neutral";

  return (
    <Card className="space-y-3">
      <Link href={`/plans/${plan.id}`} className="block tap">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{plan.name}</p>
            <p className="text-[11px] text-muted">
              Started {formatDateShort(plan.startedAt)} · {fmt(plan.dailyCalories)}{" "}
              kcal / day
            </p>
          </div>
          <Badge tone={tone}>{plan.goalType}</Badge>
        </div>
        <p className="mt-2 text-xs text-muted">
          {state === "maintenance"
            ? "At maintenance calories"
            : `${fmt(Math.abs(delta))} kcal ${state} / day`}
          {plan.targetWeightKg != null
            ? ` · target ${plan.targetWeightKg} kg`
            : ""}
        </p>
      </Link>
      <PlanActions id={plan.id} status={plan.status} />
    </Card>
  );
}
