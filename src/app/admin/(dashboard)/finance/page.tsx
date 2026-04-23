import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  DollarSign,
  CreditCard,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Wallet,
  Plus,
  ArrowLeftRight
} from "lucide-react";

import {
  decideExpenseAction,
  processRefundAction,
  recordInvoicePaymentAction,
  submitExpenseAction,
  createPettyCashBoxAction,
  recordPettyCashMovementAction,
  transferBetweenBoxesAction,
  upsertVendorAction,
  createVendorBillAction
} from "@/app/actions";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getFinanceSnapshot } from "@/lib/finance/service";
import { getPettyCashSnapshot, PETTY_CASH_BOX_TYPES } from "@/lib/finance/petty-cash";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceComposer } from "@/components/admin/invoice-composer";
import { EXPENSE_CATEGORIES } from "@/lib/finance/expense-categories";

export const metadata: Metadata = { title: "Finance — B.B. Admin" };

const PAYMENT_METHODS: { value: string; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "MOMO_MTN", label: "MoMo — MTN" },
  { value: "MOMO_VODAFONE", label: "MoMo — Vodafone" },
  { value: "MOMO_AIRTELTIGO", label: "MoMo — AirtelTigo" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "POS", label: "POS / Card terminal" },
  { value: "CARD", label: "Card online" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "OTHER", label: "Other" }
];

type TabKey =
  | "overview"
  | "invoices"
  | "payments"
  | "expenses"
  | "petty_cash"
  | "vendors"
  | "refunds"
  | "bi";

