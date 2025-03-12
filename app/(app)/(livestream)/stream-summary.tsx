"use client";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { myTheme } from "@/constants/index";
import { Card } from "react-native-ui-lib"; // Updated import

export default function StreamSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get params
  const livestreamId = params.id as string;
  const streamTitle = params.title as string;
  const duration = Number.parseInt(params.duration as string, 10) || 0;
  const viewers = Number.parseInt(params.viewers as string, 10) || 0;

  // Calculate stats
  const engagementRate = Math.floor(Math.random() * 30) + 60; // 60-90%
  const likes = Math.floor(viewers * 0.7);
  const comments = Math.floor(viewers * 0.3);
  const shares = Math.floor(viewers * 0.1);

  // Format duration as HH:MM:SS
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Navigate back to home
  const goToHome = () => {
    router.replace("/(app)/(tabs)/live");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stream Summary</Text>
        <TouchableOpacity onPress={goToHome} style={styles.closeButton}>
          <Feather name="x" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.bannerContainer}>
          <View style={styles.banner}>
            <Feather
              name="check-circle"
              size={24}
              color="#fff"
              style={styles.bannerIcon}
            />
            <Text style={styles.bannerText}>Your livestream has ended</Text>
          </View>
        </View>

        <Card style={styles.summaryCard}>
          <Text style={styles.cardTitle}>{streamTitle}</Text>
          <Text style={styles.cardSubtitle}>Stream Summary</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Feather
                name="clock"
                size={20}
                color={myTheme.primary}
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>{formatDuration(duration)}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>

            <View style={styles.statItem}>
              <Feather
                name="users"
                size={20}
                color={myTheme.primary}
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>{viewers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Viewers</Text>
            </View>

            <View style={styles.statItem}>
              <Feather
                name="activity"
                size={20}
                color={myTheme.primary}
                style={styles.statIcon}
              />
              <Text style={styles.statValue}>{engagementRate}%</Text>
              <Text style={styles.statLabel}>Engagement</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.engagementContainer}>
            <View style={styles.engagementItem}>
              <Feather name="heart" size={16} color="#64748b" />
              <Text style={styles.engagementValue}>
                {likes.toLocaleString()}
              </Text>
              <Text style={styles.engagementLabel}>Likes</Text>
            </View>

            <View style={styles.engagementItem}>
              <Feather name="message-square" size={16} color="#64748b" />
              <Text style={styles.engagementValue}>
                {comments.toLocaleString()}
              </Text>
              <Text style={styles.engagementLabel}>Comments</Text>
            </View>

            <View style={styles.engagementItem}>
              <Feather name="share-2" size={16} color="#64748b" />
              <Text style={styles.engagementValue}>
                {shares.toLocaleString()}
              </Text>
              <Text style={styles.engagementLabel}>Shares</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionButton}>
            <Feather
              name="download"
              size={20}
              color={myTheme.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Download Recording</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Feather
              name="bar-chart-2"
              size={20}
              color={myTheme.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>View Detailed Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Feather
              name="share-2"
              size={20}
              color={myTheme.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Share Stream Summary</Text>
          </TouchableOpacity>
        </Card>

        <TouchableOpacity
          style={styles.newStreamButton}
          onPress={() => router.push("/(app)/(livestream)/create-livestream")}
        >
          <Feather
            name="video"
            size={20}
            color="#fff"
            style={styles.buttonIcon}
          />
          <Text style={styles.newStreamText}>Schedule New Livestream</Text>
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
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    position: "relative",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  bannerContainer: {
    marginBottom: 16,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bannerIcon: {
    marginRight: 8,
  },
  bannerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  summaryCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 16,
  },
  engagementContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  engagementItem: {
    alignItems: "center",
  },
  engagementValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginTop: 4,
    marginBottom: 2,
  },
  engagementLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  actionsCard: {
    marginBottom: 16,
    padding: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    color: "#0f172a",
  },
  newStreamButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: myTheme.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
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
  newStreamText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
