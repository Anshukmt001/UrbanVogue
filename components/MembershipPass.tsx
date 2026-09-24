"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { MOCK_MEMBER } from "@/lib/mock-data";
import type { MockMember } from "@/lib/mock-data";

function BankChip() {
  return (
    <div className="h-9 w-12 shrink-0 rounded-md overflow-hidden bg-gradient-to-br from-[#ecd49a] via-[#c9a86a] to-[#8a703c] p-[2px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)]">
      <div className="h-full w-full rounded-[5px] border border-black/15 flex bg-gradient-to-br from-[#e2c57f] to-[#b99a54]">
        <span className="flex-1 border-r border-black/20" />
        <span className="flex-1 border-r border-black/20" />
        <span className="flex-1" />
      </div>
    </div>
  );
}

function ContactlessIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-primary" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M6.5 7.5a9.9 9.9 0 0 1 0 9" />
      <path d="M9.5 5.5a13.9 13.9 0 0 1 0 13" />
      <path d="M12.5 3.5a17.6 17.6 0 0 1 0 17" />
    </svg>
  );
}

function cardNumberFor(membershipNumber: number): string {
  const last = String(membershipNumber).padStart(4, "0");
  return `0375 2602 2026 ${last}`;
}

export function MembershipPass({ member = MOCK_MEMBER }: { member?: MockMember }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const sx = useSpring(x, { stiffness: 180, damping: 22 });
  const sy = useSpring(y, { stiffness: 180, damping: 22 });
  const rotateX = useTransform(sy, [0, 1], [6, -6]);
  const rotateY = useTransform(sx, [0, 1], [-6, 6]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }

  function onLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  const qrValue = `https://urbanvogue.vercel.app/verify/uv-${member.membershipNumber}`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className="w-full max-w-md mx-auto"
    >
      <div
        className="relative aspect-[1.586] rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden"
        style={{
          boxShadow:
            "0 30px 60px -24px rgba(0,0,0,0.85), 0 0 0 1px rgba(201,168,106,0.12), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Texture overlays */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 0% 0%, rgba(201,168,106,0.16), transparent 55%)",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a86a] to-transparent" />
        <div className="absolute inset-0 grid-pattern opacity-[0.35]" aria-hidden />
        <div className="absolute -right-16 -bottom-24 h-56 w-56 rounded-full border border-[#c9a86a]/20" aria-hidden />

        {/* Content */}
        <div
          className="relative flex h-full flex-col justify-between p-5 sm:p-6"
          style={{ transform: "translateZ(24px)" }}
        >
          {/* Brand row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 bg-primary" />
              <div>
                <p className="font-headline leading-none tracking-[0.04em] uppercase text-sm">
                  Urban{" "}
                  <span className="font-editorial italic normal-case font-medium text-primary">
                    Vogue
                  </span>
                </p>
                <p className="font-mono text-[6px] tracking-[0.4em] uppercase text-muted-foreground mt-1.5">
                  Early Access 2026
                </p>
              </div>
            </div>
            <div className="clip-notch-sm bg-primary px-3 py-1.5">
              <p className="font-headline text-sm leading-none text-primary-foreground">
                {member.discountPercentage}% OFF
              </p>
            </div>
          </div>

          {/* Chip + contactless */}
          <div className="flex items-center justify-between">
            <BankChip />
            <div className="flex items-center gap-2">
              <span className="font-mono text-[7px] tracking-[0.3em] uppercase text-muted-foreground">
                Pay Pass
              </span>
              <ContactlessIcon />
            </div>
          </div>

          {/* Card number */}
          <div>
            <p className="font-mono tracking-[0.16em] text-bone text-[clamp(0.78rem,3.8vw,1.125rem)] leading-none">
              {cardNumberFor(member.membershipNumber)}
            </p>
          </div>

          {/* Cardholder + QR */}
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-end gap-5 sm:gap-6">
                <div className="min-w-0">
                  <p className="font-mono text-[6px] tracking-[0.34em] uppercase text-muted-foreground mb-1.5">
                    Cardholder
                  </p>
                  <p className="truncate font-headline uppercase tracking-wide text-foreground text-base sm:text-lg leading-none">
                    {member.name}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-[6px] tracking-[0.34em] uppercase text-muted-foreground mb-1.5">
                    Valid Thru
                  </p>
                  <p className="font-mono text-xs sm:text-sm text-foreground leading-none">
                    12/26
                  </p>
                </div>
              </div>
              <p className="mt-3 font-mono text-[6px] tracking-[0.3em] uppercase text-muted-foreground">
                Scan the QR at the launch to verify
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <span className="font-mono text-[6px] tracking-[0.34em] uppercase text-muted-foreground">
                Verify
              </span>
              <div className="bg-white p-1.5">
                <QRCodeSVG
                  value={qrValue}
                  size={96}
                  level="M"
                  className="h-[80px] w-[80px] sm:h-[100px] sm:w-[100px]"
                />
              </div>
            </div>
          </div>

          {/* Footer strip */}
          <div className="flex items-center justify-between">
            <p className="font-mono text-[6px] tracking-[0.3em] uppercase text-muted-foreground">
              Member {String(member.membershipNumber).padStart(3, "0")} · {member.membershipTier === "first100" ? "First 50" : "Next 50"}
            </p>
            <p className="font-mono text-[6px] tracking-[0.3em] uppercase text-muted-foreground">
              Early Access 2026
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}