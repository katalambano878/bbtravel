import { Metadata } from "next";
import Link from "next/link";
import { signInAction } from "@/app/actions";
import { PageHero } from "@/components/shared/page-hero";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/portal/auth-header";
import { AuthNotice } from "@/components/portal/auth-notice";

export const metadata: Metadata = {
  title: "Portal Login",
  robots: {
    index: false,
    follow: false
  }
};

export default async function PortalLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; registered?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const notice = params.error ?? (params.registered ? "registered" : params.reset ? "reset" : null);

  return (
    <>
      <PageHero
        eyebrow="Client Portal"
        title="Sign in to track your case progress."
        description="Access your timeline, document checklist, appointments, and messages in one transparent dashboard."
      />
      <section className="section-shell">
        <AuthHeader current="login" />
        <form action={signInAction} className="mx-auto max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-8">
          <AuthNotice code={notice} />
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
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
