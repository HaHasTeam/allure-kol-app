import type { AxiosError } from "axios";
import { log } from "./logger";

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

/**
 * Standardizes API error handling across the application
 * @param error The axios error object
 * @returns A standardized ApiError object
 */
export const handleApiError = (error: AxiosError): ApiError => {
  // Log the error for debugging
  log.error("API Error:", error);

  if (error.response) {
    // The server responded with a status code outside the 2xx range
    const status = error.response.status;
    const responseData = error.response.data as any;

    return {
      status,
      message: responseData?.message || getDefaultErrorMessage(status),
      code: responseData?.code || `ERR_${status}`,
      details: responseData?.data || responseData,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      status: 0,
      message: "Network error. Please check your internet connection.",
      code: "ERR_NETWORK",
    };
  } else {
    // Something happened in setting up the request
    return {
      status: 0,
      message: error.message || "An unexpected error occurred",
      code: "ERR_UNKNOWN",
    };
  }
};

/**
 * Returns a default error message based on HTTP status code
 * @param status HTTP status code
 * @returns A user-friendly error message
 */
const getDefaultErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return "The information you provided is invalid or incomplete. Please check and try again.";
    case 401:
      return "Your session has expired. Please log in again to continue.";
    case 403:
      return "You don't have permission to access this feature. Please contact support if you need access.";
    case 404:
      return "We couldn't find what you're looking for. It may have been moved or deleted.";
    case 409:
      return "There was a conflict with your request. Someone may have updated this information already.";
    case 422:
      return "We couldn't process your request due to validation errors. Please check your information.";
    case 429:
      return "You've made too many requests. Please wait a moment before trying again.";
    case 500:
      return "Something went wrong on our end. We're working to fix it. Please try again later.";
    case 503:
      return "Our service is temporarily unavailable. Please try again in a few minutes.";
    default:
      return "Something unexpected happened. Please try again or contact support if the issue persists.";
  }
};

/**
 * Utility function to extract error message from various error formats
 * @param error Any error object
 * @returns A user-friendly error message string
 */
export const resolveError = (error: any): string => {
  if (!error) return "An unknown error occurred";

  // Handle ApiError objects
  if (error.status && error.message) {
    return error.message;
  }

  // Handle Axios errors
  if (error.isAxiosError) {
    const apiError = handleApiError(error as AxiosError);
    return apiError.message;
  }

  // Handle standard Error objects
  if (error.message) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Default fallback
  return "An unexpected error occurred";
};

// Add a new function to get user-friendly action suggestions based on error type
export const getErrorActionSuggestion = (error: ApiError): string => {
  switch (error.status) {
    case 0: // Network error
      return "Check your internet connection and try again.";
    case 401:
      return "Please log in again to continue.";
    case 403:
      return "You may need additional permissions to access this feature.";
    case 404:
      return "Try navigating back and searching for what you need.";
    case 422:
      return "Please review your information and correct any errors.";
    case 429:
      return "Please wait a moment before trying again.";
    case 500:
    case 503:
      return "Try again later or contact support if the issue persists.";
    default:
      return "Try again or contact support if the issue continues.";
  }
};
