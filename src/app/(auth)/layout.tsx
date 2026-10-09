import type { ReactNode } from "react";
import { IconBolt } from "@/components/icons";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-sm">
            <IconBolt size={28} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            MacroVault
          </h1>
          <p className="mt-1 text-sm text-muted">
            Calories, macros, cut &amp; bulk — tracked with precision.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
