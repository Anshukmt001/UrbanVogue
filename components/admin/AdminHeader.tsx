"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  ScanLine,
  Settings,
  LogOut,
  ArrowUpRight,
  Ticket,
} from "lucide-react";
import { MOCK_ADMIN } from "@/lib/mock-data";

const MOBILE_NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/members", icon: Users, label: "Members" },
  { href: "/admin/coupons", icon: Ticket, label: "Coupons" },
  { href: "/admin/scanner", icon: ScanLine, label: "Scanner" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminHeader() {
  const pathname = usePathname();

  function handleLogout() {
    void signOut({ callbackUrl: "/admin/login" });
  }

  return (
    <header className="md:hidden sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-headline text-sm leading-none tracking-[0.04em] uppercase">
            Urban <span className="font-editorial italic text-primary normal-case font-medium">Vogue</span>
          </p>
          <p className="font-mono text-[7px] tracking-[0.3em] uppercase text-muted-foreground mt-1">
            Admin · {MOCK_ADMIN.name}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="View site"
          >
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <nav className="flex border-t border-border">
        {MOBILE_NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[8px] font-bold tracking-[0.14em] uppercase ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}