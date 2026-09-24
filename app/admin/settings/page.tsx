"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, CalendarDays, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MOCK_CAMPAIGN } from "@/lib/mock-data";

export default function AdminSettingsPage() {
  const [status, setStatus] = useState<"open" | "paused" | "closed">(
    MOCK_CAMPAIGN.status
  );
  const [allowRegistration, setAllowRegistration] = useState(
    MOCK_CAMPAIGN.allowRegistration
  );
  const [maxMembers, setMaxMembers] = useState(String(MOCK_CAMPAIGN.total));
  const [tenPctLimit, setTenPctLimit] = useState(String(MOCK_CAMPAIGN.tenPercentLimit));
  const [fivePctLimit, setFivePctLimit] = useState(String(MOCK_CAMPAIGN.fivePercentLimit));
  const [tierOnePct, setTierOnePct] = useState(String(MOCK_CAMPAIGN.tierOnePercent));
  const [tierTwoPct, setTierTwoPct] = useState(String(MOCK_CAMPAIGN.tierTwoPercent));
  const [launchDate, setLaunchDate] = useState(MOCK_CAMPAIGN.launchDate);
  const [saved, setSaved] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  function toDateInput(value: string) {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value.slice(0, 10);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((json) => {
        if (!active || !json?.success) return;
        const s = json.data;
        setStatus(s.campaignStatus === "sold_out" ? "closed" : s.campaignStatus);
        setAllowRegistration(Boolean(s.allowRegistration));
        setMaxMembers(String(s.earlyAccessLimit));
        setTenPctLimit(String(s.tenPercentLimit));
        setFivePctLimit(String(s.fivePercentLimit));
        setTierOnePct(String(s.tierOnePercent ?? 10));
        setTierTwoPct(String(s.tierTwoPercent ?? 5));
        if (s.launchDate) setLaunchDate(toDateInput(String(s.launchDate)));
      })
      .catch(() => {
        // ignore
      });
    return () => {
      active = false;
    };
  }, []);

  async function save() {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignStatus: status === "closed" ? "sold_out" : status,
          earlyAccessLimit: parseInt(maxMembers, 10),
          tenPercentLimit: parseInt(tenPctLimit, 10),
          fivePercentLimit: parseInt(fivePctLimit, 10),
          tierOnePercent: parseInt(tierOnePct, 10),
          tierTwoPercent: parseInt(tierTwoPct, 10),
          launchDate: launchDate || null,
          allowRegistration,
        }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      }
    } catch {
      // ignore
    }
  }

  async function resetAll() {
    setResetting(true);
    try {
      await fetch("/api/admin/reset", { method: "DELETE" });
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("uv.pass.draft");
      localStorage.removeItem("uv.mock.v1");
    }
    setResetting(false);
    setResetOpen(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10 max-w-3xl"
    >
      <div>
        <h1 className="font-headline text-3xl sm:text-5xl uppercase tracking-tight leading-none">
          Campaign <span className="font-editorial italic text-primary normal-case font-medium">Settings</span>
        </h1>
        <p className="mt-2 font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
          Early access configuration
        </p>
      </div>

      {/* Status */}
      <div className="border border-border bg-card p-6 sm:p-8">
        <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
          Campaign Status
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {(["open", "paused", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`clip-notch flex items-center gap-3 px-5 py-4 border text-left transition-all cursor-pointer ${
                status === s
                  ? s === "open"
                    ? "border-primary/50 bg-primary/10"
                    : s === "paused"
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-border bg-secondary/40"
                  : "border-border text-muted-foreground hover:border-silver"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 ${
                  status === s
                    ? s === "open"
                      ? "bg-primary"
                      : s === "paused"
                      ? "bg-amber-400"
                      : "bg-muted-foreground"
                    : "bg-border"
                }`}
              />
              <span className="text-sm font-bold tracking-[0.16em] uppercase">
                {s}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="border border-border bg-card p-6 sm:p-8 space-y-6">
        <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground">
          Registration
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Allow new registrations</p>
            <p className="font-mono text-[8px] tracking-[0.24em] uppercase text-muted-foreground mt-1">
              Public join form live or closed
            </p>
          </div>
          <button
            onClick={() => setAllowRegistration((v) => !v)}
            role="switch"
            aria-checked={allowRegistration}
            aria-label="Toggle registration"
            className={`relative h-7 w-14 shrink-0 border transition-colors cursor-pointer ${
              allowRegistration ? "bg-primary border-primary" : "bg-secondary border-border"
            }`}
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 bg-bone transition-all ${
                allowRegistration ? "left-[calc(100%-1.5rem)]" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Limits */}
      <div className="border border-border bg-card p-6 sm:p-8 space-y-6">
        <div>
          <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground">
            Campaign Limits &amp; Discounts
          </p>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Tier 1 applies to the first members in line, tier 2 to everyone
            after. Editing a discount here updates what new members are
            awarded.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { label: "Max Members", value: maxMembers, set: setMaxMembers, hint: "passes" },
            { label: "Tier 1 Discount %", value: tierOnePct, set: setTierOnePct, hint: "0 – 100" },
            { label: "Tier 1 Limit", value: tenPctLimit, set: setTenPctLimit, hint: "first members" },
            { label: "Tier 2 Discount %", value: tierTwoPct, set: setTierTwoPct, hint: "0 – 100" },
            { label: "Tier 2 Limit", value: fivePctLimit, set: setFivePctLimit, hint: "next members" },
          ].map((field) => (
            <div key={field.label}>
              <label className="block font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground mb-2">
                {field.label}
              </label>
              <input
                type="number"
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                className="w-full bg-transparent border-b border-border px-0 py-2.5 font-headline text-2xl text-bone focus:outline-none focus:border-primary transition-colors"
              />
              <p className="mt-1.5 font-mono text-[7px] tracking-[0.22em] uppercase text-muted-foreground/60">
                {field.hint}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Launch date */}
      <div className="border border-border bg-card p-6 sm:p-8">
        <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
          Launch Date
        </p>
        <div className="flex items-center gap-4">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <input
            type="date"
            value={launchDate}
            onChange={(e) => setLaunchDate(e.target.value)}
            className="flex-1 bg-transparent border-b border-border px-0 py-2.5 text-bone font-headline text-xl tracking-[0.08em] uppercase focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-destructive/30 bg-card p-6 sm:p-8">
        <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-destructive mb-3">
          Danger Zone
        </p>
        <h2 className="font-headline text-2xl uppercase tracking-tight">
          Reset Everything <span className="font-editorial italic text-destructive normal-case font-medium">to Zero</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-xl leading-relaxed">
          Permanently clears all members, redemptions, coupons, registration
          stats and stored pass drafts, and restores campaign limits and tier
          discounts to their defaults. This cannot be undone.
        </p>
        <Button
          variant="danger"
          size="lg"
          onClick={() => setResetOpen(true)}
          className="clip-notch mt-6"
        >
          <AlertTriangle className="h-4 w-4" />
          Reset Everything to Zero
        </Button>
        {resetDone && (
          <p className="mt-4 inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.28em] uppercase text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Reset complete
          </p>
        )}
      </div>

      <Button
        variant="inverse"
        size="lg"
        onClick={save}
        className="clip-notch w-auto"
      >
        <Save className="h-4 w-4" />
        {saved ? "Settings Saved" : "Save Settings"}
      </Button>

      <Modal
        open={resetOpen}
        onClose={() => {
          if (!resetting) setResetOpen(false);
        }}
        title="Reset everything?"
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          This wipes all members, redemptions, coupons and stats to zero and
          restores the campaign to its fresh state. There is no undo.
        </p>
        <div className="mt-4 flex items-center gap-2 font-mono text-[8px] tracking-[0.28em] uppercase text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Irreversible action
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setResetOpen(false)}
            disabled={resetting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={resetAll}
            loading={resetting}
            className="clip-notch"
          >
            <AlertTriangle className="h-4 w-4" />
            Reset to Zero
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}