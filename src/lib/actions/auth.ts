"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles, users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  destroySession,
  getCurrentUser,
} from "@/lib/auth/session";
import { firstError, loginSchema, registerSchema } from "@/lib/validation";
import type { FormState } from "./state";

export async function registerAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: firstError(parsed.error), success: null };
  }

  const { displayName, email, password } = parsed.data;

  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return { error: "An account with that email already exists.", success: null };
    }

    const passwordHash = await hashPassword(password);
    const [created] = await db
      .insert(users)
      .values({ displayName, email, passwordHash })
      .returning({ id: users.id });

    await db.insert(profiles).values({ userId: created.id });
    await createSession(created.id);
  } catch (error) {
    console.error("registerAction failed", error);
    return {
      error: "Could not create your account. Please try again.",
      success: null,
    };
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: firstError(parsed.error), success: null };
  }

  const { email, password } = parsed.data;

  try {
    const [account] = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!account || !(await verifyPassword(password, account.passwordHash))) {
      return { error: "Incorrect email or password.", success: null };
    }

    await createSession(account.id);
  } catch (error) {
    console.error("loginAction failed", error);
    return { error: "Could not sign you in. Please try again.", success: null };
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function updateAccountAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Your session expired. Please sign in again.", success: null };

  const displayName = String(formData.get("displayName") ?? "").trim();
  if (displayName.length < 2 || displayName.length > 60) {
    return { error: "Name must be between 2 and 60 characters.", success: null };
  }

  await db
    .update(users)
    .set({ displayName, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  return { error: null, success: "Profile updated." };
}

export async function changePasswordAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Your session expired. Please sign in again.", success: null };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters.", success: null };
  }

  const [account] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!account || !(await verifyPassword(currentPassword, account.passwordHash))) {
    return { error: "Your current password is incorrect.", success: null };
  }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(newPassword), updatedAt: new Date() })
    .where(eq(users.id, user.id));

  return { error: null, success: "Password changed." };
}
