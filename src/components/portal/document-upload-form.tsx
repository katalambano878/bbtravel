"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
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

export function DocumentUploadForm({ caseId, userId }: { caseId: string; userId: string }) {
  const [docType, setDocType] = useState("passport");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string>("");

  async function handleUpload(formData: FormData) {
    setUploading(true);
    setStatus("");
    try {
      const file = formData.get("file") as File | null;
      if (!file) throw new Error("Select a file first");

      const supabase = createClient();
      const filePath = `${userId}/${caseId}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const { error: storageError } = await supabase.storage.from("client-documents").upload(filePath, file);
      if (storageError) throw storageError;

      const { error: insertError } = await supabase.from("documents").insert({
        case_id: caseId,
        doc_type: docType,
        file_url: filePath,
        status: "PENDING",
        uploaded_by: userId
      });
      if (insertError) throw insertError;
      setStatus("Document uploaded successfully.");
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
