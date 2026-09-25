"use client";

import { use, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Download, BookmarkCheck, Copy, Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MembershipPass } from "@/components/MembershipPass";
import { downloadMembershipPass } from "@/lib/download-pass";
import { getMockMemberByNumber, type MockMember } from "@/lib/mock-data";

interface PassDraft {
  name?: string;
  mobile?: string;
  email?: string;
}

function subscribeToDraft(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getDraftSnapshot() {
  try {
    return localStorage.getItem("uv.pass.draft");
  } catch {
    return null;
  }
}

export default function MembershipPage({
  params,
}: {
  params: Promise<{ membershipNumber: string }>;
}) {
  const { membershipNumber } = use(params);
  const member = getMockMemberByNumber(parseInt(membershipNumber, 10));
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liveMember, setLiveMember] = useState<MockMember | null>(null);
  const rawDraft = useSyncExternalStore(
    subscribeToDraft,
    getDraftSnapshot,
    () => null
  );

  useEffect(() => {
    let active = true;
    fetch(`/api/members/${membershipNumber}`)
      .then((res) => (Promise.resolve(res.ok ? res.json() : null)))
      .then((json) => {
        if (!active || !json?.success) return;
        const d = json.data;
        setLiveMember({
          membershipNumber: d.membershipNumber,
          name: d.name,
          mobile: "",
          email: "",
          discountPercentage: d.discountPercentage,
          membershipTier: d.membershipTier === "next50" ? "next50" : "first100",
          status: "active",
          discountRedeemed: false,
          redeemedAt: null,
          createdAt: "",
        });
      })
      .catch(() => {
        // ignore
      });
    return () => {
      active = false;
    };
  }, [membershipNumber]);

  const draft: PassDraft | null = rawDraft
    ? (JSON.parse(rawDraft) as PassDraft)
    : null;

  const displayMember: MockMember = liveMember
    ? liveMember
    : draft
    ? {
        ...member,
        name: draft.name || member.name,
        mobile: draft.mobile || member.mobile,
        email: draft.email || member.email,
      }
    : member;

  async function downloadPass() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await downloadMembershipPass(cardRef.current, member.membershipNumber);
    } catch {
      // ignore
    } finally {
      setDownloading(false);
    }
  }

  async function copyId() {
    try {
      await navigator.clipboard.writeText(`UV-${member.membershipNumber}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-background text-foreground pt-28 pb-24">
        <div className="mx-auto max-w-2xl px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mt-10 mb-14"
          >
            <p className="font-headline text-7xl sm:text-8xl uppercase leading-none tracking-tight">
              You&apos;re <span className="font-editorial italic text-primary normal-case font-medium">in.</span>
            </p>
            <p className="mt-5 text-sm sm:text-base text-muted-foreground tracking-wide">
              Welcome to Urban Vogue early access.
            </p>
          </motion.div>

          {/* ATM-style pass */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative px-1 sm:px-4"
          >
            <div ref={cardRef} className="w-full max-w-md mx-auto">
              <MembershipPass member={displayMember} />
            </div>
            <p className="mt-6 text-center font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground">
              Scan the QR at the launch to verify · Member #{member.membershipNumber}
            </p>
          </motion.div>

          {/* Actions */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={downloadPass}
              disabled={downloading}
              className="clip-notch inline-flex items-center justify-center gap-2 px-4 py-4 bg-bone text-background text-[10px] font-bold tracking-[0.22em] uppercase hover:bg-[#c9a86a] transition-colors disabled:opacity-60 cursor-pointer min-h-[52px]"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Preparing…" : "Download Pass"}
            </button>
            <button
              onClick={() => setSaved((v) => !v)}
              className={`clip-notch inline-flex items-center justify-center gap-2 px-4 py-4 border text-[10px] font-bold tracking-[0.22em] uppercase transition-all cursor-pointer min-h-[52px] ${
                saved
                  ? "border-primary/50 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-silver"
              }`}
            >
              <BookmarkCheck className="h-4 w-4" />
              {saved ? "Pass Saved" : "Save Pass"}
            </button>
            <button
              onClick={copyId}
              className="clip-notch inline-flex items-center justify-center gap-2 px-4 py-4 border border-border text-[10px] font-bold tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground hover:border-silver transition-all cursor-pointer min-h-[52px]"
            >
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Member ID"}
            </button>
          </div>

          <p className="mt-8 text-center font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground">
            Keep this pass safe · Digital member pass · Urban Vogue 2026
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}