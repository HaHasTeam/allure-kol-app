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

// First, import the useProducts hook at the top of the file
import useProducts from "@/hooks/api/useProducts";

const { width, height } = Dimensions.get("window");

// Update the props interface to include a way to pass back full product objects
interface ProductSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (
    selectedIds: string[],
    selectedProducts: IResponseProduct[]
  ) => void;
  initialSelectedIds: string[];
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialSelectedIds,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<IResponseProduct[]>([]);
  const [selectedProductIds, setSelectedProductIds] =
    useState<string[]>(initialSelectedIds);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // Add a ref to track if this is the initial load
  const isInitialLoadRef = useRef(true);
  // Add a ref to track previous search query
  const prevSearchQueryRef = useRef("");

  // Make sure to add getFilteredProducts to the component
  const { getFilteredProducts } = useProducts();

  // Then, replace the existing fetchProductsData function with this implementation
  // that uses the useProducts hook
  const fetchProductsData = useCallback(
    async (query: string, pageNum: number, append = false) => {
      try {
        if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        console.log(
          `Fetching products: query=${query}, page=${pageNum}, append=${append}`
        );

        // Use the getFilteredProducts function from the hook
        const result = await getFilteredProducts({
          search: query,
          page: pageNum,
          limit: 10,
          // You can add more filter parameters as needed
          // sortBy: "createdAt",
          // order: "DESC",
          // brandId: selectedBrand,
          // categoryId: selectedCategory,
        });

        if (result) {
          if (append) {
            setProducts((prev) => [...prev, ...result.products]);
          } else {
            setProducts(result.products);
          }
          setHasMore(result.hasMore);
          setTotalItems(result.total);

          // Log pagination info for debugging
          console.log(
            `Loaded page ${result.page} of ${result.totalPages}, total: ${result.total} items`
          );
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [getFilteredProducts]
  );

  // Combined effect for handling both initial load and search changes
  useEffect(() => {
    // Only fetch data if the modal is visible
    if (!visible) {
      return;
    }

    // If this is the initial load when modal becomes visible
    if (isInitialLoadRef.current && visible) {
      isInitialLoadRef.current = false;
      setPage(1);
      fetchProductsData(searchQuery, 1, false);
      prevSearchQueryRef.current = searchQuery;
      return;
    }

    // For search query changes, use debounce
    if (searchQuery !== prevSearchQueryRef.current) {
      const delayDebounceFn = setTimeout(() => {
        setPage(1);
        fetchProductsData(searchQuery, 1, false);
        prevSearchQueryRef.current = searchQuery;
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, visible, fetchProductsData]);

  // Reset the initial load flag when modal closes
  useEffect(() => {
    if (!visible) {
      isInitialLoadRef.current = true;
    }
  }, [visible]);

  // Handle product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProductsData(searchQuery, nextPage, true);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Update the handleConfirm function to ensure it properly passes data back
  // Look for the handleConfirm function and replace it with this implementation:

  const handleConfirm = () => {
    // Get the full product objects for selected IDs
    const selectedProductObjects = products.filter((product) =>
      selectedProductIds.includes(product.id || "")
    );

    // Log what we're sending back for debugging
    console.log(
      `Confirming selection of ${selectedProductIds.length} products`
    );

    // Pass both IDs and full product objects back to the parent component
    onConfirm(selectedProductIds, selectedProductObjects);

    // Close the modal after confirming
    onClose();
  };

  // Render footer with loading indicator
  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <LoadingIndicator size="small" message="Loading more products..." />
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading) return null;

    return (
      <EmptyState
        message={
          searchQuery ? "No products found" : "Start typing to search products"
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
          <View style={styles.content}>
            {error && (
              <ErrorView
                message={error}
                onRetry={() => fetchProductsData(searchQuery, 1, false)}
              />
            )}

            {loading ? (
              <LoadingIndicator message="Loading products..." />
            ) : (
              <>
                {totalItems > 0 && (
                  <Text style={styles.resultsCount}>
                    Showing {products.length} of {totalItems} products
                  </Text>
                )}
                <FlatList
                  data={products}
                  renderItem={({ item }) => (
                    <ProductItem
                      product={item}
                      isSelected={selectedProductIds.includes(item.id || "")}
                      onSelect={toggleProductSelection}
                    />
                  )}
                  keyExtractor={(item) => item.id || Math.random().toString()}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={renderEmpty}
                  ListFooterComponent={renderFooter}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
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
