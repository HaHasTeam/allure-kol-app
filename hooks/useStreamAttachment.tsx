"use client";

import { useState, useEffect, useRef } from "react";
import { log } from "@/utils/logger";
import type { RtcConnection } from "react-native-agora";

/**
 * Hook that extends streaming hooks with additional functionality
 * for tracking viewer count and other stream attachments
 */
export const useStreamAttachment = (
  engine: any,
  channel: string,
  isInitialized: boolean,
  joinChannelSuccess: boolean
) => {
  // Add state for tracking viewer count
  const [viewerCount, setViewerCount] = useState(0);
  const viewersRef = useRef<Set<number | string>>(new Set());

  // Set up event listeners for user joined/left events to update viewer count
  useEffect(() => {
    if (!isInitialized || !engine) return;

    // Track users joining the channel
    const onUserJoined = (
      connection: RtcConnection,
      uid: number,
      elapsed: number
    ) => {
      if (connection.channelId === channel) {
        log.info(`User joined: ${uid}`);
        viewersRef.current.add(uid);
        setViewerCount(viewersRef.current.size);
      }
    };

    // Track users leaving the channel
    const onUserOffline = (
      connection: RtcConnection,
      uid: number,
      reason: number
    ) => {
      if (connection.channelId === channel) {
        log.info(`User left: ${uid}, reason: ${reason}`);
        viewersRef.current.delete(uid);
        setViewerCount(viewersRef.current.size);
      }
    };

    // Track user account changes
    const onUserInfoUpdated = (uid: number, userInfo: any) => {
      log.info(`User info updated: ${uid}`, userInfo);
    };

    // Add listeners
    engine.addListener("onUserJoined", onUserJoined);
    engine.addListener("onUserOffline", onUserOffline);
    engine.addListener("onUserInfoUpdated", onUserInfoUpdated);

    // Set initial count to 1 (the broadcaster)
    if (joinChannelSuccess) {
      viewersRef.current.add("broadcaster");
      setViewerCount(viewersRef.current.size);
    }

    return () => {
      engine.removeListener("onUserJoined", onUserJoined);
      engine.removeListener("onUserOffline", onUserOffline);
      engine.removeListener("onUserInfoUpdated", onUserInfoUpdated);
    };
  }, [isInitialized, engine, joinChannelSuccess, channel]);

  // Return the viewer count and a method to refresh it
  return {
    viewerCount,
    refreshViewerCount: () => setViewerCount(viewersRef.current.size),
  };
};
