import { redirect } from "next/navigation";

import { createDocumentVersionAction, requestDocumentReviewAction } from "@/app/actions";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getDocumentLifecycleSnapshot } from "@/lib/documents/service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AdminDocumentsPage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/portal/login");
  if (!(context.permissions.includes("documents.view") || context.permissions.includes("documents.review") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const snapshot = await getDocumentLifecycleSnapshot();

  return (
    <section className="section-shell space-y-8">
      <div>
        <p className="eyebrow">Document Lifecycle</p>
        <h1 className="text-3xl font-semibold text-bb-navy">Versions, Reviews, and Expiry Controls</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Documents</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.documents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Versions</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.versions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Reviews</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.reviews.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Expiry Alerts</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.alerts.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-xl font-semibold text-bb-navy">Review Queue</h2>
          <div className="space-y-4">
            {snapshot.documents.slice(0, 20).map((doc) => (
              <div key={doc.id} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-bb-navy">
                  {doc.doc_type} • {doc.status}
                </p>
                <p className="text-xs text-slate-600">Version: {doc.version_no ?? 1}</p>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <form action={requestDocumentReviewAction} className="space-y-2 rounded-lg bg-slate-50 p-3">
                    <input type="hidden" name="document_id" value={doc.id} />
                    <Input name="review_notes" placeholder="Review notes" />
                    <Input name="requested_changes" placeholder="Requested changes (optional)" />
                    <Button type="submit" size="sm">
                      Request review
                    </Button>
                  </form>
                  <form action={createDocumentVersionAction} className="space-y-2 rounded-lg bg-slate-50 p-3">
                    <input type="hidden" name="document_id" value={doc.id} />
                    <Input name="file_url" placeholder="New file URL" required />
                    <Input name="file_name" placeholder="File name" />
                    <Input name="mime_type" placeholder="MIME type (e.g. application/pdf)" />
                    <Button type="submit" size="sm" variant="secondary">
                      Add version
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
