import Link from "next/link";
import { InstagramIcon } from "@/components/instagram-icon";

const LINKS = [
  { label: "Instagram", href: "https://instagram.com/urban_vogue_kct", external: true },
  { label: "Early Access", href: "/join" },
  { label: "Admin Login", href: "/admin/login" },
  { label: "Privacy", href: "/#" },
  { label: "Terms", href: "/#" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-foreground">
      <div className="mx-auto max-w-[1600px] px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-headline text-4xl sm:text-5xl uppercase leading-none tracking-tight">
              Urban <span className="font-editorial italic text-primary normal-case font-medium">Vogue</span>
            </p>
            <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-muted-foreground mt-3">
              Early Access 2026 · The First 100
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:justify-items-end">
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
                Explore
              </p>
              <ul className="space-y-3">
                {LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.external && <InstagramIcon className="h-3.5 w-3.5" />}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
                Status
              </p>
              <div className="clip-notch-sm bg-card border border-border px-4 py-3">
                <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-primary">
                  Coming Soon
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground/70">
            © 2026 Urban Vogue. All rights reserved.
          </p>
          <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground/70">
            Mumbai · Delhi · Bengaluru · Kochi
          </p>
        </div>
      </div>
    </footer>
  );
}