function fmtGhs(n: number | null | undefined) {
  return `GH₵${Number(n ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GH", { dateStyle: "medium" });
}

export default async function AdminFinancePage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!(context.permissions.includes("finance.view") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const tab = ((await searchParams).tab as TabKey) ?? "overview";
  const snapshot = await getFinanceSnapshot();
  const petty = await getPettyCashSnapshot();

  const admin = createAdminClient();
  const vendorsRes = await admin
    .from("vendors")
    .select("id, vendor_name, contact_name, phone, email, payment_terms")
    .order("vendor_name");
  const vendors = vendorsRes.data ?? [];

  const k = snapshot.kpis;
  const onHand = petty.kpis.totalOnHand;

  const kpis = [
    { label: "Billed", value: fmtGhs(k.billed), icon: DollarSign, accent: "border-l-blue-500" },
    { label: "Collected", value: fmtGhs(k.paid), icon: CreditCard, accent: "border-l-emerald-500" },
    { label: "Outstanding", value: fmtGhs(k.outstanding), icon: TrendingUp, accent: "border-l-amber-500" },
    { label: "Expenses", value: fmtGhs(k.expenses), icon: TrendingDown, accent: "border-l-rose-500" },
    { label: "Net", value: fmtGhs(k.netPosition), icon: PiggyBank, accent: "border-l-violet-500" },
    { label: "Cash on hand", value: fmtGhs(onHand), icon: Wallet, accent: "border-l-teal-500" }
  ];

  const TABS: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "invoices", label: "Invoices" },
    { key: "payments", label: "Payments" },
    { key: "expenses", label: "Expenses" },
    { key: "petty_cash", label: "Cash & MoMo" },
    { key: "vendors", label: "Vendors" },
    { key: "refunds", label: "Refunds" },
    { key: "bi", label: "Reports" }
  ];

  const caseIds = Array.from(
    new Set(
      snapshot.invoices
        .map((i) => i.case_id)
        .filter((v): v is string => typeof v === "string" && v.length > 0)
    )
  );
  const caseTypeById = new Map<string, string>();
  if (caseIds.length > 0) {
    const { data } = await admin.from("cases").select("id, case_type").in("id", caseIds);
    for (const row of data ?? []) {
      caseTypeById.set(row.id as string, String(row.case_type));
    }
  }
  const biByService = new Map<string, { billed: number; paid: number }>();
  for (const inv of snapshot.invoices) {
    const key = (inv.case_id && caseTypeById.get(inv.case_id as string)) || "UNASSIGNED";
    const prev = biByService.get(key) ?? { billed: 0, paid: 0 };
    prev.billed += Number(inv.total_amount ?? 0);
    prev.paid += Number(inv.amount_paid ?? 0);
    biByService.set(key, prev);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
          Finance
        </h1>
      </div>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className={`border-l-4 ${accent}`}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="text-base font-bold text-bb-navy">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/finance?tab=${t.key}`}
            className={`border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? "border-bb-navy text-bb-navy" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-navy">Recent invoices</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wide text-slate-500">
                      <th className="pb-2">#</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Total</th>
                      <th className="pb-2 text-right">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/60">
                    {snapshot.invoices.slice(0, 10).map((inv) => (
                      <tr key={inv.id as string}>
                        <td className="py-2 font-semibold text-bb-navy">{inv.invoice_number}</td>
                        <td className="py-2 text-slate-600">{inv.status}</td>
                        <td className="py-2 text-right text-bb-navy">{fmtGhs(inv.total_amount as number)}</td>
                        <td className="py-2 text-right text-slate-500">{formatDate(inv.due_date as string)}</td>
                      </tr>
                    ))}
                    {snapshot.invoices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          No invoices yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-navy">Cash &amp; MoMo balances</h2>
              {petty.boxes.length === 0 ? (
                <p className="py-4 text-center text-[12px] text-slate-400">
                  No petty cash / MoMo floats set up yet.{" "}
                  <Link href="/admin/finance?tab=petty_cash" className="font-semibold text-bb-navy hover:underline">
                    Add one
                  </Link>
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {petty.boxes.map((b) => (
                    <li key={b.id as string} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-[12px] font-semibold text-bb-navy">{b.box_name}</p>
                        <p className="text-[11px] text-slate-500">{String(b.box_type).replace(/_/g, " ")}</p>
                      </div>
                      <p className={`text-[13px] font-bold ${Number(b.current_balance) >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {fmtGhs(b.current_balance as number)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-navy">Pending expenses</h2>
              {snapshot.expenses.filter((e) => e.status === "PENDING").length === 0 ? (
                <p className="py-4 text-center text-[12px] text-slate-400">No expenses awaiting approval.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {snapshot.expenses
                    .filter((e) => e.status === "PENDING")
                    .slice(0, 6)
                    .map((e) => (
                      <li key={e.id as string} className="flex items-center justify-between gap-2 py-2">
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-bb-navy">{e.category}</p>
                          <p className="truncate text-[11px] text-slate-500">{e.description || "—"}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[12px] font-bold text-bb-navy">{fmtGhs(e.amount as number)}</p>
                          <form action={decideExpenseAction} className="inline-flex">
                            <input type="hidden" name="expense_id" value={e.id as string} />
                            <input type="hidden" name="status" value="APPROVED" />
                            <button
                              type="submit"
                              className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              Approve
                            </button>
                          </form>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-navy">Recent cash movements</h2>
              {petty.movements.length === 0 ? (
                <p className="py-4 text-center text-[12px] text-slate-400">No movements yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {petty.movements.slice(0, 8).map((m) => (
                    <li key={m.id as string} className="flex items-center justify-between gap-2 py-2">
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-bb-navy">
                          {String(m.movement_type).replace(/_/g, " ")}
                          <span className="ml-2 font-normal text-slate-500">{m.description}</span>
                        </p>
                        <p className="text-[11px] text-slate-500">{formatDate(m.occurred_at as string)}</p>
                      </div>
                      <p
                        className={`text-[12px] font-bold ${
                          ["IN", "TRANSFER_IN", "TOPUP"].includes(String(m.movement_type))
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }`}
                      >
                        {fmtGhs(m.amount as number)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* INVOICES */}
      {tab === "invoices" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-navy">Raise invoice</h2>
              <InvoiceComposer />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-2.5 text-left font-semibold">Invoice</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Paid</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/60">
                    {snapshot.invoices.slice(0, 60).map((inv) => (
                      <tr key={inv.id as string}>
                        <td className="px-4 py-3 font-semibold text-bb-navy">{inv.invoice_number}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-600">{inv.status}</td>
                        <td className="px-4 py-3 text-right text-bb-navy">{fmtGhs(inv.total_amount as number)}</td>
                        <td className="px-4 py-3 text-right text-emerald-700">{fmtGhs(inv.amount_paid as number)}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-slate-500">
                          {formatDate(inv.due_date as string)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PAYMENTS */}
      {tab === "payments" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-navy">Record payment</h2>
              <form
                action={recordInvoicePaymentAction}
                className="grid grid-cols-1 gap-3 md:grid-cols-3"
              >
                <input
                  name="invoice_id"
                  required
                  placeholder="Invoice ID (copy from invoices tab)"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
                />
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Amount (GHS)"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <select
                  name="payment_method"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  defaultValue="MOMO_MTN"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <input
                  name="reference"
                  placeholder="MoMo transaction ID / cheque # / reference"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
                />
                <select
                  name="deposit_to_box_id"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  defaultValue=""
                >
                  <option value="">Deposit to… (optional float)</option>
                  {petty.boxes.map((b) => (
                    <option key={b.id as string} value={b.id as string}>
                      {b.box_name}
                    </option>
                  ))}
                </select>
                <input
                  name="notes"
                  placeholder="Notes"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90"
                >
                  Record payment
                </button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-2.5 text-left font-semibold">Date</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Method</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Reference</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/60">
                    {snapshot.payments.slice(0, 50).map((p) => (
                      <tr key={p.id as string}>
                        <td className="px-4 py-3 text-[12px] text-slate-500">
                          {formatDate(p.created_at as string)}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-700">
                          {String(p.payment_method).replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-600">{p.reference || "—"}</td>
                        <td className="px-4 py-3 text-right font-semibold text-bb-navy">
                          {fmtGhs(p.amount as number)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* EXPENSES */}
      {tab === "expenses" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-navy">Log an expense</h2>
              <form action={submitExpenseAction} className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <select
                  name="category_key"
                  required
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
                >
                  <option value="">Select category…</option>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Amount (GHS)"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  name="description"
                  placeholder="Description"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
                />
                <input
                  name="expense_date"
                  type="date"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <select
                  name="payment_method"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  defaultValue=""
                >
                  <option value="">Payment method…</option>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  name="paid_from_box_id"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  defaultValue=""
                >
                  <option value="">Paid from… (optional float)</option>
                  {petty.boxes.map((b) => (
                    <option key={b.id as string} value={b.id as string}>
                      {b.box_name}
                    </option>
                  ))}
                </select>
                <select
                  name="vendor_id"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  defaultValue=""
                >
                  <option value="">Vendor (optional)…</option>
                  {vendors.map((v) => (
                    <option key={v.id as string} value={v.id as string}>
                      {v.vendor_name}
                    </option>
                  ))}
                </select>
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90"
                  >
                    Submit expense
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-2.5 text-left font-semibold">Date</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Category</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Description</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Method</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Status</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/60">
                    {snapshot.expenses.slice(0, 60).map((e) => (
                      <tr key={e.id as string}>
                        <td className="px-4 py-3 text-[12px] text-slate-500">{formatDate(e.expense_date as string)}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-700">{e.category}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-600">{e.description || "—"}</td>
                        <td className="px-4 py-3 text-[11px] text-slate-500">
                          {e.payment_method ? String(e.payment_method).replace(/_/g, " ") : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-bb-navy">{fmtGhs(e.amount as number)}</td>
                        <td className="px-4 py-3 text-right text-[11px] text-slate-600">{e.status}</td>
                        <td className="px-4 py-3 text-right">
                          {e.status === "PENDING" ? (
                            <div className="inline-flex items-center gap-1">
                              <form action={decideExpenseAction} className="inline-flex">
                                <input type="hidden" name="expense_id" value={e.id as string} />
                                <input type="hidden" name="status" value="APPROVED" />
                                <button
                                  type="submit"
                                  className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100"
                                >
                                  Approve
                                </button>
                              </form>
                              <form action={decideExpenseAction} className="inline-flex">
                                <input type="hidden" name="expense_id" value={e.id as string} />
                                <input type="hidden" name="status" value="REJECTED" />
                                <button
                                  type="submit"
                                  className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 hover:bg-rose-100"
                                >
                                  Reject
                                </button>
                              </form>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PETTY CASH */}
      {tab === "petty_cash" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {petty.boxes.map((b) => (
              <Card key={b.id as string}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-bb-navy">{b.box_name}</p>
                      <p className="text-[11px] text-slate-500">{String(b.box_type).replace(/_/g, " ")}</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0 text-[10px] text-slate-600">
                      {b.currency}
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-2xl font-bold ${
                      Number(b.current_balance) >= 0 ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {fmtGhs(b.current_balance as number)}
                  </p>
                  <form action={recordPettyCashMovementAction} className="mt-3 grid grid-cols-2 gap-2">
                    <input type="hidden" name="box_id" value={b.id as string} />
                    <select
                      name="movement_type"
                      className="col-span-2 rounded-md border border-slate-200 px-2 py-1 text-[11px]"
                    >
                      <option value="IN">Money IN</option>
                      <option value="OUT">Money OUT</option>
                      <option value="TOPUP">Top-up</option>
                      <option value="ADJUSTMENT">Adjustment</option>
                    </select>
                    <input
                      name="amount"
                      type="number"
                      step="0.01"
                      required
                      placeholder="Amount"
                      className="rounded-md border border-slate-200 px-2 py-1 text-[11px]"
                    />
                    <input
                      name="reference"
                      placeholder="Reference"
                      className="rounded-md border border-slate-200 px-2 py-1 text-[11px]"
                    />
                    <input
                      name="description"
                      required
                      placeholder="What is this for?"
                      className="col-span-2 rounded-md border border-slate-200 px-2 py-1 text-[11px]"
                    />
                    <button
                      type="submit"
                      className="col-span-2 rounded-md bg-bb-navy px-2 py-1 text-[11px] font-semibold text-white hover:bg-bb-navy/90"
                    >
                      Record
                    </button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-bb-navy">
                  <Plus className="h-4 w-4" /> Add a box / float
                </h2>
                <form action={createPettyCashBoxAction} className="grid grid-cols-2 gap-2">
                  <input
                    name="name"
                    required
                    placeholder="Box name"
                    className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <select
                    name="type"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    defaultValue="CASH"
                  >
                    {PETTY_CASH_BOX_TYPES.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <input
                    name="opening"
                    type="number"
                    step="0.01"
                    defaultValue="0"
                    placeholder="Opening balance"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    name="notes"
                    placeholder="Notes"
                    className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="col-span-2 rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90"
                  >
                    Create box
                  </button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-bb-navy">
                  <ArrowLeftRight className="h-4 w-4" /> Transfer between floats
                </h2>
                <form action={transferBetweenBoxesAction} className="grid grid-cols-2 gap-2">
                  <select
                    name="from_box_id"
                    required
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="">From…</option>
                    {petty.boxes.map((b) => (
                      <option key={b.id as string} value={b.id as string}>
                        {b.box_name}
                      </option>
                    ))}
                  </select>
                  <select
                    name="to_box_id"
                    required
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="">To…</option>
                    {petty.boxes.map((b) => (
                      <option key={b.id as string} value={b.id as string}>
                        {b.box_name}
                      </option>
                    ))}
                  </select>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    placeholder="Amount"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    name="reference"
                    placeholder="Reference"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    name="description"
                    required
                    placeholder="Reason for transfer"
                    className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="col-span-2 rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90"
                  >
                    Transfer
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-navy">Movement history</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="pb-2 text-left font-semibold">When</th>
                      <th className="pb-2 text-left font-semibold">Type</th>
                      <th className="pb-2 text-left font-semibold">Description</th>
                      <th className="pb-2 text-left font-semibold">Reference</th>
                      <th className="pb-2 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/60">
                    {petty.movements.slice(0, 40).map((m) => (
                      <tr key={m.id as string}>
                        <td className="py-2 text-[12px] text-slate-500">{formatDate(m.occurred_at as string)}</td>
                        <td className="py-2 text-[12px] text-slate-700">
                          {String(m.movement_type).replace(/_/g, " ")}
                        </td>
                        <td className="py-2 text-[12px] text-slate-600">{m.description || "—"}</td>
                        <td className="py-2 text-[11px] text-slate-500">{m.reference || "—"}</td>
                        <td
                          className={`py-2 text-right font-semibold ${
                            ["IN", "TRANSFER_IN", "TOPUP"].includes(String(m.movement_type))
                              ? "text-emerald-700"
                              : "text-rose-700"
                          }`}
                        >
                          {fmtGhs(m.amount as number)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VENDORS */}
      {tab === "vendors" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-navy">Add / update vendor</h2>
              <form action={upsertVendorAction} className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  name="vendor_name"
                  required
                  placeholder="Vendor name"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
                />
                <input
                  name="contact_name"
                  placeholder="Contact person"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  name="phone"
                  placeholder="Phone"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  name="email"
                  placeholder="Email"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  name="payment_terms"
                  placeholder="Payment terms (e.g. Net 30)"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90 md:col-span-3"
                >
                  Save vendor
                </button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-navy">Vendor bill</h2>
              <form action={createVendorBillAction} className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <select
                  name="vendor_id"
                  required
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
                >
                  <option value="">Select vendor…</option>
                  {vendors.map((v) => (
                    <option key={v.id as string} value={v.id as string}>
                      {v.vendor_name}
                    </option>
                  ))}
                </select>
                <input
                  name="bill_number"
                  required
                  placeholder="Bill / invoice #"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  name="bill_date"
                  required
                  type="date"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  name="due_date"
                  required
                  type="date"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  name="amount"
                  required
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  name="notes"
                  placeholder="Notes"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90 md:col-span-3"
                >
                  Save bill
                </button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-2.5 text-left font-semibold">Vendor</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Contact</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Phone</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Terms</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/60">
                    {vendors.map((v) => (
                      <tr key={v.id as string}>
                        <td className="px-4 py-3 font-semibold text-bb-navy">{v.vendor_name}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-600">{v.contact_name || "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-600">{v.phone || "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-600">{v.payment_terms || "—"}</td>
                      </tr>
                    ))}
                    {vendors.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-[12px] text-slate-400">
                          No vendors yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* REFUNDS */}
      {tab === "refunds" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-navy">Process refund</h2>
              <form action={processRefundAction} className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  name="invoice_id"
                  required
                  placeholder="Invoice ID"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
                />
                <input
                  name="refund_amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Amount"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  name="payment_id"
                  placeholder="Payment ID (optional)"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
                />
                <input
                  name="reason"
                  placeholder="Reason"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-bb-navy px-4 py-2 text-xs font-semibold text-white hover:bg-bb-navy/90 md:col-span-3"
                >
                  Process refund
                </button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-2.5 text-left font-semibold">Date</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Reason</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/60">
                    {snapshot.refunds.slice(0, 30).map((r) => (
                      <tr key={r.id as string}>
                        <td className="px-4 py-3 text-[12px] text-slate-500">{formatDate(r.created_at as string)}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-600">{r.reason || "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-700">{r.status}</td>
                        <td className="px-4 py-3 text-right font-semibold text-bb-navy">
                          {fmtGhs(r.refund_amount as number)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* BI */}
      {tab === "bi" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-sm font-bold text-bb-navy">Revenue by service</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="pb-2 text-left font-semibold">Service</th>
                      <th className="pb-2 text-right font-semibold">Billed</th>
                      <th className="pb-2 text-right font-semibold">Collected</th>
                      <th className="pb-2 text-right font-semibold">Outstanding</th>
                      <th className="pb-2 text-right font-semibold">Collection %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 [&_tr]:transition-colors [&_tr:hover]:bg-slate-50/60">
                    {Array.from(biByService.entries())
                      .sort((a, b) => b[1].billed - a[1].billed)
                      .map(([key, v]) => {
                        const outstanding = Math.max(v.billed - v.paid, 0);
                        const pct = v.billed > 0 ? (v.paid / v.billed) * 100 : 0;
                        return (
                          <tr key={key}>
                            <td className="py-2 text-[12px] font-semibold text-bb-navy">
                              {String(key).replace(/_/g, " ")}
                            </td>
                            <td className="py-2 text-right">{fmtGhs(v.billed)}</td>
                            <td className="py-2 text-right text-emerald-700">{fmtGhs(v.paid)}</td>
                            <td className="py-2 text-right text-amber-700">{fmtGhs(outstanding)}</td>
                            <td className="py-2 text-right text-[12px] text-slate-600">{pct.toFixed(0)}%</td>
                          </tr>
                        );
                      })}
                    {biByService.size === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-[12px] text-slate-400">
                          No billing data yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 text-sm font-bold text-bb-navy">Expenses by category</h2>
                {(() => {
                  const byCat = new Map<string, number>();
                  for (const e of snapshot.expenses) {
                    byCat.set(e.category as string, (byCat.get(e.category as string) ?? 0) + Number(e.amount ?? 0));
                  }
                  const rows = Array.from(byCat.entries()).sort((a, b) => b[1] - a[1]);
                  if (rows.length === 0) {
                    return <p className="py-4 text-center text-[12px] text-slate-400">No expenses logged yet.</p>;
                  }
                  const max = rows[0]?.[1] ?? 0;
                  return (
                    <ul className="space-y-2">
                      {rows.slice(0, 10).map(([cat, amt]) => (
                        <li key={cat}>
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="text-slate-700">{cat}</span>
                            <span className="font-semibold text-bb-navy">{fmtGhs(amt)}</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                            <div
                              className="h-1.5 rounded-full bg-bb-navy"
                              style={{ width: `${(amt / max) * 100}%` }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 text-sm font-bold text-bb-navy">Payments by method (last 60d)</h2>
                {(() => {
                  const byMethod = new Map<string, number>();
                  const cutoff = Date.now() - 60 * 86400 * 1000;
                  for (const p of snapshot.payments) {
                    const d = new Date(p.created_at as string);
                    if (Number.isNaN(d.getTime()) || d.getTime() < cutoff) continue;
                    const key = String(p.payment_method).replace(/_/g, " ");
                    byMethod.set(key, (byMethod.get(key) ?? 0) + Number(p.amount ?? 0));
                  }
                  const rows = Array.from(byMethod.entries()).sort((a, b) => b[1] - a[1]);
                  if (rows.length === 0) {
                    return <p className="py-4 text-center text-[12px] text-slate-400">No recent payments.</p>;
                  }
                  const max = rows[0]?.[1] ?? 0;
                  return (
                    <ul className="space-y-2">
                      {rows.map(([m, amt]) => (
                        <li key={m}>
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="text-slate-700">{m}</span>
                            <span className="font-semibold text-emerald-700">{fmtGhs(amt)}</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                            <div
                              className="h-1.5 rounded-full bg-emerald-500"
                              style={{ width: `${(amt / max) * 100}%` }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
}
