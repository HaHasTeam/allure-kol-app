import type React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "react-native-ui-lib";

import { myTheme } from "@/constants/index";

interface LoadingIndicatorProps {
  message?: string;
  size?: "small" | "large";
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "Loading...",
  size = "large",
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={myTheme.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 12,
  },
});

export default LoadingIndicator;
