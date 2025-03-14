"use client";

import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
  PermissionsAndroid,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { RtcSurfaceView, ClientRoleType } from "react-native-agora";
import { useAgoraRtcEngine } from "@/hooks/useAgoraRtc";
import { myTheme } from "@/constants/index";
import { Card } from "react-native-ui-lib";

// Mock data for testing - in a real app, this would come from your API
const MOCK_TOKEN =
  "007eJxTYJjxccK5H1cLT6jbt7M/k61+tjtkdsUzj5dGTIKPZJdff/VIgcHAIM00xcTY2Ng0Ockk0dDS0swyNc3cIinJwtLUNMUo+eKFi+kNgYwMm8W9mBgZIBDEZ2HIzczLYGAAACSeIjM=";
const MOCK_CHANNEL = "minh";
const MOCK_USER_ID = 432;

const askMediaAccess = async () => {
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
        console.log("Camera and microphone permissions granted");
        return true;
      } else {
        console.log("Camera and microphone permissions denied");
        Alert.alert(
          "Permissions Required",
          "Camera and microphone permissions are required for livestreaming.",
          [{ text: "OK" }]
        );
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else if (Platform.OS === "ios") {
    // iOS permissions are handled at the app level through Info.plist
    // But we can still check and notify the user
    return true;
  }
  return false;
};

export default function StreamConfigScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [streamTitle, setStreamTitle] = useState(
    (params.title as string) || ""
  );
  const [isStartingStream, setIsStartingStream] = useState(false);

  // Get livestream ID from params if available
  const livestreamId = params.id as string;

  // Initialize Agora engine
  const {
    rtcEngine,
    rtcEngineReady,
    didJoinChannel,
    remoteUserID,
    isRemoteAudioEnabled,
    isRemoteVideoEnabled,
  } = useAgoraRtcEngine({
    userID: MOCK_USER_ID,
    channel: MOCK_CHANNEL,
    token: MOCK_TOKEN,
    roleType: ClientRoleType.ClientRoleBroadcaster, // Add this line
  });

  useEffect(() => {
    const initializeStream = async () => {
      // Request permissions first
      const hasPermissions = await askMediaAccess();

      if (!hasPermissions) {
        Alert.alert(
          "Permission Denied",
          "Camera and microphone access is required for livestreaming. Please enable permissions in your device settings.",
          [{ text: "OK" }]
        );
        return;
      }

      // Rest of your initialization code...
    };

    initializeStream();
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

  // Handle camera flip
  const switchCamera = () => {
    if (!rtcEngineReady || !isCameraEnabled) return;

    rtcEngine.switchCamera();
    setIsFrontCamera(!isFrontCamera);
  };

  // Handle starting the actual livestream
  const startLivestream = async () => {
    if (!streamTitle.trim()) {
      Alert.alert("Error", "Please enter a stream title");
      return;
    }

    setIsStartingStream(true);

    try {
      // In a real app, you would make an API call to update the livestream status
      // For example:
      // await updateLivestreamStatus(livestreamId, 'live', { title: streamTitle })

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to the live streaming screen
      router.push({
        pathname: "/(app)/(livestream)/live-streamming",
        params: {
          id: livestreamId,
          title: streamTitle,
          channel: MOCK_CHANNEL,
          token: MOCK_TOKEN,
          userId: MOCK_USER_ID.toString(),
        },
      });
    } catch (error) {
      console.error("Error starting livestream:", error);
      Alert.alert("Error", "Failed to start livestream. Please try again.");
    } finally {
      setIsStartingStream(false);
    }
  };

  // Handle canceling the stream setup
  const cancelSetup = () => {
    Alert.alert(
      "Cancel Stream",
      "Are you sure you want to cancel the stream setup?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={cancelSetup} style={styles.backButton}>
          <Feather name="x" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stream Setup</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Camera Preview */}
        <View style={styles.previewContainer}>
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
              <ActivityIndicator size="large" color={myTheme.primary} />
              <Text style={styles.loadingText}>Initializing camera...</Text>
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

            <TouchableOpacity
              style={[
                styles.controlButton,
                !isCameraEnabled && styles.disabledButton,
              ]}
              onPress={switchCamera}
              disabled={!isCameraEnabled}
            >
              <Feather name="refresh-cw" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stream Settings */}
        <Card style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Stream Settings</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Stream Title</Text>
            <TextInput
              style={styles.input}
              value={streamTitle}
              onChangeText={setStreamTitle}
              placeholder="Enter a title for your stream"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons
              name="info-outline"
              size={20}
              color={myTheme.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Make sure you have a stable internet connection before going live.
            </Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons
              name="lightbulb-outline"
              size={20}
              color={myTheme.primary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              Good lighting and clear audio will improve your stream quality.
            </Text>
          </View>
        </Card>

        {/* Go Live Button */}
        <TouchableOpacity
          style={[
            styles.goLiveButton,
            (!rtcEngineReady || isStartingStream) && styles.disabledButton,
          ]}
          onPress={startLivestream}
          disabled={!rtcEngineReady || isStartingStream}
        >
          {isStartingStream ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather
                name="radio"
                size={20}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.goLiveText}>Go Live Now</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  previewContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
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
    marginTop: 12,
    fontSize: 16,
  },
  cameraControls: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  settingsCard: {
    marginBottom: 16,
    padding: 16,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  goLiveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
    ...Platform.select({
      ios: {
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonIcon: {
    marginRight: 8,
  },
  goLiveText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
