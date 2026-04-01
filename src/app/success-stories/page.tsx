import { PageHero } from "@/components/shared/page-hero";
import { CtaBanner } from "@/components/shared/cta-banner";
import { successStories } from "@/lib/data/content";
import { getPublicTestimonials } from "@/lib/data/public-content";
import { Card, CardContent } from "@/components/ui/card";

export default async function SuccessStoriesPage() {
  const testimonials = await getPublicTestimonials();

  return (
    <>
      <PageHero
        eyebrow="Success Stories"
        title="Outcomes built on structure, transparency, and trust."
        description="From student placements to global recruitment and family travel, our clients move with confidence."
      />
      <section className="section-shell">
        <div className="grid gap-6 md:grid-cols-3">
          {successStories.map((item) => (
            <Card key={item.title}>
              <CardContent className="space-y-3 p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-bb-gold">{item.service}</p>
                <h2 className="text-xl font-semibold text-bb-navy">{item.title}</h2>
                <p className="text-sm text-slate-600">{item.outcome}</p>
                <p className="text-xs font-medium text-bb-sky">{item.metric}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="section-shell pt-0">
        <h2 className="mb-6 text-2xl font-semibold text-bb-navy">Client testimonials</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.name}>
              <CardContent className="space-y-3 p-6">
                <p className="text-sm text-slate-600">"{item.quote}"</p>
                <p className="text-sm font-semibold text-bb-navy">{item.name}</p>
                <p className="text-xs text-bb-gold">{item.service}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
