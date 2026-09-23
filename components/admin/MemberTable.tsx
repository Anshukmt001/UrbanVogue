import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { MockMember } from "@/lib/mock-data";

interface MemberTableProps {
  members: MockMember[];
  emptyLabel?: string;
}

function statusTone(member: MockMember) {
  if (member.status === "revoked") return "deactivated" as const;
  if (member.discountRedeemed) return "redeemed" as const;
  return "active" as const;
}

function statusLabel(member: MockMember) {
  if (member.status === "revoked") return "Revoked";
  if (member.discountRedeemed) return "Redeemed";
  return "Active";
}

export function MemberTable({ members, emptyLabel = "No members found" }: MemberTableProps) {
  if (members.length === 0) {
    return (
      <div className="border border-border bg-card p-10 text-center">
        <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
          {emptyLabel}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card overflow-x-auto">
      <table className="w-full text-left min-w-[640px]">
        <thead>
          <tr className="border-b border-border">
            {["Member", "Name", "Discount", "Status", "Redeemed"].map((col) => (
              <th
                key={col}
                className="px-5 py-3.5 font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground font-medium"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr
              key={member.membershipNumber}
              className="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors"
            >
              <td className="px-5 py-4">
                <Link
                  href={`/admin/members/${member.membershipNumber}`}
                  className="font-headline text-lg text-bone hover:text-primary transition-colors"
                >
                  #{String(member.membershipNumber).padStart(3, "0")}
                </Link>
              </td>
              <td className="px-5 py-4 text-sm text-foreground whitespace-nowrap">
                {member.name}
              </td>
              <td className="px-5 py-4 font-headline text-base text-primary">
                {member.discountPercentage}% OFF
              </td>
              <td className="px-5 py-4">
                <Badge tone={statusTone(member)}>{statusLabel(member)}</Badge>
              </td>
              <td className="px-5 py-4 font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
                {member.discountRedeemed ? "Yes" : "No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}