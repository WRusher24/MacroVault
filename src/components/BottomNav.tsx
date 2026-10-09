"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconFoods,
  IconSettings,
  IconTarget,
} from "./icons";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Log", icon: IconDashboard },
  { href: "/plans", label: "Plans", icon: IconTarget },
  { href: "/foods", label: "Foods", icon: IconFoods },
  { href: "/settings", label: "Settings", icon: IconSettings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-safe">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 pb-2 pt-2.5 text-[11px] font-medium transition-colors tap",
                active ? "text-primary" : "text-muted hover:text-ink"
              )}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
