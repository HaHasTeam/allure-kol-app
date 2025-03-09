import type React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-ui-lib";
import { Feather } from "@expo/vector-icons";

interface EmptyStateProps {
  message: string;
  icon?: string;
  iconSize?: number;
  iconColor?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon = "search",
  iconSize = 48,
  iconColor = "#94a3b8",
}) => {
  return (
    <View style={styles.container}>
      <Feather name={icon as any} size={iconSize} color={iconColor} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  message: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 12,
    textAlign: "center",
  },
});

export default EmptyState;
