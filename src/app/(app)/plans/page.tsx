import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listPlans, partitionPlans } from "@/lib/data/plans";
import { AppHeader } from "@/components/AppHeader";
import { PlanCard } from "@/components/plans/PlanCard";
import { EmptyState, SectionHeader } from "@/components/ui";
import { IconTarget } from "@/components/icons";

export const metadata = { title: "Plans" };

export default async function PlansPage() {
  const user = await requireUser();
  const plans = await listPlans(user.id);
  const { active, closed, archived } = partitionPlans(plans);

  return (
    <>
      <AppHeader
        title="Plans"
        subtitle="Cut, bulk or maintain — on your terms"
        right={
          <Link
            href="/plans/new"
            className="rounded-xl bg-primary px-3 py-2 text-xs font-medium text-on-primary tap"
          >
            New plan
          </Link>
        }
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={<IconTarget size={26} />}
          title="No plans yet"
          description="Create a cut or bulk plan to set a daily calorie goal and track cumulative progress. You can also keep tracking without any plan."
          action={
            <Link
              href="/plans/new"
              className="inline-flex h-11 items-center rounded-xl bg-primary px-4 text-sm font-medium text-on-primary tap"
            >
              Create your first plan
            </Link>
          }
        />
      ) : null}

      {active.length > 0 ? (
        <>
          <SectionHeader title="Active" subtitle="Currently guiding your daily goal" />
          <div className="mb-6 space-y-3">
            {active.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </>
      ) : null}

      {closed.length > 0 ? (
        <>
          <SectionHeader title="Closed" subtitle="Completed or paused plans" />
          <div className="mb-6 space-y-3">
            {closed.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </>
      ) : null}

      {archived.length > 0 ? (
        <>
          <SectionHeader
            title="Archived"
            subtitle="Historical snapshots kept for reference"
          />
          <div className="space-y-3">
            {archived.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}
