import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/events";
import { publishEvent } from "@/lib/events/bus";

function makeInvoiceNumber() {
  const now = new Date();
  return `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.floor(Math.random() * 90000 + 10000)}`;
}

export async function createInvoice(input: {
  clientId?: string;
  caseId?: string;
  dueDate: string;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; taxRate?: number }>;
}) {
  const context = await requirePermission("finance.invoice.create");
  const admin = createAdminClient();
  const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = input.taxAmount ?? 0;
  const discountAmount = input.discountAmount ?? 0;
  const totalAmount = subtotal + taxAmount - discountAmount;

  const { data: invoice, error } = await admin
    .from("invoices")
    .insert({
      invoice_number: makeInvoiceNumber(),
      client_id: input.clientId ?? null,
      case_id: input.caseId ?? null,
      due_date: input.dueDate,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      notes: input.notes ?? null,
      status: "DRAFT",
      created_by: context.user.id
    })
    .select("*")
    .single();
  if (error) throw error;

  await admin.from("invoice_items").insert(
    input.items.map((item) => ({
      invoice_id: invoice.id,
      line_description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      tax_rate: item.taxRate ?? 0,
      line_total: item.quantity * item.unitPrice
    }))
  );

  await writeAuditEvent({
    actorId: context.user.id,
    action: "INVOICE_CREATED",
    targetType: "invoice",
    targetId: invoice.id,
    payload: {
      total_amount: totalAmount
    }
  });

  await publishEvent({
    eventKey: "invoice.created",
    eventType: "FINANCE",
    aggregateType: "invoice",
    aggregateId: invoice.id,
    payload: {
      total_amount: totalAmount
    },
    createdBy: context.user.id
  });
}

export async function recordInvoicePayment(input: {
  invoiceId: string;
  amount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "MOBILE_MONEY" | "CARD" | "OTHER";
  reference?: string;
  notes?: string;
}) {
  const context = await requirePermission("finance.payment.record");
  const admin = createAdminClient();
  const { data: invoice } = await admin.from("invoices").select("id, total_amount, amount_paid").eq("id", input.invoiceId).single();
  if (!invoice) throw new Error("Invoice not found.");
  const currentPaid = Number(invoice.amount_paid ?? 0);
  const total = Number(invoice.total_amount ?? 0);
  if (currentPaid + input.amount > total) {
    throw new Error("Payment exceeds invoice total.");
  }

  const { data: payment, error } = await admin
    .from("payments")
    .insert({
      invoice_id: input.invoiceId,
      amount: input.amount,
      payment_method: input.paymentMethod,
      reference: input.reference ?? null,
      notes: input.notes ?? null,
      recorded_by: context.user.id
    })
    .select("*")
    .single();
  if (error) throw error;

  await writeAuditEvent({
    actorId: context.user.id,
    action: "PAYMENT_RECORDED",
    targetType: "invoice",
    targetId: input.invoiceId,
    payload: {
      payment_id: payment.id,
      amount: input.amount
    }
  });
}

export async function decideExpense(input: { expenseId: string; status: "APPROVED" | "REJECTED"; approverNotes?: string }) {
  const context = await requirePermission("finance.expense.approve");
  const admin = createAdminClient();
  await admin
    .from("expenses")
    .update({
      status: input.status,
      approved_by: context.user.id,
      approved_at: new Date().toISOString(),
      description: input.approverNotes ?? null
    })
    .eq("id", input.expenseId);

  await writeAuditEvent({
    actorId: context.user.id,
    action: "EXPENSE_DECIDED",
    targetType: "expense",
    targetId: input.expenseId,
    payload: { status: input.status }
  });
}

export async function processRefund(input: { invoiceId: string; paymentId?: string; refundAmount: number; reason?: string }) {
  const context = await requirePermission("finance.refund.process");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("refunds")
    .insert({
      invoice_id: input.invoiceId,
      payment_id: input.paymentId ?? null,
      refund_amount: input.refundAmount,
      reason: input.reason ?? null,
      status: "APPROVED",
      approved_by: context.user.id
    })
    .select("*")
    .single();
  if (error) throw error;

  await writeAuditEvent({
    actorId: context.user.id,
    action: "REFUND_CREATED",
    targetType: "refund",
    targetId: data.id,
    payload: { invoice_id: input.invoiceId, refund_amount: input.refundAmount }
  });
}

export async function getFinanceSnapshot() {
  await requirePermission("finance.view");
  const admin = createAdminClient();
  const [invoices, payments, expenses, vendorBills, refunds, coa, periods] = await Promise.all([
    admin.from("invoices").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("payments").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("expenses").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("vendor_bills").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("refunds").select("*").order("created_at", { ascending: false }).limit(200),
    admin.from("chart_of_accounts").select("*").order("account_code"),
    admin.from("financial_periods").select("*").order("period_start", { ascending: false }).limit(24)
  ]);

  const invoiceRows = invoices.data ?? [];
  const expenseRows = expenses.data ?? [];
  const paid = invoiceRows.reduce((sum, row) => sum + Number(row.amount_paid ?? 0), 0);
  const billed = invoiceRows.reduce((sum, row) => sum + Number(row.total_amount ?? 0), 0);
  const expenseTotal = expenseRows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  return {
    kpis: {
      billed,
      paid,
      outstanding: Math.max(billed - paid, 0),
      expenses: expenseTotal,
      netPosition: paid - expenseTotal
    },
    invoices: invoiceRows,
    payments: payments.data ?? [],
    expenses: expenseRows,
    vendorBills: vendorBills.data ?? [],
    refunds: refunds.data ?? [],
    chartOfAccounts: coa.data ?? [],
    periods: periods.data ?? []
  };
}
