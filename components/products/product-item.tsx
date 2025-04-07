import type React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  TextInput,
} from "react-native";
import { Text } from "react-native-ui-lib";
import { Feather } from "@expo/vector-icons";

import { myTheme } from "@/constants/index";
import type { IResponseProduct } from "@/types/product";

interface ProductItemProps {
  product: IResponseProduct;
  isSelected: boolean;
  onSelect: (productId: string) => void;
  discount?: number;
  onDiscountChange?: (productId: string, discount: number) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({
  product,
  isSelected,
  onSelect,
  discount = 0,
  onDiscountChange,
}) => {
  if (!product) {
    console.error("ProductItem received undefined or null product");
    return null;
  }

  const productId = product.id || "";

  const productName = product.name || "Sản phẩm không tên";

  const imageUrl =
    product.images && product.images.length > 0 && product.images[0].fileUrl
      ? product.images[0].fileUrl
      : "https://via.placeholder.com/60";

  const formattedPrice = product.price
    ? `${product.price.toLocaleString("vi-VN")}đ`
    : "Chưa có giá";

  const brandName = product.brand?.name || "";

  const stockInfo =
    product.quantity !== undefined ? `Còn ${product.quantity} sản phẩm` : "";

  const displayDiscount = Math.round(discount * 100);

  // Handle discount change
  const handleDiscountChange = (text: string) => {
    if (onDiscountChange) {
      // Convert text to number (as percentage 0-100)
      const percentValue = Number.parseInt(text, 10);
      if (!isNaN(percentValue)) {
        // Ensure it's between 0-100
        const normalizedPercentValue = Math.min(Math.max(percentValue, 0), 100);
        // Convert to 0-1 scale for storage and server
        const decimalValue = normalizedPercentValue / 100;
        onDiscountChange(productId, decimalValue);
      }
    }
  };

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

          {isSelected && (
            <View style={styles.discountContainer}>
              <Text style={styles.discountLabel}>Giảm giá (%):</Text>
              <TextInput
                style={styles.discountInput}
                value={displayDiscount.toString()}
                onChangeText={handleDiscountChange}
                keyboardType="number-pad"
                placeholder="0-100"
                maxLength={3}
              />
            </View>
          )}
        </View>
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
  discountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  discountLabel: {
    fontSize: 12,
    color: "#64748b",
    marginRight: 4,
  },
  discountInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 12,
    width: 60,
    backgroundColor: "#fff",
  },
});

export default ProductItem;
