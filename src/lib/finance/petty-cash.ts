import { createAdminClient } from "@/lib/db/admin";
import { requirePermission } from "@/lib/auth/policy";
import { writeAuditEvent } from "@/lib/audit/events";

export type PettyCashBoxType =
  | "CASH"
  | "MOMO_MTN"
  | "MOMO_VODAFONE"
  | "MOMO_AIRTELTIGO"
  | "BANK"
  | "OTHER";

export type PettyCashMovementType =
  | "IN"
  | "OUT"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "TOPUP"
  | "ADJUSTMENT";

export const PETTY_CASH_BOX_TYPES: { key: PettyCashBoxType; label: string; hint: string }[] = [
  { key: "CASH", label: "Cash box", hint: "Physical GHS cash at the office" },
  { key: "MOMO_MTN", label: "MoMo — MTN", hint: "MTN Mobile Money float" },
  { key: "MOMO_VODAFONE", label: "MoMo — Vodafone Cash", hint: "Vodafone Cash float" },
  { key: "MOMO_AIRTELTIGO", label: "MoMo — AirtelTigo", hint: "AirtelTigo Money float" },
  { key: "BANK", label: "Bank account", hint: "Cleared bank balance for reconciliation" },
  { key: "OTHER", label: "Other", hint: "Any other holding account" }
];

export async function getPettyCashSnapshot() {
  await requirePermission("finance.view");
  const admin = createAdminClient();
  const [boxes, movements] = await Promise.all([
    admin.from("petty_cash_boxes").select("*").order("box_name"),
    admin
      .from("petty_cash_movements")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(100)
  ]);
  const boxRows = boxes.data ?? [];
  const moveRows = movements.data ?? [];
  const totalOnHand = boxRows
    .filter((b) => b.is_active)
    .reduce((sum, b) => sum + Number(b.current_balance ?? 0), 0);
  return {
    boxes: boxRows,
    movements: moveRows,
    kpis: {
      totalOnHand,
      activeBoxes: boxRows.filter((b) => b.is_active).length,
      movements7d: moveRows.filter((m) => {
        const d = new Date(m.occurred_at);
        return Date.now() - d.getTime() < 7 * 86400 * 1000;
      }).length
    }
  };
}

export async function createPettyCashBox(input: {
  name: string;
  type: PettyCashBoxType;
  currency?: string;
  opening?: number;
  notes?: string;
}) {
  const context = await requirePermission("finance.payment.record");
  const admin = createAdminClient();
  const opening = input.opening ?? 0;
  const { data, error } = await admin
    .from("petty_cash_boxes")
    .insert({
      box_name: input.name,
      box_type: input.type,
      currency: input.currency ?? "GHS",
      opening_balance: opening,
      current_balance: opening,
      custodian_user_id: context.user.id,
      notes: input.notes ?? null
    })
    .select("*")
    .single();
  if (error) throw error;
  await writeAuditEvent({
    actorId: context.user.id,
    action: "PETTY_CASH_BOX_CREATED",
    targetType: "petty_cash_box",
    targetId: data.id,
    payload: { box_name: input.name, box_type: input.type, opening }
  });
  return data;
}

export async function recordPettyCashMovement(input: {
  boxId: string;
  movementType: PettyCashMovementType;
  amount: number;
  description: string;
  category?: string;
  reference?: string;
  counterparty?: string;
  linkedInvoiceId?: string;
  linkedExpenseId?: string;
  linkedPaymentId?: string;
  occurredAt?: string;
}) {
  const context = await requirePermission("finance.payment.record");
  const admin = createAdminClient();
  if (!(input.amount > 0)) throw new Error("Amount must be positive.");

  const { data, error } = await admin
    .from("petty_cash_movements")
    .insert({
      box_id: input.boxId,
      movement_type: input.movementType,
      amount: input.amount,
      occurred_at: input.occurredAt ?? new Date().toISOString(),
      description: input.description,
      category: input.category ?? null,
      reference: input.reference ?? null,
      counterparty: input.counterparty ?? null,
      linked_invoice_id: input.linkedInvoiceId ?? null,
      linked_expense_id: input.linkedExpenseId ?? null,
      linked_payment_id: input.linkedPaymentId ?? null,
      recorded_by: context.user.id
    })
    .select("*")
    .single();
  if (error) throw error;

  await writeAuditEvent({
    actorId: context.user.id,
    action: "PETTY_CASH_MOVEMENT",
    targetType: "petty_cash_box",
    targetId: input.boxId,
    payload: {
      type: input.movementType,
      amount: input.amount,
      description: input.description
    }
  });
  return data;
}

export async function transferBetweenBoxes(input: {
  fromBoxId: string;
  toBoxId: string;
  amount: number;
  description: string;
  reference?: string;
}) {
  await requirePermission("finance.payment.record");
  if (input.fromBoxId === input.toBoxId) throw new Error("Source and destination boxes must differ.");
  await recordPettyCashMovement({
    boxId: input.fromBoxId,
    movementType: "TRANSFER_OUT",
    amount: input.amount,
    description: input.description,
    reference: input.reference,
    counterparty: input.toBoxId
  });
  await recordPettyCashMovement({
    boxId: input.toBoxId,
    movementType: "TRANSFER_IN",
    amount: input.amount,
    description: input.description,
    reference: input.reference,
    counterparty: input.fromBoxId
  });
}
