"use client";

import { usePathname } from "next/navigation";
import { LogOut, Menu, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AdminTopbarProps {
  fullName: string;
  role: string;
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

const titleMap: Record<string, string> = {
  "/admin": "Today",
  "/admin/inbox": "Inbox",
  "/admin/pipeline": "Pipeline",
  "/admin/clients": "Clients",
  "/admin/documents": "Documents",
  "/admin/finance": "Finance",
  "/admin/tours": "Tours",
  "/admin/tours/new": "New tour",
  "/admin/team": "Team",
  "/admin/settings": "Settings"
};

function resolveTitle(pathname: string): string {
  const direct = titleMap[pathname];
  if (direct) return direct;
  if (pathname.startsWith("/admin/clients/")) return "Client";
  if (pathname.startsWith("/admin/pipeline/")) return "Case";
  if (pathname.startsWith("/admin/finance/")) return "Finance";
  if (pathname.startsWith("/admin/team/")) return "Team";
  if (pathname.startsWith("/admin/tours/")) return "Edit tour";
  return "Admin";
}

function roleBadgeColor(role: string) {
  if (role === "super_admin") return "bg-bb-gold/15 text-bb-gold border-bb-gold/30";
  if (role.includes("manager")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (role.includes("officer")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

export function AdminTopbar({ fullName, role, onMenuToggle, sidebarCollapsed }: AdminTopbarProps) {
  const pathname = usePathname();
  const pageTitle = resolveTitle(pathname);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md transition-all",
        sidebarCollapsed ? "lg:pl-[92px]" : "lg:pl-[244px]"
      )}
    >
      <button
        onClick={onMenuToggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className="font-medium text-slate-700">Admin</span>
        {pageTitle !== "Today" && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-bb-navy">{pageTitle}</span>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden items-center gap-3 sm:flex">
          <div className="text-right">
            <p className="text-sm font-semibold text-bb-navy leading-tight">{fullName}</p>
            <span className={cn("mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", roleBadgeColor(role))}>
              {role.replace("_", " ")}
            </span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bb-navy text-sm font-bold text-white">
            {fullName.charAt(0)}
          </div>
        </div>

        <form action="/api/admin-signout" method="POST">
          <button
            type="submit"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
