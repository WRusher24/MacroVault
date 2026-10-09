"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteLogEntryAction, updateLogEntryAction } from "@/lib/actions/log";
import type { EntryView } from "@/lib/data/logs";
import { cn } from "@/lib/utils";
import { Sheet } from "../Sheet";
import { Button, inputClasses } from "../ui";
import { IconEdit, IconTrash } from "../icons";

export function LogEntryItem({
  entry,
  hideActions = false,
}: {
  entry: EntryView;
  hideActions?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [grams, setGrams] = useState(String(entry.grams));
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Remove "${entry.foodName}" from this log?`)) return;
    setBusy(true);
    await deleteLogEntryAction(entry.id);
    setBusy(false);
    router.refresh();
  }

  async function save() {
    const value = Number(grams);
    if (!Number.isFinite(value) || value < 1) return;
    setBusy(true);
    await updateLogEntryAction({ id: entry.id, grams: value });
    setBusy(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm text-ink">{entry.foodName}</p>
          <p className="text-[11px] text-muted">
            {entry.grams} g · {entry.proteinG}P {entry.carbsG}C {entry.fatG}F
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span className="mr-1 text-sm font-semibold tabular-nums text-ink">
            {Math.round(entry.calories)}
          </span>
          {!hideActions ? (
            <>
              <button
                type="button"
                aria-label="Edit entry"
                onClick={() => {
                  setGrams(String(entry.grams));
                  setEditing(true);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-ink"
              >
                <IconEdit size={16} />
              </button>
              <button
                type="button"
                aria-label="Delete entry"
                disabled={busy}
                onClick={remove}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-negative/10 hover:text-negative disabled:opacity-50"
              >
                <IconTrash size={16} />
              </button>
            </>
          ) : null}
        </div>
      </div>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Edit portion">
        <div className="space-y-4">
          <p className="text-sm text-muted">{entry.foodName}</p>
          <input
            inputMode="decimal"
            value={grams}
            onChange={(event) => setGrams(event.target.value.replace(/[^0-9.]/g, ""))}
            className={cn(inputClasses, "text-center text-lg font-semibold")}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={save}
              disabled={busy}
            >
              Save
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
