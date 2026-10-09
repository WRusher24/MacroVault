import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getHistoryDays } from "@/lib/data/logs";
import { AppHeader } from "@/components/AppHeader";
import { Badge, Card, EmptyState, Stat } from "@/components/ui";
import { IconCalendar } from "@/components/icons";
import { formatDateLong, relativeDayLabel } from "@/lib/dates";
import { fmt, round } from "@/lib/utils";

export const metadata = { title: "History" };

export default async function HistoryPage() {
  const user = await requireUser();
  const days = await getHistoryDays(user.id, 120);

  const totalDays = days.length;
  const avgCalories =
    totalDays > 0
      ? Math.round(days.reduce((sum, day) => sum + day.calories, 0) / totalDays)
      : 0;
  const avgProtein =
    totalDays > 0
      ? round(days.reduce((sum, day) => sum + day.proteinG, 0) / totalDays, 0)
      : 0;
  const totalEntries = days.reduce((sum, day) => sum + day.entryCount, 0);

  return (
    <>
      <AppHeader
        title="History"
        subtitle="Daily archive of everything you logged"
        right={
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted tap hover:text-ink"
            aria-label="Back to today"
          >
            <IconCalendar size={20} />
          </Link>
        }
      />

      {totalDays === 0 ? (
        <EmptyState
          icon={<IconCalendar size={26} />}
          title="No history yet"
          description="Once you log foods, each finished day rolls into this archive."
        />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2">
            <Stat label="Days logged" value={totalDays} tone="primary" />
            <Stat label="Avg kcal" value={fmt(avgCalories)} sub="per day" />
            <Stat label="Avg protein" value={`${avgProtein} g`} sub="per day" />
          </div>
          <p className="mb-3 text-xs text-muted">
            {fmt(totalEntries)} food entries archived. Showing the last {totalDays}{" "}
            active days.
          </p>

          <div className="space-y-2">
            {days.map((day) => (
              <Link
                key={day.date}
                href={`/dashboard?date=${day.date}`}
                className="block tap"
              >
                <Card className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-ink">
                        {relativeDayLabel(day.date)}
                      </p>
                      {day.date === days[0].date ? (
                        <Badge tone="primary">Latest</Badge>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-muted">
                      {formatDateLong(day.date)} · {day.entryCount} item
                      {day.entryCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-ink">
                      {fmt(day.calories)}
                      <span className="ml-0.5 text-[10px] font-normal text-muted">
                        kcal
                      </span>
                    </p>
                    <p className="text-[11px] text-muted">
                      {round(day.proteinG, 0)}P {round(day.carbsG, 0)}C{" "}
                      {round(day.fatG, 0)}F
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
