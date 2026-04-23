import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, UserPlus, Phone, Mail } from "lucide-react";

import { getClientsList, getStaffAccessContext } from "@/lib/data/queries";
import { Card, CardContent } from "@/components/ui/card";
import { WhatsappButton } from "@/components/admin/whatsapp-button";

export const metadata: Metadata = {
  title: "Clients — B.B. Admin"
};

export default async function ClientsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");

  const params = await searchParams;
  const search = params.q ?? "";
  const clients = await getClientsList({ search, limit: 200 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
          Clients
        </h1>
        <Link
          href="/admin/pipeline?new=1"
          className="inline-flex items-center gap-1.5 rounded-lg bg-bb-navy px-3 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90"
        >
          <UserPlus className="h-3.5 w-3.5" /> New lead
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <form className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={search}
                placeholder="Search by name, email, phone or WhatsApp…"
                className="w-full rounded-lg border border-slate-200 bg-white px-9 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90"
            >
              Search
            </button>
            {search ? (
              <Link href="/admin/clients" className="text-xs font-medium text-slate-500 hover:text-slate-700">
                Clear
              </Link>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5 text-left font-semibold">Name</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Contact</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Location</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Cases</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/60">
                {clients.map((c) => {
                  const casesArr = (c.cases ?? []) as { id: string; status: string }[];
                  const activeCases = casesArr.filter((x) => x.status !== "COMPLETED").length;
                  return (
                    <tr key={c.id as string} className="align-top">
                      <td className="px-4 py-3">
                        <Link href={`/admin/clients/${c.id}`} className="font-semibold text-bb-navy hover:underline">
                          {c.name}
                        </Link>
                        {c.tags && Array.isArray(c.tags) && c.tags.length > 0 ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {(c.tags as string[]).slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0 text-[10px] font-medium text-slate-600"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[12px] text-slate-700">{c.email || "—"}</p>
                        <p className="text-[11px] text-slate-500">{c.phone || "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-600">
                        {[c.city, c.country].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-700">
                        <span className="font-semibold text-bb-navy">{activeCases}</span>
                        <span className="text-slate-400"> / {casesArr.length}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {c.phone ? (
                            <a
                              href={`tel:${c.phone}`}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                            >
                              <Phone className="h-3 w-3" /> Call
                            </a>
                          ) : null}
                          {c.email ? (
                            <a
                              href={`mailto:${c.email}`}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                            >
                              <Mail className="h-3 w-3" /> Email
                            </a>
                          ) : null}
                          <WhatsappButton
                            variant="chip"
                            phone={(c.whatsapp as string) || (c.phone as string)}
                            name={c.name as string}
                            clientId={c.id as string}
                            defaultVars={{
                              client_name: c.name,
                              staff_name: context.profile.full_name.split(" ")[0]
                            }}
                          />
                          <Link
                            href={`/admin/clients/${c.id}`}
                            className="rounded-full border border-bb-navy/30 bg-bb-navy/5 px-2 py-0.5 text-[10px] font-semibold text-bb-navy hover:bg-bb-navy/10"
                          >
                            Open 360
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">
                      No clients yet. Converted leads will appear here.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
