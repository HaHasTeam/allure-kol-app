"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  FlatList,
  TextInput,
  BackHandler,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import type { FlatList as FlatListType } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { RtcSurfaceView, ClientRoleType } from "react-native-agora";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";

import { myTheme } from "@/constants/index";
import { useStreamPreparation } from "@/hooks/useStreamPreparation";
import { refreshAgoraToken } from "@/utils/token-refresh";
import useLivestreams from "@/hooks/api/useLivestreams";
import { log } from "@/utils/logger";
import config from "@/constants/agora.config";

const { width, height } = Dimensions.get("window");

// Mock data for chat messages
const MOCK_MESSAGES = [
  {
    id: "1",
    user: "John Doe",
    message: "Love your content! Can you talk about summer trends?",
    avatar: "JD",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).getTime(),
  },
  {
    id: "2",
    user: "Alice Smith",
    message: "Just bought the lipstick you recommended last week!",
    avatar: "AS",
    timestamp: new Date(Date.now() - 1000 * 60 * 3).getTime(),
  },
  {
    id: "3",
    user: "Robert Johnson",
    message: "When is your next collaboration coming?",
    avatar: "RJ",
    timestamp: new Date(Date.now() - 1000 * 60 * 1).getTime(),
  },
  {
    id: "4",
    user: "Emma Wilson",
    message: "That shade looks amazing on you!",
    avatar: "EW",
    timestamp: new Date(Date.now() - 1000 * 30).getTime(),
  },
  {
    id: "5",
    user: "Michael Brown",
    message: "Is this product good for sensitive skin?",
    avatar: "MB",
    timestamp: new Date(Date.now() - 1000 * 10).getTime(),
  },
];

// Token refresh interval in milliseconds (refresh every 30 minutes)
const TOKEN_REFRESH_INTERVAL = 30 * 60 * 1000;

