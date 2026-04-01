import Link from "next/link";
import { signInAction } from "@/app/actions";
import { PageHero } from "@/components/shared/page-hero";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function PortalLoginPage() {
  return (
    <>
      <PageHero
        eyebrow="Client Portal"
        title="Sign in to track your case progress."
        description="Access your timeline, document checklist, appointments, and messages in one transparent dashboard."
      />
      <section className="section-shell">
        <form action={signInAction} className="mx-auto max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-8">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
          <div className="flex justify-between text-xs text-slate-500">
            <Link href="/portal/register">Create account</Link>
            <Link href="/portal/forgot-password">Forgot password?</Link>
          </div>
        </form>
      </section>
    </>
  );
}
