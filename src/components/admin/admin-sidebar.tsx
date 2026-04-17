"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Bell,
  UserCog,
  DollarSign,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permissionKey?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "CRM / Leads", href: "/admin/crm", icon: Users, permissionKey: "crm.view" },
  { label: "Cases", href: "/admin/cases", icon: Briefcase, permissionKey: "cases.view" },
  { label: "Documents", href: "/admin/documents", icon: FileText, permissionKey: "documents.view" },
  { label: "Notifications", href: "/admin/notifications", icon: Bell, permissionKey: "messages.manage" },
  { label: "HR", href: "/admin/hr", icon: UserCog, permissionKey: "hr.view" },
  { label: "Finance", href: "/admin/finance", icon: DollarSign, permissionKey: "finance.view" },
  { label: "Reports / BI", href: "/admin/bi", icon: BarChart3, permissionKey: "reports.view" },
  { label: "Settings", href: "/admin/settings", icon: Settings, permissionKey: "settings.manage" }
];

interface AdminSidebarProps {
  permissions: string[];
  role: string;
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ permissions, role, collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => {
    if (!item.permissionKey) return true;
    if (role === "super_admin") return true;
    return permissions.includes(item.permissionKey);
  });

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-bb-navy transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-white/10 px-4", collapsed ? "justify-center" : "gap-3")}>
        {!collapsed && (
          <Image src="/images/logo.png" alt="B.B. Travel" width={120} height={40} className="brightness-0 invert" />
        )}
        <button
          onClick={onToggle}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-bb-gold/15 text-bb-gold"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-bb-gold" : "text-slate-500 group-hover:text-white")} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={cn("border-t border-white/10 p-4 text-xs text-slate-500", collapsed && "text-center")}>
        {!collapsed ? "B.B. Travel Consult" : "BB"}
      </div>
    </aside>
  );
}
