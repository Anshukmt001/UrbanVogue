"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { normalizeMobile } from "@/lib/validations/member";

export default function JoinPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
  });
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState<number | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateMobile(raw: string) {
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }
    if (digits.length === 12 && digits.startsWith("91")) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith("91")) {
      digits = digits.slice(2);
    }
    update("mobile", digits.slice(0, 10));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const mobileNumber = normalizeMobile(form.mobile);
      const res = await fetch("/api/members/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName.trim(),
          mobile: mobileNumber,
          email: form.email.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.error === "This mobile number is already registered") {
          setSubmitting(false);
          setAlreadyRegistered(
            typeof json.data?.membershipNumber === "number"
              ? json.data.membershipNumber
              : 0
          );
          return;
        }
        throw new Error(registerErrorText(json.error));
      }
      const draft = {
        name: form.fullName.trim(),
        mobile: mobileNumber,
        email: form.email.trim(),
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem("uv.pass.draft", JSON.stringify(draft));
      router.push(`/membership/${json.data.membershipNumber}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
      setSubmitting(false);
    }
  }

  function registerErrorText(code: string | undefined) {
    switch (code) {
      case "EARLY_ACCESS_SOLD_OUT":
        return "Early access is sold out.";
      case "REGISTRATION_CURRENTLY_PAUSED":
        return "Registration is currently paused.";
      case "This mobile number is already registered":
        return "This mobile number is already registered.";
      case "Enter a valid 10-digit Indian mobile number":
        return "Enter a valid 10-digit mobile number.";
      default:
        return "Something went wrong. Try again.";
    }
  }

  const valid =
    form.fullName.trim().length > 1 &&
    form.mobile.trim().length >= 10 &&
    form.email.includes("@") &&
    agree;

  return (
    <>
      <Navbar />
      <main>
        {/* Editorial banner */}
        <section className="pt-28 sm:pt-32 pb-2 bg-background text-foreground">
          <div className="mx-auto max-w-[1400px] px-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="mt-8 font-headline text-6xl sm:text-8xl uppercase leading-[0.85] tracking-tight pb-1">
                Get <span className="font-editorial italic text-primary normal-case font-medium">in</span>
                <br />
                Early.
              </h1>
            </motion.div>
          </div>
        </section>

        <section className="bg-background text-foreground py-16 sm:py-20">
          <div className="mx-auto max-w-[1400px] px-6 grid lg:grid-cols-2 gap-16">
            {/* Left editorial */}
            <div>
              <div className="flex items-start gap-4">
                <span className="h-2 w-2 bg-primary mt-2 shrink-0" />
                <div>
                  <p className="font-headline text-3xl sm:text-4xl uppercase tracking-tight leading-[1.05]">
                    Only 100 early-access passes will be issued.
                  </p>
                  <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-md">
                    The first 50 members lock in 10% off everything. The next
                    50 lock in 5% off. After that, the doors close.
                  </p>
                </div>
              </div>

              <div className="mt-14 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-headline text-2xl text-primary">01 — 50</span>
                    <span className="font-mono text-[9px] tracking-[0.28em] uppercase text-muted-foreground">
                      Members
                    </span>
                  </div>
                  <span className="clip-notch-sm bg-primary/10 border border-primary/40 text-primary px-4 py-2 font-mono text-[9px] tracking-[0.28em] uppercase">
                    10% Off
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-headline text-2xl text-muted-foreground">51 — 100</span>
                    <span className="font-mono text-[9px] tracking-[0.28em] uppercase text-muted-foreground">
                      Members
                    </span>
                  </div>
                  <span className="clip-notch-sm bg-secondary border border-silver/30 text-muted-foreground px-4 py-2 font-mono text-[9px] tracking-[0.28em] uppercase">
                    5% Off
                  </span>
                </div>
              </div>

              <div className="mt-14 hidden lg:block max-w-md">
                <p className="font-editorial italic text-2xl leading-snug text-muted-foreground">
                  &ldquo;The new era of streetwear is arriving &mdash; get in
                  before it lands.&rdquo;
                </p>
                <p className="mt-3 font-mono text-[9px] tracking-[0.32em] uppercase text-primary">
                  @urban_vogue_kct
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="border border-border bg-card clip-notch p-8 sm:p-10 h-fit">
              <p className="font-mono text-[9px] tracking-[0.32em] uppercase text-primary mb-8">
                Registration
              </p>

              <form onSubmit={onSubmit} className="space-y-7">
                <Input
                  label="Full Name"
                  placeholder="Your full name"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                />
                <div className="w-full">
                  <label
                    htmlFor="mobile"
                    className="block font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2"
                  >
                    Mobile Number
                  </label>
                  <div className="flex items-center border-b border-border focus-within:border-primary transition-colors">
                    <span className="shrink-0 font-mono text-base text-muted-foreground">
                      +91
                    </span>
                    <input
                      id="mobile"
                      placeholder="98XXX XXXXX"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.mobile}
                      onChange={(e) => updateMobile(e.target.value)}
                      className="w-full bg-transparent border-0 px-3 py-3 text-foreground placeholder:text-muted-foreground/40 text-base focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>

                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />

                <label className="flex items-start gap-3 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors ${
                      agree
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    I agree to the terms of the early-access program.
                  </span>
                </label>

                {error && (
                  <p className="text-xs text-destructive leading-relaxed">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  variant="inverse"
                  loading={submitting}
                  disabled={!valid}
                  className="w-full"
                >
                  Claim My Pass
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="text-center font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground">
                  50 × 10% off · 50 × 5% off
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <Modal
        open={alreadyRegistered !== null}
        onClose={() => setAlreadyRegistered(null)}
        title="Already Claimed"
        actions={
          <>
            <button
              onClick={() => setAlreadyRegistered(null)}
              className="border border-border px-5 py-3 text-[10px] font-bold tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground hover:border-silver transition-all cursor-pointer"
            >
              Close
            </button>
            {alreadyRegistered !== null && alreadyRegistered > 0 && (
              <Button
                variant="inverse"
                size="lg"
                onClick={() => router.push(`/membership/${alreadyRegistered}`)}
              >
                View My Pass
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </>
        }
      >
        <div className="flex flex-col items-center text-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center border border-primary/40 bg-primary/10">
            <Check className="h-5 w-5 text-primary" />
          </span>
          <p className="font-headline text-2xl uppercase tracking-tight">
            You&apos;re already in.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This mobile number has already claimed an early-access pass.
            {alreadyRegistered !== null && alreadyRegistered > 0 && (
              <>
                {" "}
                (Member #{String(alreadyRegistered).padStart(3, "0")})
              </>
            )}
          </p>
        </div>
      </Modal>
    </>
  );
}
