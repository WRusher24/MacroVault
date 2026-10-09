"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  updateAccountAction,
} from "@/lib/actions/auth";
import { emptyFormState } from "@/lib/actions/state";
import { Button, Field, Input } from "@/components/ui";

function Message({ error, success }: { error: string | null; success: string | null }) {
  if (error) {
    return (
      <p className="rounded-xl bg-negative/10 px-3 py-2 text-xs font-medium text-negative">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p className="rounded-xl bg-positive/10 px-3 py-2 text-xs font-medium text-positive">
        {success}
      </p>
    );
  }
  return null;
}

export function AccountForm({ displayName }: { displayName: string }) {
  const [state, formAction, pending] = useActionState(
    updateAccountAction,
    emptyFormState
  );

  return (
    <form action={formAction} className="space-y-3">
      <Field label="Display name" htmlFor="displayName">
        <Input
          id="displayName"
          name="displayName"
          defaultValue={displayName}
          maxLength={60}
          required
        />
      </Field>
      <Message error={state.error} success={state.success} />
      <Button type="submit" variant="outline" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Update profile"}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    emptyFormState
  );

  return (
    <form action={formAction} className="space-y-3">
      <Field label="Current password" htmlFor="currentPassword">
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <Field label="New password" htmlFor="newPassword" hint="At least 8 characters.">
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      <Message error={state.error} success={state.success} />
      <Button type="submit" variant="outline" className="w-full" disabled={pending}>
        {pending ? "Updating…" : "Change password"}
      </Button>
    </form>
  );
}
