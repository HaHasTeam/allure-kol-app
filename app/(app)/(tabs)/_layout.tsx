import Feather from "@expo/vector-icons/Feather";
import { Header } from "@react-navigation/elements";
import { Tabs, useRouter } from "expo-router";
import React, { useState } from "react";
import { ImageBackground, StyleSheet, TouchableOpacity } from "react-native";
import { Avatar, View } from "react-native-ui-lib";

import {
  myDeviceWidth,
  myFontWeight,
  myTextColor,
  myTheme,
  width,
} from "../../../constants/index";
import { FontAwesome5 } from "@expo/vector-icons";
import MyText from "@/components/common/MyText";
import useUser from "@/hooks/api/useUser";
import { TUser } from "@/types/user";
import KOLHeader from "@/components/header/KOLHeader";

export default function TabLayout() {
  const router = useRouter();
  const { getProfile } = useUser();
  const [user, setUser] = useState<TUser>({
    email: "",
    id: "",
    username: "",
    avatar: "",
    phone: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    role: "",
    status: "",
    isEmailVerify: false,
  });
  const style = StyleSheet.create({
    iconContainer: {
      padding: 5,
      borderRadius: 15,
    },
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: myTheme.primary,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 65,
          backgroundColor: "#FFF",
        },
        tabBarIconStyle: {
          margin: 5,
        },
        tabBarItemStyle: {
          borderRadius: 15,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        listeners={{
          focus: async () => {
            const data = await getProfile();
            if (data && typeof data !== "string") setUser(data);
          },
        }}
        options={{
          title: "Home",
          header: () => (
            <KOLHeader
              userName={user.username || "KOL"}
              userAvatar={user.avatar}
              notificationCount={5}
            />
          ),
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                style.iconContainer,
                focused && { backgroundColor: myTheme.lighter },
              ]}
            >
              <Feather
                size={width <= myDeviceWidth.sm ? 21 : 25}
                name="home"
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="live"
        options={{
          title: "Live",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                style.iconContainer,
                focused && { backgroundColor: myTheme.lighter },
              ]}
            >
              <FontAwesome5
                size={width <= myDeviceWidth.sm ? 21 : 25}
                name="video"
                color={color}
                solid
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        listeners={{
          focus: async () => {
            const data = await getProfile();
            if (data && typeof data !== "string") setUser(data);
          },
        }}
        options={{
          title: "Profile",
          header: () => (
            <ImageBackground
              source={require("@/assets/images/profile-background.jpg")}
              resizeMode="cover"
              borderBottomLeftRadius={40}
              borderBottomRightRadius={40}
              style={{
                flexDirection: "column",
                paddingBottom: 24,
                marginTop: -35,
              }}
            >
              <Header
                title="Trang cá nhân"
                headerStyle={{
                  borderBottomLeftRadius: 40,
                  borderBottomRightRadius: 40,
                  backgroundColor: "transparent",
                  height: 100,
                }}
                headerTitleAlign="left"
                headerTitleStyle={{
                  fontFamily: myFontWeight.bold,
                  color: "#FFF",
                  paddingTop: 25,
                }}
              />
              <Avatar
                size={80}
                containerStyle={{
                  alignSelf: "center",
                }}
                source={
                  user.avatar
                    ? { uri: user.avatar.replace("http://", "https://") }
                    : require("@/assets/images/no_avatar.png")
                }
              />
              <MyText
                styleProps={{
                  alignSelf: "center",
                  fontSize: 16,
                  fontFamily: myFontWeight.bold,
                  color: "#FFF",
                }}
                text={user.email || ""}
              />
              {/* <MyText
                styleProps={{
                  alignSelf: "center",
                  color: "#FFF",
                }}
                text={user.email}
              /> */}
            </ImageBackground>
          ),
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                style.iconContainer,
                focused && { backgroundColor: myTheme.lighter },
              ]}
            >
              <Feather
                size={width <= myDeviceWidth.sm ? 21 : 25}
                name="user"
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
