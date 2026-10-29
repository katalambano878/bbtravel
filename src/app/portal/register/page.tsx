import { Metadata } from "next";
import Link from "next/link";
import { signUpAction } from "@/app/actions";
import { PageHero } from "@/components/shared/page-hero";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthHeader } from "@/components/portal/auth-header";
import { AuthNotice } from "@/components/portal/auth-notice";

export const metadata: Metadata = {
  title: "Portal Registration",
  robots: {
    index: false,
    follow: false
  }
};

export default async function PortalRegisterPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="Client Portal"
        title="Create your portal account."
        description="Register with your application email to track progress, upload documents, and receive updates."
      />
      <section className="section-shell">
        <AuthHeader current="register" />
        <form action={signUpAction} className="mx-auto max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-8">
          <AuthNotice code={error} />
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={6} />
          </div>
          <Button type="submit" className="w-full">
            Register
          </Button>
          <p className="text-center text-xs text-slate-500">
            Already registered?{" "}
            <Link href="/portal/login" className="text-bb-sky">
              Login
            </Link>
          </p>
        </form>
      </section>
    </>
  );
}
