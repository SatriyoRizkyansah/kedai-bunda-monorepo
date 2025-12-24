export type UserRole = "super_admin" | "admin" | "kasir";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

/**
 * Check if user has a specific role
 */
export function hasRole(role: UserRole | UserRole[]): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  return user.role === role;
}

/**
 * Check if user can perform inventory actions (admin or super_admin)
 */
export function canManageInventory(): boolean {
  return hasRole(["admin", "super_admin"]);
}

/**
 * Check if user can perform transactions (kasir or super_admin)
 */
export function canMakeTransactions(): boolean {
  return hasRole(["kasir", "super_admin"]);
}

/**
 * Check if user can access reports (admin or super_admin)
 */
export function canViewReports(): boolean {
  return hasRole(["admin", "super_admin"]);
}

/**
 * Check if user can manage users (super_admin only)
 */
export function canManageUsers(): boolean {
  return hasRole("super_admin");
}
