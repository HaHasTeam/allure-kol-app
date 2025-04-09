import { useCallback } from "react";
import { GET, POST, PUT } from "@/utils/api.caller";
import { useApi } from "./useApi";
import { ApiError } from "@/utils/error-handler";

const useFirebase = () => {
  const { execute } = useApi();
  const rootEndpoint = "/firebase-auth/generate-token";

  /**
   * Update the user's profile
   * @param data Profile data to update
   * @returns Success status or error message
   */
  const createCustomToken = useCallback(async () => {
    try {
      const result = await execute<{ data: { data: { token: string } } }>(
        () => POST(rootEndpoint),
        {
          onSuccess: () => {
            console.log("generate token successfully");
          },
          onError: (error: ApiError) => {
            console.error("Failed to generate token:", error.message);
          },
        }
      );

      return result?.data || false;
    } catch (error) {
      console.error("Error in generate token:", error);
      return false;
    }
  }, [execute]);
  return { createCustomToken };
};

export default useFirebase;
