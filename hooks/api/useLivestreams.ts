"use client";

import { useCallback } from "react";
import { GET, POST, PUT, DELETE } from "@/utils/api.caller";
import { useApi } from "./useApi";
import type { ApiError } from "@/utils/error-handler";
import { ClientRoleType } from "react-native-agora";
import { LiveStreamEnum } from "@/types/enum";
export interface TokenResponse {
  token: string;
}

// Types for livestream data
export interface LivestreamFormData {
  title: string;
  startTime: string;
  endTime: string;
  account: string;
  thumbnail?: string;
  products: string[];
  status?: string;
}
// Define token request and response types
export interface TokenRequestParams {
  channelName: string;
  role: ClientRoleType;
  privilegeExpirationInSecond: number;
}
export interface LivestreamResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  startTime: string;
  endTime: string;
  record: string | null;
  thumbnail: string | null;
  status: LiveStreamEnum;
}

// Define filter parameters type for livestreams
export interface LivestreamFilterParams {
  search?: string;
  sortBy?: string;
  order?: "ASC" | "DESC";
  limit?: number;
  page?: number;
  status?: "scheduled" | "live" | "ended" | "cancelled";
  startDate?: string;
  endDate?: string;
}

const useLivestreams = () => {
  const { execute } = useApi();
  const rootEndpoint = "/livestreams";

  /**
   * Create a new livestream
   * @param data Livestream form data
   * @returns Created livestream or null
   */
  const createLivestream = useCallback(
    async (data: LivestreamFormData) => {
      try {
        const result = await execute<{
          data: {
            data: LivestreamResponse;
          };
        }>(() => POST(rootEndpoint, data), {
          onError: (error: ApiError) => {
            console.error("Failed to create livestream:", error.message);
          },
        });

        return result?.data || null;
      } catch (error) {
        console.error("Error in createLivestream:", error);
        return null;
      }
    },
    [execute]
  );

  /**
   * Get all livestreams with optional filtering
   * @param params Filter parameters
   * @returns Filtered livestreams or null
   */
  const getLivestreams = useCallback(
    async (params: LivestreamFilterParams = {}) => {
      try {
        // Build query string from params
        const queryParams = new URLSearchParams();

        // Set default page and limit if not provided
        const page = params.page || 1;
        const limit = params.limit || 10;

        // Add all non-undefined params to the query string
        Object.entries({
          ...params,
          page,
          limit,
        }).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });

        const queryString = queryParams.toString();
        const endpoint = `${rootEndpoint}${
          queryString ? `?${queryString}` : ""
        }`;

        const result = await execute<{
          data: {
            data: LivestreamResponse[];
            // data: { items: LivestreamResponse[]; total: number };
          };
        }>(() => GET(endpoint), {
          onError: (error: ApiError) => {
            console.error("Failed to fetch livestreams:", error.message);
          },
        });

        return result || null;
      } catch (error) {
        console.error("Error in getLivestreams:", error);
        return null;
      }
    },
    [execute]
  );

  /**
   * Get a specific livestream by ID
   * @param id Livestream ID
   * @returns Livestream details or null
   */
  const getLivestreamById = useCallback(
    async (id: string) => {
      try {
        const result = await execute<{
          data: {
            data: LivestreamResponse;
          };
        }>(() => GET(`${rootEndpoint}/get-by-id/${id}`), {
          onError: (error: ApiError) => {
            console.error(
              `Failed to fetch livestream with ID ${id}:`,
              error.message
            );
          },
        });

        return result?.data?.data || null;
      } catch (error) {
        console.error("Error in getLivestreamById:", error);
        return null;
      }
    },
    [execute]
  );

  /**
   * Update an existing livestream
   * @param id Livestream ID
   * @param data Updated livestream data
   * @returns Updated livestream or null
   */
  const updateLivestream = useCallback(
    async (id: string, data: Partial<LivestreamFormData>) => {
      try {
        const result = await execute<{
          data: {
            data: LivestreamResponse;
          };
        }>(() => PUT(`${rootEndpoint}/${id}`, data), {
          onError: (error: ApiError) => {
            console.error(
              `Failed to update livestream with ID ${id}:`,
              error.message
            );
          },
        });

        return result?.data?.data || null;
      } catch (error) {
        console.error("Error in updateLivestream:", error);
        return null;
      }
    },
    [execute]
  );

  /**
   * Delete a livestream
   * @param id Livestream ID
   * @returns Success status
   */
  const deleteLivestream = useCallback(
    async (id: string) => {
      try {
        const result = await execute<{
          data: {
            success: boolean;
          };
        }>(() => DELETE(`${rootEndpoint}/${id}`), {
          onError: (error: ApiError) => {
            console.error(
              `Failed to delete livestream with ID ${id}:`,
              error.message
            );
          },
        });

        return result?.data?.success || false;
      } catch (error) {
        console.error("Error in deleteLivestream:", error);
        return false;
      }
    },
    [execute]
  );
  /**
   * Get a token for livestream broadcasting
   * @param livestreamId The ID of the livestream to use as the channel name
   * @param role The role of the user (PUBLISHER or SUBSCRIBER)
   * @param expirationInSeconds Token expiration time in seconds (default: 3600)
   * @returns Token string or null
   */
  const getLivestreamToken = useCallback(
    async (
      livestreamId: string,
      role: ClientRoleType = ClientRoleType.ClientRoleBroadcaster,
      expirationInSeconds = 3600
    ) => {
      try {
        const privilegeExpiredTs =
          Math.floor(Date.now() / 1000) + expirationInSeconds;

        const requestData: TokenRequestParams = {
          channelName: livestreamId,
          role: role,
          privilegeExpirationInSecond: privilegeExpiredTs,
        };

        const result = await execute<{
          data: {
            data: string;
          };
        }>(() => POST(`${rootEndpoint}/token`, requestData), {
          onError: (error: ApiError) => {
            console.error(
              `Failed to get token for livestream ${livestreamId}:`,
              error.message
            );
          },
        });

        return result?.data || null;
      } catch (error) {
        console.error("Error in getLivestreamToken:", error);
        return null;
      }
    },
    [execute]
  );
  return {
    createLivestream,
    getLivestreams,
    getLivestreamById,
    updateLivestream,
    deleteLivestream,
    getLivestreamToken,
  };
};

export default useLivestreams;
