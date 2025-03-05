"use client";

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { myFontWeight } from "@/constants";

export default function UnauthorizedScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Không có quyền truy cập</Text>
      <Text style={styles.message}>
        Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị
        viên nếu bạn cần trợ giúp.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/(app)/(tabs)")}
      >
        <Text style={styles.buttonText}>Quay lại trang chính</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: myFontWeight.bold,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: myFontWeight.regular,
    color: "#666",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: myFontWeight.medium,
  },
});
