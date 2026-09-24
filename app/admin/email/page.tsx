"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface EmailStatus {
  totalMembers: number;
  withEmail: number;
  noEmail: number;
  sent: number;
  pending: number;
  failed: number;
  skipped: number;
  remaining: number;
  configured: boolean;
  from: string | null;
  replyTo: string | null;
  hasApiKey: boolean;
  baseUrl: string;
  dailyQuota: number;
  monthlyQuota: number;
}

interface BatchResult {
  attempted: number;
  sent: number;
  failed: number;
  remaining: number;
}

type Flash =
  | { kind: "ok"; text: string }
  | { kind: "error"; text: string }
  | null;

export default function AdminEmailPage() {
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [resendInput, setResendInput] = useState("");
  const [resending, setResending] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/email/status", { cache: "no-store" });
      if (res.status === 401) {
        setUnauthorized(true);
        setStatus(null);
        return;
      }
      const json = await res.json();
      if (json?.success) {
        setUnauthorized(false);
        setStatus(json.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/email/status", { cache: "no-store" });
        if (res.status === 401) {
          if (active) {
            setUnauthorized(true);
            setLoading(false);
          }
          return;
        }
        const json = await res.json();
        if (active && json?.success) {
          setUnauthorized(false);
          setStatus(json.data);
        }
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function showFlash(next: Flash) {
    setFlash(next);
    if (next) setTimeout(() => setFlash(null), 6000);
  }

  async function sendPending() {
    setSending(true);
    try {
      const res = await fetch("/api/admin/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 25 }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        const d: BatchResult = json.data;
        showFlash({
          kind: d.failed > 0 ? "error" : "ok",
          text:
            d.attempted === 0
              ? "No pending emails — everything is already sent."
              : `Sent ${d.sent} of ${d.attempted} · ${d.failed} failed · ${d.remaining} still pending`,
        });
      } else {
        showFlash({
          kind: "error",
          text: describeError(json?.error),
        });
      }
    } catch {
      showFlash({ kind: "error", text: "Request failed — check connection." });
    } finally {
      setSending(false);
      setConfirmOpen(false);
      load();
    }
  }

  async function sendTest() {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail.trim() }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        showFlash({ kind: "ok", text: `Test email sent to ${json.data.to}` });
      } else {
        const note = json?.data?.note || describeError(json?.error);
        showFlash({ kind: "error", text: note });
      }
    } catch {
      showFlash({ kind: "error", text: "Request failed — check connection." });
    } finally {
      setTesting(false);
    }
  }

  async function resendOne(target?: number) {
    const membershipNumber = target;
    if (!membershipNumber || Number.isNaN(membershipNumber)) return;
    setResending(true);
    try {
      const res = await fetch("/api/admin/email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipNumber }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        showFlash({
          kind: "ok",
          text: `Email re-sent to member #${membershipNumber}`,
        });
      } else {
        showFlash({ kind: "error", text: describeError(json?.error) });
      }
    } catch {
      showFlash({ kind: "error", text: "Request failed — check connection." });
    } finally {
      setResending(false);
      setResendInput("");
      load();
    }
  }

  const stats = [
    { label: "Sent", value: status ? status.sent : null, tone: "text-primary" },
    {
      label: "Pending",
      value: status ? status.pending + status.failed : null,
      tone: "text-amber-400",
    },
    { label: "Failed", value: status ? status.failed : null, tone: "text-destructive" },
    {
      label: "No Email",
      value: status ? status.noEmail : null,
      tone: "text-muted-foreground",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-4xl"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl sm:text-5xl uppercase tracking-tight leading-none">
            Email <span className="font-editorial italic text-primary normal-case font-medium">Automation</span>
          </h1>
          <p className="mt-2 font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
            Welcome emails · Resend delivery
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => setConfirmOpen(true)}
          disabled={Boolean(
            unauthorized ||
              !status ||
              status.remaining === 0 ||
              !status.configured
          )}
          loading={sending}
          className="clip-notch"
          title={
            unauthorized
              ? "Sign in as admin first"
              : !status
                ? "Loading status…"
                : !status.configured
                  ? "Set RESEND_API_KEY and RESEND_FROM_EMAIL"
                  : status.remaining === 0
                    ? "No pending emails"
                    : undefined
          }
        >
          <Send className="h-4 w-4" />
          Send Pending Emails
        </Button>
      </div>

      {!loading && unauthorized && (
        <div className="border border-destructive/40 bg-destructive/5 p-5 flex flex-wrap items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <div className="flex-1 min-w-52">
            <p className="text-sm font-medium text-destructive">Admin session required</p>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              You are not signed in, so the pending list and send buttons are locked.
              Sign in at <code className="font-mono text-[11px] text-foreground">/admin/login</code>,
              then reload this page.
            </p>
          </div>
          <Link
            href="/admin/login"
            className="clip-notch bg-primary text-primary-foreground px-5 py-2.5 text-[10px] font-bold tracking-[0.22em] uppercase hover:bg-[#b7964e] transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}

      {!loading && !unauthorized && status && status.pending + status.failed > 0 && (
        <div className="border border-amber-500/40 bg-amber-500/5 p-5 flex gap-3">
          <Send className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              {status.pending + status.failed} welcome email
              {status.pending + status.failed === 1 ? "" : "s"} not delivered yet
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {status.pending} never sent · {status.failed} failed. Press{" "}
              <span className="text-foreground">Send Pending Emails</span> (25 per click) to
              deliver them.
            </p>
          </div>
        </div>
      )}

      {!loading && status && !status.configured && (
        <div className="border border-amber-500/40 bg-amber-500/5 p-5 flex gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">Email not configured</p>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Set <code className="font-mono text-[11px] text-foreground">RESEND_API_KEY</code>{" "}
              and <code className="font-mono text-[11px] text-foreground">RESEND_FROM_EMAIL</code> in
              Vercel environment variables, then redeploy.
            </p>
          </div>
        </div>
      )}

      {flash && (
        <div
          className={`border p-4 flex gap-3 ${
            flash.kind === "ok"
              ? "border-primary/40 bg-primary/5"
              : "border-destructive/40 bg-destructive/5"
          }`}
        >
          {flash.kind === "ok" ? (
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          )}
          <p className="text-sm leading-relaxed">{flash.text}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="border border-border bg-card p-5">
            <p className={`font-headline text-4xl leading-none ${s.tone}`}>
              {loading || s.value === null ? "—" : s.value}
            </p>
            <p className="mt-3 font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {status && (
        <div className="border border-border bg-card p-6 space-y-3">
          <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground">
            Delivery Config
          </p>
          <ConfigRow label="Status" value={status.configured ? "Configured" : "Not configured"} ok={status.configured} />
          <ConfigRow label="From" value={status.from ?? "—"} ok={Boolean(status.from)} />
          <ConfigRow label="API Key" value={status.hasApiKey ? "Set" : "Missing"} ok={status.hasApiKey} />
          <ConfigRow label="Reply-To" value={status.replyTo ?? "Not set"} ok={true} />
          <ConfigRow label="With Email" value={`${status.withEmail} of ${status.totalMembers} members`} ok={true} />
          <ConfigRow
            label="Limits"
            value={`${status.dailyQuota}/day · ${status.monthlyQuota}/month (free plan)`}
            ok={true}
          />
        </div>
      )}

      {/* Resend single */}
      <div className="border border-border bg-card p-6">
        <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Resend To One Member
        </p>
        <div className="flex flex-wrap gap-3">
          <input
            type="number"
            value={resendInput}
            onChange={(e) => setResendInput(e.target.value)}
            placeholder="Membership number"
            className="w-48 bg-transparent border-b border-border px-0 py-2.5 font-headline text-xl text-bone focus:outline-none focus:border-primary transition-colors"
          />
          <Button
            variant="outline"
            size="md"
            disabled={!resendInput.trim() || resending}
            loading={resending}
            onClick={() => resendOne(parseInt(resendInput, 10))}
          >
            <RefreshCw className="h-4 w-4" />
            Resend
          </Button>
        </div>
        <p className="mt-3 font-mono text-[8px] tracking-[0.22em] uppercase text-muted-foreground/70">
          Re-sends the welcome email regardless of previous status
        </p>
      </div>

      {/* Test email */}
      <div className="border border-border bg-card p-6">
        <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Send Test Email
        </p>
        <div className="flex flex-wrap gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="you@example.com (blank = your admin email)"
            className="flex-1 min-w-64 bg-transparent border-b border-border px-0 py-2.5 font-headline text-lg text-bone focus:outline-none focus:border-primary transition-colors"
          />
          <Button
            variant="outline"
            size="md"
            onClick={sendTest}
            loading={testing}
            disabled={!status?.configured}
          >
            <Mail className="h-4 w-4" />
            Send Test
          </Button>
        </div>
        <p className="mt-3 font-mono text-[8px] tracking-[0.22em] uppercase text-muted-foreground/70">
          Without a verified domain, Resend only delivers to your own account email
        </p>
      </div>

      <div className="flex items-start gap-3 text-muted-foreground">
        <Settings2 className="h-4 w-4 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">
          Batch sends run 25 emails per click, sequentially rate-limited. Registration emails
          are sent automatically at signup; failures never block registration and land here as
          <span className="text-destructive"> Failed</span> for retry.
        </p>
      </div>

      {/* Confirm modal */}
      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!sending) setConfirmOpen(false);
        }}
        title="Send pending welcome emails?"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={sendPending}
              loading={sending}
              className="clip-notch"
            >
              <Send className="h-4 w-4" />
              Send {Math.min(25, status?.remaining ?? 0)} Emails
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          This sends the welcome email to up to 25 members who haven&apos;t received one yet
          (including previous failures). The free Resend plan allows 100 emails per day.
        </p>
        {status && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <MiniStat label="Pending" value={status.pending} />
            <MiniStat label="Failed" value={status.failed} />
            <MiniStat label="Total due" value={status.remaining} />
          </div>
        )}
      </Modal>
    </motion.div>
  );
}

function ConfigRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 last:border-0 pb-2.5 last:pb-0">
      <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-muted-foreground">
        {label}
      </span>
      <span
        className={`text-sm font-medium truncate ${ok ? "text-foreground" : "text-destructive"}`}
      >
        {value}
      </span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border p-3 text-center">
      <p className="font-headline text-2xl leading-none">{value}</p>
      <p className="mt-1.5 font-mono text-[7px] tracking-[0.22em] uppercase text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function describeError(code: string | undefined): string {
  switch (code) {
    case "UNAUTHORIZED":
      return "Not signed in as admin.";
    case "EMAIL_NOT_CONFIGURED":
      return "Set RESEND_API_KEY and RESEND_FROM_EMAIL first.";
    case "RATE_LIMITED":
      return "Too many requests — wait a minute and retry.";
    case "MEMBER_NOT_FOUND":
      return "No member with that membership number.";
    case "MEMBER_HAS_NO_EMAIL":
      return "That member registered without an email address.";
    case "INVALID_MEMBERSHIP_NUMBER":
      return "Enter a valid membership number.";
    case "not_configured":
      return "RESEND_API_KEY or RESEND_FROM_EMAIL is missing.";
    case "invalid_from_address":
      return "Sender address rejected — verify your domain in Resend.";
    case "daily_quota_exceeded":
      return "Daily quota reached (100/day on free plan) — try tomorrow.";
    case "monthly_quota_exceeded":
      return "Monthly quota reached (3,000/month on free plan).";
    case "invalid_api_key":
      return "RESEND_API_KEY is invalid.";
    case "restricted_api_key":
      return "This API key cannot send to that address — verify a domain first.";
    default:
      return code ? `Request failed (${code}).` : "Request failed.";
  }
}
