import { Metadata } from "next";
import { redirect } from "next/navigation";
import { FileText, Clock, ShieldCheck, AlertCircle } from "lucide-react";

import { createDocumentVersionAction, requestDocumentReviewAction } from "@/app/actions";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getDocumentLifecycleSnapshot } from "@/lib/documents/service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { divisions, getService, serviceCatalogue, type ServiceDivisionKey } from "@/lib/services/catalogue";
import { ServiceBadge } from "@/components/admin/service-badge";

export const metadata: Metadata = { title: "Documents — Admin Console" };

type DocumentRow = Awaited<
  ReturnType<typeof getDocumentLifecycleSnapshot>
>["documents"][number];

const STATUS_TONE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-100",
  EXPIRED: "bg-slate-100 text-slate-500 border-slate-200"
};

function StatusPill({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tone}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function prettyDocType(raw: string | null | undefined, caseType: string | null | undefined) {
  if (!raw) return "—";
  const svc = getService(caseType);
  const match = svc?.documentChecklist.find((d) => d.key === raw);
  if (match) return match.label;
  return raw
    .toLowerCase()
    .split(/[_-]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function DocsTable({ rows }: { rows: DocumentRow[] }) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">Nothing here yet.</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((doc) => {
          const caseRow = Array.isArray(doc.cases) ? doc.cases[0] : (doc.cases as { case_type?: string; clients?: { name?: string } | { name?: string }[] } | null);
          const caseType = caseRow?.case_type as string | undefined;
          const clients = caseRow?.clients;
          const clientName = Array.isArray(clients) ? clients[0]?.name : clients?.name;
          return (
            <TableRow key={doc.id}>
              <TableCell className="font-medium text-bb-navy">
                {prettyDocType(doc.doc_type, caseType)}
              </TableCell>
              <TableCell>
                {caseType ? (
                  <ServiceBadge short serviceType={caseType} />
                ) : (
                  <span className="text-xs text-slate-300">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {clientName ?? <span className="text-slate-300">—</span>}
              </TableCell>
              <TableCell>
                <StatusPill status={doc.status as string} />
              </TableCell>
              <TableCell className="text-sm text-slate-600">v{doc.version_no ?? 1}</TableCell>
              <TableCell>
                <Tabs defaultValue="review">
                  <TabsList>
                    <TabsTrigger value="review">Review</TabsTrigger>
                    <TabsTrigger value="version">New version</TabsTrigger>
                  </TabsList>

                  <TabsContent value="review">
                    <form
                      action={requestDocumentReviewAction}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <input type="hidden" name="document_id" value={doc.id} />
                      <Input
                        name="review_notes"
                        placeholder="Review notes"
                        className="h-8 min-w-[160px] text-xs"
                      />
                      <Input
                        name="requested_changes"
                        placeholder="Changes requested"
                        className="h-8 min-w-[140px] text-xs"
                      />
                      <Button type="submit" size="sm" className="h-8 text-xs">
                        Request review
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="version">
                    <form
                      action={createDocumentVersionAction}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <input type="hidden" name="document_id" value={doc.id} />
                      <Input
                        name="file_url"
                        placeholder="File URL"
                        required
                        className="h-8 min-w-[160px] text-xs"
                      />
                      <Input
                        name="file_name"
                        placeholder="File name"
                        className="h-8 min-w-[120px] text-xs"
                      />
                      <Input
                        name="mime_type"
                        placeholder="MIME type"
                        className="h-8 min-w-[130px] text-xs"
                      />
                      <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs">
                        Add version
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default async function AdminDocumentsPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (
    !(
      context.permissions.includes("documents.view") ||
      context.permissions.includes("documents.review") ||
      context.profile.role === "super_admin"
    )
  ) {
    redirect("/admin");
  }

  const snapshot = await getDocumentLifecycleSnapshot();

  // Classify documents by division via their linked case_type
  const getDocDivision = (doc: DocumentRow): ServiceDivisionKey | null => {
    const caseRow = Array.isArray(doc.cases) ? doc.cases[0] : (doc.cases as { case_type?: string } | null);
    const svc = getService(caseRow?.case_type);
    return svc?.division ?? null;
  };

  const byDivision: Record<ServiceDivisionKey, DocumentRow[]> = {
    IMMIGRATION: [],
    TRAVEL: [],
    CORPORATE_EVENTS: [],
    CONSULTATION: []
  };
  for (const d of snapshot.documents) {
    const div = getDocDivision(d);
    if (div) byDivision[div].push(d);
  }

  const pendingDocs = snapshot.documents.filter((d) => d.status === "PENDING");

  // Build the union of all possible document types so staff know what to chase
  const expectedDocTypes = Array.from(
    new Set(
      Object.values(serviceCatalogue).flatMap((svc) =>
        svc.documentChecklist.filter((d) => d.expiryRelevant).map((d) => d.label)
      )
    )
  );

  const kpis = [
    {
      label: "Total documents",
      value: snapshot.documents.length,
      icon: FileText,
      accent: "border-l-blue-500"
    },
    {
      label: "Awaiting review",
      value: pendingDocs.length,
      icon: Clock,
      accent: "border-l-amber-500"
    },
    {
      label: "Reviews on record",
      value: snapshot.reviews.length,
      icon: ShieldCheck,
      accent: "border-l-emerald-500"
    },
    {
      label: "Expiry alerts",
      value: snapshot.alerts.length,
      icon: AlertCircle,
      accent: "border-l-red-500"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-2xl font-bold text-bb-navy"
          style={{ fontFamily: "var(--font-sora)" }}
        >
          Documents
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Passport, visa, ticket, insurance, and placement files across all
          desks. Watch expiry thresholds carefully — embassies reject documents
          that are inside their trailing six-month validity window.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className={`border-l-4 ${accent}`}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="text-2xl font-bold text-bb-navy">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {expectedDocTypes.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Expiry-sensitive document types
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Keep an eye on validity windows for the following documents across
              your live cases.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {expectedDocTypes.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                >
                  {label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({snapshot.documents.length})</TabsTrigger>
              <TabsTrigger value="pending">Awaiting review ({pendingDocs.length})</TabsTrigger>
              <TabsTrigger value="IMMIGRATION">
                {divisions.IMMIGRATION.short} ({byDivision.IMMIGRATION.length})
              </TabsTrigger>
              <TabsTrigger value="TRAVEL">
                {divisions.TRAVEL.short} ({byDivision.TRAVEL.length})
              </TabsTrigger>
              <TabsTrigger value="CORPORATE_EVENTS">
                {divisions.CORPORATE_EVENTS.short} ({byDivision.CORPORATE_EVENTS.length})
              </TabsTrigger>
              <TabsTrigger value="CONSULTATION">
                {divisions.CONSULTATION.short} ({byDivision.CONSULTATION.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <DocsTable rows={snapshot.documents.slice(0, 50)} />
            </TabsContent>
            <TabsContent value="pending">
              <DocsTable rows={pendingDocs.slice(0, 50)} />
            </TabsContent>
            {(Object.keys(byDivision) as ServiceDivisionKey[]).map((key) => (
              <TabsContent key={key} value={key}>
                <DocsTable rows={byDivision[key].slice(0, 50)} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
