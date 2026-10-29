"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";

import { completePasswordResetAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(completePasswordResetAction, null);

  return (
    <form action={formAction} className="mx-auto max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-8">
      <input type="hidden" name="token" value={token} />
      {state?.error ? (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      ) : null}
      <div>
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={6} />
      </div>
      <div>
        <Label htmlFor="confirm_password">Confirm new password</Label>
        <Input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" required minLength={6} />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
