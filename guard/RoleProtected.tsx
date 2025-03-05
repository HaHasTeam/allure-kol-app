import { useRequireRole } from "@/hooks/useRequireRole";
import { Redirect } from "expo-router";

// Component to protect routes based on role
export function RoleProtected({
  children,
  requiredRole,
  fallbackPath = "/unauthorized",
}: {
  children: React.ReactNode;
  requiredRole: string;
  fallbackPath?: string;
}) {
  const { hasRole, isLoading } = useRequireRole(requiredRole);

  if (isLoading) {
    return null; // Or a loading indicator
  }

  if (!hasRole) {
    return <Redirect href={fallbackPath as any} />;
  }

  return <>{children}</>;
}
