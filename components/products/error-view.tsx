import type React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-ui-lib";

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
  retryButtonText?: string;
}

const ErrorView: React.FC<ErrorViewProps> = ({
  message,
  onRetry,
  retryButtonText = "Retry",
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>{retryButtonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  message: {
    fontSize: 14,
    color: "#ef4444",
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#ef4444",
    borderRadius: 4,
    marginLeft: 8,
  },
  retryButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
});

export default ErrorView;
