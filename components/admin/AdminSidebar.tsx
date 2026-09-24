"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, ScanLine, Settings, LogOut, ArrowUpRight, Ticket } from "lucide-react";
import { MOCK_ADMIN } from "@/lib/mock-data";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/scanner", label: "Scanner", icon: ScanLine },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    router.push("/admin/login");
  }

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card/60">
      <div className="p-6 border-b border-border">
        <p className="font-headline text-base tracking-[0.04em] uppercase leading-none">
          Urban <span className="font-editorial italic text-primary normal-case font-medium">Vogue</span>
        </p>
        <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground mt-1.5">
          Admin Portal
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-[0.16em] uppercase transition-colors ${
                isActive
                  ? "bg-secondary text-foreground border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <div className="px-3 py-2 flex items-center gap-2">
          <span className="h-2 w-2 bg-primary" />
          <div>
            <p className="text-xs font-medium">{MOCK_ADMIN.name}</p>
            <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-muted-foreground">
              {MOCK_ADMIN.email}
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          View Site
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold tracking-[0.16em] uppercase text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors w-full cursor-pointer"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </aside>
  );
}