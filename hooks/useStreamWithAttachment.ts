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
import { Platform, PermissionsAndroid, Alert } from "react-native";

/**
 * Hook for preparing a livestream with Agora RTC
 * with additional functionality for tracking viewer count
 */
export const useStreamWithAttachment = ({
  appId,
  channel,
  token,
  userId,
  enableVideo = true,
  autoJoin = true,
}: {
  appId: string;
  channel: string;
  token: string | null;
  userId: string;
  enableVideo?: boolean;
  autoJoin?: boolean;
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [joinChannelSuccess, setJoinChannelSuccess] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<number[]>([]);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [tokenError, setTokenError] = useState(false);

  // Add state for tracking viewer count
  const [viewerCount, setViewerCount] = useState(0);
  const viewersRef = useRef<Set<number | string>>(new Set());

  // Create the engine instance
  const engine = useRef<IRtcEngineEx>(createAgoraRtcEngine() as IRtcEngineEx);

  /**
   * Request camera and microphone permissions
   */
  const requestPermissions = useCallback(async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          granted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          log.info("Camera and microphone permissions granted");
          return true;
        } else {
          log.error("Camera and microphone permissions denied");
          Alert.alert(
            "Permissions Required",
            "Camera and microphone permissions are required for livestreaming.",
            [{ text: "OK" }]
          );
          return false;
        }
      } catch (err) {
        log.error("Error requesting permissions:", err);
        return false;
      }
    } else if (Platform.OS === "ios") {
      // iOS permissions are handled at the app level through Info.plist
      return true;
    }
    return false;
  }, []);

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

      // Enable audio
      engine.current.enableAudio();

      if (enableVideo) {
        // Enable video
        engine.current.enableVideo();

        // Start preview - this is important for seeing the camera without joining
        engine.current.startPreview();
        log.debug("Camera preview started");
      }

      setIsInitialized(true);
      log.debug("RTC Engine initialized successfully");
      return true;
    } catch (error) {
      log.error("Failed to initialize Agora engine:", error);
      return false;
    }
  }, [appId, enableVideo]);

  /**
   * Join the channel
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
      setTokenError(true);
      return;
    }

    if (!userId) {
      log.error("userId is invalid");
      return;
    }

    try {
      log.info(`Joining channel '${channel}' with userID ${userId}`);
      setTokenError(false);

      // Join the channel with user account
      engine.current.joinChannelWithUserAccount(token, channel, userId, {
        // Set as broadcaster for livestreaming
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (error) {
      log.error("Failed to join channel:", error);
    }
  }, [isInitialized, channel, token, userId]);

  /**
   * Renew the token when it's about to expire
   */
  const renewToken = useCallback(
    (newToken: string) => {
      if (!isInitialized) {
        log.error("Engine not initialized");
        return;
      }

      try {
        engine.current.renewToken(newToken);
        log.info("Token renewed successfully");
        setTokenError(false);
      } catch (error) {
        log.error("Failed to renew token:", error);
        setTokenError(true);
      }
    },
    [isInitialized]
  );

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

  /**
   * Toggle microphone
   */
  const toggleMicrophone = useCallback(() => {
    if (!isInitialized) return;

    try {
      engine.current.muteLocalAudioStream(isMicEnabled);
      setIsMicEnabled(!isMicEnabled);
      log.debug(`Microphone ${!isMicEnabled ? "enabled" : "disabled"}`);
    } catch (error) {
      log.error("Failed to toggle microphone:", error);
    }
  }, [isInitialized, isMicEnabled]);

  /**
   * Toggle camera
   */
  const toggleCamera = useCallback(() => {
    if (!isInitialized) return;

    try {
      engine.current.muteLocalVideoStream(isCameraEnabled);
      setIsCameraEnabled(!isCameraEnabled);
      log.debug(`Camera ${!isCameraEnabled ? "enabled" : "disabled"}`);
    } catch (error) {
      log.error("Failed to toggle camera:", error);
    }
  }, [isInitialized, isCameraEnabled]);

  /**
   * Switch between front and back camera
   */
  const switchCamera = useCallback(() => {
    if (!isInitialized || !isCameraEnabled) return;

    try {
      engine.current.switchCamera();
      setIsFrontCamera(!isFrontCamera);
      log.debug(`Switched to ${!isFrontCamera ? "front" : "back"} camera`);
    } catch (error) {
      log.error("Failed to switch camera:", error);
    }
  }, [isInitialized, isCameraEnabled, isFrontCamera]);

  // Event handlers
  const onError = useCallback((err: ErrorCodeType, msg: string) => {
    log.error("Agora error:", err, msg);

    // Handle token expiration errors
    if (err === 109 || err === 110) {
      log.warn("Token expired or invalid");
      setTokenError(true);
      setJoinChannelSuccess(false);
    }
  }, []);

  const onJoinChannelSuccess = useCallback(
    (connection: RtcConnection, elapsed: number) => {
      log.info(
        "Successfully joined channel:",
        connection.channelId,
        "with local UID:",
        connection.localUid
      );

      // Don't check the UID, just check the channel ID
      // The localUid might be different from userId due to how Agora assigns UIDs
      if (connection.channelId === channel) {
        log.info("Setting joinChannelSuccess to true");
        setJoinChannelSuccess(true);
        setTokenError(false);

        // Add ourselves to the viewer count
        viewersRef.current.add(userId || "broadcaster");
        setViewerCount(viewersRef.current.size);
      } else {
        log.warn(
          "Channel ID mismatch:",
          connection.channelId,
          "expected:",
          channel
        );
      }
    },
    [channel, userId]
  );

  const onLeaveChannel = useCallback(
    (connection: RtcConnection, stats: RtcStats) => {
      log.info("Left channel:", connection.channelId);
      if (connection.channelId === channel) {
        setJoinChannelSuccess(false);
        setRemoteUsers([]);

        // Clear viewer count when leaving channel
        viewersRef.current.clear();
        setViewerCount(0);
      }
    },
    [channel]
  );

  const onUserJoined = useCallback(
    (connection: RtcConnection, remoteUid: number, elapsed: number) => {
      log.debug("Remote user joined:", remoteUid);
      if (connection.channelId === channel) {
        setRemoteUsers((prev) => [...prev, remoteUid]);

        // Add to viewer count
        viewersRef.current.add(remoteUid);
        setViewerCount(viewersRef.current.size);
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
      log.debug("Remote user left:", remoteUid);
      if (connection.channelId === channel) {
        setRemoteUsers((prev) => prev.filter((uid) => uid !== remoteUid));

        // Remove from viewer count
        viewersRef.current.delete(remoteUid);
        setViewerCount(viewersRef.current.size);
      }
    },
    [channel]
  );

  const onUserInfoUpdated = useCallback((uid: number, userInfo: any) => {
    log.info(`User info updated: ${uid}`, userInfo);
  }, []);

  // Initialize the engine when the component mounts
  useEffect(() => {
    const setup = async () => {
      const hasPermissions = await requestPermissions();
      if (hasPermissions) {
        await initializeEngine();
      }
    };

    setup();

    // Cleanup when the component unmounts
    return () => {
      try {
        engine.current.leaveChannel();
        engine.current.release();
      } catch (error) {
        log.error("Error during cleanup:", error);
      }
    };
  }, [requestPermissions, initializeEngine]);

  // Register event handlers
  useEffect(() => {
    if (!isInitialized) return;

    engine.current.addListener("onError", onError);
    engine.current.addListener("onJoinChannelSuccess", onJoinChannelSuccess);
    engine.current.addListener("onLeaveChannel", onLeaveChannel);
    engine.current.addListener("onUserJoined", onUserJoined);
    engine.current.addListener("onUserOffline", onUserOffline);
    engine.current.addListener("onUserInfoUpdated", onUserInfoUpdated);

    return () => {
      engine.current.removeListener("onError", onError);
      engine.current.removeListener(
        "onJoinChannelSuccess",
        onJoinChannelSuccess
      );
      engine.current.removeListener("onLeaveChannel", onLeaveChannel);
      engine.current.removeListener("onUserJoined", onUserJoined);
      engine.current.removeListener("onUserOffline", onUserOffline);
      engine.current.removeListener("onUserInfoUpdated", onUserInfoUpdated);
    };
  }, [
    isInitialized,
    onError,
    onJoinChannelSuccess,
    onLeaveChannel,
    onUserJoined,
    onUserOffline,
    onUserInfoUpdated,
  ]);

  // Join channel when token is available (if autoJoin is true)
  useEffect(() => {
    if (
      isInitialized &&
      token &&
      channel &&
      userId &&
      !joinChannelSuccess &&
      autoJoin
    ) {
      joinChannel();
    }
  }, [
    isInitialized,
    token,
    channel,
    userId,
    joinChannelSuccess,
    joinChannel,
    autoJoin,
  ]);

  // Set initial count when joining channel
  useEffect(() => {
    if (joinChannelSuccess) {
      viewersRef.current.add(userId || "broadcaster");
      setViewerCount(viewersRef.current.size);
    }
  }, [joinChannelSuccess, userId]);

  return {
    engine: engine.current,
    isInitialized,
    joinChannelSuccess,
    remoteUsers,
    isMicEnabled,
    isCameraEnabled,
    isFrontCamera,
    tokenError,
    toggleMicrophone,
    toggleCamera,
    switchCamera,
    joinChannel,
    renewToken,
    leaveChannel,
    // Viewer count functionality
    viewerCount,
    refreshViewerCount: () => setViewerCount(viewersRef.current.size),
  };
};
