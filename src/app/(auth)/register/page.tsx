import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { Card } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <Card className="p-5">
      <h2 className="mb-1 text-lg font-semibold text-ink">Create your account</h2>
      <p className="mb-4 text-xs text-muted">
        Your logs, foods and plans stay private to you.
      </p>
      <AuthForm mode="register" />
    </Card>
  );
}
