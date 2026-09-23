import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="relative bg-background text-foreground py-28 sm:py-36 overflow-hidden">
      <div className="absolute inset-0 diagonal-stripes opacity-[0.06]" aria-hidden />
      <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-primary mb-6">
          Early Access 2026
        </p>
        <h2 className="font-headline text-6xl sm:text-9xl uppercase leading-[0.85] tracking-tight">
          Ready
          <span className="block font-editorial italic normal-case font-medium text-primary">
            to get in?
          </span>
        </h2>
        <p className="mx-auto mt-8 max-w-md text-sm sm:text-base text-muted-foreground">
          Early access is limited to 100 members. When the circle is full, it&apos;s
          closed — for good.
        </p>
        <div className="mt-12">
          <Link
            href="/join"
            className="clip-notch inline-flex items-center justify-center px-10 py-5 bg-bone text-background text-sm font-bold tracking-[0.22em] uppercase hover:bg-[#c9a86a] transition-all duration-300"
          >
            Claim My Pass
          </Link>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 font-mono text-[10px] tracking-[0.3em] uppercase">
          <span className="clip-notch-sm border border-primary/40 bg-primary/10 px-5 py-3 text-primary">
            50 × 10% OFF
          </span>
          <span className="clip-notch-sm border border-border bg-card px-5 py-3 text-muted-foreground">
            50 × 5% OFF
          </span>
        </div>
      </div>
    </section>
  );
}