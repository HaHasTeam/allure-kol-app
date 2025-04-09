import type React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-ui-lib";

import { myTheme } from "@/constants/index";

interface ModalFooterProps {
  onCancel: () => void;
  onConfirm: () => void;
  selectedCount: number;
  cancelText?: string;
  confirmText?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = ({
  onCancel,
  onConfirm,
  selectedCount,
  cancelText = "Cancel",
  confirmText = "Confirm",
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>{cancelText}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.confirmButton,
          selectedCount === 0 && styles.confirmButtonDisabled,
        ]}
        onPress={onConfirm}
        disabled={selectedCount === 0}
      >
        <Text style={styles.confirmButtonText}>
          {confirmText} ({selectedCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff", // Add background color to ensure visibility
    zIndex: 1, // Ensure the footer stays on top
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: myTheme.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
});

export default ModalFooter;
