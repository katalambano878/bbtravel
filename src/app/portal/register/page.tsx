import Link from "next/link";
import { signUpAction } from "@/app/actions";
import { PageHero } from "@/components/shared/page-hero";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function PortalRegisterPage() {
  return (
    <>
      <PageHero
        eyebrow="Client Portal"
        title="Create your portal account."
        description="Register with your application email to track progress, upload documents, and receive updates."
      />
      <section className="section-shell">
        <form action={signUpAction} className="mx-auto max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-8">
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
            <Input id="password" name="password" type="password" required minLength={6} />
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
