"use client";

import { useState } from "react";
import { FilePlus2 } from "lucide-react";

import { createInvoiceAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { serviceList, getService } from "@/lib/services/catalogue";

/**
 * Invoice composer with service presets. Selecting a service pre-fills the
 * invoice line description and the unit price to the catalogue's floor price,
 * so staff can raise an invoice in seconds while keeping pricing consistent.
 */
export function InvoiceComposer() {
  const [serviceKey, setServiceKey] = useState<string>("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  function applyService(key: string) {
    setServiceKey(key);
    const svc = getService(key);
    if (!svc) {
      setDescription("");
      setUnitPrice("");
      return;
    }
    setDescription(svc.defaultInvoiceDescription);
    setUnitPrice(svc.priceFloorGhs ? String(svc.priceFloorGhs) : "");
  }

  return (
    <form action={createInvoiceAction} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label className="text-xs">Service preset</Label>
        <select
          value={serviceKey}
          onChange={(e) => applyService(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">— Select a service to prefill description &amp; price —</option>
          {serviceList
            .filter((svc) => svc.key !== "BUSINESS_EXPORT")
            .map((svc) => (
              <option key={svc.key} value={svc.key}>
                {svc.label} ({svc.priceLabel})
              </option>
            ))}
        </select>
        {serviceKey && (
          <p className="mt-1 text-[11px] text-slate-400">
            Catalogue price floor is set as the default — adjust for discounts,
            extra travellers, or scope changes before issuing.
          </p>
        )}
      </div>

      <Input name="client_id" placeholder="Client ID (optional)" />
      <Input name="case_id" placeholder="Case ID (optional)" />
      <div>
        <Label className="text-xs">Due date</Label>
        <Input name="due_date" type="date" required />
      </div>
      <Input
        name="item_description"
        placeholder="Line item description"
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        name="item_quantity"
        type="number"
        step="0.01"
        defaultValue="1"
        placeholder="Quantity"
      />
      <Input
        name="item_unit_price"
        type="number"
        step="0.01"
        placeholder="Unit price (GHS)"
        required
        value={unitPrice}
        onChange={(e) => setUnitPrice(e.target.value)}
      />
      <Input name="item_tax_rate" type="number" step="0.0001" placeholder="Line tax rate" />
      <Input name="tax_amount" type="number" step="0.01" placeholder="Invoice tax amount" />
      <Input name="discount_amount" type="number" step="0.01" placeholder="Discount amount" />
      <Input name="notes" placeholder="Notes (visible on invoice)" className="sm:col-span-2" />
      <div className="sm:col-span-2">
        <Button type="submit">
          <FilePlus2 className="mr-1.5 h-4 w-4" />
          Create invoice
        </Button>
      </div>
    </form>
  );
}
