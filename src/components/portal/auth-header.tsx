import Link from "next/link";

type AuthView = "login" | "register";

interface AuthHeaderProps {
  current: AuthView;
}

export function AuthHeader({ current }: AuthHeaderProps) {
  const isLogin = current === "login";

  return (
    <div className="mx-auto mb-6 flex w-full max-w-md items-center justify-between rounded-2xl border border-slate-200 bg-white p-3">
      <Link
        href="/"
        className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-bb-navy"
      >
        Back Home
      </Link>
      <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1">
        <Link
          href="/portal/login"
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            isLogin ? "bg-white text-bb-navy shadow-sm" : "text-slate-500 hover:text-bb-navy"
          }`}
        >
          Login
        </Link>
        <Link
          href="/portal/register"
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            isLogin ? "text-slate-500 hover:text-bb-navy" : "bg-white text-bb-navy shadow-sm"
          }`}
        >
          Register
        </Link>
      </div>
    </div>
  );
}
