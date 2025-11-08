"use client";

import { useSession, signOut } from "next-auth/react";
import { getUserRole, type UserRole } from "@/src/utils/user";

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const userRole = getUserRole(user?.groups);

  return {
    user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    signOut: () => signOut({ callbackUrl: "/" }),
    userRole,
  };
}
