import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { Card } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <Card className="p-5">
      <h2 className="mb-4 text-lg font-semibold text-ink">Welcome back</h2>
      <AuthForm mode="login" />
    </Card>
  );
}
