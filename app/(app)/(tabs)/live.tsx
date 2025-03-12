"use client";
import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  FlatList,
  RefreshControl,
} from "react-native";
import { Text, Card } from "react-native-ui-lib";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { myTheme } from "@/constants/index";

// Mock data for upcoming livestreams
const MOCK_UPCOMING_STREAMS = [
  {
    id: "upcoming-1",
    title: "New Skincare Collection Review",
    scheduledStartTime: new Date(Date.now() + 2 * 60 * 60000).toISOString(), // Starts in 2 hours
    scheduledEndTime: new Date(Date.now() + 3 * 60 * 60000).toISOString(), // Ends in 3 hours
    thumbnail: "https://i.imgur.com/8BFQXnZ.jpg",
    status: "scheduled",
    products: 3,
  },
  {
    id: "upcoming-2",
    title: "Fashion Haul: Summer Collection",
    scheduledStartTime: new Date(Date.now() + 24 * 60 * 60000).toISOString(), // Starts tomorrow
    scheduledEndTime: new Date(Date.now() + 25 * 60 * 60000).toISOString(),
    thumbnail: "https://i.imgur.com/Vd9VYT4.jpg",
    status: "scheduled",
    products: 8,
  },
  {
    id: "upcoming-3",
    title: "Q&A Session with Followers",
    scheduledStartTime: new Date(Date.now() + 48 * 60 * 60000).toISOString(), // Starts in 2 days
    scheduledEndTime: new Date(Date.now() + 49 * 60 * 60000).toISOString(),
    thumbnail: null,
    status: "scheduled",
    products: 0,
  },
];

