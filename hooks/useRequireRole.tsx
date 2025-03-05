import type React from "react";
import { useSession } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";
import { jwtDecode } from "jwt-decode";

// Hook to check if user has required role
export function useRequireRole(requiredRole: string) {
  const { accessToken, getRoleByEnum } = useSession();

  if (!accessToken) {
    return { hasRole: false, isLoading: false };
  }

  try {
    const decoded = jwtDecode(accessToken) as any;
    const userRole = decoded?.role;

    if (!userRole) {
      return { hasRole: false, isLoading: false };
    }

    const roleObj = getRoleByEnum ? getRoleByEnum(userRole) : undefined;
    const hasRole = roleObj?.role === requiredRole;

    return { hasRole, isLoading: false };
  } catch (error) {
    console.error("Error checking role:", error);
    return { hasRole: false, isLoading: false };
  }
}
