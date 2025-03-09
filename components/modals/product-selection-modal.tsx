"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Modal, FlatList, Platform } from "react-native";
import { Text } from "react-native-ui-lib";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import { IResponseProduct } from "@/types/product";
import ProductItem from "@/components/products/product-item";
import SearchBar from "@/components/products/search-bar";
import EmptyState from "@/components/products/empty-state";
import LoadingIndicator from "@/components/products/loading-indicator";
import ErrorView from "@/components/products/error-view";
import ModalFooter from "@/components/products/modal-footer";

// First, import the useProducts hook at the top of the file
import useProducts from "@/hooks/api/useProducts";

interface ProductSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
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
        } else {
          throw new Error("Failed to fetch products");
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

  // Load initial products
  useEffect(() => {
    if (visible) {
      fetchProductsData(searchQuery, 1, false);
    }
  }, [visible, fetchProductsData]);

  // Handle search with debounce
  useEffect(() => {
    if (visible) {
      const delayDebounceFn = setTimeout(() => {
        setPage(1);
        fetchProductsData(searchQuery, 1, false);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, visible, fetchProductsData]);

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

  // Handle confirmation
  const handleConfirm = () => {
    onConfirm(selectedProductIds);
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
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Products</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={clearSearch}
          />

          {error && (
            <ErrorView
              message={error}
              onRetry={() => fetchProductsData(searchQuery, 1, false)}
            />
          )}

          {loading ? (
            <LoadingIndicator message="Loading products..." />
          ) : (
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
              style={styles.productList}
              contentContainerStyle={styles.productListContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmpty}
              ListFooterComponent={renderFooter}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
            />
          )}

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
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "90%",
    maxHeight: "80%",
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
  productList: {
    flex: 1,
  },
  productListContent: {
    padding: 16,
    paddingTop: 0,
  },
  footerLoader: {
    paddingVertical: 8,
  },
});

export default ProductSelectionModal;