export default function LiveStreamingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  const [isEndingStream, setIsEndingStream] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(
    params.token as string
  );
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const chatListRef = useRef<
    FlatListType<{
      id: string;
      user: string;
      message: string;
      avatar: string;
      timestamp: number;
    }>
  >(null);

  // Animation values
  const chatWidth = useSharedValue(width);
  const chatOpacity = useSharedValue(1);
  const controlsOpacity = useSharedValue(1);
  const fabScale = useSharedValue(1);

  // Get params
  const livestreamId = params.id as string;
  const streamTitle = params.title as string;
  const channel = params.channel as string;
  const userId = params.userId as string;
  const { getLivestreamToken } = useLivestreams();

  // Token refresh timer
  const tokenRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Agora engine with our improved hook
  const {
    engine,
    isInitialized,
    joinChannelSuccess,
    isMicEnabled,
    isCameraEnabled,
    toggleMicrophone,
    toggleCamera,
    switchCamera,
    joinChannel,
    leaveChannel,
  } = useStreamPreparation({
    appId: config.appId, // Replace with your Agora App ID
    channel: channel,
    token: currentToken,
    userId: userId,
    enableVideo: true,
    autoJoin: true, // Auto join for the live screen
  });

  // Function to refresh the token
  const handleTokenRefresh = useCallback(async () => {
    console.log("newToken");

    setIsRefreshingToken(true);
    setTokenError(false);

    try {
      const newToken = await refreshAgoraToken(
        livestreamId,
        ClientRoleType.ClientRoleBroadcaster,
        3600,
        getLivestreamToken
      );
      console.log("newToken", newToken);

      if (newToken) {
        log.info("Successfully refreshed token");
        setCurrentToken(newToken);

        // If we're already connected, we need to renew the token in the engine
        if (isInitialized && engine) {
          const res = engine.renewToken(newToken);
          log.info("Token renewed in Agora engine", res);
        } else if (isInitialized && !joinChannelSuccess) {
          // If we're initialized but not connected, try to join with the new token
          joinChannel();
        }
      } else {
        log.error("Failed to refresh token");
        setTokenError(true);
        Alert.alert(
          "Token Error",
          "Failed to refresh streaming token. The stream may end soon.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      log.error("Error in token refresh:", error);
      setTokenError(true);
    } finally {
      setIsRefreshingToken(false);
    }
  }, [
    isRefreshingToken,
    livestreamId,
    getLivestreamToken,
    isInitialized,
    engine,
    joinChannelSuccess,
    joinChannel,
  ]);

  // Add this after the handleTokenRefresh function

  /**
   * Proactively refresh the token before it expires
   * Agora tokens typically expire after the time specified when generating them (default 3600 seconds)
   * We'll refresh 5 minutes before expiration to be safe
   */
  const setupTokenRefreshSchedule = useCallback(() => {
    // Clear any existing refresh timer
    if (tokenRefreshTimerRef.current) {
      clearInterval(tokenRefreshTimerRef.current);
    }

    // Set up a new refresh timer - refresh every 55 minutes (if token expiration is 60 minutes)
    // This gives a 5-minute buffer before the token actually expires
    const REFRESH_INTERVAL = 55 * 60 * 1000; // 55 minutes in milliseconds

    tokenRefreshTimerRef.current = setInterval(() => {
      log.info("Proactively refreshing token before expiration");
      handleTokenRefresh();
    }, REFRESH_INTERVAL);

    return () => {
      if (tokenRefreshTimerRef.current) {
        clearInterval(tokenRefreshTimerRef.current);
      }
    };
  }, [handleTokenRefresh]);

  // Set up token refresh interval
  useEffect(() => {
    // Initial token refresh timer
    tokenRefreshTimerRef.current = setInterval(
      handleTokenRefresh,
      TOKEN_REFRESH_INTERVAL
    );

    return () => {
      if (tokenRefreshTimerRef.current) {
        clearInterval(tokenRefreshTimerRef.current);
      }
    };
  }, [handleTokenRefresh]);

  // Handle token errors from Agora
  useEffect(() => {
    if (isInitialized && engine) {
      const handleError = (errorCode: number, msg: string) => {
        log.error(`Agora error: ${errorCode}, ${msg}`);

        // Error codes related to token expiration
        // 109: token expired
        // 110: token invalid
        if (errorCode == 109 || errorCode == 110) {
          log.warn("Token expired or invalid, refreshing...");
          handleTokenRefresh();
        }
      };

      // Add error listener
      engine.addListener("onError", handleError);

      return () => {
        engine.removeListener("onError", handleError);
      };
    }
  }, [isInitialized, engine, handleTokenRefresh]);

  // Timer for stream duration
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls after inactivity
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetControlsTimer = () => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }

    controlsOpacity.value = withTiming(1, { duration: 200 });

    controlsTimerRef.current = setTimeout(() => {
      controlsOpacity.value = withTiming(0, { duration: 500 });
    }, 5000);
  };

  // Update the useEffect that sets up timers to include the token refresh schedule
  useEffect(() => {
    // Start timer for stream duration
    timerRef.current = setInterval(() => {
      setStreamDuration((prev) => prev + 1);
    }, 1000);

    // Set up token refresh schedule
    const cleanupTokenRefresh = setupTokenRefreshSchedule();

    // Simulate increasing viewer count
    // const viewerInterval = setInterval(() => {
    //   setViewerCount((prev) =>
    //     Math.min(prev + Math.floor(Math.random() * 3), 9999)
    //   );
    // }, 5000);

    // Set initial viewer count
    setViewerCount(Math.floor(Math.random() * 50) + 10);

    // Handle back button press
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Prevent going back with hardware button
        confirmEndStream();
        return true;
      }
    );

    // Initialize controls timer
    // resetControlsTimer();

    // // Simulate new messages coming in
    // const messageInterval = setInterval(() => {
    //   const randomMessages = [
    //     "This product looks amazing!",
    //     "How long does it last?",
    //     "What's the price?",
    //     "Love your makeup today!",
    //     "Is it available in other colors?",
    //     "When will you restock?",
    //     "Does it work for oily skin?",
    //     "You're so talented!",
    //     "❤️❤️❤️",
    //     "👏👏👏",
    //   ];

    //   const randomUsers = [
    //     { name: "Sarah", avatar: "SJ" },
    //     { name: "David", avatar: "DK" },
    //     { name: "Jessica", avatar: "JL" },
    //     { name: "Kevin", avatar: "KW" },
    //     { name: "Olivia", avatar: "OP" },
    //   ];

    //   const randomUser =
    //     randomUsers[Math.floor(Math.random() * randomUsers.length)];
    //   const randomMessage =
    //     randomMessages[Math.floor(Math.random() * randomMessages.length)];

    //   const newMsg = {
    //     id: Date.now().toString(),
    //     user: randomUser.name,
    //     message: randomMessage,
    //     avatar: randomUser.avatar,
    //     timestamp: Date.now(),
    //   };

    //   setMessages((prev) => [...prev, newMsg]);

    //   // Scroll to bottom
    //   if (chatListRef.current) {
    //     chatListRef.current?.scrollToEnd({ animated: true });
    //   }
    // }, 8000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      cleanupTokenRefresh();
      // clearInterval(viewerInterval);
      // clearInterval(messageInterval);
      backHandler.remove();
    };
  }, [setupTokenRefreshSchedule]);

  // Toggle chat visibility
  const toggleChat = () => {
    if (isChatVisible) {
      // Hide chat
      chatWidth.value = withTiming(0, { duration: 300 });
      chatOpacity.value = withTiming(0, { duration: 200 });
      setTimeout(() => setIsChatVisible(false), 300);
    } else {
      // Show chat
      setIsChatVisible(true);
      chatWidth.value = withTiming(width, { duration: 300 });
      chatOpacity.value = withTiming(1, { duration: 300 });
    }
    resetControlsTimer();
  };

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) {
      return "just now";
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else {
      return `${Math.floor(diff / 3600000)}h ago`;
    }
  };

  // Send a chat message
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      user: "You (Host)",
      message: newMessage.trim(),
      avatar: "ME",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Scroll to bottom
    if (chatListRef.current) {
      chatListRef.current?.scrollToEnd({ animated: true });
    }

    resetControlsTimer();
  };

  // Confirm ending the stream
  const confirmEndStream = () => {
    Alert.alert("End Stream", "Are you sure you want to end your livestream?", [
      { text: "Cancel", style: "cancel" },
      { text: "End Stream", style: "destructive", onPress: endStream },
    ]);
  };

  // End the livestream
  const endStream = async () => {
    setIsEndingStream(true);

    try {
      // In a real app, you would make an API call to update the livestream status
      // For example:
      // await updateLivestreamStatus(livestreamId, 'ended')

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clean up Agora connection
      if (isInitialized) {
        leaveChannel();
      }

      // Navigate to stream summary
      router.replace({
        pathname: "/(app)/(livestream)/stream-summary",
        params: {
          id: livestreamId,
          title: streamTitle,
          duration: streamDuration.toString(),
          viewers: viewerCount.toString(),
        },
      });
    } catch (error) {
      console.error("Error ending livestream:", error);
      Alert.alert("Error", "Failed to end livestream. Please try again.");
      setIsEndingStream(false);
    }
  };

  // Animated styles
  const chatContainerStyle = useAnimatedStyle(() => {
    return {
      width: chatWidth.value,
      opacity: chatOpacity.value,
    };
  });

  const controlsStyle = useAnimatedStyle(() => {
    return {
      opacity: controlsOpacity.value,
    };
  });

  const chatButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: fabScale.value }],
    };
  });

  // Handle chat button press animation
  const onChatButtonPressIn = () => {
    fabScale.value = withSpring(0.9);
  };

  const onChatButtonPressOut = () => {
    fabScale.value = withSpring(1);
  };

  // Manual token refresh button handler
  const onManualTokenRefresh = () => {
    handleTokenRefresh();
  };

  return (
    <View style={styles.container} onTouchStart={resetControlsTimer}>
      <StatusBar hidden />

      {/* Video Stream */}
      <View style={styles.videoContainer}>
        {isInitialized && !tokenError ? (
          isCameraEnabled ? (
            <RtcSurfaceView style={styles.videoView} canvas={{ uid: 0 }} />
          ) : (
            <View style={styles.cameraOffContainer}>
              <Feather name="video-off" size={48} color="#94a3b8" />
              <Text style={styles.cameraOffText}>Camera is turned off</Text>
            </View>
          )
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {tokenError
                ? "Token error. Tap to refresh."
                : isRefreshingToken
                ? "Refreshing token..."
                : "Connecting to stream..."}
            </Text>
            {tokenError && (
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={onManualTokenRefresh}
                disabled={isRefreshingToken}
              >
                <Text style={styles.refreshButtonText}>Refresh Token</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Floating Chat Button (visible when chat is hidden) */}
      {!isChatVisible && (
        <Animated.View style={[styles.chatButton, chatButtonStyle]}>
          <TouchableOpacity
            onPressIn={onChatButtonPressIn}
            onPressOut={onChatButtonPressOut}
            onPress={toggleChat}
            style={styles.chatButtonInner}
          >
            <Feather name="message-circle" size={24} color="#fff" />
            <View style={styles.chatBadge}>
              <Text style={styles.chatBadgeText}>{messages.length}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Overlay Controls */}
      <Animated.View style={[styles.overlayControls, controlsStyle]}>
        {/* Top Row: Header with info */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.liveIndicator}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.durationText}>
              {formatDuration(streamDuration)}
            </Text>
          </View>

          <Text style={styles.titleText} numberOfLines={1}>
            {streamTitle}
          </Text>

          <View style={styles.headerRight}>
            <View style={styles.viewerContainer}>
              <Feather name="eye" size={14} color="#fff" />
              <Text style={styles.viewerCount}>{viewerCount}</Text>
            </View>

            <TouchableOpacity
              style={styles.endButton}
              onPress={confirmEndStream}
              disabled={isEndingStream}
            >
              {isEndingStream ? (
                <Text style={styles.endButtonText}>Ending...</Text>
              ) : (
                <Text style={styles.endButtonText}>End</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                !isMicEnabled && styles.controlButtonActive,
              ]}
              onPress={toggleMicrophone}
              disabled={!isInitialized}
            >
              <Feather
                name={isMicEnabled ? "mic" : "mic-off"}
                size={22}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                !isCameraEnabled && styles.controlButtonActive,
              ]}
              onPress={toggleCamera}
              disabled={!isInitialized}
            >
              <Feather
                name={isCameraEnabled ? "video" : "video-off"}
                size={22}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={switchCamera}
              disabled={!isInitialized || !isCameraEnabled}
            >
              <Feather name="refresh-cw" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                !isChatVisible && styles.controlButtonActive,
              ]}
              onPress={toggleChat}
            >
              <Feather name="message-circle" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Chat Section */}
      {isChatVisible && (
        <Animated.View style={[styles.chatContainer, chatContainerStyle]}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Live Chat</Text>
            <TouchableOpacity
              onPress={toggleChat}
              style={styles.chatCloseButton}
            >
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={chatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            style={styles.chatList}
            renderItem={({ item }) => (
              <View style={styles.chatMessage}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{item.avatar}</Text>
                </View>
                <View style={styles.messageContent}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageUser}>{item.user}</Text>
                    <Text style={styles.messageTime}>
                      {formatTimestamp(item.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.messageText}>{item.message}</Text>
                </View>
              </View>
            )}
            onContentSizeChange={() =>
              chatListRef.current?.scrollToEnd({ animated: true })
            }
          />

          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#94a3b8"
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !newMessage.trim() && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Feather name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0f172a",
  },
  videoView: {
    flex: 1,
  },
  cameraOffContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e293b",
  },
  cameraOffText: {
    color: "#94a3b8",
    marginTop: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e293b",
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 16,
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: myTheme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  refreshButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  overlayControls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveIndicator: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  liveText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  durationText: {
    color: "#ffffff",
    fontSize: 14,
  },
  titleText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  viewerCount: {
    color: "#ffffff",
    fontSize: 12,
    marginLeft: 4,
  },
  endButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  endButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 12,
  },
  bottomControls: {
    padding: 16,
    alignItems: "center",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  controlButtonActive: {
    backgroundColor: myTheme.primary,
  },
  chatButton: {
    position: "absolute",
    right: 16,
    bottom: 80,
    zIndex: 10,
  },
  chatButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: myTheme.primary,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  chatBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  chatBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  chatContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    display: "flex",
    flexDirection: "column",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Add background for better visibility
  },
  chatList: {
    flex: 1,
    padding: 16,
  },
  chatMessage: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "85%", // Limit width for better readability
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: myTheme.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  messageContent: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 8,
    borderTopLeftRadius: 4,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  messageUser: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "600",
  },
  messageTime: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 10,
  },
  messageText: {
    color: "#f8fafc",
    fontSize: 14,
  },
  chatInputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
  },
  chatInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: "#ffffff",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: myTheme.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  chatCloseButton: {
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  chatTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});
