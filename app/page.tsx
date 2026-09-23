import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { MembershipCards } from "@/components/MembershipCards";
import { MemberProgress } from "@/components/MemberProgress";
import { BenefitCards } from "@/components/BenefitCards";
import { MembershipExperience } from "@/components/MembershipExperience";
import { HowItWorks } from "@/components/HowItWorks";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { MOCK_CAMPAIGN } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <MembershipCards />
        <MemberProgress claimed={MOCK_CAMPAIGN.claimed} total={MOCK_CAMPAIGN.total} />
        <BenefitCards />
        <MembershipExperience />
        <HowItWorks />
        <Marquee />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}