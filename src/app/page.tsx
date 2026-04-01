import { HeroJourney } from "@/components/home/HeroJourney";
import { ChoosePathCards } from "@/components/home/ChoosePathCards";
import { TransparencyTimeline } from "@/components/home/TransparencyTimeline";
import { ProofWall } from "@/components/home/ProofWall";
import { TourCarousel } from "@/components/home/TourCarousel";
import { CaseStudies } from "@/components/home/CaseStudies";
import { InsightsFaq } from "@/components/home/InsightsFaq";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroJourney />
      <ChoosePathCards />
      <TransparencyTimeline />
      <ProofWall />
      <TourCarousel />
      <CaseStudies />
      <InsightsFaq />
      <FinalCTA />
    </div>
  );
}
