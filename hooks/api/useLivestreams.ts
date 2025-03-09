import { useState } from "react";

// Types for livestream data
export interface LivestreamFormData {
  title: string;
  startTime: string;
  endTime: string;
  account: string;
  thumbnail?: string;
  products: string[];
}

export interface LivestreamResponse {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "live" | "ended" | "cancelled";
  thumbnail?: string;
  products: string[];
  createdAt: string;
  updatedAt: string;
}

export default function useLivestreams() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new livestream
  const createLivestream = async (
    data: LivestreamFormData
  ): Promise<LivestreamResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/livestreams`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add authorization header if needed
            // "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create livestream");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error("Error creating livestream:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all livestreams
  const getLivestreams = async (): Promise<LivestreamResponse[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/livestreams`,
        {
          method: "GET",
          headers: {
            // Add authorization header if needed
            // "Authorization": `Bearer ${token}`
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch livestreams");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error("Error fetching livestreams:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get a specific livestream by ID
  const getLivestreamById = async (
    id: string
  ): Promise<LivestreamResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/livestreams/${id}`,
        {
          method: "GET",
          headers: {
            // Add authorization header if needed
            // "Authorization": `Bearer ${token}`
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch livestream");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error("Error fetching livestream:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createLivestream,
    getLivestreams,
    getLivestreamById,
  };
}
