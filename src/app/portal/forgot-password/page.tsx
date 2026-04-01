import Link from "next/link";
import { resetPasswordAction } from "@/app/actions";
import { PageHero } from "@/components/shared/page-hero";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function PortalForgotPasswordPage() {
  return (
    <>
      <PageHero
        eyebrow="Client Portal"
        title="Reset your password."
        description="Enter your account email to receive a secure reset link."
      />
      <section className="section-shell">
        <form
          action={resetPasswordAction}
          className="mx-auto max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-8"
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
          <p className="text-center text-xs text-slate-500">
            <Link href="/portal/login" className="text-bb-sky">
              Back to login
            </Link>
          </p>
        </form>
      </section>
    </>
  );
}
