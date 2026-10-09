import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/data/profile";
import { todayIso } from "@/lib/dates";
import { AppHeader } from "@/components/AppHeader";
import { PlanForm } from "@/components/plans/PlanForm";
import { IconChevronLeft } from "@/components/icons";

export const metadata = { title: "New plan" };

export default async function NewPlanPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  return (
    <>
      <AppHeader
        title="New plan"
        subtitle="Calculate TDEE, then set your target"
        right={
          <Link
            href="/plans"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted tap hover:text-ink"
            aria-label="Back to plans"
          >
            <IconChevronLeft size={20} />
          </Link>
        }
      />
      <PlanForm profile={profile} today={todayIso()} />
    </>
  );
}
