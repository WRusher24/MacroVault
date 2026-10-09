"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  archivePlanAction,
  closePlanAction,
  deletePlanAction,
  reopenPlanAction,
} from "@/lib/actions/plans";
import type { ActionResult } from "@/lib/actions/state";
import { Button } from "@/components/ui";

export function PlanActions({
  id,
  status,
  showDelete = true,
}: {
  id: number;
  status: string;
  showDelete?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(
    action: () => Promise<ActionResult>,
    options: { confirm?: string; redirectTo?: string } = {}
  ) {
    if (options.confirm && !window.confirm(options.confirm)) return;
    setBusy(true);
    await action();
    setBusy(false);
    if (options.redirectTo) router.push(options.redirectTo);
    else router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "active" ? (
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() =>
            run(() => closePlanAction(id), {
              confirm: "Close this plan? Your logs are kept and metrics stay frozen.",
            })
          }
        >
          Close plan
        </Button>
      ) : null}

      {status === "active" ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() =>
            run(() => archivePlanAction(id), {
              confirm: "Archive this plan to keep a historical snapshot?",
            })
          }
        >
          Archive
        </Button>
      ) : null}

      {status !== "active" ? (
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => run(() => reopenPlanAction(id))}
        >
          Reactivate
        </Button>
      ) : null}

      {showDelete ? (
        <Button
          variant="ghost"
          size="sm"
          className="text-negative hover:bg-negative/10"
          disabled={busy}
          onClick={() =>
            run(() => deletePlanAction(id), {
              confirm: "Delete this plan permanently? Logged foods are not affected.",
              redirectTo: "/plans",
            })
          }
        >
          Delete
        </Button>
      ) : null}
    </div>
  );
}
