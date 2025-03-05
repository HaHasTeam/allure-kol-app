import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { log } from "./logger";

// Token keys
export const ACCESS_TOKEN = "accessToken";
export const REFRESH_TOKEN = "refreshToken";

/**
 * Refreshes the access token using the refresh token
 * @returns Promise with the new access token or null if refresh failed
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN);

    if (!refreshToken) {
      log.warn("No refresh token available");
      return null;
    }

    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.data?.accessToken) {
      const newAccessToken = response.data.data.accessToken;

      // Store the new access token
      await AsyncStorage.setItem(ACCESS_TOKEN, newAccessToken);

      log.info("Access token refreshed successfully");
      return newAccessToken;
    }

    return null;
  } catch (error) {
    log.error("Failed to refresh access token:", error);
    return null;
  }
};

/**
 * Clears all authentication tokens from storage
 */
export const clearAuthTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      ACCESS_TOKEN,
      REFRESH_TOKEN,
      "firebaseToken",
    ]);
    log.info("Auth tokens cleared");
  } catch (error) {
    log.error("Error clearing auth tokens:", error);
  }
};
