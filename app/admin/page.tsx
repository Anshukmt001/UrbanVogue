"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/admin/StatCard";
import { MemberTable } from "@/components/admin/MemberTable";
import {
  MOCK_CAMPAIGN,
  MOCK_MEMBERS,
  type MockMember,
} from "@/lib/mock-data";

interface StatsData {
  totalMembers: number;
  tenPercentMembers: number;
  fivePercentMembers: number;
  tierOnePercent?: number;
  tierTwoPercent?: number;
  remaining: number;
  redeemed: number;
  unredeemed: number;
  totalLimit: number;
  tenPercentLimit: number;
  fivePercentLimit: number;
}

interface ChartPoint {
  date?: string;
  label?: string;
  count: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recent, setRecent] = useState<MockMember[]>(MOCK_MEMBERS.slice(0, 6));
  const [chart, setChart] = useState<ChartPoint[]>([]);

  useEffect(() => {
    let active = true;

    const toMockMember = (m: Record<string, unknown>): MockMember => ({
      membershipNumber: Number(m.membershipNumber),
      name: String(m.name ?? ""),
      mobile: String(m.mobile ?? ""),
      email: m.email ? String(m.email) : undefined,
      discountPercentage: Number(m.discountPercentage ?? 0),
      membershipTier:
        Number(m.membershipNumber) <= 50 ? "first100" : "next50",
      status: (m.status === "revoked" ? "revoked" : "active") as
        | "active"
        | "revoked",
      discountRedeemed: Boolean(m.discountRedeemed),
      redeemedAt: m.redeemedAt ? String(m.redeemedAt) : null,
      createdAt: m.createdAt ? String(m.createdAt) : "",
    });

    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/members/recent").then((r) => r.json()),
      fetch("/api/admin/analytics/registrations").then((r) => r.json()),
    ])
      .then(([statsJson, recentJson, chartJson]) => {
        if (!active) return;
        if (statsJson?.success) setStats(statsJson.data as StatsData);
        if (recentJson?.success && Array.isArray(recentJson.data)) {
          setRecent(recentJson.data.map(toMockMember).slice(0, 6));
        }
        if (chartJson?.success && Array.isArray(chartJson.data)) {
          setChart(chartJson.data as ChartPoint[]);
        }
      })
      .catch(() => {
        // ignore
      });

    return () => {
      active = false;
    };
  }, []);

  const campaign = stats
    ? {
        claimed: stats.totalMembers,
        total: stats.totalLimit,
        remaining: stats.remaining,
        tenPercentMembers: stats.tenPercentMembers,
        fivePercentMembers: stats.fivePercentMembers,
        tenPercentLimit: stats.tenPercentLimit,
        fivePercentLimit: stats.fivePercentLimit,
        redeemed: stats.redeemed,
        unredeemed: stats.unredeemed,
      }
    : MOCK_CAMPAIGN;

  const tierOnePercent = stats?.tierOnePercent ?? 10;
  const tierTwoPercent = stats?.tierTwoPercent ?? 5;

  const STATS = [
    { label: "Total Members", value: campaign.claimed, sub: `of ${campaign.total} passes` },
    { label: `${tierOnePercent}% Tier`, value: campaign.tenPercentMembers, sub: `of ${campaign.tenPercentLimit}` },
    { label: `${tierTwoPercent}% Tier`, value: campaign.fivePercentMembers, sub: `of ${campaign.fivePercentLimit}` },
    { label: "Remaining", value: campaign.remaining, sub: "passes left" },
    { label: "Redeemed", value: campaign.redeemed, sub: "discounts used" },
    { label: "Unredeemed", value: campaign.unredeemed, sub: "still active" },
  ];

  const chartPoints: ChartPoint[] =
    chart.length > 0
      ? chart.slice(-12).map((p) => ({
          label: p.date
            ? new Date(`${p.date}T00:00:00`).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })
            : p.label,
          count: p.count,
        }))
      : [{ label: "", count: 0 }];
  const totalRegistered = chartPoints.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(1, ...chartPoints.map((d) => d.count));
  const pct =
    campaign.total > 0
      ? Math.round((campaign.claimed / campaign.total) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      <div>
        <h1 className="font-headline text-3xl sm:text-5xl uppercase tracking-tight leading-none">
          Admin <span className="font-editorial italic text-primary normal-case font-medium">Portal</span>
        </h1>
        <p className="mt-2 font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
          Early Access 2026 · Overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <StatCard
              label={stat.label}
              value={stat.value}
              sub={stat.sub}
              accent={stat.label === "Remaining"}
            />
          </motion.div>
        ))}
      </div>

      {/* Progress + chart */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 border border-border bg-card p-6 sm:p-8">
          <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground">
            Membership Progress
          </p>
          <p className="mt-3 font-headline text-5xl leading-none text-bone">
            {campaign.claimed}
            <span className="text-2xl text-muted-foreground"> / {campaign.total}</span>
          </p>
          <div className="mt-6 h-[18px] w-full border border-border bg-background overflow-hidden">
            <div
              className="h-full bg-primary relative"
              style={{ width: `${pct}%` }}
            >
              <div className="absolute inset-0 diagonal-stripes opacity-40" />
            </div>
          </div>
          <p className="mt-2 font-mono text-[8px] tracking-[0.3em] uppercase text-primary">
            {pct}% claimed · {campaign.remaining} remaining
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="border border-border p-4">
              <p className="font-headline text-2xl text-primary">{campaign.tenPercentMembers}</p>
              <p className="font-mono text-[8px] tracking-[0.24em] uppercase text-muted-foreground mt-1">
                of {campaign.tenPercentLimit} · {tierOnePercent}% members
              </p>
            </div>
            <div className="border border-border p-4">
              <p className="font-headline text-2xl text-muted-foreground">{campaign.fivePercentMembers}</p>
              <p className="font-mono text-[8px] tracking-[0.24em] uppercase text-muted-foreground mt-1">
                of {campaign.fivePercentLimit} · {tierTwoPercent}% members
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground">
              Registrations · Last 30 days
            </p>
            <span className="font-headline text-xl text-bone">+{totalRegistered}</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-44">
            {chartPoints.map((day, i) => (
              <div key={`${day.date}-${day.label}-${i}`} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                    className={`w-full max-w-[14px] ${i % 2 === 0 ? "bg-primary" : "bg-silver/70"}`}
                  />
                </div>
                <span
                  className={`font-mono text-[7px] tracking-[0.12em] uppercase ${
                    i % 3 === 0 ? "text-muted-foreground" : "text-muted-foreground/40"
                  }`}
                >
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent members */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-xl uppercase tracking-tight">
            Recent <span className="font-editorial italic text-primary normal-case font-medium">Members</span>
          </h2>
          <span className="font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground">
            Latest {recent.length} · #001 – #100
          </span>
        </div>
        <MemberTable members={recent} />
      </div>
    </motion.div>
  );
}