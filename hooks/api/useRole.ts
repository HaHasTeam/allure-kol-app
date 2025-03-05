import { useState, useCallback } from "react";
import { useApi } from "./useApi";
import { GET } from "@/utils/api.caller";
import { log } from "@/utils/logger";
import { GetRoleByEnumResponse, TRoleResponse } from "@/types/role";

/**
 * Hook for role-related API operations
 */
const useRole = () => {
  const { execute, isLoading } = useApi();
  const [rolesData, setRolesData] = useState<TRoleResponse[]>([]);
  const [mappedRoles, setMappedRoles] = useState<GetRoleByEnumResponse>({});

  /**
   * Fetch all roles and map them by role enum
   * @returns Promise that resolves when roles are fetched
   */
  const fetchRoles = useCallback(async () => {
    try {
      const result = await execute<{
        data: {
          data: TRoleResponse[];
        };
      }>(() => GET("/role/"), {
        onSuccess: (response) => {
          const roles = response.data.data;

          if (roles && Array.isArray(roles)) {
            setRolesData(roles);

            // Map roles by enum value for easier access
            const mappedRoles = roles.reduce(
              (acc: GetRoleByEnumResponse, roleItem: TRoleResponse) => {
                const key = roleItem.role;
                acc[key] = roleItem;
                return acc;
              },
              {}
            );

            setMappedRoles(mappedRoles);
            log.info("Roles fetched and mapped successfully");
          }
        },
        onError: (error) => {
          log.error("Error fetching roles:", error);
        },
      });

      return result?.data.data || [];
    } catch (error) {
      log.error("Error in fetchRoles:", error);
      return [];
    }
  }, [execute]);

  /**
   * Get a role by its enum value
   * @param roleEnum The role enum value to look up
   * @returns The role object or undefined if not found
   */
  const getRoleByEnum = useCallback(
    (roleEnum: string): TRoleResponse | undefined => {
      return mappedRoles[roleEnum];
    },
    [mappedRoles]
  );

  /**
   * Get a role name by its enum value
   * @param roleEnum The role enum value to look up
   * @returns The role name or the enum value if not found
   */
  const getRoleNameByEnum = useCallback(
    (roleEnum: string): string => {
      return mappedRoles[roleEnum]?.role || roleEnum;
    },
    [mappedRoles]
  );

  /**
   * Check if roles data is loaded
   * @returns Boolean indicating if roles are loaded
   */
  const isRolesLoaded = useCallback((): boolean => {
    return rolesData.length > 0;
  }, [rolesData]);

  return {
    fetchRoles,
    getRoleByEnum,
    getRoleNameByEnum,
    isRolesLoaded,
    rolesData,
    mappedRoles,
    isLoading,
  };
};

export default useRole;
