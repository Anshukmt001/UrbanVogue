"use client";

import { motion } from "framer-motion";

interface Member {
  _id: string;
  membershipNumber: number;
  name: string;
  mobile: string;
  discountPercentage: number;
  status: string;
  discountRedeemed: boolean;
  createdAt: string;
}

interface RecentMembersProps {
  members: Member[];
}

export function RecentMembers({ members }: RecentMembersProps) {
  if (members.length === 0) {
    return (
      <div className="border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">No members yet.</p>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-medium">
                Member #
              </th>
              <th className="text-left px-4 py-3 text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-medium">
                Name
              </th>
              <th className="text-left px-4 py-3 text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-medium hidden sm:table-cell">
                Mobile
              </th>
              <th className="text-left px-4 py-3 text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-medium">
                Discount
              </th>
              <th className="text-left px-4 py-3 text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-medium">
                Status
              </th>
              <th className="text-left px-4 py-3 text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-medium hidden md:table-cell">
                Redeemed
              </th>
              <th className="text-left px-4 py-3 text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-medium hidden lg:table-cell">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, i) => (
              <motion.tr
                key={member._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs">
                  #{member.membershipNumber}
                </td>
                <td className="px-4 py-3 font-medium">{member.name}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                  {member.mobile}
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold text-silver">
                    {member.discountPercentage}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs ${
                      member.status === "active"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        member.status === "active"
                          ? "bg-emerald-400"
                          : "bg-red-400"
                      }`}
                    />
                    {member.status === "active" ? "Active" : "Revoked"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span
                    className={`text-xs ${
                      member.discountRedeemed
                        ? "text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {member.discountRedeemed ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                  {new Date(member.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
