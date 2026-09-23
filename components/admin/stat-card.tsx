"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  index?: number;
}

export function StatCard({ label, value, icon: Icon, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border border-border bg-card p-5 hover:border-silver/30 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
          {label}
        </p>
        <Icon className="h-3.5 w-3.5 text-silver/40" strokeWidth={1.5} />
      </div>
      <p className="font-headline text-3xl font-extrabold tracking-tight text-silver">
        {value}
      </p>
    </motion.div>
  );
}
