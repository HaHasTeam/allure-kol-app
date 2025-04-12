"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ClientRoleType,
  type IRtcEngineEx,
  type RtcConnection,
  type ErrorCodeType,
  type UserOfflineReasonType,
  type RtcStats,
} from "react-native-agora";
import createAgoraRtcEngine from "react-native-agora";
import { log } from "../utils/logger";

/**
 * Hook for viewers to watch a livestream
 */
export const useViewerStream = ({
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [joinChannelSuccess, setJoinChannelSuccess] = useState(false);
  const [hostUid, setHostUid] = useState<number | null>(null);
  const [isHostVideoEnabled, setIsHostVideoEnabled] = useState(false);
  const [isHostAudioEnabled, setIsHostAudioEnabled] = useState(false);

  // Create the engine instance
  const engine = useRef<IRtcEngineEx>(createAgoraRtcEngine() as IRtcEngineEx);

  /**
   * Initialize the RTC Engine
   */
  const initializeEngine = useCallback(async () => {
    if (!appId) {
      log.error("appId is invalid");
      return false;
    }

    try {
      // Initialize the engine
      engine.current.initialize({
        appId,
        // Should use ChannelProfileLiveBroadcasting for livestreaming
        channelProfile: 1, // ChannelProfileLiveBroadcasting
      });

      // Enable audio and video for receiving
      engine.current.enableAudio();
      engine.current.enableVideo();

      setIsInitialized(true);
      log.debug("RTC Engine initialized successfully for viewer");
      return true;
    } catch (error) {
      log.error("Failed to initialize Agora engine for viewer:", error);
      return false;
    }
  }, [appId]);

  /**
   * Join the channel as audience
   */
  const joinChannel = useCallback(() => {
    if (!isInitialized) {
      log.error("Engine not initialized");
      return;
    }

    if (!channel) {
      log.error("channelId is invalid");
      return;
    }

    if (!token) {
      log.error("token is invalid");
      return;
    }

    if (!userId) {
      log.error("userId is invalid");
      return;
    }

    try {
      log.info(
        `Joining channel '${channel}' as audience with userID ${userId}`
      );

      // Join the channel with user account as audience
      engine.current.joinChannelWithUserAccount(token, channel, userId, {
        // Set as audience for view-only
        clientRoleType: ClientRoleType.ClientRoleAudience,
      });
    } catch (error) {
      log.error("Failed to join channel as audience:", error);
    }
  }, [isInitialized, channel, token, userId]);

  /**
   * Leave the channel
   */
  const leaveChannel = useCallback(() => {
    if (!isInitialized) return;

    try {
      engine.current.leaveChannel();
      log.info("Left channel");
    } catch (error) {
      log.error("Failed to leave channel:", error);
    }
  }, [isInitialized]);

  // Event handlers
  const onError = useCallback((err: ErrorCodeType, msg: string) => {
    log.error("Agora error:", err, msg);
  }, []);

  const onJoinChannelSuccess = useCallback(
    (connection: RtcConnection, elapsed: number) => {
      log.info(
        "Successfully joined channel as viewer:",
        connection.channelId,
        channel
      );
      if (connection.channelId === channel) {
        setJoinChannelSuccess(true);
      }
    },
    [channel]
  );

  const onLeaveChannel = useCallback(
    (connection: RtcConnection, stats: RtcStats) => {
      log.info("Left channel as viewer:", connection.channelId);
      if (connection.channelId === channel) {
        setJoinChannelSuccess(false);
        setHostUid(null);
        setIsHostVideoEnabled(false);
        setIsHostAudioEnabled(false);
      }
    },
    [channel]
  );

  const onUserJoined = useCallback(
    (connection: RtcConnection, remoteUid: number, elapsed: number) => {
      log.debug("Host joined:", remoteUid);
      if (connection.channelId === channel) {
        // Assuming the first broadcaster is the host
        setHostUid(remoteUid);
      }
    },
    [channel]
  );

  const onUserOffline = useCallback(
    (
      connection: RtcConnection,
      remoteUid: number,
      reason: UserOfflineReasonType
    ) => {
      log.debug("Host left:", remoteUid);
      if (connection.channelId === channel && remoteUid === hostUid) {
        setHostUid(null);
      }
    },
    [channel, hostUid]
  );

  const onRemoteVideoStateChanged = useCallback(
    (connection: RtcConnection, remoteUid: number, state: number) => {
      if (connection.channelId === channel && remoteUid === hostUid) {
        // State 2 means the remote video is playing
        setIsHostVideoEnabled(state === 2);
      }
    },
    [channel, hostUid]
  );

  const onRemoteAudioStateChanged = useCallback(
    (connection: RtcConnection, remoteUid: number, state: number) => {
      if (connection.channelId === channel && remoteUid === hostUid) {
        // State 2 means the remote audio is playing
        setIsHostAudioEnabled(state === 2);
      }
    },
    [channel, hostUid]
  );

  // Initialize the engine when the component mounts
  useEffect(() => {
    initializeEngine();

    // Cleanup when the component unmounts
    return () => {
      try {
        engine.current.leaveChannel();
        engine.current.release();
      } catch (error) {
        log.error("Error during cleanup:", error);
      }
    };
  }, [initializeEngine]);

  // Register event handlers
  useEffect(() => {
    if (!isInitialized) return;

    engine.current.addListener("onError", onError);
    engine.current.addListener("onJoinChannelSuccess", onJoinChannelSuccess);
    engine.current.addListener("onLeaveChannel", onLeaveChannel);
    engine.current.addListener("onUserJoined", onUserJoined);
    engine.current.addListener("onUserOffline", onUserOffline);
    engine.current.addListener(
      "onRemoteVideoStateChanged",
      onRemoteVideoStateChanged
    );
    engine.current.addListener(
      "onRemoteAudioStateChanged",
      onRemoteAudioStateChanged
    );

    return () => {
      engine.current.removeListener("onError", onError);
      engine.current.removeListener(
        "onJoinChannelSuccess",
        onJoinChannelSuccess
      );
      engine.current.removeListener("onLeaveChannel", onLeaveChannel);
      engine.current.removeListener("onUserJoined", onUserJoined);
      engine.current.removeListener("onUserOffline", onUserOffline);
      engine.current.removeListener(
        "onRemoteVideoStateChanged",
        onRemoteVideoStateChanged
      );
      engine.current.removeListener(
        "onRemoteAudioStateChanged",
        onRemoteAudioStateChanged
      );
    };
  }, [
    isInitialized,
    onError,
    onJoinChannelSuccess,
    onLeaveChannel,
    onUserJoined,
    onUserOffline,
    onRemoteVideoStateChanged,
    onRemoteAudioStateChanged,
  ]);

  // Join channel when token is available
  useEffect(() => {
    if (isInitialized && token && channel && userId && !joinChannelSuccess) {
      joinChannel();
    }
  }, [isInitialized, token, channel, userId, joinChannelSuccess, joinChannel]);

  return {
    engine: engine.current,
    isInitialized,
    joinChannelSuccess,
    hostUid,
    isHostVideoEnabled,
    isHostAudioEnabled,
    joinChannel,
    leaveChannel,
  };
};
