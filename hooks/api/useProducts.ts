"use client";

import { useCallback } from "react";
import { GET } from "@/utils/api.caller";
import { useApi } from "./useApi";
import type { ApiError } from "@/utils/error-handler";
import type { IResponseProduct } from "@/types/product";

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
  const rootEndpoint = "/products";

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

        // Set default page and limit if not provided
        const page = params.page || 1;
        const limit = params.limit || 10;

        // Add all non-undefined params to the query string
        Object.entries({
          ...params,
          page,
          limit,
        }).forEach(([key, value]) => {
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
            data: { items: IResponseProduct[]; total: number };
          };
        }>(() => GET(endpoint), {
          onError: (error: ApiError) => {
            console.error("Failed to fetch filtered products:", error.message);
          },
        });

        if (!result?.data?.data) {
          return null;
        }

        // Extract data from the response
        const { items, total } = result.data.data;

        // Calculate pagination values
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        return {
          products: items,
          total,
          page,
          limit,
          totalPages,
          hasMore,
        };
      } catch (error) {
        console.error("Error in getFilteredProducts:", error);
        return null;
      }
    },
    []
  );
  /**
   * Get filtered products based on provided parameters
   * @param id Filter parameters
   * @returns Filtered products or error message
   */
  const getProductByBrandId = useCallback(
    async (brandId: string) => {
      try {
        const endpoint = `${rootEndpoint}/get-by-brand/${brandId}`;

        const result = await execute<{
          data: {
            data: IResponseProduct[];
          };
        }>(() => GET(endpoint), {
          onError: (error: ApiError) => {
            console.error(
              `Failed to fetch products for brand ${brandId}:`,
              error.message
            );
          },
        });

        if (!result?.data?.data) {
          return null;
        }

        return {
          products: result.data.data,
        };
      } catch (error) {
        console.error("Error in getProductByBrandId:", error);
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

  return {
    getFilteredProducts,
    getProductById,
    getProductByBrandId,
  };
};

export default useProducts;
