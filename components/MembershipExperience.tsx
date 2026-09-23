import Link from "next/link";
import { MembershipPass } from "@/components/MembershipPass";
import { MOCK_MEMBER } from "@/lib/mock-data";

export function MembershipExperience() {
  return (
    <section className="relative bg-background text-foreground py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-[1400px] px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-primary mb-3">
              Membership Experience
            </p>
            <h2 className="font-headline text-5xl sm:text-7xl uppercase leading-[0.9] tracking-tight mb-8">
              Your Pass.
              <span className="block font-editorial italic text-primary normal-case font-medium">
                Your
              </span>
              Access.
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-md mb-10">
              A scannable digital pass — your membership number, your discount,
              hard-coded for the launch of the new era.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/membership/037"
                className="clip-notch inline-flex items-center justify-center px-8 py-4 bg-bone text-background text-xs font-bold tracking-[0.22em] uppercase hover:bg-[#c9a86a] transition-colors duration-300"
              >
                View Sample Pass
              </Link>
              <Link
                href="/verify/uv-037"
                className="clip-notch inline-flex items-center justify-center px-8 py-4 border border-border text-xs font-bold tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground hover:border-silver transition-all duration-300"
              >
                Verify Your Pass
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-2 font-mono text-[9px] tracking-[0.32em] uppercase text-muted-foreground">
              <span className="h-1.5 w-1.5 bg-silver" />
              Member #{MOCK_MEMBER.membershipNumber} · 10% Off
            </div>
          </div>

          <MembershipPass member={MOCK_MEMBER} />
        </div>
      </div>
    </section>
  );
}