import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { myTheme } from "@/constants/index";
import { IResponseProduct } from "@/types/product";

interface ProductItemProps {
  product: IResponseProduct;
  onAddToCart: (product: IResponseProduct) => void;
  onBuyNow: (product: IResponseProduct) => void;
}

const ProductItem = ({ product, onAddToCart, onBuyNow }: ProductItemProps) => {
  // Get the first image URL or use a placeholder
  const imageUrl =
    product.images && product.images.length > 0 && product.images[0].fileUrl
      ? product.images[0].fileUrl
      : "https://via.placeholder.com/50";

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.brandText}>{product.brand?.name || ""}</Text>
        <View style={styles.priceRatingContainer}>
          <Text style={styles.price}>${product.price}</Text>
          {product.average_rating > 0 && (
            <View style={styles.ratingContainer}>
              <Feather name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>
                {product.average_rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => onAddToCart(product)}
        >
          <Feather name="shopping-cart" size={20} color="#6b46c1" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => onBuyNow(product)}
        >
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  brandText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  priceRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 12,
    color: "#4b5563",
    marginLeft: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  buyButton: {
    backgroundColor: myTheme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buyButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default ProductItem;
