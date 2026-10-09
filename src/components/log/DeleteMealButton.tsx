"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMealAction } from "@/lib/actions/log";
import { IconTrash } from "../icons";

export function DeleteMealButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete the "${name}" meal and all of its items?`)) return;
    setBusy(true);
    await deleteMealAction(id);
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      aria-label={`Delete ${name}`}
      disabled={busy}
      onClick={remove}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-negative/10 hover:text-negative disabled:opacity-50"
    >
      <IconTrash size={16} />
    </button>
  );
}
