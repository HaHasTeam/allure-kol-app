"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Text, Card, Button, Avatar, ProgressBar } from "react-native-ui-lib";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { myTheme } from "@/constants/index";

export default function KOLHomePage() {
  const router = useRouter();
  const [isFirstLogin, setIsFirstLogin] = useState(true);
  const [hasScheduledStreams, setHasScheduledStreams] = useState(false);
  const [loading, setLoading] = useState(true);

  // Animation for buttons
  const buttonScale = useSharedValue(1);

  const buttonAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  // Simulate checking if user has any scheduled streams
  useEffect(() => {
    // This would be an API call in a real app
    setTimeout(() => {
      setHasScheduledStreams(false); // Set to true if they have streams
      setLoading(false);
    }, 1000);
  }, []);

  const goToCreateStream = () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    router.push("/(app)/(livestream)/create-livestream");
  };

  const goToScheduledStreams = () => {
    router.push("/(app)/(tabs)/live");
  };

  const dismissWelcome = () => {
    setIsFirstLogin(false);
    // In a real app, you would save this preference to user settings
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBar} />
        <View style={styles.loadingCard} />
        <View style={styles.loadingSmallCard} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Welcome banner for first-time users */}
      {isFirstLogin && (
        <View style={styles.welcomeBanner}>
          <TouchableOpacity
            onPress={dismissWelcome}
            style={styles.dismissButton}
          >
            <Text style={styles.dismissButtonText}>×</Text>
          </TouchableOpacity>
          <Text style={styles.welcomeTitle}>Welcome to Allure!</Text>
          <Text style={styles.welcomeText}>
            Your platform for creating engaging livestreams and connecting with
            your audience.
          </Text>
          <Button
            label="Take a quick tour"
            backgroundColor={myTheme.yellow}
            color="#fff"
            onPress={() => router.push("/(app)/tutorial")}
            style={styles.tourButton}
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile summary */}
        <View style={styles.profileContainer}>
          <Avatar
            size={60}
            source={{ uri: "https://i.imgur.com/8BFQXnZ.jpg" }}
            label="KOL"
            backgroundColor={myTheme.primary}
            containerStyle={styles.avatar}
          />
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>Welcome back, Creator!</Text>
            <Text style={styles.profileSubtitle}>
              Ready to engage with your audience?
            </Text>
          </View>
        </View>

        {/* Quick actions */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <Button
              style={styles.actionButton}
              backgroundColor={myTheme.primary}
              onPress={goToCreateStream}
            >
              <View style={styles.actionButtonContent}>
                <Feather name="video" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Go Live Now</Text>
              </View>
            </Button>
            <Button
              style={styles.actionButton}
              backgroundColor="#fff"
              outlineColor={myTheme.borderColor}
              outlineWidth={1}
              onPress={goToScheduledStreams}
            >
              <View style={styles.actionButtonContent}>
                <Feather name="calendar" size={24} color={myTheme.textColor} />
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: myTheme.textColor },
                  ]}
                >
                  Scheduled Streams
                </Text>
              </View>
            </Button>
          </View>
        </Card>

        {/* Conditional content based on whether they have streams */}
        {hasScheduledStreams ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Your Next Livestream</Text>
            <Text style={styles.cardSubtitle}>
              Get ready for your upcoming stream
            </Text>

            <View style={styles.nextStreamContainer}>
              <View style={styles.streamInfoContainer}>
                <View>
                  <Text style={styles.streamTitle}>
                    Summer Fashion Collection
                  </Text>
                  <Text style={styles.streamTime}>Today at 7:00 PM</Text>
                </View>
                <Button
                  size={Button.sizes.small}
                  backgroundColor={myTheme.yellow}
                  style={styles.startButton}
                >
                  <View style={styles.startButtonContent}>
                    <Feather name="play" size={14} color="#fff" />
                    <Text style={[styles.startButtonText, { color: "#fff" }]}>
                      Start
                    </Text>
                  </View>
                </Button>
              </View>

              <View style={styles.streamMetaContainer}>
                <View style={styles.streamMetaItem}>
                  <Feather
                    name="shopping-bag"
                    size={14}
                    color={myTheme.textColorLight}
                  />
                  <Text style={styles.streamMetaText}>5 products</Text>
                </View>
                <Text style={styles.streamCountdown}>Starts in 3h 24m</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={goToScheduledStreams}
            >
              <Text style={styles.viewAllText}>View all scheduled streams</Text>
              <Feather
                name="chevron-right"
                size={16}
                color={myTheme.textColorLight}
              />
            </TouchableOpacity>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Get Started</Text>
            <Text style={styles.cardSubtitle}>
              Create your first livestream
            </Text>

            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIconContainer}>
                <Feather name="calendar" size={32} color={myTheme.primary} />
              </View>
              <Text style={styles.emptyStateTitle}>
                No scheduled livestreams
              </Text>
              <Text style={styles.emptyStateText}>
                Create your first livestream to engage with your audience
              </Text>
              <Button
                label="Schedule a Livestream"
                backgroundColor={myTheme.primary}
                iconSource={() => (
                  <Feather
                    name="plus"
                    size={16}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                )}
                onPress={goToCreateStream}
                style={styles.scheduleButton}
              />
            </View>
          </Card>
        )}

        {/* Performance insights */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Performance Insights</Text>
          <Text style={styles.cardSubtitle}>Your livestream statistics</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressLabelContainer}>
              <Text style={styles.progressLabel}>Profile Completion</Text>
              <Text style={styles.progressValue}>70%</Text>
            </View>
            <ProgressBar
              progress={70}
              progressColor={myTheme.primary}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Followers</Text>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>0</Text>
                <Feather
                  name="trending-up"
                  size={16}
                  color="#10b981"
                  style={styles.statIcon}
                />
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Sales</Text>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>$0</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Gifts Received</Text>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>0</Text>
                <Feather
                  name="gift"
                  size={16}
                  color={myTheme.textColorLight}
                  style={styles.statIcon}
                />
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Views</Text>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>0</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push("/(app)/analytics")}
          >
            <Text style={styles.viewAllText}>View detailed analytics</Text>
            <Feather
              name="chevron-right"
              size={16}
              color={myTheme.textColorLight}
            />
          </TouchableOpacity>
        </Card>

        {/* Tips for success */}
        <Card style={[styles.card, styles.lastCard]}>
          <Text style={styles.cardTitle}>Tips for Success</Text>

          <View style={styles.tipContainer}>
            <View style={styles.tipIconContainer}>
              <Feather name="calendar" size={20} color={myTheme.primary} />
            </View>
            <View style={styles.tipTextContainer}>
              <Text style={styles.tipTitle}>Schedule in advance</Text>
              <Text style={styles.tipText}>
                Give your audience time to prepare for your stream
              </Text>
            </View>
          </View>

          <View style={styles.tipContainer}>
            <View style={styles.tipIconContainer}>
              <Feather name="shopping-bag" size={20} color={myTheme.primary} />
            </View>
            <View style={styles.tipTextContainer}>
              <Text style={styles.tipTitle}>Add products to your stream</Text>
              <Text style={styles.tipText}>
                Increase sales by showcasing products during your livestream
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push("/(app)/resources")}
          >
            <Text style={styles.viewAllText}>View all resources</Text>
            <Feather
              name="chevron-right"
              size={16}
              color={myTheme.textColorLight}
            />
          </TouchableOpacity>
        </Card>

        {/* Create livestream button */}
        <Animated.View
          style={[styles.floatingButtonContainer, buttonAnimStyle]}
        >
          <Button
            label="Schedule New Livestream"
            backgroundColor={myTheme.primary}
            iconSource={() => (
              <Feather
                name="calendar"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
            )}
            onPress={goToCreateStream}
            style={styles.floatingButton}
          />
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
  loadingContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBar: {
    height: 32,
    width: "100%",
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingCard: {
    height: 250,
    width: "100%",
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingSmallCard: {
    height: 120,
    width: "100%",
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
  },
  welcomeBanner: {
    backgroundColor: myTheme.primary,
    padding: 16,
    position: "relative",
  },
  dismissButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  dismissButtonText: {
    fontSize: 24,
    color: "rgba(255, 255, 255, 0.8)",
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
  },
  tourButton: {
    alignSelf: "flex-start",
    backgroundColor: myTheme.yellow,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    borderWidth: 2,
    borderColor: myTheme.primary,
  },
  profileTextContainer: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: myTheme.textColor,
  },
  profileSubtitle: {
    fontSize: 14,
    color: myTheme.textColorLight,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  lastCard: {
    marginBottom: 80, // Extra space for the floating button
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: myTheme.textColor,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: myTheme.textColorLight,
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%",
    height: 80,
    borderRadius: 8,
  },
  actionButtonContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    marginTop: 8,
    fontWeight: "500",
  },
  nextStreamContainer: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  streamInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  streamTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: myTheme.textColor,
    marginBottom: 4,
  },
  streamTime: {
    fontSize: 14,
    color: myTheme.textColorLight,
  },
  startButton: {
    paddingHorizontal: 12,
  },
  startButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  startButtonText: {
    color: myTheme.primary,
    fontWeight: "500",
    marginLeft: 4,
  },
  streamMetaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streamMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  streamMetaText: {
    fontSize: 14,
    color: myTheme.textColorLight,
    marginLeft: 6,
  },
  streamCountdown: {
    fontSize: 14,
    color: myTheme.primary,
    fontWeight: "500",
  },
  emptyStateContainer: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${myTheme.lightPrimary}`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: myTheme.textColor,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: myTheme.textColorLight,
    textAlign: "center",
    marginBottom: 16,
  },
  scheduleButton: {
    width: "100%",
  },
  viewAllButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: myTheme.textColorLight,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: myTheme.textColor,
  },
  progressValue: {
    fontSize: 14,
    color: myTheme.textColorLight,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: myTheme.textColorLight,
    marginBottom: 4,
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: myTheme.textColor,
  },
  statIcon: {
    marginLeft: 8,
  },
  tipContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: myTheme.lightPrimary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: myTheme.textColor,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: myTheme.textColorLight,
  },
  floatingButtonContainer: {
    marginBottom: 24,
  },
  floatingButton: {
    height: 56,
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
});
