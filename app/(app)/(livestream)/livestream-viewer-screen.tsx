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
  ActivityIndicator,
  Image,
} from "react-native";
import type { FlatList as FlatListType } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { RtcSurfaceView, ClientRoleType } from "react-native-agora";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";

import { myTheme } from "@/constants/index";
import { useViewerStream } from "@/hooks/useViewerStream";
import useLivestreams from "@/hooks/api/useLivestreams";
import { log } from "@/utils/logger";
import useUser from "@/hooks/api/useUser";

const { width, height } = Dimensions.get("window");

export default function LivestreamViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [messages, setMessages] = useState<
    {
      id: string;
      user: string;
      message: string;
      avatar: string;
      timestamp: number;
    }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [streamInfo, setStreamInfo] = useState<{
    title: string;
    hostName: string;
    hostAvatar?: string;
  }>({
    title: (params.title as string) || "Live Stream",
    hostName: "Host",
    hostAvatar: undefined,
  });
  const [account, setAccount] = useState<{ id: string; name: string } | null>(
    null
  );

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
  const chatWidth = useSharedValue(width * 0.85);
  const chatOpacity = useSharedValue(1);
  const controlsOpacity = useSharedValue(1);
  const fabScale = useSharedValue(1);

  // Get params
  const livestreamId = params.id as string;
  const { getLivestreamToken, getLivestreamById } = useLivestreams();
  const { getProfile } = useUser();

  // Function to refresh the token
  const handleTokenRefresh = useCallback(() => {
    Alert.alert(
      "Token Expired",
      "Your viewing session has expired. Please exit and rejoin the stream.",
      [{ text: "OK" }]
    );
    setTokenError(true);
    setIsRefreshingToken(false);
  }, []);

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile();
        if (data && data.id) {
          setAccount({
            id: data.id,
            name: data.email || "Viewer",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }

    fetchProfile();
  }, [getProfile]);

  // Fetch livestream info and token
  useEffect(() => {
    async function fetchLivestreamData() {
      setIsLoading(true);
      try {
        // Fetch livestream details
        const livestreamData = await getLivestreamById(livestreamId);
        if (livestreamData) {
          setStreamInfo({
            title: livestreamData.title || "Live Stream",
            hostName: "Host", // You might want to fetch host info from your API
            hostAvatar: undefined,
          });
        }

        // Fetch token
        const tokenResult = await getLivestreamToken(
          livestreamId,
          ClientRoleType.ClientRoleAudience,
          3600
        );

        if (tokenResult && tokenResult.data) {
          // Fallback in case the structure is different
          setCurrentToken(tokenResult.data);
        } else {
          setTokenError(true);
          Alert.alert(
            "Error",
            "Failed to get streaming token. Please try again."
          );
        }
      } catch (error) {
        console.error("Error fetching livestream data:", error);
        Alert.alert("Error", "Failed to load livestream. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLivestreamData();
  }, [livestreamId, getLivestreamById, getLivestreamToken]);

  // Initialize the viewer stream hook
  const {
    engine,
    isInitialized,
    joinChannelSuccess,
    hostUid,
    isHostVideoEnabled,
    isHostAudioEnabled,
    joinChannel,
    leaveChannel,
  } = useViewerStream({
    appId: "00f5d43335cb4a19969ef78bb8955d2c", // Replace with your Agora App ID
    channel: livestreamId,
    token: currentToken,
    userId: account?.id || "viewer",
  });

  // Handle token errors from Agora
  useEffect(() => {
    if (isInitialized && engine) {
      const handleError = (errorCode: number, msg: string) => {
        log.error(`Agora error: ${errorCode}, ${msg}`);

        // Error codes related to token expiration
        // 109: token expired
        // 110: token invalid
        if (errorCode === 109 || errorCode === 110) {
          log.warn("Token expired or invalid");
          Alert.alert(
            "Connection Error",
            "Your viewing session has expired. Please exit and rejoin the stream.",
            [{ text: "OK" }]
          );
          setTokenError(true);
        }
      };

      //   Add error listener
      engine.addListener("onError", handleError);

      return () => {
        engine.removeListener("onError", handleError);
      };
    }
  }, [isInitialized, engine]);

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

  useEffect(() => {
    // Start timer for stream duration
    timerRef.current = setInterval(() => {
      setStreamDuration((prev) => prev + 1);
    }, 1000);

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
        confirmLeaveStream();
        return true;
      }
    );

    // Initialize controls timer
    resetControlsTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }

      backHandler.remove();
    };
  }, []);

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
      chatWidth.value = withTiming(width * 0.85, { duration: 300 });
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
      user: account?.name || "You",
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

  // Confirm leaving the stream
  const confirmLeaveStream = () => {
    Alert.alert(
      "Leave Stream",
      "Are you sure you want to leave this livestream?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: leaveStream },
      ]
    );
  };

  // Leave the livestream
  const leaveStream = () => {
    if (isInitialized) {
      leaveChannel();
    }
    router.back();
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
    Alert.alert(
      "Session Expired",
      "Your viewing session has expired. Please exit and rejoin the stream.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container} onTouchStart={resetControlsTimer}>
      <StatusBar hidden />

      {/* Video Stream */}
      <View style={styles.videoContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={myTheme.primary} />
            <Text style={styles.loadingText}>Loading stream...</Text>
          </View>
        ) : isInitialized ? (
          isHostVideoEnabled ? (
            <RtcSurfaceView
              style={styles.videoView}
              canvas={{ uid: hostUid || 0 }}
            />
          ) : (
            <View style={styles.hostOfflineContainer}>
              <MaterialIcons name="videocam-off" size={48} color="#94a3b8" />
              <Text style={styles.hostOfflineText}>Host camera is off</Text>
            </View>
          )
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {tokenError
                ? "Session expired. Please exit and rejoin."
                : "Waiting for host..."}
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
          <TouchableOpacity
            onPress={confirmLeaveStream}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.liveIndicator}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.durationText}>
              {formatDuration(streamDuration)}
            </Text>
          </View>

          <View style={styles.viewerContainer}>
            <Feather name="eye" size={14} color="#fff" />
            <Text style={styles.viewerCount}>{viewerCount}</Text>
          </View>
        </View>

        {/* Host Info */}
        <View style={styles.hostInfoContainer}>
          <View style={styles.hostAvatarContainer}>
            {streamInfo.hostAvatar ? (
              <Image
                source={{ uri: streamInfo.hostAvatar }}
                style={styles.hostAvatar}
              />
            ) : (
              <Text style={styles.hostAvatarText}>
                {streamInfo.hostName.charAt(0)}
              </Text>
            )}
          </View>
          <View style={styles.hostTextContainer}>
            <Text style={styles.hostName}>{streamInfo.hostName}</Text>
            <Text style={styles.streamTitle} numberOfLines={1}>
              {streamInfo.title}
            </Text>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              !isChatVisible && styles.controlButtonActive,
            ]}
            onPress={toggleChat}
          >
            <Feather name="message-circle" size={22} color="#fff" />
            <Text style={styles.controlButtonText}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={() => {}}>
            <Feather name="heart" size={22} color="#fff" />
            <Text style={styles.controlButtonText}>Like</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={() => {}}>
            <Feather name="share-2" size={22} color="#fff" />
            <Text style={styles.controlButtonText}>Share</Text>
          </TouchableOpacity>
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
  hostOfflineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e293b",
  },
  hostOfflineText: {
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
    marginTop: 16,
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
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  headerInfo: {
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
  viewerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  viewerCount: {
    color: "#ffffff",
    fontSize: 12,
    marginLeft: 4,
  },
  hostInfoContainer: {
    position: "absolute",
    top: 70,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 24,
    padding: 8,
    maxWidth: "80%",
  },
  hostAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: myTheme.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  hostAvatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  hostTextContainer: {
    flex: 1,
  },
  hostName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  streamTitle: {
    color: "#e2e8f0",
    fontSize: 12,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  controlButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  controlButtonText: {
    color: "#ffffff",
    fontSize: 12,
    marginTop: 4,
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
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    display: "flex",
    flexDirection: "column",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  chatList: {
    flex: 1,
    padding: 16,
  },
  chatMessage: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "100%",
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
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  chatTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});
