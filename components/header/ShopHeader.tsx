"use client";

import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Badge } from "react-native-ui-lib";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { myTheme } from "@/constants/index";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useState } from "react";
import SearchModal from "../search/SearchModal";

const { width } = Dimensions.get("window");

interface ShopHeaderProps {
  cartItemCount?: number;
  notificationCount?: number;
  onSearchChange?: (text: string) => void;
}

const ShopHeader = ({
  cartItemCount = 10,
  notificationCount = 10,
  onSearchChange,
}: ShopHeaderProps) => {
  const router = useRouter();
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  // Animation hooks
  const cartScale = useSharedValue(1);
  const notifScale = useSharedValue(1);

  const pressCartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(cartScale.value) }],
    };
  });

  const pressNotifStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(notifScale.value) }],
    };
  });

  // Animation handlers
  const handleCartPressIn = () => {
    cartScale.value = 0.9;
  };

  const handleCartPressOut = () => {
    cartScale.value = 1;
  };

  const handleNotifPressIn = () => {
    notifScale.value = 0.9;
  };

  const handleNotifPressOut = () => {
    notifScale.value = 1;
  };

  const handleSearchPress = () => {
    setSearchModalVisible(true);
  };

  const handleSearchClose = () => {
    setSearchModalVisible(false);
  };

  const handleSearch = (query: string) => {
    if (onSearchChange) {
      onSearchChange(query);
    }
    // You could also navigate to search results page here
    // router.push({ pathname: "/(app)/(home)/search-results", params: { query } });
  };

  return (
    <View style={styles.container}>
      {/* Search Bar (now just a button that opens the modal) */}
      <TouchableOpacity
        style={styles.searchContainer}
        activeOpacity={0.7}
        onPress={handleSearchPress}
      >
        <View style={styles.textFieldContainer}>
          <View style={styles.searchInputButton}>
            <View style={styles.searchIcon}>
              <Feather name="search" size={16} color={myTheme.primary} />
            </View>
            <View style={styles.searchPlaceholder}>
              <Feather
                name="search"
                size={16}
                color="#999"
                style={{ marginRight: 6 }}
              />
              <Animated.Text style={styles.placeholderText}>
                Tìm kiếm sản phẩm...
              </Animated.Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Icons Container */}
      <View style={styles.iconsContainer}>
        {/* Cart Icon with Badge */}
        <AnimatedTouchable
          style={[styles.iconWrapper]}
          activeOpacity={0.7}
          onPressIn={handleCartPressIn}
          onPressOut={handleCartPressOut}
          onPress={() => router.push({ pathname: "/(app)/(home)/cart" })}
        >
          <Animated.View style={[styles.iconBackground, pressCartStyle]}>
            <Feather name="shopping-cart" size={18} color={myTheme.primary} />
          </Animated.View>
          {cartItemCount > 0 && (
            <Badge
              label={cartItemCount > 99 ? "99+" : cartItemCount.toString()}
              size={14}
              backgroundColor={myTheme.primary}
              containerStyle={styles.badge}
            />
          )}
        </AnimatedTouchable>

        {/* Notification Icon with Badge */}
        <AnimatedTouchable
          style={[styles.iconWrapper]}
          activeOpacity={0.7}
          onPressIn={handleNotifPressIn}
          onPressOut={handleNotifPressOut}
          onPress={() =>
            router.push({ pathname: "/(app)/(home)/notifications" })
          }
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

      {/* Search Modal */}
      <SearchModal
        visible={searchModalVisible}
        onClose={handleSearchClose}
        onSearch={handleSearch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
    flexDirection: "column",
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
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  searchContainer: {
    marginBottom: 8,
  },
  textFieldContainer: {
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
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
  searchInputButton: {
    height: 36,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: 13,
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 2,
  },
  iconWrapper: {
    position: "relative",
    marginLeft: 16,
    padding: 2,
  },
  iconBackground: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    width: 32,
    height: 32,
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
});

export default ShopHeader;
