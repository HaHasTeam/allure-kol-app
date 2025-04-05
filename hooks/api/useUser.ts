import { useCallback } from "react";
import { IEditUserPayload, TUser } from "@/types/user";
import { GET, PUT } from "@/utils/api.caller";
import { useApi } from "./useApi";
import { ApiError } from "@/utils/error-handler";

const useUser = () => {
  const { execute } = useApi();
  const rootEndpoint = "/accounts";

  /**
   * Get the current user's profile
   * @returns User profile data or error message
   */
  const getProfile = useCallback(async () => {
    try {
      const result = await execute<{
        data: {
          data: TUser;
        };
      }>(() => GET(`${rootEndpoint}/me`), {
        onError: (error: ApiError) => {
          console.error("Failed to fetch profile:", error.message);
        },
      });

      return result?.data.data;
    } catch (error) {
      console.error("Error in getProfile:", error);
      return null;
    }
  }, [execute]);

  /**
   * Update the user's profile
   * @param data Profile data to update
   * @returns Success status or error message
   */
  const editProfile = useCallback(
    async (data: IEditUserPayload) => {
      try {
        const result = await execute<{ data: { success: boolean } }>(
          () => PUT(rootEndpoint, data),
          {
            onSuccess: () => {
              console.log("Profile updated successfully");
            },
            onError: (error: ApiError) => {
              console.error("Failed to update profile:", error.message);
            },
          }
        );

        return result?.data || false;
      } catch (error) {
        console.error("Error in editProfile:", error);
        return false;
      }
    },
    [execute]
  );
  return { getProfile, editProfile };
};

export default useUser;
