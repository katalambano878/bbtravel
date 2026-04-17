import { redirect } from "next/navigation";

import {
  createInvoiceAction,
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

export default async function AdminFinancePage() {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");
  if (!(context.permissions.includes("finance.view") || context.profile.role === "super_admin")) {
    redirect("/admin");
  }

  const snapshot = await getFinanceSnapshot();

  return (
    <section className="section-shell space-y-8">
      <div>
        <p className="eyebrow">Finance</p>
        <h1 className="text-3xl font-semibold text-bb-navy">Revenue, Expenses, AR/AP, Refund Controls</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Billed (GHS)</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.kpis.billed.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Collected (GHS)</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.kpis.paid.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Outstanding (GHS)</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.kpis.outstanding.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Expenses (GHS)</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.kpis.expenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-slate-500">Net Position (GHS)</p>
            <p className="text-2xl font-semibold text-bb-navy">{snapshot.kpis.netPosition.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-bb-navy">Create Invoice</h2>
            <form action={createInvoiceAction} className="space-y-3">
              <Input name="client_id" placeholder="Client ID (optional)" />
              <Input name="case_id" placeholder="Case ID (optional)" />
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" name="due_date" type="date" required />
              <Input name="item_description" placeholder="Line item description" required />
              <Input name="item_quantity" type="number" step="0.01" defaultValue="1" />
              <Input name="item_unit_price" type="number" step="0.01" placeholder="Unit price" required />
              <Input name="item_tax_rate" type="number" step="0.0001" placeholder="Line tax rate (optional)" />
              <Input name="tax_amount" type="number" step="0.01" placeholder="Invoice tax amount" />
              <Input name="discount_amount" type="number" step="0.01" placeholder="Discount amount" />
              <Input name="notes" placeholder="Notes (optional)" />
              <Button type="submit">Create invoice</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-bb-navy">Record Payment</h2>
            <form action={recordInvoicePaymentAction} className="space-y-3">
              <Input name="invoice_id" placeholder="Invoice ID" required />
              <Input name="amount" type="number" step="0.01" placeholder="Amount" required />
              <select name="payment_method" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="OTHER">Other</option>
              </select>
              <Input name="reference" placeholder="Reference (optional)" />
              <Input name="notes" placeholder="Notes (optional)" />
              <Button type="submit" variant="secondary">
                Record payment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-bb-navy">Expense Approval</h2>
            <form action={decideExpenseAction} className="space-y-3">
              <Input name="expense_id" placeholder="Expense ID" required />
              <select name="status" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="APPROVED">Approve</option>
                <option value="REJECTED">Reject</option>
              </select>
              <Input name="approver_notes" placeholder="Approver notes" />
              <Button type="submit">Submit decision</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-bb-navy">Process Refund</h2>
            <form action={processRefundAction} className="space-y-3">
              <Input name="invoice_id" placeholder="Invoice ID" required />
              <Input name="payment_id" placeholder="Payment ID (optional)" />
              <Input name="refund_amount" type="number" step="0.01" placeholder="Refund amount" required />
              <Input name="reason" placeholder="Reason" />
              <Button type="submit" variant="secondary">
                Process refund
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
