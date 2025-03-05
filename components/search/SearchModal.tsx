"use client";

import { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { myTheme } from "@/constants/index";
import MyText from "../common/MyText";
import useDebounce from "../../hooks/useDebounce";

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

const { height } = Dimensions.get("window");

const SearchModal = ({ visible, onClose, onSearch }: SearchModalProps) => {
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Debounce the search text with a 500ms delay
  const debouncedSearchText = useDebounce(searchText, 500);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto focus the input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  // Effect for debounced search
  useEffect(() => {
    // Only perform search if there's text and it's different from the initial render
    if (debouncedSearchText && debouncedSearchText.trim() !== "") {
      performSearch(debouncedSearchText);
    }
  }, [debouncedSearchText]);

  const performSearch = async (query: string) => {
    // Don't search for empty queries
    if (!query.trim()) return;

    setIsSearching(true);

    try {
      // Simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Here you would typically make an API call to get search results
      // For now, we'll just call the onSearch callback
      console.log("Performing search for:", query);

      // We don't close the modal here to allow for continuous searching
      // onSearch(query);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      onSearch(searchText);
      onClose();
    }
  };

  const handleChangeText = (text: string) => {
    setSearchText(text);
    // When text is cleared, reset search state
    if (!text.trim()) {
      setIsSearching(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.searchHeader}>
            <View style={styles.searchInputContainer}>
              {isSearching ? (
                <ActivityIndicator
                  size="small"
                  color={myTheme.primary}
                  style={styles.searchIcon}
                />
              ) : (
                <Feather
                  name="search"
                  size={18}
                  color={myTheme.primary}
                  style={styles.searchIcon}
                />
              )}
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder="Tìm kiếm sản phẩm..."
                value={searchText}
                onChangeText={handleChangeText}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoCapitalize="none"
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <Feather name="x" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <MyText style={styles.cancelText} text="Hủy"></MyText>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContent}>
            <View style={styles.emptyStateContainer}>
              <Feather
                name="search"
                size={50}
                color="#e0e0e0"
                style={styles.emptyStateIcon}
              />
              <MyText
                style={styles.emptyStateText}
                text="Tìm kiếm sản phẩm"
              ></MyText>
              <MyText
                style={styles.emptyStateSubtext}
                text="Nhập từ khóa để tìm kiếm sản phẩm bạn muốn"
              ></MyText>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "white",
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
  },
  searchIcon: {
    marginRight: 8,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#333",
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelText: {
    color: myTheme.primary,
    fontSize: 14,
  },
  searchContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

export default SearchModal;
