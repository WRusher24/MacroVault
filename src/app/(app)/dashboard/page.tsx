import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/data/profile";
import { getActivePlan } from "@/lib/data/plans";
import { getDayLog } from "@/lib/data/logs";
import { getTopFrequentFoods } from "@/lib/data/foods";
import { isValidIsoDate, todayIso } from "@/lib/dates";
import { AppHeader } from "@/components/AppHeader";
import { DayNavigator } from "@/components/dashboard/DayNavigator";
import { CalorieSummary } from "@/components/dashboard/CalorieSummary";
import { MacroSummary } from "@/components/dashboard/MacroSummary";
import { PlanBanner } from "@/components/dashboard/PlanBanner";
import { SuggestionRail } from "@/components/dashboard/SuggestionRail";
import { MealCard } from "@/components/log/MealCard";
import { AddMealButton } from "@/components/log/AddMealButton";
import { LogEntryItem } from "@/components/log/LogEntryItem";
import { FoodPicker } from "@/components/FoodPicker";
import { Card, EmptyState, SectionHeader } from "@/components/ui";
import { IconBolt, IconCalendar, IconFoods } from "@/components/icons";

export const metadata = { title: "Today" };

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const user = await requireUser();
  const params = await searchParams;
  const dateParam = typeof params.date === "string" ? params.date : undefined;
  const date = dateParam && isValidIsoDate(dateParam) ? dateParam : todayIso();

  const [profile, plan, dayLog, suggestions] = await Promise.all([
    getProfile(user.id),
    getActivePlan(user.id),
    getDayLog(user.id, date),
    getTopFrequentFoods(user.id, 3),
  ]);

  const goalCalories = plan?.dailyCalories ?? profile?.tdee ?? null;
  const firstName = user.displayName.split(" ")[0];

  return (
    <>
      <AppHeader
        title={`Hi, ${firstName}`}
        subtitle={plan ? `Active plan · ${plan.name}` : "Maintenance tracking"}
        right={
          <Link
            href="/history"
            aria-label="History"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted tap hover:text-ink"
          >
            <IconCalendar size={20} />
          </Link>
        }
      />

      <DayNavigator date={date} />

      <CalorieSummary
        consumed={dayLog.totals.calories}
        target={plan?.dailyCalories ?? null}
        tdee={profile?.tdee ?? null}
      />

      <div className="mt-4">
        <MacroSummary
          proteinG={dayLog.totals.proteinG}
          carbsG={dayLog.totals.carbsG}
          fatG={dayLog.totals.fatG}
          goalCalories={goalCalories}
        />
      </div>

      <div className="mt-4">
        <PlanBanner plan={plan} />
      </div>

      <SuggestionRail suggestions={suggestions} logDate={date} />

      <FoodPicker
        logDate={date}
        mealId={null}
        suggestions={suggestions}
        quick
        triggerClassName="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-medium text-on-primary shadow-sm tap hover:opacity-90"
        trigger={
          <>
            <IconBolt size={18} /> Quick log a food
          </>
        }
      />

      <SectionHeader
        className="mt-6"
        title="Meals"
        subtitle="Structured breakfast, lunch, dinner and more"
        action={
          <AddMealButton
            logDate={date}
            existingNames={dayLog.meals.map((meal) => meal.name)}
          />
        }
      />

      {dayLog.meals.length === 0 ? (
        <EmptyState
          icon={<IconFoods size={26} />}
          title="No meals yet today"
          description="Create a meal to group foods, or use Quick log for a single item."
        />
      ) : (
        <div className="space-y-3">
          {dayLog.meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              logDate={date}
              suggestions={suggestions}
            />
          ))}
        </div>
      )}

      {dayLog.loose.length > 0 ? (
        <div className="mt-5">
          <SectionHeader title="Quick items" subtitle="Logged without a meal" />
          <Card className="divide-y divide-line px-4 py-1">
            {dayLog.loose.map((entry) => (
              <LogEntryItem key={entry.id} entry={entry} />
            ))}
          </Card>
        </div>
      ) : null}

      {dayLog.entryCount === 0 ? (
        <p className="mt-6 text-center text-xs text-muted">
          Nothing logged for this day yet.
        </p>
      ) : null}
    </>
  );
}
