import { useCallback } from "react";
import { useApi } from "./useApi";
import { POST } from "@/utils/api.caller";
import type { ApiError } from "@/utils/api.caller";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/utils/api.caller";
import { IRegisterFormPayload, IRegisterPayload } from "@/types/auth";
import { ILoginPayload } from "@/app/login";

// Define types for auth payloads

export interface IResendOtpPayload {
  email: string;
}

export interface IVerifyOtpPayload {
  email: string;
  otp: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Hook for authentication-related API operations
 */
const useAuth = () => {
  const { execute } = useApi();
  const rootEndpoint = "/";

  /**
   * Register a new user
   * @param data Registration data
   * @returns Success status or error message
   */
  const register = useCallback(
    async (data: IRegisterPayload) => {
      try {
        await execute(() => POST(rootEndpoint + "accounts", data), {
          onSuccess: () => {
            console.log("Registration successful");
          },
          onError: (error: ApiError) => {
            console.error("Registration failed:", error.message);
          },
        });
        return true;
      } catch (error) {
        console.error("Error in register:", error);
        return false;
      }
    },
    [execute]
  );

  /**
   * Login a user
   * @param data Login credentials
   * @returns Success status or error message
   */
  const login = useCallback(
    async (data: ILoginPayload) => {
      try {
        const result = await execute<{
          data: { accessToken: string; refreshToken: string };
        }>(() => POST(rootEndpoint + "auth/login", data), {
          onSuccess: (response) => {
            const { accessToken, refreshToken } = response.data;

            // Store tokens
            AsyncStorage.setItem(ACCESS_TOKEN, accessToken);
            AsyncStorage.setItem(REFRESH_TOKEN, refreshToken);

            console.log("Login successful");
          },
        });

        return !!result;
      } catch (error) {
        console.error("Error in login:", error);
        return false;
      }
    },
    [execute]
  );

  /**
   * Logout the current user
   * @returns Success status
   */
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint if your API has one
      await execute(() => POST(rootEndpoint + "auth/logout"), {
        showError: false,
      });

      // Clear tokens regardless of API response
      await AsyncStorage.multiRemove([ACCESS_TOKEN, REFRESH_TOKEN]);

      return true;
    } catch (error) {
      console.error("Error in logout:", error);

      // Still clear tokens even if API call fails
      await AsyncStorage.multiRemove([ACCESS_TOKEN, REFRESH_TOKEN]);

      return true; // Return true anyway since we've cleared tokens
    }
  }, [execute]);

  /**
   * Resend OTP verification code
   * @param data Email information
   * @returns Success status or error message
   */
  const resendOtp = useCallback(
    async (data: IResendOtpPayload) => {
      try {
        await execute(() => POST(rootEndpoint + "auth/resend-otp", data), {
          onSuccess: () => {
            Alert.alert("Success", "Verification code sent to your email");
          },
        });
        return true;
      } catch (error) {
        console.error("Error in resendOtp:", error);
        return false;
      }
    },
    [execute]
  );

  /**
   * Verify OTP code
   * @param data OTP verification data
   * @returns Success status or error message
   */
  const verifyOtp = useCallback(
    async (data: IVerifyOtpPayload) => {
      try {
        await execute(() => POST(rootEndpoint + "auth/verify-otp", data), {
          onSuccess: () => {
            Alert.alert("Success", "Email verified successfully");
          },
        });
        return true;
      } catch (error) {
        console.error("Error in verifyOtp:", error);
        return false;
      }
    },
    [execute]
  );

  /**
   * Request password reset
   * @param data Email information
   * @returns Success status or error message
   */
  const forgotPassword = useCallback(
    async (data: IForgotPasswordPayload) => {
      try {
        await execute(() => POST(rootEndpoint + "auth/forgot-password", data), {
          onSuccess: () => {
            Alert.alert(
              "Success",
              "Password reset instructions sent to your email"
            );
          },
        });
        return true;
      } catch (error) {
        console.error("Error in forgotPassword:", error);
        return false;
      }
    },
    [execute]
  );

  /**
   * Reset password with token
   * @param data Reset password data
   * @returns Success status or error message
   */
  const resetPassword = useCallback(
    async (data: IResetPasswordPayload) => {
      try {
        if (data.password !== data.confirmPassword) {
          Alert.alert("Error", "Passwords don't match");
          return false;
        }

        await execute(() => POST(rootEndpoint + "auth/reset-password", data), {
          onSuccess: () => {
            Alert.alert("Success", "Password reset successfully");
          },
        });
        return true;
      } catch (error) {
        console.error("Error in resetPassword:", error);
        return false;
      }
    },
    [execute]
  );

  /**
   * Check if user is authenticated
   * @returns Boolean indicating authentication status
   */
  const isAuthenticated = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN);
      return !!token;
    } catch (error) {
      console.error("Error checking authentication status:", error);
      return false;
    }
  }, []);

  return {
    register,
    login,
    logout,
    resendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
    isAuthenticated,
  };
};

export default useAuth;
