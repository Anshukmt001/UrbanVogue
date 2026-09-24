"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Ticket,
  Pencil,
  Trash2,
  Power,
  AlertTriangle,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  formatCouponValue,
  isCouponExpired,
  normalizeCouponCode,
} from "@/lib/coupons";

interface CouponRecord {
  _id: string;
  code: string;
  title: string;
  description: string;
  discountType: "percentage" | "flat";
  value: number;
  active: boolean;
  expiresAt: string | null;
  createdAt?: string;
}

const EMPTY_FORM = {
  code: "",
  title: "",
  description: "",
  discountType: "percentage" as "percentage" | "flat",
  value: "",
  expiresAt: "",
  active: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CouponRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((json) => {
        if (!active || !json?.success) return;
        setCoupons(json.data.coupons || []);
        setActiveCount(Number(json.data.activeCount) || 0);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(coupon: CouponRecord) {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description || "",
      discountType: coupon.discountType,
      value: String(coupon.value),
      expiresAt: toDateInput(coupon.expiresAt),
      active: coupon.active,
    });
    setFormError(null);
    setFormOpen(true);
  }

  function toDateInput(value: string | null) {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  async function saveCoupon() {
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        code: normalizeCouponCode(form.code),
        title: form.title.trim(),
        description: form.description.trim(),
        discountType: form.discountType,
        value: Number(form.value),
        expiresAt: form.expiresAt ? form.expiresAt : null,
        active: form.active,
      };
      const res = await fetch(
        editingId
          ? `/api/admin/coupons/${editingId}`
          : "/api/admin/coupons",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setFormError(
          json?.error === "COUPON_CODE_EXISTS"
            ? "That coupon code already exists."
            : json?.error || "Could not save the coupon."
        );
        return;
      }
      setFormOpen(false);
      recount();
    } catch {
      setFormError("Could not save the coupon.");
    } finally {
      setSaving(false);
    }
  }

  function recount() {
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((json) => {
        if (!json?.success) return;
        setCoupons(json.data.coupons || []);
        setActiveCount(Number(json.data.activeCount) || 0);
      })
      .catch(() => {
        // ignore
      });
  }

  async function toggleCoupon(coupon: CouponRecord) {
    setTogglingId(coupon._id);
    try {
      const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !coupon.active }),
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        recount();
      }
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteCoupon() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        setDeleteTarget(null);
        recount();
      }
    } finally {
      setDeleting(false);
    }
  }

  function statusOf(coupon: CouponRecord) {
    if (isCouponExpired(coupon))
      return { tone: "deactivated" as const, label: "Expired" };
    if (!coupon.active) return { tone: "neutral" as const, label: "Paused" };
    return { tone: "active" as const, label: "Live" };
  }

  const total = coupons.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl sm:text-5xl uppercase tracking-tight leading-none">
            Coupons &{" "}
            <span className="font-editorial italic text-primary normal-case font-medium">
              Vouchers
            </span>
          </h1>
          <p className="mt-2 font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
            {total} vouchers · {activeCount} live for members
          </p>
        </div>
        <Button variant="inverse" size="md" onClick={openCreate} className="clip-notch">
          <Plus className="h-4 w-4" />
          New Coupon
        </Button>
      </div>

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-left min-w-[720px]">
          <thead>
            <tr className="border-b border-border">
              {["Code", "Offer", "Voucher", "Status", "Expires", "Actions"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-5 py-3.5 font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground font-medium"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground"
                >
                  Loading coupons…
                </td>
              </tr>
            ) : total === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center"
                >
                  <Ticket className="h-6 w-6 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
                    No coupons yet — create your first voucher
                  </p>
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => {
                const status = statusOf(coupon);
                return (
                  <tr
                    key={coupon._id}
                    className="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs tracking-[0.18em] uppercase text-bone border border-border bg-background px-2.5 py-1.5">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-headline text-lg text-primary whitespace-nowrap">
                      {formatCouponValue(coupon.discountType, coupon.value)}
                    </td>
                    <td className="px-5 py-4 max-w-[280px]">
                      <p className="text-sm text-foreground truncate">
                        {coupon.title}
                      </p>
                      {coupon.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground truncate">
                          {coupon.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </td>
                    <td className="px-5 py-4 font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground whitespace-nowrap">
                      {coupon.expiresAt ? (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {toDateInput(coupon.expiresAt)}
                        </span>
                      ) : (
                        "Never"
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleCoupon(coupon)}
                          disabled={togglingId === coupon._id}
                          title={coupon.active ? "Pause coupon" : "Activate coupon"}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Power className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => openEdit(coupon)}
                          title="Edit coupon"
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(coupon)}
                          title="Delete coupon"
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create / edit modal */}
      <Modal
        open={formOpen}
        onClose={() => {
          if (!saving) setFormOpen(false);
        }}
        title={editingId ? "Edit Coupon" : "New Coupon"}
        maxWidth="max-w-lg"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="inverse"
              onClick={saveCoupon}
              loading={saving}
              className="clip-notch"
            >
              {editingId ? "Save Changes" : "Create Coupon"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground mb-2">
              Coupon Code
            </label>
            <input
              value={form.code}
              onChange={(e) =>
                setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
              }
              placeholder="WELCOME15"
              className="w-full bg-transparent border-b border-border px-0 py-2.5 font-mono text-sm tracking-[0.18em] uppercase text-bone focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground mb-2">
              Voucher Title
            </label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="15% off your first order"
              className="w-full bg-transparent border-b border-border px-0 py-2.5 text-sm text-bone focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground mb-2">
              Description <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              placeholder="Valid on all full-price drops"
              className="w-full bg-transparent border-b border-border px-0 py-2.5 text-sm text-bone resize-none focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground mb-2">
                Discount Type
              </label>
              <div className="flex gap-2">
                {(["percentage", "flat"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setForm((f) => ({ ...f, discountType: type }))
                    }
                    className={`flex-1 px-3 py-2.5 font-mono text-[9px] tracking-[0.22em] uppercase transition-colors cursor-pointer ${
                      form.discountType === type
                        ? "bg-bone text-background"
                        : "border border-border text-muted-foreground hover:text-foreground hover:border-silver"
                    }`}
                  >
                    {type === "percentage" ? "Percent" : "Flat"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground mb-2">
                {form.discountType === "percentage"
                  ? "Value (%)"
                  : "Value (off)"}
              </label>
              <input
                type="number"
                min={1}
                max={form.discountType === "percentage" ? 100 : undefined}
                value={form.value}
                onChange={(e) =>
                  setForm((f) => ({ ...f, value: e.target.value }))
                }
                placeholder={form.discountType === "percentage" ? "15" : "500"}
                className="w-full bg-transparent border-b border-border px-0 py-2.5 font-headline text-2xl text-bone focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 items-end">
            <div>
              <label className="block font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground mb-2">
                Expires On <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expiresAt: e.target.value }))
                }
                className="w-full bg-transparent border-b border-border px-0 py-2.5 text-sm text-bone focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex items-center justify-between sm:justify-start sm:gap-4">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="font-mono text-[8px] tracking-[0.24em] uppercase text-muted-foreground mt-1">
                  Visible to members
                </p>
              </div>
              <button
                onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                role="switch"
                aria-checked={form.active}
                aria-label="Toggle coupon active"
                className={`relative h-7 w-14 shrink-0 border transition-colors cursor-pointer ${
                  form.active
                    ? "bg-primary border-primary"
                    : "bg-secondary border-border"
                }`}
              >
                <span
                  className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 bg-bone transition-all ${
                    form.active ? "left-[calc(100%-1.5rem)]" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {formError && (
            <p className="text-xs text-destructive leading-relaxed">
              {formError}
            </p>
          )}
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        title="Delete coupon?"
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-mono text-xs tracking-[0.18em] uppercase text-bone">
            {deleteTarget?.code}
          </span>{" "}
          will be removed permanently. Members currently holding this code lose
          access to it. This cannot be undone.
        </p>
        <div className="mt-4 flex items-center gap-2 font-mono text-[8px] tracking-[0.28em] uppercase text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Irreversible action
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={deleteCoupon}
            loading={deleting}
            className="clip-notch"
          >
            <Trash2 className="h-4 w-4" />
            Delete Coupon
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
