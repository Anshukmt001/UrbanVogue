"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { MemberTable } from "@/components/admin/MemberTable";
import { tierFromDiscount } from "@/lib/tier";
import { MOCK_CAMPAIGN, type MockMember } from "@/lib/mock-data";

const BASE_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "revoked", label: "Revoked" },
  { key: "redeemed", label: "Redeemed" },
  { key: "unredeemed", label: "Unredeemed" },
] as const;

const PER_PAGE = 8;

export default function AdminMembersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<MockMember[]>([]);
  const [total, setTotal] = useState(0);
  const [tierOnePct, setTierOnePct] = useState(10);
  const [tierTwoPct, setTierTwoPct] = useState(5);

  useEffect(() => {
    let active = true;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((json) => {
        if (!active || !json?.success) return;
        setTierOnePct(Number(json.data.tierOnePercent) || 10);
        setTierTwoPct(Number(json.data.tierTwoPercent) || 5);
      })
      .catch(() => {
        // keep defaults
      });
    return () => {
      active = false;
    };
  }, []);

  const filters = [
    BASE_FILTERS[0],
    ...(tierOnePct === tierTwoPct
      ? [{ key: `pct:${tierOnePct}`, label: `${tierOnePct}%` }]
      : [
          { key: `pct:${tierOnePct}`, label: `${tierOnePct}%` },
          { key: `pct:${tierTwoPct}`, label: `${tierTwoPct}%` },
        ]),
    ...BASE_FILTERS.slice(1),
  ];

  function toMockMember(m: Record<string, unknown>): MockMember {
    return {
      membershipNumber: Number(m.membershipNumber),
      name: String(m.name ?? ""),
      mobile: String(m.mobile ?? ""),
      email: m.email ? String(m.email) : undefined,
      discountPercentage: Number(m.discountPercentage ?? 0),
      membershipTier: tierFromDiscount(
        Number(m.discountPercentage ?? 0),
        tierOnePct
      ),
      status: (m.status === "revoked" ? "revoked" : "active") as
        | "active"
        | "revoked",
      discountRedeemed: Boolean(m.discountRedeemed),
      redeemedAt: m.redeemedAt ? String(m.redeemedAt) : null,
      createdAt: m.createdAt ? String(m.createdAt) : "",
    };
  }

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PER_PAGE),
    });
    if (search.trim()) params.set("search", search.trim());
    if (filter.startsWith("pct:")) params.set("discount", filter.slice(4));
    if (filter === "revoked") params.set("status", "revoked");
    if (filter === "active") params.set("status", "active");
    if (filter === "redeemed") params.set("redeemed", "true");
    if (filter === "active" || filter === "unredeemed")
      params.set("redeemed", "false");

    const handle = setTimeout(() => {
      fetch(`/api/admin/members?${params.toString()}`)
        .then((r) => r.json())
        .then((json) => {
          if (!active) return;
          if (json?.success) {
            setRows((json.data.members || []).map(toMockMember));
            setTotal(Number(json.data.total) || 0);
          } else {
            setRows([]);
            setTotal(0);
          }
        })
        .catch(() => {
          if (!active) return;
          setRows([]);
          setTotal(0);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [search, filter, page]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);

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
            <span className="font-editorial italic text-primary normal-case font-medium">Members</span>
          </h1>
          <p className="mt-2 font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
            {total} of {MOCK_CAMPAIGN.total} badges issued
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="font-mono text-[9px] tracking-[0.24em] uppercase">
            {total} results
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="relative lg:max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, number, phone…"
            className="w-full bg-card border border-border pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
              className={`clip-notch-sm px-4 py-2 font-mono text-[8px] tracking-[0.24em] uppercase transition-colors cursor-pointer ${
                filter === f.key
                  ? "bg-bone text-background"
                  : "border border-border text-muted-foreground hover:text-foreground hover:border-silver"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <MemberTable
        members={rows.map((m) => ({
          ...m,
          membershipTier: tierFromDiscount(m.discountPercentage, tierOnePct),
        }))}
        emptyLabel="No members found"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex items-center gap-2 border border-border px-4 py-2.5 font-mono text-[8px] tracking-[0.24em] uppercase text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>
          <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-muted-foreground">
            Page {safePage} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="flex items-center gap-2 border border-border px-4 py-2.5 font-mono text-[8px] tracking-[0.24em] uppercase text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}