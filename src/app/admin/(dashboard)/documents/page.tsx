import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Clock, ShieldCheck, AlertCircle } from "lucide-react";

import { decideDocumentAction, uploadDocumentAction } from "@/app/actions";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getDocumentLifecycleSnapshot } from "@/lib/documents/service";
import { Card, CardContent } from "@/components/ui/card";
import { getService } from "@/lib/services/catalogue";
import { ServiceBadge } from "@/components/admin/service-badge";

export const metadata: Metadata = { title: "Documents — B.B. Admin" };

type DocumentRow = Awaited<ReturnType<typeof getDocumentLifecycleSnapshot>>["documents"][number];

function fromMaybeArray<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return (v as T) ?? null;
}

function formatDate(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GH", { dateStyle: "medium" });
}

function prettyDocType(raw: string | null | undefined, caseType: string | null | undefined) {
  if (!raw) return "—";
  const svc = getService(caseType ?? null);
  const match = svc?.documentChecklist.find((d) => d.key === raw);
  if (match) return match.label;
  return raw
    .toLowerCase()
    .split(/[_-]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-100",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    REJECTED: "bg-rose-50 text-rose-700 border-rose-100",
    EXPIRED: "bg-slate-100 text-slate-500 border-slate-200"
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
        tone[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}

function DocsRow({ doc }: { doc: DocumentRow }) {
  const caseRow = fromMaybeArray(doc.cases as unknown) as
    | { case_type?: string; clients?: { name?: string } | { name?: string }[] }
    | null;
  const client = fromMaybeArray(caseRow?.clients as unknown) as { name?: string } | null;
  const caseType = caseRow?.case_type;
  return (
    <tr className="align-top">
      <td className="px-4 py-3">
        <p className="font-semibold text-bb-navy">{prettyDocType(doc.doc_type as string, caseType)}</p>
        <p className="mt-0.5 text-[11px] text-slate-500">v{doc.version_no ?? 1} · {formatDate(doc.created_at as string)}</p>
      </td>
      <td className="px-4 py-3">
        {caseType ? <ServiceBadge short serviceType={caseType} /> : <span className="text-[11px] text-slate-300">—</span>}
      </td>
      <td className="px-4 py-3 text-[12px] text-slate-700">{client?.name ?? "—"}</td>
      <td className="px-4 py-3">
        <StatusPill status={String(doc.status)} />
        {doc.expires_at ? (
          <p className="mt-0.5 text-[10px] text-slate-500">Exp. {formatDate(doc.expires_at as string)}</p>
        ) : null}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {doc.file_url ? (
            <a
              href={doc.file_url as string}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
            >
              Open file
            </a>
          ) : null}
          {doc.status === "PENDING" ? (
            <>
              <form action={decideDocumentAction} className="inline-flex">
                <input type="hidden" name="document_id" value={doc.id as string} />
                <input type="hidden" name="decision" value="APPROVED" />
                <button
                  type="submit"
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  Approve
                </button>
              </form>
              <details className="relative">
                <summary className="cursor-pointer list-none rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 hover:bg-rose-100">
                  Reject
                </summary>
                <form
                  action={decideDocumentAction}
                  className="absolute right-0 z-10 mt-1 flex w-56 flex-col gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
                >
                  <input type="hidden" name="document_id" value={doc.id as string} />
                  <input type="hidden" name="decision" value="REJECTED" />
                  <input
                    name="notes"
                    required
                    placeholder="Reason (required)"
                    className="rounded-md border border-slate-200 px-2 py-1 text-[11px]"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-rose-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-rose-700"
                  >
                    Send rejection
                  </button>
                </form>
              </details>
            </>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

function DocsTable({ rows }: { rows: DocumentRow[] }) {
  if (rows.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">Nothing here yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
            <th className="px-4 py-2.5 text-left font-semibold">Document</th>
            <th className="px-4 py-2.5 text-left font-semibold">Service</th>
            <th className="px-4 py-2.5 text-left font-semibold">Client</th>
            <th className="px-4 py-2.5 text-left font-semibold">Status</th>
            <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/60">
          {rows.map((d) => (
            <DocsRow key={d.id as string} doc={d} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminDocumentsPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
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

  const tab = (await searchParams).tab ?? "pending";
  const snapshot = await getDocumentLifecycleSnapshot();

  const pending = snapshot.documents.filter((d) => d.status === "PENDING");
  const approved = snapshot.documents.filter((d) => d.status === "APPROVED");
  const rejected = snapshot.documents.filter((d) => d.status === "REJECTED");
  const expiring = snapshot.documents.filter((d) => {
    if (!d.expires_at) return false;
    const exp = new Date(d.expires_at as string);
    if (Number.isNaN(exp.getTime())) return false;
    const days = (exp.getTime() - Date.now()) / 86400000;
    return days <= 60 && days >= -7;
  });

  const kpis = [
    { label: "Pending", value: pending.length, icon: Clock, accent: "border-l-amber-500" },
    { label: "Approved", value: approved.length, icon: ShieldCheck, accent: "border-l-emerald-500" },
    { label: "Rejected", value: rejected.length, icon: AlertCircle, accent: "border-l-rose-500" },
    { label: "Expiring (60d)", value: expiring.length, icon: FileText, accent: "border-l-blue-500" }
  ];

  const active: DocumentRow[] =
    tab === "approved"
      ? approved
      : tab === "rejected"
        ? rejected
        : tab === "expiring"
          ? expiring
          : tab === "all"
            ? snapshot.documents
            : pending;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
          Documents
        </h1>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className={`border-l-4 ${k.accent}`}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{k.label}</p>
                  <p className="text-xl font-bold text-bb-navy">{k.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-2 text-sm font-bold text-bb-navy">Upload / add a document</h2>
          <form action={uploadDocumentAction} className="grid grid-cols-1 gap-2 md:grid-cols-5">
            <input
              name="case_id"
              required
              placeholder="Case ID"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="doc_type"
              required
              placeholder="Doc type (e.g. passport)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="file_url"
              required
              placeholder="File URL (uploaded link)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
            />
            <input
              name="expires_at"
              type="date"
              placeholder="Expires"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="file_name"
              placeholder="File name (optional)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
            />
            <input
              name="mime_type"
              placeholder="MIME (optional)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
            />
            <button
              type="submit"
              className="rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90"
            >
              Save document
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { key: "pending", label: `Pending (${pending.length})` },
          { key: "expiring", label: `Expiring (${expiring.length})` },
          { key: "approved", label: `Approved (${approved.length})` },
          { key: "rejected", label: `Rejected (${rejected.length})` },
          { key: "all", label: `All (${snapshot.documents.length})` }
        ].map((t) => (
          <Link
            key={t.key}
            href={`/admin/documents?tab=${t.key}`}
            className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? "border-bb-navy text-bb-navy" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <DocsTable rows={active.slice(0, 100)} />
        </CardContent>
      </Card>
    </div>
  );
}
