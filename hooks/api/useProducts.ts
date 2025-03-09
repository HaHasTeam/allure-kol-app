import { useCallback } from "react";
import { GET, POST, PUT, DELETE } from "@/utils/api.caller";
import { useApi } from "./useApi";
import { ApiError } from "@/utils/error-handler";
import { IResponseProduct } from "@/types/product";

// Define the filter parameters type
export interface ProductFilterParams {
  search?: string;
  sortBy?: string;
  order?: "ASC" | "DESC";
  limit?: number;
  page?: number;
  brandId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

// Define the create/update product payload type
export interface ProductPayload {
  name: string;
  description: string;
  price?: number;
  brandId?: string;
  categoryId?: string;
  images?: File[];
  productClassifications?: {
    title?: string;
    price?: number;
    quantity?: number;
    sku?: string;
    color?: string;
    size?: string;
    other?: string;
    images?: File[];
  }[];
  [key: string]: any; // For any additional fields
}

const useProducts = () => {
  const { execute } = useApi();
  const rootEndpoint = "/allure/products";

  /**
   * Get filtered products based on provided parameters
   * @param params Filter parameters
   * @returns Filtered products or error message
   */
  const getFilteredProducts = useCallback(
    async (params: ProductFilterParams = {}) => {
      try {
        // Build query string from params
        const queryParams = new URLSearchParams();

        // Add all non-undefined params to the query string
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });

        const queryString = queryParams.toString();
        const endpoint = `${rootEndpoint}/filter-product${
          queryString ? `?${queryString}` : ""
        }`;

        const result = await execute<{
          data: {
            data: IResponseProduct[];
            meta: {
              total: number;
              page: number;
              limit: number;
              totalPages: number;
            };
          };
        }>(() => GET(endpoint), {
          onError: (error: ApiError) => {
            console.error("Failed to fetch filtered products:", error.message);
          },
        });

        if (!result?.data) {
          return null;
        }

        return {
          products: result.data.data,
          total: result.data.meta.total,
          page: result.data.meta.page,
          limit: result.data.meta.limit,
          totalPages: result.data.meta.totalPages,
          hasMore: result.data.meta.page < result.data.meta.totalPages,
        };
      } catch (error) {
        console.error("Error in getFilteredProducts:", error);
        return null;
      }
    },
    [execute]
  );

  /**
   * Get product details by ID
   * @param id Product ID
   * @returns Product details or error message
   */
  const getProductById = useCallback(
    async (id: string) => {
      try {
        const result = await execute<{
          data: {
            data: IResponseProduct;
          };
        }>(() => GET(`${rootEndpoint}/${id}`), {
          onError: (error: ApiError) => {
            console.error(
              `Failed to fetch product with ID ${id}:`,
              error.message
            );
          },
        });

        return result?.data.data || null;
      } catch (error) {
        console.error("Error in getProductById:", error);
        return null;
      }
    },
    [execute]
  );

  /**
   * Get multiple products by IDs
   * @param ids Array of product IDs
   * @returns Array of product details or error message
   */
  const getProductsByIds = useCallback(
    async (ids: string[]) => {
      try {
        // This assumes your API has an endpoint for fetching multiple products by IDs
        // If not, you might need to make multiple requests or adjust accordingly
        const queryParams = new URLSearchParams();
        ids.forEach((id) => queryParams.append("ids", id));

        const result = await execute<{
          data: {
            data: IResponseProduct[];
          };
        }>(() => GET(`${rootEndpoint}/batch?${queryParams.toString()}`), {
          onError: (error: ApiError) => {
            console.error("Failed to fetch products by IDs:", error.message);
          },
        });

        return result?.data.data || [];
      } catch (error) {
        console.error("Error in getProductsByIds:", error);
        return [];
      }
    },
    [execute]
  );

  /**
   * Create a new product
   * @param data Product data to create
   * @returns Created product or error message
   */
  const createProduct = useCallback(
    async (data: ProductPayload) => {
      try {
        const formData = new FormData();

        // Handle basic fields
        Object.entries(data).forEach(([key, value]) => {
          if (
            key !== "images" &&
            key !== "productClassifications" &&
            value !== undefined
          ) {
            formData.append(key, value.toString());
          }
        });

        // Handle images
        if (data.images && data.images.length > 0) {
          data.images.forEach((image) => {
            formData.append("images", image);
          });
        }

        // Handle product classifications
        if (
          data.productClassifications &&
          data.productClassifications.length > 0
        ) {
          formData.append(
            "productClassifications",
            JSON.stringify(data.productClassifications)
          );
        }

        const result = await execute<{
          data: {
            data: IResponseProduct;
          };
        }>(
          () =>
            POST(rootEndpoint, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }),
          {
            onSuccess: () => {
              console.log("Product created successfully");
            },
            onError: (error: ApiError) => {
              console.error("Failed to create product:", error.message);
            },
          }
        );

        return result?.data.data || null;
      } catch (error) {
        console.error("Error in createProduct:", error);
        return null;
      }
    },
    [execute]
  );

  /**
   * Update an existing product
   * @param id Product ID
   * @param data Product data to update
   * @returns Updated product or error message
   */
  const updateProduct = useCallback(
    async (id: string, data: Partial<ProductPayload>) => {
      try {
        const formData = new FormData();

        // Handle basic fields
        Object.entries(data).forEach(([key, value]) => {
          if (
            key !== "images" &&
            key !== "productClassifications" &&
            value !== undefined
          ) {
            formData.append(key, value.toString());
          }
        });

        // Handle images
        if (data.images && data.images.length > 0) {
          data.images.forEach((image) => {
            formData.append("images", image);
          });
        }

        // Handle product classifications
        if (
          data.productClassifications &&
          data.productClassifications.length > 0
        ) {
          formData.append(
            "productClassifications",
            JSON.stringify(data.productClassifications)
          );
        }

        const result = await execute<{
          data: {
            data: IResponseProduct;
          };
        }>(
          () =>
            PUT(`${rootEndpoint}/${id}`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }),
          {
            onSuccess: () => {
              console.log("Product updated successfully");
            },
            onError: (error: ApiError) => {
              console.error("Failed to update product:", error.message);
            },
          }
        );

        return result?.data.data || null;
      } catch (error) {
        console.error("Error in updateProduct:", error);
        return null;
      }
    },
    [execute]
  );

  /**
   * Delete a product
   * @param id Product ID
   * @returns Success status or error message
   */
  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        const result = await execute<{ data: { success: boolean } }>(
          () => DELETE(`${rootEndpoint}/${id}`),
          {
            onSuccess: () => {
              console.log("Product deleted successfully");
            },
            onError: (error: ApiError) => {
              console.error("Failed to delete product:", error.message);
            },
          }
        );

        return result?.data.success || false;
      } catch (error) {
        console.error("Error in deleteProduct:", error);
        return false;
      }
    },
    [execute]
  );

  return {
    getFilteredProducts,
    getProductById,
    getProductsByIds,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};

export default useProducts;
