interface BenefitCardsProps {
  items?: { number: string; title: string; body: string }[];
}

const DEFAULTS = [
  {
    number: "01",
    title: "Early Access",
    body: "Founding members get the drop before anyone else.",
  },
  {
    number: "02",
    title: "Exclusive Discount",
    body: "10% off for the first 50, 5% for the next 50.",
  },
  {
    number: "03",
    title: "Digital Member Pass",
    body: "A scannable pass. Yours to keep. Yours to show.",
  },
];

export function BenefitCards({ items = DEFAULTS }: BenefitCardsProps) {
  return (
    <section className="bg-card text-foreground py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-primary mb-3">
              Why Join
            </p>
            <h2 className="font-headline text-5xl sm:text-7xl uppercase leading-[0.9] tracking-tight">
              Why <span className="font-editorial italic text-primary normal-case font-medium">Get In</span>
              <br />
              Early
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-sm">
            The founding circle is small by design. Each benefit is reserved for
            members only.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.number}
              className="group relative border border-border bg-background p-10 transition-colors duration-300 hover:border-silver/40"
            >
              <span className="font-headline text-4xl text-muted-foreground/60 transition-colors duration-300 group-hover:text-primary">
                {item.number}
              </span>
              <div className="my-10 h-px w-full bg-border group-hover:bg-primary transition-colors duration-300" />
              <h3 className="font-headline text-2xl uppercase tracking-tight mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.body}
              </p>
              <span className="absolute top-0 right-0 h-full w-1 bg-primary scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}