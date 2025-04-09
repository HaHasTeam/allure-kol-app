"use client";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import ProductItem from "./product-item";
import type { IResponseProduct } from "@/types/product";

const { height, width } = Dimensions.get("window");

interface ProductsBottomSheetProps {
  products: IResponseProduct[];
  visible: boolean;
  onClose: () => void;
  onAddToCart: (product: IResponseProduct) => void;
  onBuyNow: (product: IResponseProduct) => void;
}

const ProductsBottomSheet = ({
  products,
  visible,
  onClose,
  onAddToCart,
  onBuyNow,
}: ProductsBottomSheetProps) => {
  // Handle close
  const handleClose = () => {
    console.log("Closing modal");
    onClose();
  };

  // Handle add to cart with auto-close
  const handleAddToCart = (product: IResponseProduct) => {
    onAddToCart(product);
    handleClose();
  };

  // Handle buy now with auto-close
  const handleBuyNow = (product: IResponseProduct) => {
    onBuyNow(product);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>PRODUCTS</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductItem
                product={item}
                onAddToCart={() => handleAddToCart(item)}
                onBuyNow={() => handleBuyNow(item)}
              />
            )}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.7,
    width: width,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    letterSpacing: 1,
  },
  closeButton: {
    padding: 4,
  },
  productsList: {
    padding: 16,
  },
});

// Add display name for React DevTools
ProductsBottomSheet.displayName = "ProductsBottomSheet";

export default ProductsBottomSheet;
