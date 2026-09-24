"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Download, ExternalLink, Ban, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { MembershipPass } from "@/components/MembershipPass";
import { downloadMembershipPass } from "@/lib/download-pass";
import { getMockMemberByNumber, type MockMember } from "@/lib/mock-data";

export default function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [member, setMember] = useState<MockMember>(
    () => getMockMemberByNumber(parseInt(id, 10))
  );
  const [showConfirm, setShowConfirm] = useState<"revoke" | "restore" | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/members/${id}`)
      .then((res) => (Promise.resolve(res.ok ? res.json() : null)))
      .then((json) => {
        if (!active || !json?.success) return;
        const d = json.data;
        setMember({
          membershipNumber: Number(d.membershipNumber),
          name: String(d.name ?? ""),
          mobile: String(d.mobile ?? ""),
          email: d.email ? String(d.email) : undefined,
          discountPercentage: Number(d.discountPercentage ?? 0),
          membershipTier:
            Number(d.membershipNumber) <= 50 ? "first100" : "next50",
          status: (d.status === "revoked" ? "revoked" : "active") as
            | "active"
            | "revoked",
          discountRedeemed: Boolean(d.discountRedeemed),
          redeemedAt: d.redeemedAt ? String(d.redeemedAt) : null,
          createdAt: d.createdAt ? String(d.createdAt) : "",
        });
      })
      .catch(() => {
        // ignore
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function downloadPass() {
    if (!cardRef.current) return;
    try {
      await downloadMembershipPass(cardRef.current, member.membershipNumber);
    } catch {
      // ignore
    }
  }

  async function performAction(action: "revoke" | "restore") {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        setMember((prev) => ({
          ...prev,
          status: action === "revoke" ? "revoked" : "active",
        }));
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
      setShowConfirm(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-2xl"
    >
      <Link
        href="/admin/members"
        className="inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to members
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-4xl sm:text-5xl uppercase tracking-tight leading-none">
            #{String(member.membershipNumber).padStart(3, "0")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground tracking-wide">
            {member.name}
          </p>
        </div>
        <Badge tone={member.status === "active" && !member.discountRedeemed ? "active" : member.status === "revoked" ? "deactivated" : "redeemed"}>
          {member.status === "revoked"
            ? "Revoked"
            : member.discountRedeemed
            ? "Redeemed"
            : "Active"}
        </Badge>
      </div>

      {/* Pass preview */}
      <div ref={cardRef} className="w-full max-w-md mx-auto">
        <MembershipPass member={member} />
      </div>

      {/* Details */}
      <div className="border border-border bg-card divide-y divide-border">
        {[
          { label: "Membership #", value: `UV-${member.membershipNumber}` },
          { label: "Name", value: member.name },
          { label: "Mobile", value: member.mobile },
          { label: "Email", value: member.email || "—" },
          { label: "Discount", value: `${member.discountPercentage}% OFF` },
          { label: "Tier", value: member.membershipTier === "first100" ? "First 50" : "Next 50" },
          { label: "Status", value: member.status === "active" ? "Active" : "Revoked" },
          { label: "Redeemed", value: member.discountRedeemed ? "Yes" : "No" },
          ...(member.redeemedAt
            ? [
                {
                  label: "Redeemed At",
                  value: new Date(member.redeemedAt).toLocaleString("en-IN"),
                },
              ]
            : []),
          {
            label: "Registered",
            value: new Date(member.createdAt).toLocaleString("en-IN"),
          },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
            <span className="font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground">
              {row.label}
            </span>
            <span className="text-sm font-medium">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/membership/${member.membershipNumber}`}
          target="_blank"
          className="clip-notch inline-flex items-center justify-center gap-2 border border-border px-4 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground hover:border-silver transition-all"
        >
          <ExternalLink className="h-4 w-4" />
          View Pass
        </Link>
        <button
          onClick={downloadPass}
          className="clip-notch inline-flex items-center justify-center gap-2 border border-border px-4 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground hover:border-silver transition-all cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>

      {member.status === "active" ? (
        <button
          onClick={() => setShowConfirm("revoke")}
          className="clip-notch w-full flex items-center justify-center gap-2 border border-primary/40 px-4 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase text-primary hover:bg-primary/10 transition-colors cursor-pointer"
        >
          <Ban className="h-4 w-4" />
          Revoke Membership
        </button>
      ) : (
        <button
          onClick={() => setShowConfirm("restore")}
          className="clip-notch w-full flex items-center justify-center gap-2 border border-amber-500/40 px-4 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4" />
          Restore Membership
        </button>
      )}

      <Modal
        open={showConfirm !== null}
        onClose={() => setShowConfirm(null)}
        title={showConfirm === "revoke" ? "Revoke Membership?" : "Restore Membership?"}
        actions={
          <>
            <Button variant="outline" onClick={() => setShowConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant={showConfirm === "revoke" ? "danger" : "inverse"}
              onClick={() => showConfirm && performAction(showConfirm)}
              loading={saving}
              disabled={saving}
            >
              {showConfirm === "revoke" ? "Revoke" : "Restore"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          {showConfirm === "revoke"
            ? `This will deactivate #${member.membershipNumber}. The member will no longer be able to use their discount.`
            : `This will reactivate #${member.membershipNumber}. The member will be able to use their discount again.`}
        </p>
      </Modal>
    </motion.div>
  );
}