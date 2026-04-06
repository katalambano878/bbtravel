import { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { StartApplicationForm } from "@/components/forms/start-application-form";
import { submitWizardAction } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Start Application",
  description: "Begin your structured onboarding for visa, recruitment, study, tours, flights, or hotel booking support.",
  alternates: { canonical: "/start-application" },
  openGraph: {
    title: "Start Application | B.B. Travel Consult",
    description: "Begin your structured onboarding for visa, recruitment, study, tours, flights, or hotel booking support.",
    url: "/start-application",
    images: [{ url: "/seo/og-image.png", width: 1024, height: 1024, alt: "B.B. Travel Consult" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Start Application | B.B. Travel Consult",
    description: "Begin your structured onboarding for visa, recruitment, study, tours, flights, or hotel booking support.",
    images: ["/seo/og-image.png"]
  }
};

export default function StartApplicationPage() {
  return (
    <>
      <PageHero
        eyebrow="Start Application"
        title="One smart intake, six service pathways."
        description="Complete this onboarding wizard to create your case, unlock your checklist, and see your readiness score."
      />
      <section className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <StartApplicationForm action={submitWizardAction} />
          <Card className="h-fit">
            <CardContent className="space-y-4 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-bb-gold">What happens next</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>1. Your lead and case records are created instantly.</li>
                <li>2. A personalized checklist appears on your success page.</li>
                <li>3. Our team reviews and contacts you for next actions.</li>
                <li>4. You can track status, documents, and appointments in your client portal.</li>
              </ul>
              <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                Guidance only: readiness scoring is a process completeness indicator, not legal or immigration advice.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
