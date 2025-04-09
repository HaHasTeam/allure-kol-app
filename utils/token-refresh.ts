import { log } from "./logger";
import type { ClientRoleType } from "react-native-agora";

/**
 * Utility function to refresh an Agora token
 * @param livestreamId The ID of the livestream
 * @param role The role (broadcaster or audience)
 * @param expirationTime Token expiration time in seconds
 * @param getLivestreamToken The API function to call for token refresh
 */
export const refreshAgoraToken = async (
  livestreamId: string,
  role: ClientRoleType,
  expirationTime = 3600,
  getLivestreamToken: (
    id: string,
    role: ClientRoleType,
    expiration: number
  ) => Promise<any>
): Promise<string | null> => {
  try {
    log.info(`Refreshing token for livestream ${livestreamId}`);
    const result = await getLivestreamToken(livestreamId, role, expirationTime);
    console.log("====================================");
    console.log(result);
    console.log("====================================");
    if (result && result.data) {
      log.info("Token refreshed successfully");
      return result.data;
    } else {
      log.error("Failed to refresh token: Invalid response format");
      return null;
    }
  } catch (error) {
    log.error("Error refreshing token:", error);
    return null;
  }
};
