import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/data/profile";
import { AppHeader } from "@/components/AppHeader";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { AccountForm, PasswordForm } from "@/components/settings/AccountForms";
import { ThemeSelector } from "@/components/ThemeSelector";
import { LogoutButton } from "@/components/settings/LogoutButton";
import { Card, SectionHeader } from "@/components/ui";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  return (
    <>
      <AppHeader title="Settings" subtitle={user.email} />

      <Card className="mb-4">
        <ProfileForm profile={profile} />
      </Card>

      <Card className="mb-4">
        <SectionHeader
          title="Appearance"
          subtitle="Pick a theme — it applies instantly"
        />
        <ThemeSelector />
      </Card>

      <Card className="mb-4">
        <SectionHeader title="Account" subtitle="Your name and login details" />
        <div className="space-y-5">
          <AccountForm displayName={user.displayName} />
          <div className="h-px bg-line" />
          <PasswordForm />
        </div>
      </Card>

      <Card className="mb-6">
        <SectionHeader title="Session" />
        <LogoutButton />
        <p className="mt-3 text-center text-[11px] text-muted">
          MacroVault · your data is private to your account
        </p>
      </Card>
    </>
  );
}
