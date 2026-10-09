import { FoodPicker } from "@/components/FoodPicker";
import type { FoodView, FrequentFoodView } from "@/lib/data/foods";
import { IconBolt } from "@/components/icons";

export function SuggestionRail({
  suggestions,
  logDate,
}: {
  suggestions: FrequentFoodView[];
  logDate: string;
}) {
  if (suggestions.length === 0) return null;
  const asFoods: FoodView[] = suggestions;

  return (
    <div className="mb-4">
      <p className="mb-2 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted">
        <IconBolt size={13} /> Top picks — tap to log
      </p>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {suggestions.map((food) => (
          <FoodPicker
            key={food.id}
            logDate={logDate}
            mealId={null}
            suggestions={asFoods}
            preselect={food}
            triggerClassName="flex w-36 shrink-0 flex-col items-start rounded-2xl border border-line bg-surface p-3 text-left transition-colors tap hover:bg-elevated"
            trigger={
              <div className="w-full">
                <p className="line-clamp-2 h-9 text-xs font-medium leading-snug text-ink">
                  {food.name}
                </p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-primary">
                  {food.calories}
                  <span className="ml-0.5 text-[10px] font-normal text-muted">kcal</span>
                </p>
                <p className="text-[10px] text-muted">logged {food.uses}×</p>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
