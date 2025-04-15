"use client";

import { useNavigation } from "expo-router";
import { jwtDecode } from "jwt-decode";
import {
  type PropsWithChildren,
  useState,
  useEffect,
  useCallback,
} from "react";

import AuthContext from "./AuthContenxtDefinition";

import { resolveError } from "@/utils";
import { GET, POST } from "@/utils/api.caller";
import { log } from "@/utils/logger";
import { getItem, removeItem, setItem } from "@/utils/asyncStorage";

import type { TRoleResponse, GetRoleByEnumResponse } from "@/types/role";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useRole from "@/hooks/api/useRole";
import { Alert } from "react-native";
import { AxiosError } from "axios";
import { firebaseAuth } from "@/utils/firebase";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import useFirebase from "@/hooks/api/useFirebase";

export { useSession } from "../hooks/useSession";

export function SessionProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [refreshToken, setRefreshToken] = useState<string | undefined>();
  const [firebaseToken, setFirebaseToken] = useState<string | undefined>();

  const [firebaseUser, setFirebaseUser] =
    useState<FirebaseAuthTypes.UserCredential | null>(null);
  const navigation = useNavigation();
  const { createCustomToken } = useFirebase();
  // Use the useRole hook instead of managing role state directly
  const {
    fetchRoles,
    getRoleByEnum,
    getRoleNameByEnum,
    isRolesLoaded,
    rolesData: roles,
    mappedRoles,
    isLoading: isLoadingRoles,
  } = useRole();

  const handleFirebaseAuth = async (token: string) => {
    try {
      const userCredential = await firebaseAuth.signInWithCustomToken(token);
      setFirebaseUser(userCredential);
      return userCredential.user;
    } catch (error) {
      log.error("Firebase auth error:", error);
      throw error;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        log.info("Checking stored token", process.env.EXPO_PUBLIC_API_URL);

        // Fetch roles on initial load - doesn't depend on authentication
        await fetchRoles();

        const storedToken = await Promise.all([
          getItem("accessToken"),
          getItem("refreshToken"),
          getItem("firebaseToken"),
        ]);
        console.log("storedToken", storedToken);

        if (storedToken[0] && storedToken[1]) {
          setAccessToken(storedToken[0]);
          setRefreshToken(storedToken[1]);
          const decodedToken = jwtDecode(storedToken[0]);
          if (decodedToken.exp && decodedToken.exp * 1000 > Date.now()) {
            navigation.reset({
              index: 0,
              routes: [{ name: "(app)" as never }],
            });
          }
        }

        if (storedToken[2]) {
          setFirebaseToken(storedToken[2]);
        }
      } catch (error) {
        log.error(error);
        navigation.reset({
          index: 0,
          routes: [{ name: "welcome" as never }],
        });
      }
    })();
  }, [navigation, fetchRoles]);

  return (
    <AuthContext.Provider
      value={{
        login: async (email, password) => {
          try {
            console.log("email:", email, password);

            const { data: res } = await POST(
              "/auth/login",
              { email, password },
              {},
              {}
            );
            console.log("check response", res);

            setAccessToken(res.data?.accessToken);
            setRefreshToken(res.data?.refreshToken);
            await setItem("accessToken", res.data?.accessToken);
            await setItem("refreshToken", res.data?.refreshToken);

            try {
              // Assuming useFirebase().createCustomToken() is your function to get a Firebase token
              const firebaseTokenResponse = await createCustomToken();

              if (firebaseTokenResponse) {
                const fbToken = firebaseTokenResponse.data.token;

                // 4. Save Firebase token
                await setItem("firebaseToken", fbToken);
                setFirebaseToken(fbToken);

                // 5. Sign in to Firebase immediately
                await handleFirebaseAuth(fbToken);
              }
            } catch (firebaseError) {
              log.error("Failed to get or use Firebase token:", firebaseError);
              // We continue with navigation even if Firebase auth fails
              // The app can try to recover later
            }

            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: "welcome" as never }],
              });
            }
            return true;
          } catch (error: any) {
            console.log("error 130", error);

            if (error.message == "Invalid email") {
              Alert.alert("Xin lỗi", "Email không hợp lệ", [{ text: "OK" }]);
            } else if (error.message == "Invalid password") {
              Alert.alert("Xin lỗi", "Mật khẩu không hợp lệ", [{ text: "OK" }]);
            }
            return resolveError(error);
          }
        },
        logout: async () => {
          try {
            await AsyncStorage.removeItem("refreshToken");
            await AsyncStorage.removeItem("accessToken");
            await AsyncStorage.removeItem("firebaseToken");
            setAccessToken(undefined);
            setRefreshToken(undefined);
            setFirebaseToken(undefined);
          } catch (error) {
            return resolveError(error);
          }
        },
        saveFirebaseToken: async (firebaseToken: string) => {
          try {
            await setItem("firebaseToken", firebaseToken);
            setFirebaseToken(firebaseToken);
          } catch (error) {
            return resolveError(error);
          }
        },
        removeFirebaseToken: async () => {
          try {
            await removeItem("firebaseToken");
            setFirebaseToken(undefined);
          } catch (error) {
            return resolveError(error);
          }
        },
        setToken: async (accessToken, refreshToken) => {
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);
          await setItem("accessToken", accessToken);
          await setItem("refreshToken", refreshToken);
        },
        fetchRoles,
        getRoleByEnum,
        getRoleNameByEnum,
        isRolesLoaded,
        accessToken,
        refreshToken,
        firebaseToken,
        roles,
        mappedRoles,
        isLoadingRoles,
        firebaseUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
