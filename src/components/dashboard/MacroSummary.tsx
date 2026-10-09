import { Card, MacroBar } from "@/components/ui";
import { macroTargets } from "@/lib/calc/tdee";
import { round } from "@/lib/utils";

const MACROS = [
  { key: "proteinG", label: "Protein", color: "#3b82f6" },
  { key: "carbsG", label: "Carbs", color: "#f59e0b" },
  { key: "fatG", label: "Fat", color: "#ef4444" },
] as const;

export function MacroSummary({
  proteinG,
  carbsG,
  fatG,
  goalCalories,
}: {
  proteinG: number;
  carbsG: number;
  fatG: number;
  goalCalories: number | null;
}) {
  const targets = goalCalories ? macroTargets(goalCalories) : null;
  const values = { proteinG, carbsG, fatG };
  const targetValues = targets ?? null;

  return (
    <Card className="space-y-4">
      <MacroBar proteinG={proteinG} carbsG={carbsG} fatG={fatG} />

      <div className="space-y-3">
        {MACROS.map((macro) => {
          const consumed = values[macro.key];
          const target = targetValues ? targetValues[macro.key] : null;
          const pct =
            target && target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
          return (
            <div key={macro.key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: macro.color }}
                  />
                  {macro.label}
                </span>
                <span className="tabular-nums text-muted">
                  {round(consumed, 1)}
                  {target ? ` / ${target} g` : " g"}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${pct}%`, backgroundColor: macro.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
