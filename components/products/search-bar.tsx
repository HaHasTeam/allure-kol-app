import type React from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = "Search products...",
}) => {
  return (
    <View style={styles.container}>
      <Feather name="search" size={20} color="#64748b" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#94a3b8"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Feather name="x" size={16} color="#64748b" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#0f172a",
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar;
