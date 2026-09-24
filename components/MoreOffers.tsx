"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ticket, ChevronDown, Copy, Check } from "lucide-react";
import { formatCouponValue } from "@/lib/coupons";

interface LiveCoupon {
  code: string;
  title: string;
  description?: string | null;
  discountType: string;
  value: number;
  expiresAt?: string | null;
}

interface MoreOffersProps {
  className?: string;
}

export function MoreOffers({ className = "" }: MoreOffersProps) {
  const [open, setOpen] = useState(false);
  const [coupons, setCoupons] = useState<LiveCoupon[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open || coupons !== null) return;
    let active = true;
    fetch("/api/coupons", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active) return;
        setCoupons(json?.success && Array.isArray(json.data?.coupons) ? json.data.coupons : []);
      })
      .catch(() => {
        if (active) setCoupons([]);
      });
    return () => {
      active = false;
    };
  }, [open, coupons]);

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setFailed(false);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setFailed(true);
    }
  }

  return (
    <div className={`border border-border bg-card clip-notch ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 p-6 sm:p-7 text-left cursor-pointer group"
      >
        <span className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-primary/40 bg-primary/10">
            <Ticket className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </span>
          <span>
            <span className="block font-headline text-xl sm:text-2xl uppercase tracking-tight group-hover:text-primary transition-colors">
              More Offers &amp; Vouchers
            </span>
            <span className="block mt-1.5 font-mono text-[9px] tracking-[0.28em] uppercase text-muted-foreground">
              Extra coupons beyond the tier discount
            </span>
          </span>
        </span>
        <span className="flex items-center gap-2 shrink-0 font-mono text-[9px] tracking-[0.28em] uppercase text-primary">
          <span className="hidden sm:inline">{open ? "Less" : "More"}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 sm:px-7 pb-7 border-t border-border pt-6">
              <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground mb-5">
                Live now · copy a code to claim
              </p>

              {coupons === null ? (
                <div className="py-6 text-center font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
                  Loading offers…
                </div>
              ) : coupons.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
                    No extra vouchers live right now
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/70">
                    Your tier discount is still locked in — check back soon.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon.code}
                        className="relative border border-dashed border-primary/30 bg-background p-5 clip-notch-sm overflow-hidden"
                      >
                        <span className="absolute top-0 left-0 h-[3px] w-full bg-primary/60" />
                        <p className="font-headline text-3xl leading-none text-primary">
                          {formatCouponValue(coupon.discountType, coupon.value)}
                        </p>
                        <p className="mt-3 text-sm text-foreground">
                          {coupon.title}
                        </p>
                        {coupon.description && (
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {coupon.description}
                          </p>
                        )}
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <code className="font-mono text-[10px] tracking-[0.2em] uppercase text-bone border border-border bg-card px-2.5 py-1.5">
                            {coupon.code}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyCode(coupon.code)}
                            className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-[8px] tracking-[0.22em] uppercase text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
                          >
                            {copied === coupon.code ? (
                              <>
                                <Check className="h-3 w-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        {coupon.expiresAt && (
                          <p className="mt-3 font-mono text-[8px] tracking-[0.24em] uppercase text-muted-foreground/70">
                            Valid until{" "}
                            {new Date(coupon.expiresAt).toLocaleDateString(
                              "en-GB",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 font-mono text-[8px] tracking-[0.24em] uppercase text-muted-foreground/70">
                    {failed
                      ? "Copy failed — select the code manually"
                      : "Codes can be shared with friends · one use per order"}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
