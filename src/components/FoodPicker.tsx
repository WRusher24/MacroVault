"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { searchFoodsAction } from "@/lib/actions/foods";
import { addLogEntryAction } from "@/lib/actions/log";
import type { FoodView } from "@/lib/data/foods";
import { FOOD_CATEGORIES } from "@/lib/constants";
import { cn, round } from "@/lib/utils";
import { Badge, Button, inputClasses } from "./ui";
import { Sheet } from "./Sheet";
import { IconBolt, IconChevronLeft, IconPlus, IconSearch } from "./icons";

const GRAM_PRESETS = [50, 100, 150, 200];

export function FoodPicker({
  logDate,
  mealId,
  mealName,
  suggestions,
  triggerLabel = "Add food",
  variant = "secondary",
  quick = false,
  preselect = null,
  trigger,
  triggerClassName,
}: {
  logDate: string;
  mealId: number | null;
  mealName?: string;
  suggestions: FoodView[];
  triggerLabel?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  quick?: boolean;
  preselect?: FoodView | null;
  trigger?: ReactNode;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [results, setResults] = useState<FoodView[]>(suggestions);
  const [selected, setSelected] = useState<FoodView | null>(null);
  const [grams, setGrams] = useState("100");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setCategory("All");
    setError(null);
    setResults(suggestions);
    setGrams("100");
    setSelected(preselect ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preselect]);

  useEffect(() => {
    if (!open || selected) return;
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const rows = await searchFoodsAction(query, category);
        if (!cancelled) setResults(rows);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, category, open, selected]);

  const gramsNum = Number(grams);
  const preview = selected
    ? {
        calories: round((selected.calories * gramsNum) / 100, 0),
        proteinG: round((selected.proteinG * gramsNum) / 100, 1),
        carbsG: round((selected.carbsG * gramsNum) / 100, 1),
        fatG: round((selected.fatG * gramsNum) / 100, 1),
      }
    : null;

  async function confirm() {
    if (!selected) return;
    if (!Number.isFinite(gramsNum) || gramsNum < 1 || gramsNum > 5000) {
      setError("Enter a weight between 1 and 5000 grams.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await addLogEntryAction({
      logDate,
      foodId: selected.id,
      grams: gramsNum,
      mealId,
    });
    setSaving(false);
    if (result.ok) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error ?? "Could not add this food.");
    }
  }

  return (
    <>
      {trigger ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={triggerClassName}
        >
          {trigger}
        </button>
      ) : (
        <Button variant={variant} size="sm" onClick={() => setOpen(true)}>
          {quick ? <IconBolt size={16} /> : <IconPlus size={16} />}
          {triggerLabel}
        </Button>
      )}

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={selected ? selected.name : mealName ? `Add to ${mealName}` : "Quick log"}
        subtitle={
          selected
            ? `${selected.category} · per 100 g`
            : mealName
              ? "Search 1,000+ foods or pick a suggestion"
              : "Log a single item straight to today"
        }
      >
        {selected && preview ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="flex items-center gap-1 text-xs font-medium text-muted hover:text-ink"
            >
              <IconChevronLeft size={15} /> Back to search
            </button>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Weight (grams)
              </label>
              <input
                inputMode="decimal"
                value={grams}
                onChange={(event) => setGrams(event.target.value.replace(/[^0-9.]/g, ""))}
                className={cn(inputClasses, "text-center text-lg font-semibold")}
                placeholder="100"
              />
              <div className="mt-2 flex gap-2">
                {GRAM_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setGrams(String(preset))}
                    className={cn(
                      "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors tap",
                      Number(grams) === preset
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-line text-muted hover:text-ink"
                    )}
                  >
                    {preset} g
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 rounded-2xl border border-line bg-elevated p-3">
              {[
                { label: "kcal", value: preview.calories },
                { label: "Protein", value: `${preview.proteinG}g` },
                { label: "Carbs", value: `${preview.carbsG}g` },
                { label: "Fat", value: `${preview.fatG}g` },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-[11px] text-muted">{item.label}</p>
                  <p className="text-sm font-semibold tabular-nums text-ink">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {error ? (
              <p className="rounded-lg bg-negative/10 px-3 py-2 text-xs text-negative">
                {error}
              </p>
            ) : null}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={confirm}
              disabled={saving}
            >
              {saving ? "Adding…" : `Add ${preview.calories} kcal`}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <IconSearch
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                autoFocus
                dir="auto"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search foods…"
                className={cn(inputClasses, "pl-10")}
              />
            </div>

            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {["All", ...FOOD_CATEGORIES].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategory(option)}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors tap",
                    category === option
                      ? "border-primary bg-primary text-on-primary"
                      : "border-line text-muted hover:text-ink"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            {!query && category === "All" && suggestions.length > 0 ? (
              <div>
                <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                  <IconBolt size={13} /> Your top picks
                </p>
                <div className="space-y-1.5">
                  {suggestions.map((food) => (
                    <FoodRow key={`s-${food.id}`} food={food} onPick={setSelected} />
                  ))}
                </div>
                <div className="my-3 h-px bg-line" />
              </div>
            ) : null}

            <div className="space-y-1.5">
              {loading && results.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted">Searching…</p>
              ) : null}
              {!loading && results.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted">
                  No foods found. Try another search or add a custom food under Foods.
                </p>
              ) : null}
              {results.map((food) => (
                <FoodRow key={food.id} food={food} onPick={setSelected} />
              ))}
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}

function FoodRow({
  food,
  onPick,
}: {
  food: FoodView;
  onPick: (food: FoodView) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(food)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 text-left transition-colors tap hover:bg-elevated"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{food.name}</p>
        <p className="text-[11px] text-muted">
          {food.calories} kcal · {food.proteinG}P {food.carbsG}C {food.fatG}F
        </p>
      </div>
      {food.isCustom ? <Badge tone="primary">Custom</Badge> : null}
    </button>
  );
}
