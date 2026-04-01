import Link from "next/link";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { checklistTemplates } from "@/lib/data/content";

export default async function StartApplicationSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ lead?: string; case?: string; score?: string }>;
}) {
  const params = await searchParams;
  const score = Number(params.score ?? "0");
  const checklist = checklistTemplates.VISA_ASSISTANCE;

  return (
    <>
      <PageHero
        eyebrow="Application Submitted"
        title="Your case has been created successfully."
        description="You now have a structured journey with transparent next steps."
      />
      <section className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-bb-gold">Readiness Score</p>
            <p className="mt-2 text-4xl font-semibold text-bb-navy">{score}%</p>
            <p className="mt-2 text-sm text-slate-600">
              This score reflects checklist completeness and readiness inputs, not visa or legal outcomes.
            </p>
            <div className="mt-5 space-y-1 text-xs text-slate-500">
              <p>Lead ID: {params.lead ?? "N/A"}</p>
              <p>Case ID: {params.case ?? "N/A"}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/portal/register">Create Portal Account</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/portal/login">Portal Login</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-bb-navy">Personalized next steps</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {checklist.map((item) => (
                <li key={item} className="rounded-xl bg-slate-50 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
