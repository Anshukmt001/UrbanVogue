"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, MinusCircle, ShieldX, HelpCircle, ScanLine } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { getMockVerify, type VerifyState } from "@/lib/mock-data";

const STATE_META: Record<
  VerifyState,
  { icon: typeof CheckCircle2; label: string; color: string }
> = {
  valid_active: {
    icon: CheckCircle2,
    label: "Valid Member",
    color: "text-primary",
  },
  valid_redeemed: {
    icon: CheckCircle2,
    label: "Already Redeemed",
    color: "text-amber-400",
  },
  revoked: {
    icon: MinusCircle,
    label: "Membership Revoked",
    color: "text-red-400",
  },
  invalid: {
    icon: ShieldX,
    label: "Invalid QR",
    color: "text-red-400",
  },
};

export default function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const result = getMockVerify(token);
  const meta = STATE_META[result.state];
  const Icon = meta.icon;

  return (
    <>
      <Navbar />
      <main className="bg-background text-foreground pt-28 pb-24 min-h-svh flex flex-col items-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <ScanLine className="h-4 w-4 text-primary" />
            <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-muted-foreground">
              Member Pass Verification
            </span>
          </div>

          <div className="clip-notch relative border border-border bg-card overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

            {/* State */}
            <div className="px-8 py-14 text-center">
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center"
              >
                <Icon className={`h-14 w-14 ${meta.color}`} strokeWidth={1.5} />
              </motion.div>

              <Badge tone={result.state === "valid_active" ? "active" : result.state === "valid_redeemed" ? "redeemed" : "deactivated"} className="mb-3">
                {meta.label}
              </Badge>

              {/* Member details */}
              {result.member && (
                <div className="mt-6">
                  <p className="font-headline text-4xl uppercase tracking-tight leading-none">
                    #{String(result.member.membershipNumber).padStart(3, "0")}
                  </p>
                  <p className="mt-2 text-base text-muted-foreground tracking-wide">
                    {result.member.name}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-3 border border-border bg-background px-6 py-3">
                    <span className="font-headline text-3xl leading-none text-primary">
                      {result.member.discountPercentage}%
                    </span>
                    <div className="text-left">
                      <p className="font-mono text-[8px] tracking-[0.32em] uppercase text-muted-foreground">
                        Off
                      </p>
                      <p className="font-mono text-[8px] tracking-[0.32em] uppercase text-muted-foreground">
                        Everything
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {result.state === "valid_redeemed" && result.member?.redeemedAt && (
                <p className="mt-5 font-mono text-[9px] tracking-[0.28em] uppercase text-muted-foreground">
                  Redeemed on{" "}
                  {new Date(result.member.redeemedAt).toLocaleString("en-IN")}
                </p>
              )}

              {result.state === "invalid" && (
                <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
                  This QR code is not recognised by Urban Vogue. Please check
                  the pass and try again.
                </p>
              )}
              {result.state === "revoked" && (
                <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
                  This membership has been deactivated.
                </p>
              )}
            </div>

            <div className="border-t border-border px-8 py-4 flex items-center justify-center gap-2">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground">
                Verified by Urban Vogue 2026
              </span>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/join"
              className="clip-notch inline-flex items-center justify-center px-6 py-3 bg-bone text-background text-[10px] font-bold tracking-[0.22em] uppercase hover:bg-[#c9a86a] transition-colors min-h-[48px]"
            >
              Join Now
            </Link>
            <Link
              href="/"
              className="clip-notch inline-flex items-center justify-center px-6 py-3 border border-border text-[10px] font-bold tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground hover:border-silver transition-all min-h-[48px]"
            >
              Home
            </Link>
          </div>

          <p className="mt-8 text-center font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground/70">
            Demo tokens: uv-037 · demo-redeemed · demo-revoked · demo-invalid
          </p>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}