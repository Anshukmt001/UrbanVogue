type BadgeTone = "active" | "deactivated" | "redeemed" | "neutral" | "invalid";

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  active:
    "border border-primary/40 bg-primary/10 text-primary",
  redeemed: "border border-amber-500/30 bg-amber-500/10 text-amber-400",
  deactivated: "border border-red-500/30 bg-red-500/10 text-red-400",
  invalid: "border border-red-500/30 bg-red-500/10 text-red-400",
  neutral: "border border-border bg-secondary text-muted-foreground",
};

export function Badge({ tone = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[9px] tracking-[0.24em] uppercase ${toneClasses[tone]} ${className}`}
    >
      <span
        className={`h-1 w-1 ${
          tone === "active"
            ? "bg-primary"
            : tone === "redeemed"
            ? "bg-amber-400"
            : tone === "deactivated" || tone === "invalid"
            ? "bg-red-400"
            : "bg-muted-foreground"
        }`}
      />
      {children}
    </span>
  );
}