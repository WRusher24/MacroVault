import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import {
  categoryCounts,
  listCustomFoods,
  searchFoods,
  getTopFrequentFoods,
} from "@/lib/data/foods";
import { FOOD_CATEGORIES } from "@/lib/constants";
import { todayIso } from "@/lib/dates";
import { AppHeader } from "@/components/AppHeader";
import { FoodPicker } from "@/components/FoodPicker";
import { CustomFoodForm } from "@/components/foods/CustomFoodForm";
import { DeleteCustomFoodButton } from "@/components/foods/DeleteCustomFoodButton";
import { Badge, Card, EmptyState, SectionHeader, inputClasses } from "@/components/ui";
import { IconSearch } from "@/components/icons";
import { cn } from "@/lib/utils";

export const metadata = { title: "Foods" };

function buildFoodsHref(q: string, category: string): string {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category && category !== "All") params.set("category", category);
  const query = params.toString();
  return query ? `/foods?${query}` : "/foods";
}

export default async function FoodsPage({ searchParams }: PageProps<"/foods">) {
  const user = await requireUser();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "All";
  const today = todayIso();

  const [results, counts, customFoods, suggestions] = await Promise.all([
    searchFoods(user.id, q, { category, limit: 60 }),
    categoryCounts(user.id),
    listCustomFoods(user.id),
    getTopFrequentFoods(user.id, 3),
  ]);

  const totalAccessible = counts.reduce((sum, row) => sum + row.count, 0);

  return (
    <>
      <AppHeader
        title="Foods"
        subtitle={`${totalAccessible.toLocaleString()} foods available · ${
          customFoods.length
        } custom`}
      />

      <form action="/foods" method="get" className="mb-3">
        {category !== "All" ? (
          <input type="hidden" name="category" value={category} />
        ) : null}
        <div className="relative">
          <IconSearch
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            name="q"
            dir="auto"
            defaultValue={q}
            placeholder="Search by name (e.g. chicken, oats, apple)"
            className={cn(inputClasses, "pl-10")}
          />
        </div>
      </form>

      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        {["All", ...FOOD_CATEGORIES].map((option) => {
          const count =
            option === "All"
              ? totalAccessible
              : (counts.find((row) => row.category === option)?.count ?? 0);
          const active = category === option;
          return (
            <Link
              key={option}
              href={buildFoodsHref(q, option)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors tap",
                active
                  ? "border-primary bg-primary text-on-primary"
                  : "border-line text-muted hover:text-ink"
              )}
            >
              {option}
              <span className={cn("ml-1", active ? "text-on-primary/70" : "text-muted/70")}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      <SectionHeader
        title={q ? `Results for “${q}”` : "Browse foods"}
        subtitle={`${results.length} shown${results.length >= 60 ? " (top 60)" : ""}`}
      />

      {results.length === 0 ? (
        <EmptyState
          icon={<IconSearch size={26} />}
          title="No foods found"
          description="Try a different search, or add a custom food below."
        />
      ) : (
        <div className="space-y-2">
          {results.map((food) => (
            <Card key={food.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-ink">{food.name}</p>
                  {food.isCustom ? <Badge tone="primary">Custom</Badge> : null}
                </div>
                <p className="text-[11px] text-muted">
                  {food.category} · {food.calories} kcal · {food.proteinG}P{" "}
                  {food.carbsG}C {food.fatG}F{" "}
                  <span className="text-muted/70">/ 100g</span>
                </p>
              </div>
              <FoodPicker
                logDate={today}
                mealId={null}
                suggestions={suggestions}
                preselect={food}
                triggerClassName="shrink-0 rounded-xl bg-primary-soft px-3 py-2 text-xs font-medium text-primary tap"
                trigger="Log"
              />
            </Card>
          ))}
        </div>
      )}

      {customFoods.length > 0 ? (
        <>
          <SectionHeader
            className="mt-6"
            title="My custom foods"
            subtitle="Only visible to your account"
          />
          <div className="space-y-2">
            {customFoods.map((food) => (
              <Card key={food.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{food.name}</p>
                  <p className="text-[11px] text-muted">
                    {food.category} · {food.calories} kcal · {food.proteinG}P{" "}
                    {food.carbsG}C {food.fatG}F
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <FoodPicker
                    logDate={today}
                    mealId={null}
                    suggestions={suggestions}
                    preselect={food}
                    triggerClassName="rounded-xl bg-primary-soft px-3 py-2 text-xs font-medium text-primary tap"
                    trigger="Log"
                  />
                  <DeleteCustomFoodButton id={food.id} name={food.name} />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      <SectionHeader
        className="mt-6"
        title="Add a custom food"
        subtitle="Per 100 g values, saved to your account"
      />
      <Card>
        <CustomFoodForm />
      </Card>
    </>
  );
}
