/**
 * User role types
 */
export type UserRole = "visitor" | "owner" | "admin" | "waiter";

/**
 * Check if user has a specific role
 */
export function hasRole(userGroups: string[] | undefined, role: UserRole): boolean {
  if (!userGroups || !Array.isArray(userGroups)) {
    return role === "visitor";
  }

  const roleMap: Record<UserRole, string[]> = {
    visitor: [],
    owner: ["OWNER"],
    admin: ["ADMIN"],
    waiter: ["WAITER"],
  };

  const expectedGroups = roleMap[role];
  return expectedGroups.some((group) => userGroups.includes(group));
}

/**
 * Get user role from groups
 */
export function getUserRole(userGroups: string[] | undefined): UserRole {
  if (!userGroups || !Array.isArray(userGroups)) {
    return "visitor";
  }

  if (userGroups.includes("ADMIN")) {
    return "admin";
  }
  if (userGroups.includes("OWNER")) {
    return "owner";
  }
  if (userGroups.includes("WAITER")) {
    return "waiter";
  }

  return "visitor";
}


