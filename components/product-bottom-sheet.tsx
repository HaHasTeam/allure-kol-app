"use client";

import { Feather } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import type { IResponseProduct } from "@/types/product";
import { getCheapestClassification } from "@/utils/product";
import ImageWithFallback from "./image/ImageWithFallBack";

export interface LiveSteamDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  discount: number;
  product: IResponseProduct;
}

interface KolProductBottomSheetProps {
  products: LiveSteamDetail[];
  visible: boolean;
  onClose: () => void;
  livestreamId?: string;
}

const ProductsBottomSheet = ({
  products,
  visible,
  onClose,
  livestreamId,
}: KolProductBottomSheetProps) => {
  // Bottom sheet reference
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["70%"], []);

  // Handle close
  const handleClose = useCallback(() => {
    console.log("Closing bottom sheet");
    bottomSheetRef.current?.close();
    onClose();
  }, [onClose]);

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="shopping-bag" size={64} color="#CBD5E1" />
      <Text style={styles.emptyText}>No products available</Text>
      <Text style={styles.emptySubtext}>
        There are no products to display at this time
      </Text>
    </View>
  );

  // Effect to open/close the bottom sheet based on visible prop
  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PRODUCTS</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {products.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const { product, discount } = item;
              const imageUrl =
                product.images &&
                product.images.length > 0 &&
                product.images[0].fileUrl
                  ? product.images[0].fileUrl
                  : "https://via.placeholder.com/100";
              const productClassification = getCheapestClassification(
                product.productClassifications ?? []
              );
              // Format price with currency
              const formattedPrice =
                productClassification && productClassification.price
                  ? `${productClassification.price.toLocaleString("vi-VN")}đ`
                  : "Chưa có giá";

              // Calculate discounted price
              const discountedPrice =
                productClassification && productClassification.price
                  ? productClassification.price * (1 - discount)
                  : 0;

              const formattedDiscountedPrice = `${discountedPrice.toLocaleString(
                "vi-VN"
              )}đ`;

              return (
                <View style={styles.productItem}>
                  <View style={styles.productImageContainer}>
                    {product.images && product.images.length > 0 ? (
                      <ImageWithFallback
                        source={{ uri: imageUrl }}
                        style={styles.productImage}
                      />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Feather name="image" size={24} color="#CBD5E1" />
                      </View>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>{formattedPrice}</Text>
                      {discount > 0 && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>
                            {discount * 100}% OFF
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            }}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginTop: 8,
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  closeButton: {
    padding: 4,
  },
  productsList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
    maxWidth: "80%",
  },
  productItem: {
    flexDirection: "row",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6b46c1",
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "500",
  },
});

// Add display name for React DevTools
ProductsBottomSheet.displayName = "ProductsBottomSheet";

export default ProductsBottomSheet;
