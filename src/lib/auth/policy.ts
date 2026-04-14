import { getStaffAccessContext } from "@/lib/data/queries";
import type { PermissionKey } from "@/lib/auth/permissions";

export class AuthorizationError extends Error {
  code: "UNAUTHENTICATED" | "FORBIDDEN";

  constructor(code: "UNAUTHENTICATED" | "FORBIDDEN", message: string) {
    super(message);
    this.code = code;
  }
}

export async function requirePermission(permission: PermissionKey | string) {
  const context = await getStaffAccessContext();
  if (!context?.user) {
    throw new AuthorizationError("UNAUTHENTICATED", "You must be signed in as staff to perform this action.");
  }

  const hasPermission =
    context.profile.role === "super_admin" ||
    context.permissions.includes(permission) ||
    // Backward compatibility for legacy permission keys still referenced in UI.
    (permission === "settings.audit.view" && context.permissions.includes("audit.view")) ||
    (permission === "settings.rbac.manage" && context.permissions.includes("staff.manage"));

  if (!hasPermission) {
    throw new AuthorizationError("FORBIDDEN", `Missing required permission: ${permission}`);
  }

  return context;
}
