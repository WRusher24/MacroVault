import { Card } from "@/components/ui";
import { round } from "@/lib/utils";

function Ring({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const over = max > 0 && value > max;
  return (
    <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="var(--line)"
        strokeWidth="10"
      />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke={over ? "var(--negative)" : "var(--primary)"}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - pct)}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

export function CalorieSummary({
  consumed,
  target,
  tdee,
}: {
  consumed: number;
  target: number | null;
  tdee: number | null;
}) {
  const goal = target ?? tdee;
  const remaining = goal !== null ? goal - consumed : null;
  const over = remaining !== null && remaining < 0;

  return (
    <Card className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        <Ring value={consumed} max={goal ?? 0} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {goal === null ? (
            <>
              <span className="text-2xl font-semibold tabular-nums text-ink">
                {Math.round(consumed)}
              </span>
              <span className="text-[11px] text-muted">kcal logged</span>
            </>
          ) : (
            <>
              <span
                className={`text-2xl font-semibold tabular-nums ${
                  over ? "text-negative" : "text-ink"
                }`}
              >
                {Math.abs(Math.round(remaining ?? 0))}
              </span>
              <span className="text-[11px] text-muted">
                {over ? "kcal over" : "kcal left"}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid w-full grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[11px] text-muted">Consumed</p>
          <p className="text-sm font-semibold tabular-nums text-ink">
            {Math.round(consumed)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted">Goal</p>
          <p className="text-sm font-semibold tabular-nums text-ink">
            {goal === null ? "—" : Math.round(goal)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted">Projected TDEE</p>
          <p className="text-sm font-semibold tabular-nums text-ink">
            {tdee === null ? "—" : Math.round(tdee)}
          </p>
        </div>
      </div>

      {goal !== null ? (
        <p className="text-center text-[11px] text-muted">
          {round((consumed / goal) * 100, 0)}% of today&apos;s{" "}
          {target !== null ? "plan" : "maintenance"} calories
        </p>
      ) : (
        <p className="text-center text-[11px] text-muted">
          Set your body metrics in Settings or create a plan to get a calorie goal.
        </p>
      )}
    </Card>
  );
}
