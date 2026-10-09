"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCustomFoodAction } from "@/lib/actions/foods";
import { IconTrash } from "@/components/icons";

export function DeleteCustomFoodButton({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete your custom food "${name}"?`)) return;
    setBusy(true);
    await deleteCustomFoodAction(id);
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
