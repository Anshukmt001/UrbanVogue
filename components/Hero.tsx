"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { InstagramIcon } from "@/components/instagram-icon";

export function Hero() {
  const [earlyAccessOpen, setEarlyAccessOpen] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/members/stats")
      .then((r) => r.json())
      .then((json) => {
        if (!active || !json?.success || !json.data) return;
        setEarlyAccessOpen(json.data.earlyAccessOpen !== false);
      })
      .catch(() => {
        // keep open on error so join remains reachable
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative min-h-svh flex flex-col items-center justify-center text-center bg-background text-foreground overflow-hidden px-6">
      {/* Animated abstract backdrop */}
      <div className="absolute inset-0 grid-pattern opacity-60" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute -right-32 top-1/4 h-[420px] w-[420px] border border-silver/10 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 56, repeat: Infinity, ease: "linear" }}
        className="absolute -left-40 bottom-8 h-[460px] w-[460px] border border-silver/10 [mask-image:linear-gradient(to_top,transparent,black,transparent)]"
      />
      <motion.div
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[12%] top-[22%] h-3 w-3 bg-primary"
      />
      <motion.div
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute right-[16%] top-[68%] h-2 w-2 bg-silver/70"
      />
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-primary to-transparent" />

      <div className="relative z-10 flex flex-col items-center">
        {/* EYEBROW */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-3 mb-10"
        >
          <span className="h-1.5 w-1.5 bg-primary" />
          <span className="font-mono text-[10px] tracking-[0.38em] uppercase text-muted-foreground">
            Coming Soon
          </span>
        </motion.div>

        {/* LOCKUP */}
        <h1 className="font-headline text-[clamp(5rem,20vw,17rem)] leading-[0.82] uppercase tracking-tight select-none">
          <motion.span
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="block"
          >
            Urban
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="font-editorial italic font-medium leading-[0.95] normal-case tracking-tight text-primary block"
          >
            Vogue
          </motion.span>
        </h1>

        {/* TAGLINE */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-10 max-w-xl text-sm sm:text-base text-muted-foreground tracking-wide"
        >
          The new era of streetwear is arriving.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
        >
          {earlyAccessOpen ? (
            <Link
              href="/join"
              className="clip-notch group inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-bone text-background px-9 py-4 text-sm font-bold tracking-[0.22em] uppercase hover:bg-[#c9a86a] transition-all duration-300"
            >
              Join Early Access
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          ) : (
            <span className="clip-notch inline-flex items-center justify-center gap-2 w-full sm:w-auto border border-border bg-secondary/40 px-9 py-4 text-sm font-bold tracking-[0.22em] uppercase text-muted-foreground">
              Closed
            </span>
          )}
          <a
            href="https://www.instagram.com/urban_vouge_kct"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 border border-border text-xs font-medium tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground hover:border-silver transition-all duration-300"
          >
            <InstagramIcon className="h-4 w-4" />
            @urban_vogue_kct
          </a>
        </motion.div>

        {/* Bottom label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-16 flex flex-col items-center gap-3"
        >
          <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-muted-foreground">
            Early Access 2026
          </span>
          <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.4em] uppercase text-muted-foreground/60">
            Scroll to explore
            <motion.span
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              ↓
            </motion.span>
          </span>
        </motion.div>
      </div>
    </section>
  );
}