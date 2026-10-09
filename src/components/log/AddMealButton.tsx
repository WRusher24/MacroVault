"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMealAction } from "@/lib/actions/log";
import { MEAL_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Sheet } from "../Sheet";
import { Button, inputClasses } from "../ui";
import { IconPlus } from "../icons";

export function AddMealButton({
  logDate,
  existingNames,
}: {
  logDate: string;
  existingNames: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const available = MEAL_PRESETS.filter((preset) => !existingNames.includes(preset));

  async function save(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Name your meal.");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await createMealAction({ name: trimmed, logDate });
    setBusy(false);
    if (result.ok) {
      setOpen(false);
      setName("");
      router.refresh();
    } else {
      setError(result.error ?? "Could not create meal.");
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <IconPlus size={16} /> New meal
      </Button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="New meal"
        subtitle="Group foods into a meal container"
      >
        <div className="space-y-4">
          {available.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {available.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => save(preset)}
                  disabled={busy}
                  className={cn(
                    "rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors tap hover:text-ink disabled:opacity-50"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
          ) : null}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Custom name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Pre-workout"
              className={inputClasses}
            />
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
            disabled={busy || !name.trim()}
            onClick={() => save(name)}
          >
            {busy ? "Creating…" : "Create meal"}
          </Button>
        </div>
      </Sheet>
    </>
  );
}
