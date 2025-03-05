import { TServerResponse } from "@/types/request";
import { TRoleResponse } from "@/types/role";
import { toQueryFetcher } from "@/utils/query";

import useApi from "../useApi";
import { log } from "@/utils/logger";
import { GET } from "@/utils/api.caller";

export type GetRoleByEnumResponse = Record<string, TRoleResponse>;
export const getRolesApi = toQueryFetcher<void, TRoleResponse[]>(
  "getRolesApi",
  async () => {
    const callApi = useApi();
    log.info("getRolesApi", await GET("/role", {}, {}));
    return await callApi<TRoleResponse[]>("get", "/role");
  }
);

export const getRoleIdByEnum = toQueryFetcher<void, GetRoleByEnumResponse>(
  "getRoleIdByEnum",
  async () => {
    const response = await getRolesApi.raw();
    console.log("roles 22  ", response);
    const roles = response.data;

    if (!roles) {
      // Handle the case where roles is null
      return {
        data: null,
        error: "No roles data received",
        message: "Error No Role",
      };
    }
    const mappedRoles = roles.reduce<GetRoleByEnumResponse>((acc, roleItem) => {
      const key = roleItem.role;
      acc[key] = roleItem;
      return acc;
    }, {});

    // Wrap the mappedRoles in a TServerResponse structure
    return {
      data: mappedRoles,
      error: null,
      message: "Success",
    };
  }
);
