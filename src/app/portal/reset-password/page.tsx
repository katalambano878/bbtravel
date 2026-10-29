import { Metadata } from "next";
import Link from "next/link";

import { userFromRecoveryToken } from "@/lib/auth/session";
import { PageHero } from "@/components/shared/page-hero";
import { AuthNotice } from "@/components/portal/auth-notice";
import { ResetPasswordForm } from "@/components/portal/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a New Password",
  robots: {
    index: false,
    follow: false
  }
};

export default async function PortalResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const valid = token ? !!(await userFromRecoveryToken(token)) : false;

  return (
    <>
      <PageHero
        eyebrow="Client Portal"
        title="Choose a new password."
        description="Set a new password for your account. You'll be signed in straight after."
      />
      <section className="section-shell">
        {valid ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="mx-auto max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-8">
            <AuthNotice code="invalid_token" />
            <p className="text-center text-xs text-slate-500">
              <Link href="/portal/forgot-password" className="text-bb-sky">
                Request a new reset link
              </Link>
            </p>
          </div>
        )}
      </section>
    </>
  );
}
