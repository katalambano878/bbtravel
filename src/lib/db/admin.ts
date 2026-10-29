import "server-only";

import { createQueryClient } from "./query-builder";

/**
 * Server-side database client with full access (the replacement for the
 * Supabase service-role client). Callers enforce permissions in code — never
 * import this from a client component.
 */
export function createAdminClient() {
  return createQueryClient();
}
