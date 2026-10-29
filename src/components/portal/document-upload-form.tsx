"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const docTypes = [
  { label: "Passport", value: "passport" },
  { label: "Bank statement", value: "bank_statement" },
  { label: "Invitation letter", value: "invitation_letter" },
  { label: "Academic transcript", value: "transcript" },
  { label: "Other supporting doc", value: "other" }
];

export function DocumentUploadForm({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [docType, setDocType] = useState("passport");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string>("");

  async function handleUpload(formData: FormData) {
    setUploading(true);
    setStatus("");
    try {
      const file = formData.get("file") as File | null;
      if (!file || file.size === 0) throw new Error("Select a file first");

      const body = new FormData();
      body.set("file", file);
      body.set("case_id", caseId);
      body.set("doc_type", docType);
      const res = await fetch("/api/portal/documents", { method: "POST", body });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setStatus("Document uploaded successfully.");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setStatus(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={handleUpload} className="space-y-3 rounded-xl border border-slate-200 p-4">
      <Select
        name="doc_type"
        value={docType}
        onChange={(event) => setDocType(event.target.value)}
        options={docTypes}
        placeholder="Document type"
      />
      <Input name="file" type="file" required />
      <Button size="sm" disabled={uploading} type="submit">
        <UploadCloud className="mr-2 h-4 w-4" />
        {uploading ? "Uploading..." : "Upload document"}
      </Button>
      {status ? <p className="text-xs text-slate-500">{status}</p> : null}
    </form>
  );
}
