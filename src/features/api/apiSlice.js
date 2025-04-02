import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { retry } from "@reduxjs/toolkit/query/react";

// Create a base query with retry logic
const baseQueryWithRetry = retry(
  fetchBaseQuery({
    baseUrl: "http://localhost:3004",
    timeout: 10000,
  }),
  { maxRetries: 3 }
);

// Calculate pagination indices
const getStartAndEndIndices = (page, limit) => {
  const start = (page - 1) * limit;
  const end = page * limit - 1;
  return { start, end };
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ page = 1, limit = 8 }) => {
        console.log("Fetching products for page:", page, "limit:", limit);
        // For json-server v1.0.0-beta.3, use _start and _end instead of _page and _limit
        const { start, end } = getStartAndEndIndices(page, limit);
        return `/products?_start=${start}&_end=${start + limit}`;
      },
      transformResponse: (response, meta, arg) => {
        console.log(
          "Response received:",
          response ? response.length : 0,
          "products for page:",
          arg.page,
          "First ID:",
          response.length > 0 ? response[0].id : "none"
        );

        // Get total count from all products
        const getAllProducts = async () => {
          try {
            const response = await fetch("http://localhost:3004/products");
            if (response.ok) {
              const allProducts = await response.json();
              return allProducts.length;
            }
            return 0;
          } catch (error) {
            console.error("Error fetching all products:", error);
            return 0;
          }
        };

        // Handle missing headers (in case the server doesn't support them)
        let totalCount = response ? response.length * 2 : 0; // Assume at least double for testing
        try {
          const totalCountHeader =
            meta?.response?.headers?.get("X-Total-Count");
          if (totalCountHeader) {
            totalCount = parseInt(totalCountHeader);
          }
        } catch (error) {
          console.error("Error parsing totalCount:", error);
        }

        const totalPages = Math.max(2, Math.ceil(totalCount / arg.limit));

        console.log("API Response:", {
          totalCount,
          totalPages,
          currentPage: arg.page,
          productsCount: response ? response.length : 0,
          firstProductId: response.length > 0 ? response[0].id : "none",
        });

        return {
          products: response || [],
          totalPages,
          totalCount,
        };
      },
      keepUnusedDataFor: 0,
      providesTags: (result, error, arg) => [
        { type: "Product", id: "LIST" },
        { type: "Product", id: `PAGE_${arg.page}` },
        ...(result?.products || []).map((product) => ({
          type: "Product",
          id: product.id,
        })),
      ],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),
    addProduct: builder.mutation({
      query: (product) => ({
        url: "/products",
        method: "POST",
        body: product,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: (product) => ({
        url: `/products/${product.id}`,
        method: "PUT",
        body: product,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = apiSlice;
