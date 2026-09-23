"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  delay?: number;
}

export function ProgressBar({
  label,
  current,
  total,
  delay = 0,
}: ProgressBarProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
          {label}
        </p>
        <p className="text-xs font-mono text-silver">
          {current} / {total}
        </p>
      </div>
      <div className="h-2 bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percentage}%` } : {}}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-silver/40 via-silver/70 to-silver"
        />
      </div>
    </div>
  );
}
