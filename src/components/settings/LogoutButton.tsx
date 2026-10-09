import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui";
import { IconLogout } from "@/components/icons";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="outline" className="w-full">
        <IconLogout size={18} /> Sign out
      </Button>
    </form>
  );
}
