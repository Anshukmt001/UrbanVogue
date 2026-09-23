"use client";

import { motion } from "framer-motion";

interface MemberProgressProps {
  claimed?: number;
  total?: number;
}

export function MemberProgress({
  claimed = 0,
  total = 100,
}: MemberProgressProps) {
  const pct = Math.min(100, Math.round((claimed / total) * 100));
  const remaining = Math.max(0, total - claimed);

  return (
    <section className="bg-background text-foreground py-24 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-muted-foreground mb-3">
              Live Availability
            </p>
            <h2 className="font-headline text-4xl sm:text-6xl uppercase leading-[0.9] tracking-tight">
              Early Access
              <span className="font-editorial italic text-primary normal-case font-medium">
                {" "}
                Status
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="font-headline text-6xl leading-none text-bone"
              >
                {claimed}
                <span className="font-mono text-sm text-muted-foreground align-baseline ml-1">
                  / {total}
                </span>
              </motion.p>
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mt-1">
                Passes Claimed
              </p>
            </div>
            <span className="h-14 w-px bg-border" />
            <div>
              <p className="clip-notch px-4 py-2 bg-primary font-headline text-lg leading-none text-primary-foreground">
                {remaining}
              </p>
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mt-1">
                Remaining
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div className="h-[26px] sm:h-[34px] w-full border border-border bg-card overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${pct}%` }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-primary relative"
            >
              <div className="absolute inset-0 diagonal-stripes opacity-40" />
            </motion.div>
          </div>
          <div className="mt-3 flex justify-between font-mono text-[9px] tracking-[0.28em] uppercase text-muted-foreground">
            <span>0</span>
            <span className="text-primary">{pct}% Claimed</span>
            <span>{total}</span>
          </div>
        </div>
      </div>
    </section>
  );
}