"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  Platform,
  Dimensions,
} from "react-native";
import { Text } from "react-native-ui-lib";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import type { IResponseProduct } from "@/types/product";
import ProductItem from "@/components/products/product-item";
import SearchBar from "@/components/products/search-bar";
import EmptyState from "@/components/products/empty-state";
import LoadingIndicator from "@/components/products/loading-indicator";
import ErrorView from "@/components/products/error-view";
import ModalFooter from "@/components/products/modal-footer";

// Import the useProducts hook
import useProducts from "@/hooks/api/useProducts";

const { width, height } = Dimensions.get("window");

interface ProductSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (
    selectedIds: string[],
    selectedProducts: IResponseProduct[],
    productDiscounts: { [key: string]: number }
  ) => void;
  initialSelectedIds: string[];
  initialDiscounts?: { [key: string]: number };
  brandId: string;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialSelectedIds,
  initialDiscounts = {},
  brandId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<IResponseProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IResponseProduct[]>(
    []
  );
  const [selectedProductIds, setSelectedProductIds] =
    useState<string[]>(initialSelectedIds);
  const [productDiscounts, setProductDiscounts] = useState<{
    [key: string]: number;
  }>(initialDiscounts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if modal was previously visible
  const wasVisibleRef = useRef(false);

  // Import only getProductByBrandId from the hook
  const { getProductByBrandId } = useProducts();

  // Simplified fetchProductsData function that only uses getProductByBrandId
  const fetchProductsData = useCallback(async () => {
    if (!brandId) {
      setError("Brand ID is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching products for brand: ${brandId}`);

      const result = await getProductByBrandId(brandId);

      if (result && result.products) {
        setAllProducts(result.products);
        setFilteredProducts(result.products);
      } else {
        setAllProducts([]);
        setFilteredProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [brandId, getProductByBrandId]);

  // Filter products when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(allProducts);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = allProducts.filter((product) =>
        product.name?.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, allProducts]);

  // Fetch data when modal becomes visible
  useEffect(() => {
    if (visible && (!wasVisibleRef.current || allProducts.length === 0)) {
      fetchProductsData();
      wasVisibleRef.current = true;
    } else if (!visible) {
      wasVisibleRef.current = false;
    }
  }, [visible, fetchProductsData, allProducts.length]);

  // Handle product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        // When adding a new product, initialize its discount to 0
        if (!productDiscounts[productId]) {
          setProductDiscounts((prev) => ({
            ...prev,
            [productId]: 0,
          }));
        }
        return [...prev, productId];
      }
    });
  };

  // Handle discount change
  const handleDiscountChange = (productId: string, discount: number) => {
    setProductDiscounts((prev) => ({
      ...prev,
      [productId]: discount,
    }));
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleConfirm = () => {
    // Get the full product objects for selected IDs
    const selectedProductObjects = allProducts.filter((product) =>
      selectedProductIds.includes(product.id || "")
    );

    console.log(
      `Confirming selection of ${selectedProductIds.length} products with discounts`,
      productDiscounts
    );

    // Pass both IDs, full product objects, and discounts back to the parent component
    onConfirm(selectedProductIds, selectedProductObjects, productDiscounts);

    // Close the modal after confirming
    onClose();
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading) return null;

    return (
      <EmptyState
        message={
          searchQuery
            ? "No products found"
            : "No products available for this brand"
        }
        icon="search"
      />
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Products</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={clearSearch}
              placeholder="Search products..."
            />
          </View>

          {/* Content */}
          <View style={styles.contentWrapper}>
            {error && <ErrorView message={error} onRetry={fetchProductsData} />}

            {loading ? (
              <LoadingIndicator message="Loading products..." />
            ) : (
              <>
                {filteredProducts.length > 0 && (
                  <Text style={styles.resultsCount}>
                    Showing {filteredProducts.length} of {allProducts.length}{" "}
                    products for this brand
                  </Text>
                )}
                <FlatList
                  data={filteredProducts}
                  renderItem={({ item }) => {
                    const productId = item.id || "";
                    const isSelected = selectedProductIds.includes(productId);
                    const discount = productDiscounts[productId] || 0;

                    return (
                      <ProductItem
                        product={item}
                        isSelected={isSelected}
                        onSelect={toggleProductSelection}
                        discount={discount}
                        onDiscountChange={handleDiscountChange}
                      />
                    );
                  }}
                  keyExtractor={(item) => item.id || Math.random().toString()}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={renderEmpty}
                  style={styles.flatList}
                />
              </>
            )}
          </View>

          {/* Footer */}
          <ModalFooter
            onCancel={onClose}
            onConfirm={handleConfirm}
            selectedCount={selectedProductIds.length}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: "column",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  contentWrapper: {
    backgroundColor: "#f8fafc",
    maxHeight: height * 0.5, // Set a maximum height for the content area
    minHeight: 200, // Set a minimum height to ensure visibility
  },
  flatList: {
    flexGrow: 0, // Prevent the FlatList from expanding beyond its content
  },
  content: {
    backgroundColor: "#f8fafc",
  },
  listContent: {
    padding: 16,
  },
  resultsCount: {
    fontSize: 12,
    color: "#64748b",
    marginHorizontal: 16,
    marginTop: 8,
  },
  footerLoader: {
    paddingVertical: 8,
  },
});

export default ProductSelectionModal;
