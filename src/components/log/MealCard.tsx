import type { FoodView } from "@/lib/data/foods";
import type { MealView } from "@/lib/data/logs";
import { Card } from "@/components/ui";
import { FoodPicker } from "@/components/FoodPicker";
import { DeleteMealButton } from "./DeleteMealButton";
import { LogEntryItem } from "./LogEntryItem";
import { round } from "@/lib/utils";

export function MealCard({
  meal,
  logDate,
  suggestions,
}: {
  meal: MealView;
  logDate: string;
  suggestions: FoodView[];
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{meal.name}</p>
          <p className="text-[11px] text-muted">
            {Math.round(meal.totals.calories)} kcal · {meal.entries.length} item
            {meal.entries.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <FoodPicker
            logDate={logDate}
            mealId={meal.id}
            mealName={meal.name}
            suggestions={suggestions}
          />
          <DeleteMealButton id={meal.id} name={meal.name} />
        </div>
      </div>

      <div className="divide-y divide-line px-4">
        {meal.entries.length === 0 ? (
          <p className="py-3 text-xs text-muted">
            Empty. Tap “Add food” to fill this meal.
          </p>
        ) : (
          meal.entries.map((entry) => <LogEntryItem key={entry.id} entry={entry} />)
        )}
      </div>

      {meal.entries.length > 0 ? (
        <div className="flex items-center gap-4 border-t border-line px-4 py-2 text-[11px] text-muted">
          <span>
            <span className="font-medium text-ink">
              {round(meal.totals.proteinG, 1)}g
            </span>{" "}
            protein
          </span>
          <span>
            <span className="font-medium text-ink">
              {round(meal.totals.carbsG, 1)}g
            </span>{" "}
            carbs
          </span>
          <span>
            <span className="font-medium text-ink">
              {round(meal.totals.fatG, 1)}g
            </span>{" "}
            fat
          </span>
        </div>
      ) : null}
    </Card>
  );
}
