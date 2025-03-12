"use client";

import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  FlatList,
  TextInput,
  BackHandler,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { RtcSurfaceView } from "react-native-agora";

import { myTheme } from "@/constants/index";
import { useAgoraRtcEngine } from "@/hooks/useAgoraRtc";

// Mock data for chat messages
const MOCK_MESSAGES = [
  {
    id: "1",
    user: "John Doe",
    message: "Love your content! Can you talk about summer trends?",
    avatar: "JD",
  },
  {
    id: "2",
    user: "Alice Smith",
    message: "Just bought the lipstick you recommended last week!",
    avatar: "AS",
  },
  {
    id: "3",
    user: "Robert Johnson",
    message: "When is your next collaboration coming?",
    avatar: "RJ",
  },
];

export default function LiveStreamingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  const [isEndingStream, setIsEndingStream] = useState(false);

  // Get params
  const livestreamId = params.id as string;
  const streamTitle = params.title as string;
  const channel = params.channel as string;
  const token = params.token as string;
  const userId = Number.parseInt(params.userId as string, 10);

  // Initialize Agora engine
  const { rtcEngine, rtcEngineReady, didJoinChannel } = useAgoraRtcEngine({
    userID: userId,
    channel: channel,
    token: token,
  });

  // Timer for stream duration
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start timer for stream duration
    timerRef.current = setInterval(() => {
      setStreamDuration((prev) => prev + 1);
    }, 1000);

    // Simulate increasing viewer count
    const viewerInterval = setInterval(() => {
      setViewerCount((prev) =>
        Math.min(prev + Math.floor(Math.random() * 3), 9999)
      );
    }, 5000);

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

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      clearInterval(viewerInterval);
      backHandler.remove();
    };
  }, []);

  // Handle camera toggle
  const toggleCamera = () => {
    if (!rtcEngineReady) return;

    if (isCameraEnabled) {
      rtcEngine.muteLocalVideoStream(true);
    } else {
      rtcEngine.muteLocalVideoStream(false);
    }
    setIsCameraEnabled(!isCameraEnabled);
  };

  // Handle microphone toggle
  const toggleMic = () => {
    if (!rtcEngineReady) return;

    if (isMicEnabled) {
      rtcEngine.muteLocalAudioStream(true);
    } else {
      rtcEngine.muteLocalAudioStream(false);
    }
    setIsMicEnabled(!isMicEnabled);
  };

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Send a chat message
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      user: "You (Host)",
      message: newMessage.trim(),
      avatar: "ME",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
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
      if (rtcEngineReady) {
        rtcEngine.leaveChannel();
      }

      // Navigate to stream summary
      router.replace({
        pathname: "/",
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

  return (
    <View style={styles.container}>
      {/* Stream Header */}
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

      <View style={styles.content}>
        {/* Video Stream */}
        <View style={styles.videoContainer}>
          {rtcEngineReady && didJoinChannel ? (
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
              <Text style={styles.loadingText}>Connecting to stream...</Text>
            </View>
          )}

          {/* Camera Controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleMic}>
              {isMicEnabled ? (
                <Feather name="mic" size={20} color="#fff" />
              ) : (
                <Feather name="mic-off" size={20} color="#fff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleCamera}
            >
              {isCameraEnabled ? (
                <Feather name="video" size={20} color="#fff" />
              ) : (
                <Feather name="video-off" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Section */}
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Live Chat</Text>
          </View>

          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            style={styles.chatList}
            renderItem={({ item }) => (
              <View style={styles.chatMessage}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{item.avatar}</Text>
                </View>
                <View style={styles.messageContent}>
                  <Text style={styles.messageUser}>{item.user}</Text>
                  <Text style={styles.messageText}>{item.message}</Text>
                </View>
              </View>
            )}
          />

          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Feather name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
  content: {
    flex: 1,
    flexDirection: "row",
  },
  videoContainer: {
    flex: 2,
    position: "relative",
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
  },
  cameraControls: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderLeftWidth: 1,
    borderLeftColor: "#334155",
  },
  chatHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  chatTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  chatList: {
    flex: 1,
    padding: 12,
  },
  chatMessage: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#334155",
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
    backgroundColor: "#334155",
    borderRadius: 12,
    padding: 8,
    borderTopLeftRadius: 4,
  },
  messageUser: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  messageText: {
    color: "#f8fafc",
    fontSize: 14,
  },
  chatInputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#334155",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: "#ffffff",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: myTheme.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
