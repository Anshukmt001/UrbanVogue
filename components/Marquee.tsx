const WORDS = [
  "Urban Vogue",
  "Early Access 2026",
  "The First 100",
  "@urban_vogue_kct",
];

export function Marquee() {
  const row = [...WORDS, ...WORDS];
  return (
    <div className="relative border-y border-border bg-card overflow-hidden select-none">
      <div className="flex whitespace-nowrap marquee-track-fast py-3.5 gap-0">
        {Array.from({ length: 2 }).map((_, dup) => (
          <div key={dup} className="flex items-center shrink-0" aria-hidden={dup === 1}>
            {row.map((word, i) => (
              <span key={`${dup}-${i}`} className="flex items-center">
                <span className="font-headline uppercase text-lg tracking-tight text-muted-foreground px-6">
                  {word}
                </span>
                <span className="text-primary">★</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}