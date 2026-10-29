import { HeroJourney } from "@/components/home/HeroJourney";
import { ChoosePathCards } from "@/components/home/ChoosePathCards";
import { TransparencyTimeline } from "@/components/home/TransparencyTimeline";
import { ProofWall } from "@/components/home/ProofWall";
import { TourCarousel } from "@/components/home/TourCarousel";
import { CaseStudies } from "@/components/home/CaseStudies";
import { InsightsFaq } from "@/components/home/InsightsFaq";
import { FinalCTA } from "@/components/home/FinalCTA";

import { getPublishedTours } from "@/lib/tours/public";

// Tours come from the database; refresh at most every minute (admin edits also revalidate).
export const revalidate = 60;

export default async function Home() {
  const tours = await getPublishedTours();
  return (
    <div className="flex flex-col min-h-screen">
      <HeroJourney />
      <ChoosePathCards />
      <TransparencyTimeline />
      <ProofWall />
      <TourCarousel tours={tours} />
      <CaseStudies />
      <InsightsFaq />
      <FinalCTA />
    </div>
  );
}
