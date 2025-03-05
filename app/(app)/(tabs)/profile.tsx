"use client";

import { useEffect, useState } from "react";
import { View, Avatar, Card } from "react-native-ui-lib";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import MyText from "@/components/common/MyText";
import {
  myDeviceWidth,
  myFontWeight,
  myTheme,
  width,
} from "../../../constants/index";
import {
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
  Entypo,
  Feather,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSession } from "@/hooks/useSession";

import { log } from "@/utils/logger";
import { UserStatusEnum, UserGenderEnum, TUser } from "../../../types/user";
import useUser from "@/hooks/api/useUser";

const ProfileScreen = () => {
  const router = useRouter();
  const { logout } = useSession();
  const { getProfile } = useUser();
  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Use the getProfile function from the useUser hook
        const userData = await getProfile();
        console.log("userData", userData);

        if (typeof userData === "string") {
          throw new Error(userData);
        } else if (userData) {
          setUser(userData);
        }
      } catch (error) {
        log.error("Error fetching profile:", error);
        Alert.alert("Error", "Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [getProfile]);

  const handleLogout = () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có muốn đăng xuất khỏi thiết bị này?",
      [
        {
          style: "destructive",
          text: "Đăng xuất",
          onPress: async () => {
            await logout();
            log.info("Logout");
          },
        },
        {
          style: "cancel",
          text: "Hủy",
        },
      ]
    );
  };

  const settingMenu = [
    {
      icon: (
        <FontAwesome5
          style={style.icon}
          name="user-cog"
          size={24}
          color={myTheme.primary}
        />
      ),
      onPress: () => router.push("/(app)/(profile)/editprofile"),
      title: "Cập nhật tài khoản",
    },
    {
      icon: (
        <Feather
          style={style.icon}
          name="lock"
          size={24}
          color={myTheme.primary}
        />
      ),
      onPress: () => router.push("/(app)/(profile)/updatepassword"),
      title: "Đổi mật khẩu",
    },
    {
      icon: (
        <MaterialCommunityIcons
          style={style.icon}
          name="logout"
          size={24}
          color={myTheme.red}
        />
      ),
      onPress: () => handleLogout(),
      title: "Đăng xuất",
    },
  ];

  const otherMenu = [
    {
      icon: (
        <FontAwesome
          style={style.icon}
          name="phone"
          size={24}
          color={myTheme.primary}
        />
      ),
      onPress: () => router.push("/(app)/(profile)/contact"),
      title: "Liên hệ",
    },
  ];

  const getStatusColor = (status: UserStatusEnum | string) => {
    switch (status) {
      case UserStatusEnum.ACTIVE:
        return myTheme.green;
      case UserStatusEnum.INACTIVE:
        return myTheme.red;
      default:
        return myTheme.grey;
    }
  };

  const getGenderIcon = (gender: UserGenderEnum | string | undefined) => {
    switch (gender) {
      case UserGenderEnum.MALE:
        return <Ionicons name="male" size={16} color={myTheme.primary} />;
      case UserGenderEnum.FEMALE:
        return <Ionicons name="female" size={16} color={myTheme.red} />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 20, gap: 24, paddingBottom: 40 }}>
        {/* Profile Header */}
        <Card style={style.profileCard}>
          {loading ? (
            <View style={style.loadingContainer}>
              <MyText
                text="Đang tải thông tin..."
                styleProps={{ fontSize: 16, color: myTheme.grey }}
              />
            </View>
          ) : (
            <>
              <View style={style.profileHeader}>
                <Avatar
                  size={80}
                  source={
                    user?.avatar
                      ? { uri: user.avatar }
                      : require("@/assets/images/no_avatar.png")
                  }
                  label={
                    (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")
                  }
                  backgroundColor={myTheme.primary}
                />
                <View style={style.nameContainer}>
                  <MyText
                    text={`${user?.firstName || ""} ${user?.lastName || ""}`}
                    styleProps={{
                      fontSize: width < myDeviceWidth.sm ? 20 : 22,
                      fontFamily: myFontWeight.bold,
                    }}
                  />
                  <View style={style.usernameRow}>
                    <MyText
                      text={`@${user?.username || ""}`}
                      styleProps={{
                        fontSize: width < myDeviceWidth.sm ? 14 : 16,
                        color: myTheme.grey,
                      }}
                    />
                    {user?.gender && (
                      <View style={{ marginLeft: 8 }}>
                        {getGenderIcon(user.gender)}
                      </View>
                    )}
                  </View>
                  <View style={style.statusBadge}>
                    <View
                      style={[
                        style.statusDot,
                        { backgroundColor: getStatusColor(user?.status || "") },
                      ]}
                    />
                    <MyText
                      text={user?.status || ""}
                      styleProps={{
                        fontSize: 12,
                        color: getStatusColor(user?.status || ""),
                      }}
                    />
                  </View>
                </View>
              </View>

              {/* User Details */}
              <View style={style.detailsContainer}>
                <View style={style.detailRow}>
                  <MaterialIcons
                    name="email"
                    size={20}
                    color={myTheme.primary}
                  />
                  <MyText
                    text={user?.email || "N/A"}
                    styleProps={{ fontSize: 14, marginLeft: 10 }}
                  />
                  {user?.isEmailVerify && (
                    <View style={style.verifiedBadge}>
                      <MaterialIcons
                        name="verified"
                        size={16}
                        color={myTheme.green}
                      />
                    </View>
                  )}
                </View>

                <View style={style.detailRow}>
                  <FontAwesome name="phone" size={20} color={myTheme.primary} />
                  <MyText
                    text={user?.phone || "Chưa cập nhật"}
                    styleProps={{ fontSize: 14, marginLeft: 10 }}
                  />
                </View>

                <View style={style.detailRow}>
                  <Entypo name="calendar" size={20} color={myTheme.primary} />
                  <MyText
                    text={user?.dob ? formatDate(user.dob) : "Chưa cập nhật"}
                    styleProps={{ fontSize: 14, marginLeft: 10 }}
                  />
                </View>

                <View style={style.detailRow}>
                  <MaterialIcons
                    name="badge"
                    size={20}
                    color={myTheme.primary}
                  />
                  <MyText
                    text={user?.role || "N/A"}
                    styleProps={{ fontSize: 14, marginLeft: 10 }}
                  />
                </View>
              </View>
            </>
          )}
        </Card>

        {/* Settings Menu */}
        <MyText
          text="Cài đặt chung"
          styleProps={{
            fontSize: width < myDeviceWidth.sm ? 18 : 20,
            textAlign: "left",
            fontFamily: myFontWeight.bold,
          }}
        />
        <FlatList
          scrollEnabled={false}
          contentContainerStyle={{ rowGap: 24 }}
          data={settingMenu}
          renderItem={(value) => (
            <TouchableOpacity
              onPress={value.item.onPress}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {value.item.icon}
                <MyText
                  styleProps={{ fontSize: width < myDeviceWidth.sm ? 16 : 18 }}
                  text={value.item.title}
                />
              </View>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={24}
                color="black"
              />
            </TouchableOpacity>
          )}
        />

        {/* Other Menu */}
        <MyText
          text="Khác"
          styleProps={{
            fontSize: width < myDeviceWidth.sm ? 18 : 20,
            textAlign: "left",
            fontFamily: myFontWeight.bold,
          }}
        />
        <FlatList
          scrollEnabled={false}
          contentContainerStyle={{ rowGap: 24 }}
          data={otherMenu}
          renderItem={(value) => (
            <TouchableOpacity
              onPress={value.item.onPress}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {value.item.icon}
                <MyText
                  styleProps={{ fontSize: width < myDeviceWidth.sm ? 16 : 18 }}
                  text={value.item.title}
                />
              </View>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={24}
                color="black"
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const style = StyleSheet.create({
  icon: {
    padding: 10,
    backgroundColor: myTheme.lightGrey,
    borderRadius: 17.5,
    width: 50,
    textAlign: "center",
  },
  profileCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  nameContainer: {
    marginLeft: 16,
    flex: 1,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  detailsContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: myTheme.lightGrey,
    paddingTop: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});
