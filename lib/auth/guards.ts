import type { AppRole } from "@/types/domain";

export function hasRequiredRole(role: AppRole, allowed: AppRole[]) {
  return allowed.includes(role);
}
