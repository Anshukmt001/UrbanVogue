const STEPS = [
  {
    number: "01",
    title: "Register",
    body: "Claim your spot in the first 100. Share your name, mobile and email.",
  },
  {
    number: "02",
    title: "Get Your Pass",
    body: "Instantly receive your digital member pass with a scannable QR code.",
  },
  {
    number: "03",
    title: "Show & Save",
    body: "Flash your pass at the launch. Your discount is on us.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-card text-foreground py-24 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex items-end justify-between gap-6 mb-16">
          <div>
            <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-muted-foreground mb-3">
              Easy As 1-2-3
            </p>
            <h2 className="font-headline text-5xl sm:text-6xl uppercase leading-[0.9] tracking-tight">
              How It{" "}
              <span className="font-editorial italic text-primary normal-case font-medium">
                Works
              </span>
            </h2>
          </div>
          <div className="hidden md:block font-headline text-8xl text-muted-foreground/15" aria-hidden>
            100
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
          {STEPS.map((step) => (
            <div key={step.number} className="bg-card p-10 sm:p-14">
              <p className="font-headline text-6xl leading-none text-muted-foreground/50">
                {step.number}
              </p>
              <div className="my-10 h-px w-16 bg-primary" />
              <h3 className="font-headline text-2xl uppercase tracking-tight mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}