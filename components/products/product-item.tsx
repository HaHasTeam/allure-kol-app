import type React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Text } from "react-native-ui-lib";
import { Feather } from "@expo/vector-icons";

import { myTheme } from "@/constants/index";
import { IResponseProduct } from "@/types/product";

interface ProductItemProps {
  product: IResponseProduct;
  isSelected: boolean;
  onSelect: (productId: string) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({
  product,
  isSelected,
  onSelect,
}) => {
  // Get the main image URL or a placeholder
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].fileUrl
      : "https://via.placeholder.com/60";

  // Format price with currency
  const formattedPrice = product.price
    ? `$${product.price.toFixed(2)}`
    : "Price unavailable";

  // Get the product ID safely
  const productId = product.id || "";

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={() => onSelect(productId)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formattedPrice}</Text>
        {product.brand && (
          <Text style={styles.brand}>{product.brand.name}</Text>
        )}
      </View>
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Feather name="check" size={16} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  containerSelected: {
    borderColor: myTheme.primary,
    borderWidth: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  brand: {
    fontSize: 12,
    color: "#94a3b8",
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: myTheme.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});

export default ProductItem;
