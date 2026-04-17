import { Metadata } from "next";
import { redirect } from "next/navigation";
import { FileText, Clock, ShieldCheck, AlertCircle } from "lucide-react";

import { createDocumentVersionAction, requestDocumentReviewAction } from "@/app/actions";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getDocumentLifecycleSnapshot } from "@/lib/documents/service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "Documents — Admin Console" };

export default async function AdminDocumentsPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!(context.permissions.includes("documents.view") || context.permissions.includes("documents.review") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const snapshot = await getDocumentLifecycleSnapshot();

  const kpis = [
    { label: "Documents", value: snapshot.documents.length, icon: FileText, accent: "border-l-blue-500" },
    { label: "Versions", value: snapshot.versions.length, icon: Clock, accent: "border-l-emerald-500" },
    { label: "Reviews", value: snapshot.reviews.length, icon: ShieldCheck, accent: "border-l-amber-500" },
    { label: "Expiry Alerts", value: snapshot.alerts.length, icon: AlertCircle, accent: "border-l-red-500" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>Document Lifecycle</h1>
        <p className="mt-1 text-sm text-slate-500">Manage versions, reviews, and expiry controls.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className={`border-l-4 ${accent}`}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-bb-navy">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-bb-navy">Review Queue</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {snapshot.documents.length} documents
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshot.documents.slice(0, 25).map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium text-bb-navy">{doc.doc_type}</TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      {doc.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">v{doc.version_no ?? 1}</TableCell>
                  <TableCell>
                    <Tabs defaultValue="review">
                      <TabsList>
                        <TabsTrigger value="review">Review</TabsTrigger>
                        <TabsTrigger value="version">New Version</TabsTrigger>
                      </TabsList>

                      <TabsContent value="review">
                        <form action={requestDocumentReviewAction} className="flex flex-wrap items-end gap-2">
                          <input type="hidden" name="document_id" value={doc.id} />
                          <Input name="review_notes" placeholder="Review notes" className="h-8 min-w-[160px] text-xs" />
                          <Input name="requested_changes" placeholder="Changes requested" className="h-8 min-w-[140px] text-xs" />
                          <Button type="submit" size="sm" className="h-8 text-xs">Request Review</Button>
                        </form>
                      </TabsContent>

                      <TabsContent value="version">
                        <form action={createDocumentVersionAction} className="flex flex-wrap items-end gap-2">
                          <input type="hidden" name="document_id" value={doc.id} />
                          <Input name="file_url" placeholder="File URL" required className="h-8 min-w-[160px] text-xs" />
                          <Input name="file_name" placeholder="File name" className="h-8 min-w-[120px] text-xs" />
                          <Input name="mime_type" placeholder="MIME type" className="h-8 min-w-[130px] text-xs" />
                          <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs">Add Version</Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
