"use client";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Badge, Avatar, Text } from "react-native-ui-lib";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

// Import myTheme
import { myTheme } from "@/constants/index";

const { width } = Dimensions.get("window");

interface KOLHeaderProps {
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
}

const KOLHeader = ({
  userName = "KOL",
  userAvatar,
  notificationCount = 0,
}: KOLHeaderProps) => {
  const router = useRouter();
  const timeOfDay = getTimeOfDay();

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  // Animation hooks
  const notifScale = useSharedValue(1);

  const pressNotifStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(notifScale.value) }],
    };
  });

  // Animation handlers
  const handleNotifPressIn = () => {
    notifScale.value = 0.9;
  };

  const handleNotifPressOut = () => {
    notifScale.value = 1;
  };

  return (
    <View style={styles.container}>
      {/* Top Row: Greeting and Notifications */}
      <View style={styles.topRow}>
        <View style={styles.greetingContainer}>
          <View style={styles.avatarContainer}>
            <Avatar
              size={40}
              source={
                userAvatar
                  ? { uri: userAvatar }
                  : require("@/assets/images/no_avatar.png")
              }
              containerStyle={styles.avatar}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.greetingText}>{`Good ${timeOfDay},`}</Text>
            <Text style={styles.nameText}>{userName}</Text>
          </View>
        </View>

        <View style={styles.iconsContainer}>
          {/* Notification Icon with Badge */}
          <AnimatedTouchable
            style={[styles.iconWrapper]}
            activeOpacity={0.7}
            onPressIn={handleNotifPressIn}
            onPressOut={handleNotifPressOut}
            onPress={() => router.push("/(app)/(home)/notifications")}
          >
            <Animated.View style={[styles.iconBackground, pressNotifStyle]}>
              <Feather name="bell" size={18} color={myTheme.primary} />
            </Animated.View>
            {notificationCount > 0 && (
              <Badge
                label={
                  notificationCount > 99 ? "99+" : notificationCount.toString()
                }
                size={14}
                backgroundColor={myTheme.primary}
                containerStyle={styles.badge}
              />
            )}
          </AnimatedTouchable>
        </View>
      </View>

      {/* Bottom Row: Live Status */}
      <View style={styles.liveStatusContainer}>
        <View style={styles.liveStatusBadge}>
          <FontAwesome5
            name="video"
            size={12}
            color="#fff"
            style={styles.liveIcon}
          />
          <Text style={styles.liveText}>LIVE NOW</Text>
        </View>
        <Text style={styles.viewersText}>1.2K viewers watching</Text>
      </View>
    </View>
  );
};

// Helper function to get time of day for greeting
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    borderWidth: 2,
    borderColor: myTheme.primary,
  },
  textContainer: {
    flexDirection: "column",
  },
  greetingText: {
    fontSize: 14,
    color: myTheme.grey,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    position: "relative",
    padding: 2,
  },
  iconBackground: {
    backgroundColor: myTheme.lightGrey,
    borderRadius: 16,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
  },
  liveStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: myTheme.red,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  liveIcon: {
    marginRight: 4,
  },
  liveText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
  },
  viewersText: {
    fontSize: 12,
    color: myTheme.grey,
  },
});

export default KOLHeader;
