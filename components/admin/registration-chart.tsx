"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface DataPoint {
  date: string;
  count: number;
}

interface RegistrationChartProps {
  data: DataPoint[];
}

export function RegistrationChart({ data }: RegistrationChartProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div ref={ref} className="w-full">
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
          No registration data yet.
        </div>
      ) : (
        <div className="flex items-end gap-1 h-48">
          {data.map((point, i) => {
            const height = (point.count / maxCount) * 100;
            const shortDate = new Date(point.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            });

            return (
              <div
                key={point.date}
                className="flex-1 flex flex-col items-center gap-1 min-w-0"
              >
                <span className="text-[10px] text-muted-foreground font-mono">
                  {point.count}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={isInView ? { height: `${height}%` } : {}}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="w-full bg-gradient-to-t from-silver/20 to-silver/60 min-h-[2px] relative group"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border px-2 py-1 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {point.count} registrations
                  </div>
                </motion.div>
                <span className="text-[9px] text-muted-foreground/60 truncate w-full text-center">
                  {shortDate}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
