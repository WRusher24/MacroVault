"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, registerAction } from "@/lib/actions/auth";
import { emptyFormState } from "@/lib/actions/state";
import { Button, Field, Input } from "@/components/ui";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState(action, emptyFormState);

  return (
    <form action={formAction} className="space-y-4">
      {mode === "register" ? (
        <Field label="Name" htmlFor="displayName">
          <Input
            id="displayName"
            name="displayName"
            autoComplete="name"
            placeholder="Alex Carter"
            required
            maxLength={60}
          />
        </Field>
      ) : null}

      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        hint={mode === "register" ? "At least 8 characters." : undefined}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          placeholder="••••••••"
          required
          minLength={mode === "register" ? 8 : 1}
        />
      </Field>

      {state.error ? (
        <p className="rounded-xl bg-negative/10 px-3 py-2 text-xs font-medium text-negative">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending
          ? mode === "login"
            ? "Signing in…"
            : "Creating account…"
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </Button>

      <p className="text-center text-xs text-muted">
        {mode === "login" ? (
          <>
            New to MacroVault?{" "}
            <Link href="/register" className="font-medium text-primary">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
