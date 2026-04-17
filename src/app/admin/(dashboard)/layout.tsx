import { redirect } from "next/navigation";
import { getStaffAccessContext } from "@/lib/data/queries";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const context = await getStaffAccessContext();
  if (!context) redirect("/admin/login");

  return (
    <AdminShell
      fullName={context.profile.full_name}
      role={context.profile.role}
      permissions={context.permissions}
    >
      {children}
    </AdminShell>
  );
}
