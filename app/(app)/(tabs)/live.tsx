"use client";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { Text, Card } from "react-native-ui-lib";
import { useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { myTheme } from "@/constants/index";

export default function LiveScreen() {
  const router = useRouter();

  // Animation for the button
  const buttonScale = useSharedValue(1);

  const buttonAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const handleButtonPress = () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });

    // Navigate to livestream setup
    router.push("/(app)/(livestream)/create-livestream");
  };

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
      >
        <Card style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Image
              source={require("@/assets/images/no_avatar.png")}
              style={styles.welcomeImage}
              resizeMode="contain"
            />
            <Text style={styles.welcomeTitle}>Ready to Go Live?</Text>
            <Text style={styles.welcomeText}>
              Connect with your audience in real-time and showcase your products
              to boost engagement and sales.
            </Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Before You Start</Text>

        <Card style={styles.guidelineCard}>
          <View style={styles.guidelineItem}>
            <View style={styles.guidelineIconContainer}>
              <Feather name="wifi" size={20} color="#fff" />
            </View>
            <View style={styles.guidelineContent}>
              <Text style={styles.guidelineTitle}>Stable Connection</Text>
              <Text style={styles.guidelineText}>
                Ensure you have a stable internet connection with at least 5Mbps
                upload speed for best streaming quality.
              </Text>
            </View>
          </View>

          <View style={styles.guidelineItem}>
            <View
              style={[
                styles.guidelineIconContainer,
                { backgroundColor: "#f59e0b" },
              ]}
            >
              <Feather name="sun" size={20} color="#fff" />
            </View>
            <View style={styles.guidelineContent}>
              <Text style={styles.guidelineTitle}>Good Lighting</Text>
              <Text style={styles.guidelineText}>
                Set up in a well-lit area. Natural light is best, but ring
                lights or soft lamps work great too.
              </Text>
            </View>
          </View>

          <View style={styles.guidelineItem}>
            <View
              style={[
                styles.guidelineIconContainer,
                { backgroundColor: "#10b981" },
              ]}
            >
              <Feather name="mic" size={20} color="#fff" />
            </View>
            <View style={styles.guidelineContent}>
              <Text style={styles.guidelineTitle}>Clear Audio</Text>
              <Text style={styles.guidelineText}>
                Test your microphone before going live. Reduce background noise
                for better audience experience.
              </Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Community Guidelines</Text>

        <Card style={styles.rulesCard}>
          <View style={styles.ruleItem}>
            <MaterialIcons
              name="check-circle"
              size={20}
              color={myTheme.primary}
              style={styles.ruleIcon}
            />
            <Text style={styles.ruleText}>
              Be respectful and professional with your audience
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <MaterialIcons
              name="check-circle"
              size={20}
              color={myTheme.primary}
              style={styles.ruleIcon}
            />
            <Text style={styles.ruleText}>
              Only promote products that you have rights to sell
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <MaterialIcons
              name="check-circle"
              size={20}
              color={myTheme.primary}
              style={styles.ruleIcon}
            />
            <Text style={styles.ruleText}>
              Provide accurate information about your products
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <MaterialIcons
              name="check-circle"
              size={20}
              color={myTheme.primary}
              style={styles.ruleIcon}
            />
            <Text style={styles.ruleText}>
              Do not share inappropriate or offensive content
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <MaterialIcons
              name="check-circle"
              size={20}
              color={myTheme.primary}
              style={styles.ruleIcon}
            />
            <Text style={styles.ruleText}>
              Respect intellectual property and copyright laws
            </Text>
          </View>
        </Card>

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

          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>04</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Be Authentic</Text>
              <Text style={styles.tipText}>
                Show your genuine personality and honest opinions about
                products.
              </Text>
            </View>
          </View>
        </Card>

        <Animated.View style={[styles.buttonContainer, buttonAnimStyle]}>
          <TouchableOpacity
            style={styles.setupButton}
            onPress={handleButtonPress}
            activeOpacity={0.8}
          >
            <Feather
              name="video"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Set Up Your Livestream</Text>
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
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 24,
    padding: 0,
    overflow: "hidden",
  },
  welcomeContent: {
    padding: 20,
    alignItems: "center",
  },
  welcomeImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 12,
    marginLeft: 4,
  },
  guidelineCard: {
    marginBottom: 24,
    padding: 16,
  },
  guidelineItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  guidelineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: myTheme.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  guidelineContent: {
    flex: 1,
  },
  guidelineTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  guidelineText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  rulesCard: {
    marginBottom: 24,
    padding: 16,
  },
  ruleItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  ruleIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
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
  setupButton: {
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
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
