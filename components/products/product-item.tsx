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
  // Safety check - if product is undefined or null, render nothing
  if (!product) {
    console.error("ProductItem received undefined or null product");
    return null;
  }

  // Get the product ID safely
  const productId = product.id || "";

  // Get the product name safely
  const productName = product.name || "Unnamed Product";

  // Get the main image URL or a placeholder
  const imageUrl =
    product.images && product.images.length > 0 && product.images[0].fileUrl
      ? product.images[0].fileUrl
      : "https://via.placeholder.com/60";

  // Format price with currency
  const formattedPrice = product.price
    ? `$${product.price.toFixed(2)}`
    : "Price unavailable";

  // Get brand name safely
  const brandName = product.brand?.name || "";

  // Get stock information if available
  const stockInfo =
    product.quantity !== undefined ? `${product.quantity} in stock` : "";

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={() => onSelect(productId)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          defaultSource={require("@/assets/images/fallBackImage.jpg")}
        />
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Feather name="check" size={14} color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <Text numberOfLines={1} style={styles.name}>
            {productName}
          </Text>
          {brandName && <Text style={styles.brand}>{brandName}</Text>}
        </View>

        {isSelected ? (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>Selected</Text>
          </View>
        ) : (
          <View style={styles.selectButton}>
            <Text style={styles.selectText}>Select</Text>
          </View>
        )}
      </View>
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
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  containerSelected: {
    borderColor: myTheme.primary,
    borderWidth: 2,
    backgroundColor: "#fdf2f8",
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  selectedBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: myTheme.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  brand: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: myTheme.primary,
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
  },
  selectedIndicator: {
    backgroundColor: myTheme.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  selectedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  selectButton: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  selectText: {
    color: myTheme.primary,
    fontSize: 12,
    fontWeight: "600",
  },
});

export default ProductItem;
