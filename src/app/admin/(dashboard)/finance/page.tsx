import { Metadata } from "next";
import { redirect } from "next/navigation";
import { DollarSign, CreditCard, TrendingDown, TrendingUp, PiggyBank } from "lucide-react";

import {
  decideExpenseAction,
  processRefundAction,
  recordInvoicePaymentAction
} from "@/app/actions";
import { getStaffAccessContext } from "@/lib/data/queries";
import { getFinanceSnapshot } from "@/lib/finance/service";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceComposer } from "@/components/admin/invoice-composer";
import { EXPENSE_CATEGORIES } from "@/lib/finance/expense-categories";

export const metadata: Metadata = { title: "Finance — Admin Console" };

function fmtGhs(n: number) {
  return `GHS ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AdminFinancePage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!(context.permissions.includes("finance.view") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const snapshot = await getFinanceSnapshot();
  const k = snapshot.kpis;

  const kpis = [
    { label: "Billed", value: fmtGhs(k.billed), icon: DollarSign, accent: "border-l-blue-500" },
    { label: "Collected", value: fmtGhs(k.paid), icon: CreditCard, accent: "border-l-emerald-500" },
    { label: "Outstanding", value: fmtGhs(k.outstanding), icon: TrendingUp, accent: "border-l-amber-500" },
    { label: "Expenses", value: fmtGhs(k.expenses), icon: TrendingDown, accent: "border-l-red-500" },
    { label: "Net Position", value: fmtGhs(k.netPosition), icon: PiggyBank, accent: "border-l-violet-500" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-bb-navy" style={{ fontFamily: "var(--font-sora)" }}>
          Finance
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {kpis.map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className={`border-l-4 ${accent}`}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
                <p className="text-lg font-bold text-bb-navy">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="invoice">
        <TabsList>
          <TabsTrigger value="invoice">Create Invoice</TabsTrigger>
          <TabsTrigger value="payment">Record Payment</TabsTrigger>
          <TabsTrigger value="expense">Expense Approval</TabsTrigger>
          <TabsTrigger value="refund">Refund</TabsTrigger>
        </TabsList>

        <TabsContent value="invoice">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-bb-navy">New invoice</h2>
              <InvoiceComposer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-bb-navy">Record Payment</h2>
              <form action={recordInvoicePaymentAction} className="grid gap-3 sm:grid-cols-2">
                <Input name="invoice_id" placeholder="Invoice ID" required />
                <Input name="amount" type="number" step="0.01" placeholder="Amount" required />
                <div>
                  <Label className="text-xs">Payment Method</Label>
                  <select name="payment_method" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <Input name="reference" placeholder="Reference" />
                <Input name="notes" placeholder="Notes" className="sm:col-span-2" />
                <div className="sm:col-span-2">
                  <Button type="submit" variant="secondary">Record Payment</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-bb-navy">Expense approval</h2>
              <form action={decideExpenseAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input name="expense_id" placeholder="Expense ID" required />
                <select
                  name="status"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="APPROVED">Approve</option>
                  <option value="REJECTED">Reject</option>
                </select>
                <Input name="approver_notes" placeholder="Approver notes" />
                <Button type="submit">Submit decision</Button>
              </form>

              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Expense category reference
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Use these categories when submitting expenses so finance reports stay accurate.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {(["IMMIGRATION", "TRAVEL", "CORPORATE_EVENTS", "OPERATIONS"] as const).map(
                    (division) => {
                      const list = EXPENSE_CATEGORIES.filter((c) => c.division === division);
                      if (list.length === 0) return null;
                      return (
                        <div key={division}>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            {division.replace("_", " & ")}
                          </p>
                          <ul className="mt-1 space-y-1 text-xs text-slate-600">
                            {list.map((c) => (
                              <li key={c.key}>
                                <span className="font-medium text-bb-navy">{c.label}</span>
                                {c.hint ? (
                                  <span className="text-slate-400"> — {c.hint}</span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refund">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-bb-navy">Process Refund</h2>
              <form action={processRefundAction} className="grid gap-3 sm:grid-cols-2">
                <Input name="invoice_id" placeholder="Invoice ID" required />
                <Input name="payment_id" placeholder="Payment ID (optional)" />
                <Input name="refund_amount" type="number" step="0.01" placeholder="Refund amount" required />
                <Input name="reason" placeholder="Reason" />
                <div className="sm:col-span-2">
                  <Button type="submit" variant="secondary">Process Refund</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent invoices */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-bb-navy">Recent Invoices</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshot.invoices.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-slate-400">No invoices yet.</TableCell></TableRow>
              )}
              {snapshot.invoices.slice(0, 20).map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium text-bb-navy">{inv.invoice_number}</TableCell>
                  <TableCell>
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
                      {inv.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{fmtGhs(Number(inv.total_amount))}</TableCell>
                  <TableCell className="text-xs text-slate-500">{inv.due_date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
