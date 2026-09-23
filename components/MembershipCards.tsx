interface MembershipCardsProps {
  first50?: number;
  next50?: number;
}

export function MembershipCards({
  first50 = 50,
  next50 = 50,
}: MembershipCardsProps) {
  return (
    <section className="bg-card text-foreground py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-end mb-16">
          <h2 className="font-headline text-6xl sm:text-8xl uppercase leading-[0.85] tracking-tight">
            The <span className="font-editorial italic text-primary normal-case font-medium">First</span>
            <br />
            100.
          </h2>
          <p className="text-muted-foreground max-w-md text-sm sm:text-base leading-relaxed">
            Not everyone gets in. Early access is capped at 100 members — the
            founding circle of Urban Vogue. Secure your number before it&apos;s gone.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="clip-notch bg-background border border-border p-10 sm:p-14 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-[3px] w-full bg-primary" />
            <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-primary mb-8">
              01 — First 50
            </p>
            <p className="font-headline text-8xl sm:text-9xl leading-none text-foreground">
              {first50}
            </p>
            <p className="mt-4 font-headline text-2xl uppercase tracking-tight">
              Members
            </p>
            <div className="mt-10 p-5 border border-primary/40 bg-primary/10 inline-block">
              <span className="font-headline text-3xl tracking-tight text-primary">
                10%
              </span>
              <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-primary block mt-1">
                Off Everything
              </span>
            </div>
          </div>

          <div
            className="clip-notch bg-background border border-border p-10 sm:p-14 relative overflow-hidden"
            id="early-access"
          >
            <div className="absolute top-0 left-0 h-[3px] w-full bg-silver" />
            <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-silver mb-8">
              02 — Next 50
            </p>
            <p className="font-headline text-8xl sm:text-9xl leading-none text-muted-foreground">
              {next50}
            </p>
            <p className="mt-4 font-headline text-2xl uppercase tracking-tight text-muted-foreground">
              Members
            </p>
            <div className="mt-10 p-5 border border-silver/30 inline-block">
              <span className="font-headline text-3xl tracking-tight text-muted-foreground">
                5%
              </span>
              <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-muted-foreground block mt-1">
                Off Everything
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}