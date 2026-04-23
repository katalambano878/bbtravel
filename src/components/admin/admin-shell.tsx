"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import { cn } from "@/lib/utils/cn";

interface AdminShellProps {
  children: React.ReactNode;
  fullName: string;
  role: string;
  permissions: string[];
}

export function AdminShell({ children, fullName, role, permissions }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar
          permissions={permissions}
          role={role}
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full w-[260px]">
            <AdminSidebar
              permissions={permissions}
              role={role}
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={cn("transition-all duration-300", collapsed ? "lg:ml-[68px]" : "lg:ml-[220px]")}>
        <AdminTopbar
          fullName={fullName}
          role={role}
          onMenuToggle={() => setMobileOpen((prev) => !prev)}
          sidebarCollapsed={collapsed}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
