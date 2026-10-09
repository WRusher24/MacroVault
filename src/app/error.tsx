"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-lg font-semibold text-ink">Something went wrong</h1>
      <p className="mt-1 text-sm text-muted">
        An unexpected error occurred. You can try again, or head back to the
        dashboard.
      </p>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-medium text-on-primary tap"
        >
          Try again
        </button>
        <a
          href="/dashboard"
          className="inline-flex h-11 items-center rounded-xl border border-line px-5 text-sm font-medium text-ink tap"
        >
          Dashboard
        </a>
      </div>
    </div>
  );
}