export default function LiveScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingStreams, setUpcomingStreams] = useState(MOCK_UPCOMING_STREAMS);

  // Animation for the button
  const buttonScale = useSharedValue(1);

  const buttonAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, you would fetch updated data here
    // await fetchUpcomingStreams()
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get relative time description
  const getTimeDescription = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) return `Starts in ${diffMins} minutes`;
    if (diffHours < 24) return `Starts in ${diffHours} hours`;
    return `Starts in ${diffDays} days`;
  };

  const handleCreateLivestream = () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    router.push("/(app)/(livestream)/create-livestream");
  };

  const handleStartStream = (stream) => {
    // Navigate to stream configuration screen with the stream data
    router.push({
      pathname: "/(app)/(livestream)/stream-config",
      params: {
        id: stream.id,
        title: stream.title,
      },
    });
  };

  const renderUpcomingStream = ({ item }) => (
    <Card style={styles.streamCard}>
      <View style={styles.streamCardContent}>
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          {item.thumbnail ? (
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={styles.placeholderThumbnail}>
              <Feather name="video" size={24} color="#94a3b8" />
            </View>
          )}
        </View>

        {/* Stream Info */}
        <View style={styles.streamInfo}>
          <Text style={styles.streamTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.streamMetaRow}>
            <Feather name="calendar" size={12} color="#64748b" />
            <Text style={styles.streamMetaText}>
              {formatDate(item.scheduledStartTime)}
            </Text>
          </View>

          <View style={styles.streamMetaRow}>
            <Feather name="clock" size={12} color="#64748b" />
            <Text style={styles.streamMetaText}>
              {formatTime(item.scheduledStartTime)}
            </Text>
          </View>

          <View style={styles.streamMetaRow}>
            <Feather name="package" size={12} color="#64748b" />
            <Text style={styles.streamMetaText}>{item.products} products</Text>
          </View>

          <Text style={styles.timeUntilStart}>
            {getTimeDescription(item.scheduledStartTime)}
          </Text>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => handleStartStream(item)}
        >
          <Feather name="video" size={20} color="#fff" />
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Feather name="video" size={24} color="#fff" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Livestream Center</Text>
              <Text style={styles.headerSubtitle}>
                Create engaging content for your audience
              </Text>
            </View>
          </View>
          <View style={styles.headerDecoration}></View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[myTheme.primary]}
            tintColor={myTheme.primary}
          />
        }
      >
        {/* Upcoming Streams Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Upcoming Livestreams</Text>
          <TouchableOpacity onPress={handleCreateLivestream}>
            <Text style={styles.seeAllText}>Create New</Text>
          </TouchableOpacity>
        </View>

        {upcomingStreams.length > 0 ? (
          <FlatList
            data={upcomingStreams}
            renderItem={renderUpcomingStream}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Feather name="calendar" size={40} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No Upcoming Livestreams</Text>
              <Text style={styles.emptyText}>
                Schedule your next livestream to connect with your audience
              </Text>
            </View>
          </Card>
        )}

        {/* Quick Start Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
        </View>

        <Card style={styles.quickStartCard}>
          <View style={styles.quickStartContent}>
            <View style={styles.quickStartIconContainer}>
              <Feather name="zap" size={32} color={myTheme.primary} />
            </View>
            <Text style={styles.quickStartTitle}>
              Start an Instant Livestream
            </Text>
            <Text style={styles.quickStartText}>
              Go live immediately without scheduling. Perfect for spontaneous
              sessions with your audience.
            </Text>
            <TouchableOpacity
              style={styles.quickStartButton}
              onPress={() => router.push("/(app)/(livestream)/stream-config")}
            >
              <Feather name="video" size={20} color="#fff" />
              <Text style={styles.quickStartButtonText}>Go Live Now</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Tips Section */}
        <Text style={styles.sectionTitle}>Tips for Success</Text>

        <Card style={styles.tipsCard}>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>01</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Prepare Your Products</Text>
              <Text style={styles.tipText}>
                Have all products ready and within reach before starting your
                stream.
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>02</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Engage With Comments</Text>
              <Text style={styles.tipText}>
                Respond to viewer questions and comments to boost engagement.
              </Text>
            </View>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>03</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Promote in Advance</Text>
              <Text style={styles.tipText}>
                Announce your livestream on social media to attract more
                viewers.
              </Text>
            </View>
          </View>
        </Card>

        <Animated.View style={[styles.buttonContainer, buttonAnimStyle]}>
          <TouchableOpacity
            style={styles.liveButton}
            onPress={handleCreateLivestream}
            activeOpacity={0.8}
          >
            <Feather
              name="calendar"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.liveButtonText}>Schedule New Livestream</Text>
          </TouchableOpacity>
        </Animated.View>
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
    marginBottom: 16,
  },
  headerCard: {
    backgroundColor: myTheme.primary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    zIndex: 2,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  headerDecoration: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 12,
    marginLeft: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: myTheme.primary,
    fontWeight: "500",
  },
  streamCard: {
    marginBottom: 12,
    padding: 0,
    overflow: "hidden",
  },
  streamCardContent: {
    flexDirection: "row",
    padding: 12,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  placeholderThumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  streamInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  streamTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  streamMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  streamMetaText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
  },
  timeUntilStart: {
    fontSize: 12,
    color: myTheme.primary,
    fontWeight: "500",
    marginTop: 4,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: "center",
    marginLeft: 8,
  },
  startButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 12,
    marginLeft: 4,
  },
  emptyCard: {
    marginBottom: 24,
    padding: 0,
  },
  emptyContent: {
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginTop: 12,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  quickStartCard: {
    marginBottom: 24,
    padding: 0,
  },
  quickStartContent: {
    padding: 20,
    alignItems: "center",
  },
  quickStartIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  quickStartText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  quickStartButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  quickStartButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  tipsCard: {
    marginBottom: 24,
    padding: 16,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  tipNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: myTheme.primary,
    marginRight: 12,
    width: 30,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  buttonContainer: {
    marginVertical: 16,
    marginBottom: 40,
  },
  liveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: myTheme.primary,
    paddingVertical: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: myTheme.primary,
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
  liveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
