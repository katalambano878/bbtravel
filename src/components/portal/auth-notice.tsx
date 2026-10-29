import { AlertCircle, CheckCircle2 } from "lucide-react";

const MESSAGES: Record<string, { tone: "success" | "error"; text: string }> = {
  registered: {
    tone: "success",
    text: "Account created. Check your email and open the confirmation link, then sign in."
  },
  reset: {
    tone: "success",
    text: "If an account exists for that email, a password reset link is on its way."
  },
  invalid_credentials: { tone: "error", text: "Invalid email or password." },
  email_not_confirmed: {
    tone: "error",
    text: "Please confirm your email first. Open the confirmation link we sent when you registered."
  },
  user_banned: { tone: "error", text: "This account has been suspended. Please contact us." },
  locked: { tone: "error", text: "Too many failed attempts. Please wait a few minutes and try again." },
  invalid_token: { tone: "error", text: "That link is invalid or has expired. Please request a new one." },
  invalid_email: { tone: "error", text: "Please enter a valid email address." },
  weak_password: { tone: "error", text: "Password should be at least 6 characters." },
  unknown: { tone: "error", text: "Something went wrong. Please try again." }
};

export function AuthNotice({ code }: { code?: string | null }) {
  if (!code) return null;
  const message = MESSAGES[code] ?? MESSAGES.unknown;
  const success = message.tone === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
        success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message.text}</span>
    </div>
  );
}
