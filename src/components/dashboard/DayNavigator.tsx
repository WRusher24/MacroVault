import Link from "next/link";
import { addDaysIso, relativeDayLabel, todayIso } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

export function DayNavigator({ date }: { date: string }) {
  const today = todayIso();
  const prev = addDaysIso(date, -1);
  const next = addDaysIso(date, 1);
  const atToday = date >= today;

  const navClass =
    "flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors tap hover:bg-elevated hover:text-ink";

  return (
    <div className="mb-4 flex items-center justify-between rounded-2xl border border-line bg-surface px-2 py-1.5">
      <Link href={`/dashboard?date=${prev}`} aria-label="Previous day" className={navClass}>
        <IconChevronLeft size={18} />
      </Link>

      <div className="text-center">
        <p className="text-sm font-semibold text-ink">{relativeDayLabel(date)}</p>
        <p className="text-[11px] text-muted">
          {date}
          {date !== today ? (
            <>
              {" · "}
              <Link href="/dashboard" className="font-medium text-primary">
                back to today
              </Link>
            </>
          ) : null}
        </p>
      </div>

      <Link
        href={atToday ? "/dashboard" : `/dashboard?date=${next}`}
        aria-label="Next day"
        aria-disabled={atToday}
        className={cn(navClass, atToday && "pointer-events-none opacity-30")}
      >
        <IconChevronRight size={18} />
      </Link>
    </div>
  );
}
