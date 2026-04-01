import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { serviceWorkflows } from "@/lib/data/brand";
import { FaqList } from "@/components/shared/faq-list";
import { ProcessTimeline } from "@/components/shared/process-timeline";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ServiceType } from "@/types/domain";

interface ServiceDetailProps {
  title: string;
  overview: string;
  whoFor: string;
  checklistPreview: string[];
  faqs: { question: string; answer: string }[];
  serviceType: ServiceType;
}

export function ServiceDetailSection(props: ServiceDetailProps) {
  const { title, overview, whoFor, checklistPreview, faqs, serviceType } = props;
  return (
    <>
      <section className="section-shell">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <SectionHeading eyebrow="Service Overview" title={title} description={overview} />
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-bb-gold">Who it's for</p>
              <p className="mt-2 text-sm text-slate-600">{whoFor}</p>
            </div>
            <Button asChild>
              <Link href="/start-application">
                Get assessed <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="space-y-3 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-bb-gold">Checklist preview</p>
              <h3 className="text-xl font-semibold text-bb-navy">Your likely required documents</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {checklistPreview.map((item) => (
                  <li key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="section-shell pt-0">
        <SectionHeading eyebrow="Workflow" title="Step-by-step process timeline" />
        <div className="mt-10">
          <ProcessTimeline steps={serviceWorkflows[serviceType]} />
        </div>
      </section>
      <section className="section-shell pt-0">
        <SectionHeading eyebrow="FAQs" title="Common questions answered" />
        <div className="mt-10">
          <FaqList items={faqs} />
        </div>
      </section>
    </>
  );
}
