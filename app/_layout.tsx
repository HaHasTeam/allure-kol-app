import "expo-dev-client";

import { myFontWeight } from "@/constants";
import { SessionProvider } from "@/contexts/AuthContext";
import QueryProvider from "@/provider/QueryProvider";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { Header, HeaderBackButton } from "@react-navigation/elements";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { Appearance, Platform, StatusBar, StyleSheet } from "react-native";
import { View } from "react-native-ui-lib";
import * as Linking from "expo-linking";
import { ToastProvider } from "@/contexts/ToastContext";
// import { SessionProvider } from "@/contexts/AuthContext";
// import QueryProvider from "@/provider/QueryProvider";
// import { myFontWeight } from "@/contracts/constants";
// import { firebaseCloudMessaging } from "@/utils/firebase";
// SplashScreen.preventAutoHideAsync();
const prefix = Linking.createURL("/");

const linking = {
  prefixes: [prefix],
  config: {
    screens: {
      home: "",
      login: "login",
      register: "register",
      verify: "verify",
      // Add other screens here
    },
  },
};
export default function Root() {
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

  // setBackgroundMessageHandler(firebaseCloudMessaging, async (remoteMessage) => {
  //   console.log("Message handled in the background!", remoteMessage);
  // });

  return (
    <ActionSheetProvider>
      <View
        useSafeArea={Platform.OS === "ios" || Platform.OS === "android"}
        style={styles.container}
      >
        <StatusBar
          translucent={false}
          backgroundColor={
            Appearance.getColorScheme() === "dark" ? "black" : "transparent"
          }
        />

        <QueryProvider>
          <SessionProvider>
            <ToastProvider>
              <Stack>
                <Stack.Screen
                  name="(app)"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="welcome"
                  options={{
                    title: "",
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="login"
                  options={{
                    header: () => (
                      <Header
                        headerLeft={() => (
                          <HeaderBackButton
                            label="Quay lại"
                            labelStyle={{
                              fontFamily: myFontWeight.regular,
                            }}
                            onPress={() => router.back()}
                          />
                        )}
                        title="Đăng nhập"
                        headerTitleStyle={{
                          fontFamily: myFontWeight.bold,
                        }}
                      />
                    ),
                  }}
                />
                <Stack.Screen
                  name="register"
                  options={{
                    header: () => (
                      <Header
                        title="Tạo tài khoản"
                        headerLeft={() => (
                          <HeaderBackButton
                            label="Quay lại"
                            labelStyle={{
                              fontFamily: myFontWeight.regular,
                            }}
                            onPress={() => router.back()}
                          />
                        )}
                        headerTitleStyle={{
                          fontFamily: myFontWeight.bold,
                        }}
                      />
                    ),
                  }}
                />
                <Stack.Screen
                  name="verify"
                  options={{
                    header: () => (
                      <Header
                        title="Xác minh tài khoản"
                        headerTitleStyle={{
                          fontFamily: myFontWeight.bold,
                        }}
                      />
                    ),
                  }}
                />
              </Stack>
            </ToastProvider>
          </SessionProvider>
        </QueryProvider>
      </View>
    </ActionSheetProvider>
  );
}
