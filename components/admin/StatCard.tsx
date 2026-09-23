interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden border p-6 ${
        accent ? "border-primary/40 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div
        className="absolute top-0 left-0 h-px w-full"
        style={{
          background: accent
            ? "linear-gradient(90deg, transparent, rgba(230,36,41,0.8), transparent)"
            : "linear-gradient(90deg, transparent, rgba(198,193,180,0.5), transparent)",
        }}
      />
      <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground">
        {label}
      </p>
      <p className={`mt-3 font-headline text-4xl leading-none ${accent ? "text-primary" : "text-bone"}`}>
        {value}
      </p>
      {sub && (
        <p className="mt-2 font-mono text-[8px] tracking-[0.24em] uppercase text-muted-foreground">
          {sub}
        </p>
      )}
    </div>
  );
}