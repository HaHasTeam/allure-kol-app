import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type Method,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { jwtDecode } from "jwt-decode";

// Create a custom axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token keys in AsyncStorage
export const ACCESS_TOKEN = "accessToken";
export const REFRESH_TOKEN = "refreshToken";

// Interface for decoded JWT token
interface IUser {
  exp: number;
  // Add other user properties as needed
  userId?: string;
  email?: string;
  role?: string;
}

// Function to check token validity and refresh if needed
const checkTokenValidity = async (): Promise<boolean> => {
  try {
    const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN);
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN);

    if (accessToken && refreshToken) {
      const decodedAccessToken = jwtDecode(accessToken) as IUser;
      const decodedRefreshToken = jwtDecode(refreshToken) as IUser;

      const accessTokenExpiration = decodedAccessToken.exp;
      const refreshTokenExpiration = decodedRefreshToken.exp;

      const currentTimestamp = Math.floor(new Date().getTime() / 1000);

      if (currentTimestamp > accessTokenExpiration) {
        // Access token is expired
        if (currentTimestamp > refreshTokenExpiration) {
          // Refresh token is also expired, logout
          await handleUnauthorized();
          return false;
        } else {
          // Refresh token is still valid, try to refresh
          try {
            const response = await axios.post(
              `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-token`,
              { refreshToken }
            );

            if (response.data?.data?.accessToken) {
              const newAccessToken = response.data.data.accessToken;
              const newRefreshToken =
                response.data.data.refreshToken || refreshToken;

              // Save the new tokens
              await AsyncStorage.setItem(ACCESS_TOKEN, newAccessToken);
              await AsyncStorage.setItem(REFRESH_TOKEN, newRefreshToken);

              return true;
            } else {
              await handleUnauthorized();
              return false;
            }
          } catch (error) {
            // Refresh failed, logout
            await handleUnauthorized();
            return false;
          }
        }
      }

      // Access token is still valid
      return true;
    } else {
      // One or both tokens don't exist
      await handleUnauthorized();
      return false;
    }
  } catch (error) {
    console.error("Error checking token validity:", error);
    await handleUnauthorized();
    return false;
  }
};

// Request interceptor for adding token and checking expiration
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Check token validity before making the request
      const isValid = await checkTokenValidity();

      if (isValid) {
        // Get the (potentially refreshed) token
        const token = await AsyncStorage.getItem(ACCESS_TOKEN);

        if (token) {
          // Add the token to the headers
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && originalRequest) {
      // Prevent infinite loops
      if (!(originalRequest as any)._retry) {
        try {
          (originalRequest as any)._retry = true;

          // Check token validity and refresh if needed
          const isValid = await checkTokenValidity();

          if (isValid) {
            // Get the refreshed token
            const token = await AsyncStorage.getItem(ACCESS_TOKEN);

            // Update the Authorization header
            originalRequest.headers.Authorization = `Bearer ${token}`;

            // Retry the original request
            return apiClient(originalRequest);
          } else {
            // Token refresh failed or user was logged out
            return Promise.reject(createApiError(error));
          }
        } catch (refreshError) {
          // If refresh token fails, handle unauthorized
          await handleUnauthorized();
          return Promise.reject(createApiError(refreshError as AxiosError));
        }
      }
    }

    // For all other errors, return a standardized error object
    return Promise.reject(createApiError(error));
  }
);

// Handle unauthorized errors (clear tokens)
const handleUnauthorized = async () => {
  try {
    // Clear all auth tokens
    await AsyncStorage.multiRemove([
      ACCESS_TOKEN,
      REFRESH_TOKEN,
      "firebaseToken",
    ]);
    console.log("User session expired. Redirect to login required.");

    // You might want to add navigation to login screen here
    // If you have access to a navigation reference or context
    // Example: navigation.navigate('Login');
  } catch (error) {
    console.error("Error handling unauthorized status:", error);
  }
};

// Create a standardized API error object
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  originalError?: any;
}

const createApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    // The server responded with an error status
    const status = error.response.status;
    const responseData = error.response.data as any;

    return {
      status,
      message: responseData?.message || getDefaultErrorMessage(status),
      code: responseData?.code || `ERR_${status}`,
      originalError: error,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      status: 0,
      message: "Network error. Please check your internet connection.",
      code: "ERR_NETWORK",
      originalError: error,
    };
  } else {
    // Something happened in setting up the request
    return {
      status: 0,
      message: error.message || "An unexpected error occurred",
      code: "ERR_UNKNOWN",
      originalError: error,
    };
  }
};

// Get user-friendly error messages
const getDefaultErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return "The information provided is invalid. Please check and try again.";
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You don't have permission to access this feature.";
    case 404:
      return "The requested information could not be found.";
    case 409:
      return "There was a conflict with your request.";
    case 422:
      return "We couldn't process your request due to validation errors.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "Something went wrong on our end. Please try again later.";
    case 503:
      return "Service temporarily unavailable. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

/**
 * Shows a user-friendly error alert with options to take action
 */
export const showErrorAlert = (
  error: ApiError,
  retryAction?: () => void,
  goBackAction?: () => void
) => {
  const buttons = [];

  // Add go back button if action provided
  if (goBackAction) {
    buttons.push({
      text: "Go Back",
      onPress: goBackAction,
      style: "cancel" as const,
    });
  }

  // Add retry button if action provided
  if (retryAction) {
    buttons.push({
      text: "Try Again",
      onPress: retryAction,
    });
  }

  // Always have at least an OK button
  if (buttons.length === 0) {
    buttons.push({ text: "OK" });
  }

  // Show appropriate alert based on error type
  if (error.status === 401) {
    Alert.alert(
      "Session Expired",
      "Your session has expired. Please log in again to continue.",
      buttons
    );
  } else if (error.status === 403) {
    Alert.alert("Access Denied", error.message, buttons);
  } else if (error.status === 0) {
    Alert.alert(
      "Connection Error",
      "Please check your internet connection and try again.",
      buttons
    );
  } else {
    Alert.alert("Error", error.message, buttons);
  }
};

/**
 * Creates a request using the configured Axios instance
 */
export const request = (
  endpoint: string,
  method: Method,
  headers: object = {},
  params: object = {},
  body: object = {}
): Promise<AxiosResponse> => {
  return apiClient({
    url: endpoint,
    method,
    headers: Object.assign({}, headers),
    params: Object.assign({}, params),
    data: body,
  });
};

/**
 * Sends a GET request to the specified endpoint
 */
export const GET = (
  endpoint: string,
  params: object = {},
  headers: object = {}
): Promise<AxiosResponse> => {
  return request(endpoint, "GET", headers, params);
};

/**
 * Sends a POST request to the specified endpoint
 */
export const POST = (
  endpoint: string,
  body: object = {},
  params: object = {},
  headers: object = {}
): Promise<AxiosResponse> => {
  return request(endpoint, "POST", headers, params, body);
};

/**
 * Sends a PUT request to the specified endpoint
 */
export const PUT = (
  endpoint: string,
  body: object = {},
  params: object = {},
  headers: object = {}
): Promise<AxiosResponse> => {
  return request(endpoint, "PUT", headers, params, body);
};

/**
 * Sends a PATCH request to the specified endpoint
 */
export const PATCH = (
  endpoint: string,
  body: object = {},
  params: object = {},
  headers: object = {}
): Promise<AxiosResponse> => {
  return request(endpoint, "PATCH", headers, params, body);
};

/**
 * Sends a DELETE request to the specified endpoint
 */
export const DELETE = (
  endpoint: string,
  body: object = {},
  params: object = {},
  headers: object = {}
): Promise<AxiosResponse> => {
  return request(endpoint, "DELETE", headers, params, body);
};

/**
 * Utility function to safely use API calls with error handling
 */
export const safeApiCall = async <T>(
  apiCall: Promise<T>,
  options?: {
    showError?: boolean;
    retryAction?: () => void;
    goBackAction?: () => void;
  }
): Promise<T> => {
  const { showError = true, retryAction, goBackAction } = options || {};

  try {
    return await apiCall;
  } catch (error) {
    const apiError = error as ApiError;

    if (showError) {
      showErrorAlert(apiError, retryAction, goBackAction);
    }

    throw apiError;
  }
};
