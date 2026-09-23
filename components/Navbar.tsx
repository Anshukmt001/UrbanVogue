"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { InstagramIcon } from "@/components/instagram-icon";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled || open
          ? "bg-background/80 backdrop-blur border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="h-2 w-2 bg-primary transition-transform duration-300 group-hover:scale-125" />
            <span className="flex items-baseline gap-1.5">
              <span className="font-headline text-base tracking-[0.08em] uppercase leading-none">
                Urban
              </span>
              <span className="font-editorial text-lg italic leading-none tracking-tight text-primary">
                Vogue
              </span>
            </span>
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/#early-access"
              className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground hover:text-primary transition-colors"
            >
              Early Access
            </Link>
            <a
              href="https://instagram.com/urban_vogue_kct"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground hover:text-primary transition-colors"
            >
              <InstagramIcon className="h-3.5 w-3.5" />
              Instagram
            </a>
            <Link
              href="/join"
              className="clip-notch-sm inline-flex items-center px-5 py-2.5 bg-bone text-background font-bold text-[10px] tracking-[0.24em] uppercase hover:bg-[#c9a86a] transition-all duration-300"
            >
              Join Now
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="md:hidden text-foreground cursor-pointer"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur"
          >
            <div className="px-6 py-8 space-y-6">
              <Link
                href="/#early-access"
                onClick={() => setOpen(false)}
                className="block font-headline text-3xl uppercase tracking-tight text-foreground"
              >
                Early Access
              </Link>
              <a
                href="https://instagram.com/urban_vogue_kct"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground"
              >
                <InstagramIcon className="h-4 w-4" />
                @urban_vogue_kct
              </a>
              <Link
                href="/join"
                onClick={() => setOpen(false)}
                className="clip-notch inline-flex items-center justify-center w-full px-6 py-4 bg-bone text-background font-bold text-sm tracking-[0.24em] uppercase"
              >
                Join Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}