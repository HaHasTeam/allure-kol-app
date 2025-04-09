import { useState, useEffect, useRef } from "react";
import { useViewerStream } from "./useViewerStream";
import { log } from "@/utils/logger";
import type { RtcConnection } from "react-native-agora";

/**
 * Hook that extends useViewerStream with additional functionality
 * for tracking viewer count and other stream attachments
 */
export const useViewerStreamAttachment = ({
  appId,
  channel,
  token,
  userId,
}: {
  appId: string;
  channel: string;
  token: string | null;
  userId: string;
}) => {
  // Use the base viewer stream hook
  const viewerStream = useViewerStream({
    appId,
    channel,
    token,
    userId,
  });

  // Add state for tracking viewer count
  const [viewerCount, setViewerCount] = useState(0);
  const viewersRef = useRef<Set<number | string>>(new Set());

  // Set up event listeners for user joined/left events to update viewer count
  useEffect(() => {
    if (!viewerStream.isInitialized || !viewerStream.engine) return;

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

    // Track when we join the channel (to count ourselves)
    const onJoinChannelSuccess = (
      connection: RtcConnection,
      elapsed: number
    ) => {
      if (connection.channelId === channel) {
        // Add ourselves to the count
        viewersRef.current.add(userId);
        setViewerCount(viewersRef.current.size);
      }
    };

    // Add listeners
    viewerStream.engine.addListener("onUserJoined", onUserJoined);
    viewerStream.engine.addListener("onUserOffline", onUserOffline);
    viewerStream.engine.addListener("onUserInfoUpdated", onUserInfoUpdated);
    viewerStream.engine.addListener(
      "onJoinChannelSuccess",
      onJoinChannelSuccess
    );

    // Set initial count (at least 1 for ourselves)
    if (viewerStream.joinChannelSuccess) {
      viewersRef.current.add(userId);
      setViewerCount(viewersRef.current.size);
    }

    // If host is already connected, add them to the count
    if (viewerStream.hostUid) {
      viewersRef.current.add(viewerStream.hostUid);
      setViewerCount(viewersRef.current.size);
    }

    return () => {
      viewerStream.engine.removeListener("onUserJoined", onUserJoined);
      viewerStream.engine.removeListener("onUserOffline", onUserOffline);
      viewerStream.engine.removeListener(
        "onUserInfoUpdated",
        onUserInfoUpdated
      );
      viewerStream.engine.removeListener(
        "onJoinChannelSuccess",
        onJoinChannelSuccess
      );
    };
  }, [
    viewerStream.isInitialized,
    viewerStream.engine,
    viewerStream.joinChannelSuccess,
    viewerStream.hostUid,
    channel,
    userId,
  ]);

  // Return the base hook properties along with viewer count
  return {
    ...viewerStream,
    viewerCount,
    // Add a method to manually refresh the count (for testing)
    refreshViewerCount: () => setViewerCount(viewersRef.current.size),
  };
};
