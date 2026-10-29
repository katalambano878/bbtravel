import { Metadata } from "next";
import { redirect } from "next/navigation";
import { FileCheck2, CalendarClock, MessageSquare } from "lucide-react";

import { signOutAction } from "@/app/actions";
import {
  getCaseAppointments,
  getCaseDocuments,
  getCaseSteps,
  getClientCases,
  getCurrentUser,
  getPortalMessages
} from "@/lib/data/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RealtimeCaseFeed } from "@/components/portal/realtime-case-feed";
import { DocumentUploadForm } from "@/components/portal/document-upload-form";

export const metadata: Metadata = {
  title: "Client Portal",
  robots: {
    index: false,
    follow: false
  }
};

export default async function PortalDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/portal/login");
  }

  const cases = await getClientCases();
  const activeCase = cases[0];
  const documents = activeCase ? await getCaseDocuments(activeCase.id) : [];
  const steps = activeCase ? await getCaseSteps(activeCase.id) : [];
  const messages = activeCase ? await getPortalMessages(activeCase.id) : [];
  const appointments = activeCase ? await getCaseAppointments(activeCase.id) : [];

  return (
    <section className="section-shell">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Client Portal</p>
          <h1 className="text-3xl font-semibold text-bb-navy">Welcome back, {user.user_metadata.full_name ?? "Client"}</h1>
        </div>
        <form action={signOutAction}>
          <Button variant="secondary">Sign out</Button>
        </form>
      </div>

      {!activeCase ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">
            No active case yet. Start your onboarding to create your first case.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="space-y-2 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-bb-gold">Case Type</p>
                <p className="text-lg font-semibold text-bb-navy">{activeCase.case_type}</p>
                <p className="text-xs text-slate-500">Status: {activeCase.status}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-bb-gold">Readiness</p>
                <p className="text-lg font-semibold text-bb-navy">
                  {(activeCase.meta as { readiness_score?: number })?.readiness_score ?? 0}%
                </p>
                <p className="text-xs text-slate-500">Checklist completeness indicator</p>
              </CardContent>
            </Card>
            <RealtimeCaseFeed caseId={activeCase.id} />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardContent className="space-y-4 p-6">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-bb-navy">
                  <FileCheck2 className="h-5 w-5 text-bb-gold" /> Case timeline
                </h2>
                <ul className="space-y-2 text-sm text-slate-600">
                  {steps.length === 0 ? (
                    <li>No timeline steps yet.</li>
                  ) : (
                    steps.map((step) => (
                      <li key={step.id} className="rounded-lg bg-slate-50 px-3 py-2">
                        {step.title} - {step.status}
                      </li>
                    ))
                  )}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-4 p-6">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-bb-navy">
                  <FileCheck2 className="h-5 w-5 text-bb-gold" /> Document checklist
                </h2>
                <ul className="space-y-2 text-sm text-slate-600">
                  {documents.length === 0 ? (
                    <li>No documents uploaded yet.</li>
                  ) : (
                    documents.map((doc) => (
                      <li key={doc.id} className="rounded-lg bg-slate-50 px-3 py-2">
                        {doc.doc_type} - {doc.status}
                      </li>
                    ))
                  )}
                </ul>
                <DocumentUploadForm caseId={activeCase.id} />
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-bb-navy">Templates Library</p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600">
                    <li>Invitation letter checklist guidance</li>
                    <li>DS-160 checklist guidance</li>
                    <li>UK form checklist guidance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-4 p-6">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-bb-navy">
                  <MessageSquare className="h-5 w-5 text-bb-gold" /> Messages
                </h2>
                <ul className="space-y-2 text-sm text-slate-600">
                  {messages.length === 0 ? (
                    <li>No messages yet.</li>
                  ) : (
                    messages.map((message) => (
                      <li key={message.id} className="rounded-lg bg-slate-50 px-3 py-2">
                        {message.message}
                      </li>
                    ))
                  )}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-4 p-6">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-bb-navy">
                  <CalendarClock className="h-5 w-5 text-bb-gold" /> Appointments & payment
                </h2>
                <ul className="space-y-2 text-sm text-slate-600">
                  {appointments.length === 0 ? (
                    <li>No appointments scheduled yet.</li>
                  ) : (
                    appointments.map((appointment) => (
                      <li key={appointment.id} className="rounded-lg bg-slate-50 px-3 py-2">
                        {new Date(appointment.scheduled_at).toLocaleString()} • {appointment.location ?? "Virtual"}
                      </li>
                    ))
                  )}
                </ul>
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">Invoice tracking placeholder active.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}
