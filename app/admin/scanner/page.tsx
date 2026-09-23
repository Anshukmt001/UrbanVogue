"use client";

import { motion } from "framer-motion";
import { QRScanner } from "@/components/admin/QRScanner";

export default function AdminScannerPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      <div>
        <h1 className="font-headline text-3xl sm:text-5xl uppercase tracking-tight leading-none">
          Pass <span className="font-editorial italic text-primary normal-case font-medium">Scanner</span>
        </h1>
        <p className="mt-2 font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
          Validate & redeem member discounts
        </p>
      </div>
      <QRScanner />
    </motion.div>
  );
}