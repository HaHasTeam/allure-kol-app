import { StyleSheet } from "react-native";
import { Text } from "react-native-ui-lib";

export const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.label}>
    {children} <Text style={styles.requiredAsterisk}>*</Text>
  </Text>
);
const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: "#ef4444",
    fontWeight: "bold",
  },
});
