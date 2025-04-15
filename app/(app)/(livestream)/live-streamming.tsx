"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  FlatList,
  BackHandler,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  PanResponder,
} from "react-native";
import { TextField } from "react-native-ui-lib"; // Import TextField instead of TextInput
import type { FlatList as FlatListType } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { RtcSurfaceView, ClientRoleType } from "react-native-agora";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { myTheme } from "@/constants/index";
import { useStreamWithAttachment } from "@/hooks/useStreamWithAttachment";
import { refreshAgoraToken } from "@/utils/token-refresh";
import useLivestreams from "@/hooks/api/useLivestreams";
import { log } from "@/utils/logger";
import config from "@/constants/agora.config";
import { useFirebaseChat } from "@/hooks/useFirebaseChat";
import ProductsBottomSheet, {
  type LiveSteamDetail,
} from "@/components/product-bottom-sheet";

const { width, height } = Dimensions.get("window");

// Token refresh interval in milliseconds (refresh every 30 minutes)
const TOKEN_REFRESH_INTERVAL = 30 * 60 * 1000;

export default function LiveStreamingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const livestreamId = params.id as string;
  const streamTitle = params.title as string;
  const channel = params.channel as string;
  const userId = params.userId as string;
  const [newMessage, setNewMessage] = useState("");
  const [streamInfo, setStreamInfo] = useState({
    title: streamTitle || "Live Stream",
    hostName: "Host",
    hostAvatar: undefined,
  });
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Add these new state variables for gesture scrolling
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [visibleHeight, setVisibleHeight] = useState(0);

  // Add a ref for the text input
  const inputRef = useRef<any>(null);

  // Products modal visibility state
  const [isProductsModalVisible, setProductsModalVisible] = useState(false);

  // Use Firebase chat hook
  const {
    messages: chatMessages,
    isInitialized: isChatInitialized,
    isLoggedIn: isChatLoggedIn,
    isSending: isChatSending,
    error: chatError,
    isLoadingMore,
    hasMoreMessages,
    sendMessage: sendChatMessage,
    loadMoreMessages,
    clearError: clearChatError,
    reconnect: reconnectChat,
  } = useFirebaseChat(livestreamId);

  const [streamDuration, setStreamDuration] = useState(0);
  const [isEndingStream, setIsEndingStream] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(
    params.token as string
  );
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [listProduct, setListProduct] = useState<LiveSteamDetail[]>([]);

  const chatListRef = useRef<
    FlatListType<{
      id: string;
      user: string;
      message: string;
      avatar: string;
      timestamp: number;
    }>
  >(null);

  // Set up pan responder for gesture-based scrolling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical gestures
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        setIsScrolling(true);
        setIsAutoScrollEnabled(false);
      },
      onPanResponderMove: (_, gestureState) => {
        if (chatListRef.current) {
          // Calculate new scroll position based on gesture
          const newPosition = lastScrollPosition - gestureState.dy;
          chatListRef.current.scrollToOffset({
            offset: newPosition,
            animated: false,
          });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Update last scroll position
        if (chatListRef.current) {
          setLastScrollPosition(lastScrollPosition - gestureState.dy);
        }

        // If user flicked quickly, add momentum scrolling
        if (Math.abs(gestureState.vy) > 0.5) {
          const distance = gestureState.vy * 300; // Adjust multiplier for momentum
          if (chatListRef.current) {
            chatListRef.current.scrollToOffset({
              offset: lastScrollPosition - gestureState.dy - distance,
              animated: true,
            });
            // Update last position after momentum scroll
            setLastScrollPosition(
              lastScrollPosition - gestureState.dy - distance
            );
          }
        }

        setIsScrolling(false);

        // After a short delay, re-enable auto-scroll if at bottom
        setTimeout(() => {
          if (chatListRef.current && isNearBottom()) {
            setIsAutoScrollEnabled(true);
          }
        }, 1000);
      },
    })
  ).current;

  // Animation values
  const controlsOpacity = useSharedValue(1);
  const fabScale = useSharedValue(1);

  // Get params
  const { getLivestreamToken, getLivestreamById, updateLivestream } =
    useLivestreams();

  // Token refresh timer
  const tokenRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    viewerCount,
    refreshViewerCount,
  } = useStreamWithAttachment({
    appId: config.appId,
    channel: channel,
    token: currentToken,
    userId: userId,
    enableVideo: true,
    autoJoin: true, // Auto join for the live screen
  });

  // Listen for keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Function to focus the input
  const focusInput = () => {
    console.log("Attempting to focus input");
    if (inputRef.current) {
      // For TextField, we need to access the inner TextInput
      if (inputRef.current.focus) {
        inputRef.current.focus();
        console.log("Focus called on input ref");
      } else if (
        inputRef.current.getTextField &&
        inputRef.current.getTextField().focus
      ) {
        // Some UI lib components have a getTextField method
        inputRef.current.getTextField().focus();
        console.log("Focus called on getTextField");
      } else {
        console.log(
          "Input ref exists but no focus method found",
          inputRef.current
        );
      }
    } else {
      console.log("Input ref is null");
    }
  };

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

  // Fetch livestream data and calculate duration
  useEffect(() => {
    async function fetchLivestreamData() {
      try {
        // Fetch livestream details
        const livestreamData = await getLivestreamById(livestreamId);
        if (livestreamData && livestreamData.startTime) {
          // Set stream info
          setStreamInfo({
            title: livestreamData.title || "Live Stream",
            hostName: "Host", // You might want to fetch host info from your API
            hostAvatar: undefined,
          });
          setListProduct(livestreamData.livestreamProducts);
          // Calculate stream duration based on startTime
          const startTimeDate = new Date(livestreamData.startTime);
          const currentTime = new Date();
          const durationInSeconds = Math.floor(
            (currentTime.getTime() - startTimeDate.getTime()) / 1000
          );

          // Only set if it's a positive value
          if (durationInSeconds > 0) {
            setStreamDuration(durationInSeconds);
          }
        }
      } catch (error) {
        console.error("Error fetching livestream data:", error);
      }
    }

    fetchLivestreamData();
  }, [livestreamId, getLivestreamById]);

  // Update the useEffect that sets up timers to include the token refresh schedule
  useEffect(() => {
    // Start timer for stream duration
    timerRef.current = setInterval(() => {
      setStreamDuration((prev) => prev + 1);
    }, 1000);

    // Set up token refresh schedule
    const cleanupTokenRefresh = setupTokenRefreshSchedule();

    // Handle back button press
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Prevent going back with hardware button
        confirmEndStream();
        return true;
      }
    );

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      cleanupTokenRefresh();
      backHandler.remove();
    };
  }, [setupTokenRefreshSchedule]);

  const toggleSettings = () => {
    setIsSettingsVisible(!isSettingsVisible);
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

  // Check if scroll position is near the bottom
  const isNearBottom = () => {
    if (!chatListRef.current || chatMessages.length === 0) return true;

    // If we're within 20 pixels of the bottom, consider it "at bottom"
    return lastScrollPosition > contentHeight - visibleHeight - 20;
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatListRef.current && chatMessages.length > 0) {
      chatListRef.current.scrollToEnd({ animated: true });
      setIsAutoScrollEnabled(true);
    }
  };

  // Send message function
  const sendMessage = async () => {
    if (!newMessage.trim() || !isChatLoggedIn) {
      if (!isChatLoggedIn) {
        Alert.alert("Not Logged In", "You need to be logged in to chat.");
      }
      return;
    }

    try {
      await sendChatMessage(newMessage.trim());
      setNewMessage("");
      Keyboard.dismiss(); // Dismiss keyboard after sending message

      // Scroll to bottom
      if (chatListRef.current) {
        chatListRef.current?.scrollToEnd({ animated: true });
      }

      resetControlsTimer();
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
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
      const currentTime = new Date().toISOString();
      await updateLivestream(livestreamId, {
        status: "ENDED", // Update status to ENDED
        endTime: currentTime, // Set the end time to current time
      });

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
  const controlsStyle = useAnimatedStyle(() => {
    return {
      opacity: controlsOpacity.value,
    };
  });

  // Manual token refresh button handler
  const onManualTokenRefresh = () => {
    handleTokenRefresh();
  };

  // Handle chat reconnection
  const handleReconnectChat = () => {
    if (reconnectChat()) {
      Alert.alert("Success", "Reconnected to chat successfully");
    }
  };

  // Open products modal
  const openProductsModal = useCallback(() => {
    console.log("Opening products modal");
    setProductsModalVisible(true);
  }, []);

  // Close products modal
  const closeProductsModal = useCallback(() => {
    console.log("Closing products modal");
    setProductsModalVisible(false);
  }, []);

  // Handle cart button press
  const handleCartButtonPress = () => {
    console.log("Cart button pressed");
    openProductsModal();
  };

  // Handle scroll event to track scroll position
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    setLastScrollPosition(scrollY);
    setContentHeight(contentHeight);
    setVisibleHeight(layoutHeight);

    // If user manually scrolled away from bottom, disable auto-scroll
    if (scrollY < contentHeight - layoutHeight - 20) {
      setIsAutoScrollEnabled(false);
    } else {
      setIsAutoScrollEnabled(true);
    }
  };

  // Render a chat message item
  const renderChatMessage = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      style={[styles.tiktokChatMessage, { opacity: 1 }]}
      key={item.id}
    >
      <View style={styles.tiktokAvatarContainer}>
        <Text style={styles.tiktokAvatarText}>{item.avatar}</Text>
      </View>
      <View style={styles.tiktokMessageContent}>
        <Text style={styles.tiktokMessageUser}>{item.user}</Text>
        <Text style={styles.tiktokMessageText}>{item.message}</Text>
      </View>
    </Animated.View>
  );

  // Dismiss keyboard when tapping outside the input
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
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

        {/* Settings button in top right */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={toggleSettings}
        >
          <View style={styles.actionButtonInner}>
            <Feather name="settings" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Chat container with gesture support */}
        <View
          style={[
            styles.tiktokChatContainer,
            isKeyboardVisible && { bottom: Platform.OS === "ios" ? 120 : 100 },
          ]}
          {...panResponder.panHandlers}
        >
          {chatError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{chatError}</Text>
              <View style={styles.errorButtonsContainer}>
                <TouchableOpacity
                  style={styles.errorButton}
                  onPress={handleReconnectChat}
                >
                  <Text style={styles.errorButtonText}>Reconnect</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.errorButton}
                  onPress={clearChatError}
                >
                  <Text style={styles.errorButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <FlatList
            ref={chatListRef}
            data={chatMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderChatMessage}
            style={styles.tiktokChatList}
            contentContainerStyle={styles.tiktokChatListContent}
            onEndReached={hasMoreMessages ? loadMoreMessages : undefined}
            onEndReachedThreshold={0.3}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ListHeaderComponent={
              isLoadingMore ? (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.loadingMoreText}>
                    Loading more messages...
                  </Text>
                </View>
              ) : null
            }
            onContentSizeChange={() => {
              // Only auto-scroll to bottom for new messages if we're already at the bottom
              if (
                chatListRef.current &&
                chatMessages.length > 0 &&
                isAutoScrollEnabled
              ) {
                chatListRef.current.scrollToEnd({ animated: false });
              }
            }}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatText}>
                  No messages yet. Be the first to say something!
                </Text>
              </View>
            }
          />

          {/* Show return to bottom button only when needed */}
          {!isAutoScrollEnabled && (
            <TouchableOpacity
              style={styles.autoScrollButton}
              onPress={scrollToBottom}
            >
              <Feather name="arrow-down-circle" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Replace the View with KeyboardAvoidingView */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 10}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.inputRowContainer}>
            {/* Cart button on the left */}
            <TouchableOpacity
              style={styles.inputSideButton}
              onPress={handleCartButtonPress}
            >
              <Feather name="shopping-cart" size={22} color="#fff" />
            </TouchableOpacity>

            {/* Chat input in the middle - now smaller */}
            <View style={styles.persistentChatInputContainer}>
              <TouchableOpacity
                style={styles.chatInputWrapper}
                activeOpacity={0.8}
                onPress={focusInput}
              >
                <TextField
                  ref={inputRef}
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder="Type a message..."
                  placeholderTextColor="#94a3b8"
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
                  enableErrors={false}
                  fieldStyle={styles.uiLibInputField}
                  style={styles.uiLibInputText}
                  containerStyle={styles.uiLibInputContainer}
                  autoCapitalize="none"
                  autoCorrect={false}
                  showCharCounter={false}
                  hideUnderline
                />
              </TouchableOpacity>

              {/* Send button */}
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!newMessage.trim() || !isChatLoggedIn || isChatSending) &&
                    styles.sendButtonDisabled,
                ]}
                onPress={sendMessage}
                disabled={
                  !newMessage.trim() || !isChatLoggedIn || isChatSending
                }
              >
                <Feather name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Overlay Controls - Now only shown when needed */}
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
              {streamInfo.title}
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
        </Animated.View>

        {/* Settings Panel - Only visible when settings button is clicked */}
        {isSettingsVisible && (
          <View style={styles.settingsPanel}>
            <View style={styles.settingsPanelHeader}>
              <Text style={styles.settingsPanelTitle}>Stream Settings</Text>
              <TouchableOpacity onPress={toggleSettings}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.settingsControls}>
              <TouchableOpacity
                style={[
                  styles.settingButton,
                  !isMicEnabled && styles.settingButtonActive,
                ]}
                onPress={toggleMicrophone}
                disabled={!isInitialized}
              >
                <Feather
                  name={isMicEnabled ? "mic" : "mic-off"}
                  size={24}
                  color="#fff"
                />
                <Text style={styles.settingButtonText}>
                  {isMicEnabled ? "Mute Mic" : "Unmute Mic"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.settingButton,
                  !isCameraEnabled && styles.settingButtonActive,
                ]}
                onPress={toggleCamera}
                disabled={!isInitialized}
              >
                <Feather
                  name={isCameraEnabled ? "video" : "video-off"}
                  size={24}
                  color="#fff"
                />
                <Text style={styles.settingButtonText}>
                  {isCameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingButton}
                onPress={switchCamera}
                disabled={!isInitialized || !isCameraEnabled}
              >
                <Feather name="refresh-cw" size={24} color="#fff" />
                <Text style={styles.settingButtonText}>Switch Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Products Modal */}
        <ProductsBottomSheet
          visible={isProductsModalVisible}
          onClose={closeProductsModal}
          products={listProduct}
        />
      </View>
    </TouchableWithoutFeedback>
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
    pointerEvents: "box-none", // Allow touches to pass through to elements below
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
  // Update the bottomControls style to be removed or hidden
  bottomControls: {
    display: "none", // Hide the old bottom controls
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
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  // TikTok-style chat container
  tiktokChatContainer: {
    position: "absolute",
    bottom: 80, // Leave space for the chat input
    left: 0,
    right: 0,
    maxHeight: height * 0.5, // Take up to half the screen height
    paddingHorizontal: 16,
    pointerEvents: "box-none", // Allow touches to pass through to elements below
  },
  tiktokChatList: {
    flex: 1,
  },
  tiktokChatListContent: {
    paddingBottom: 8,
  },
  tiktokChatMessage: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    maxWidth: "85%",
    alignSelf: "flex-start",
  },
  tiktokAvatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: myTheme.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  tiktokAvatarText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  tiktokMessageContent: {
    flex: 1,
  },
  tiktokMessageUser: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "600",
  },
  tiktokMessageText: {
    color: "#f8fafc",
    fontSize: 14,
  },
  keyboardAvoidingView: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  persistentChatInputContainer: {
    flex: 1, // Changed from 0.7 to 1 for full width
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4, // Reduced from 8 to 4
    marginHorizontal: 8,
    zIndex: 100,
    pointerEvents: "auto",
  },
  chatInputWrapper: {
    flex: 1,
    height: 36, // Reduced from 40 to 36
    justifyContent: "center",
    pointerEvents: "auto", // Ensure it can receive touch events
  },
  // Styles for react-native-ui-lib TextField
  uiLibInputContainer: {
    flex: 1,
    height: 36, // Reduced from 40 to 36
    backgroundColor: "transparent",
    pointerEvents: "auto", // Ensure it can receive touch events
  },
  uiLibInputField: {
    backgroundColor: "transparent",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  uiLibInputText: {
    color: "#ffffff",
    fontSize: 14,
    height: 36, // Reduced from 40 to 36
    paddingVertical: 4, // Reduced from 8 to 4
    paddingHorizontal: 12,
  },
  persistentChatInput: {
    flex: 1,
    color: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    height: 40,
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
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.7)",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: "#ffffff",
    flex: 1,
  },
  errorButtonsContainer: {
    flexDirection: "row",
  },
  errorButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  errorButtonText: {
    color: "#ffffff",
    fontSize: 12,
  },
  emptyChat: {
    padding: 20,
    alignItems: "center",
  },
  emptyChatText: {
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
  },
  loadingMoreContainer: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingMoreText: {
    color: "#ffffff",
    marginLeft: 8,
    fontSize: 12,
  },
  // Style for auto-scroll button
  autoScrollButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: myTheme.primary,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  settingsPanel: {
    position: "absolute",
    top: 80, // Position below the settings button
    right: 16,
    width: 250,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderRadius: 12,
    padding: 16,
    zIndex: 20,
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
  settingsPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  settingsPanelTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  settingsControls: {
    gap: 12,
  },
  settingButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 12,
    borderRadius: 8,
  },
  settingButtonActive: {
    backgroundColor: myTheme.primary,
  },
  settingButtonText: {
    color: "#ffffff",
    marginLeft: 12,
    fontSize: 14,
  },
  inputRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 24,
  },
  inputSideButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  settingsButton: {
    position: "absolute",
    top: 16,
    left: 16, // Changed from right: 16 to left: 16
    zIndex: 10,
  },
  actionButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
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
});
