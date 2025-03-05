import { type ApiError } from "@/utils/error-handler";

import { useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { safeApiCall } from "@/utils/api.caller";

/**
 * Hook for making API calls with built-in loading state and error handling
 */
export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const navigation = useNavigation();

  /**
   * Execute an API call with loading state and error handling
   */
  const execute = useCallback(
    async <T>(
      apiCallFn: () => Promise<T>,
      options: {
        showError?: boolean;
        onSuccess?: (data: T) => void;
        onError?: (error: ApiError) => void;
      } = {}
    ): Promise<T | null> => {
      const { showError = true, onSuccess, onError } = options;

      setIsLoading(true);
      setError(null);

      try {
        const result = await safeApiCall(apiCallFn(), {
          showError,
          retryAction: () => execute(apiCallFn, options),
          goBackAction: () => navigation.goBack(),
        });

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);

        if (onError) {
          onError(apiError);
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [navigation]
  );

  /**
   * Reset the error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    execute,
    resetError,
  };
}
