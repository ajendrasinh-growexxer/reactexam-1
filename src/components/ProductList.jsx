import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetProductsQuery } from "../features/api/apiSlice";
import {
  setCurrentPage,
  setTotalPages,
} from "../features/products/productsSlice";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";

const ProductList = () => {
  const dispatch = useDispatch();
  const { currentPage, itemsPerPage } = useSelector((state) => state.products);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [manuallyFetchedProducts, setManuallyFetchedProducts] = useState(null);

  // Query products
  const { data, isLoading, error, refetch } = useGetProductsQuery(
    {
      page: currentPage,
      limit: itemsPerPage,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  // Set a timeout to prevent endless loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
      // If loading takes too long, try a direct fetch
      tryDirectFetch();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Try a direct fetch as fallback
  const tryDirectFetch = async () => {
    try {
      console.log("Trying direct fetch to API");
      // Calculate pagination indices
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;

      const response = await fetch(
        `http://localhost:3004/products?_start=${start}&_end=${end}`
      );

      if (response.ok) {
        const products = await response.json();
        console.log(
          "Direct fetch succeeded:",
          products.length,
          "products",
          "First ID:",
          products.length > 0 ? products[0].id : "none",
          "for page:",
          currentPage
        );

        // Get all products to calculate total
        const allProductsResponse = await fetch(
          "http://localhost:3004/products"
        );
        let totalCount = products.length * 2; // Default fallback

        if (allProductsResponse.ok) {
          const allProducts = await allProductsResponse.json();
          totalCount = allProducts.length;
          console.log("Total products:", totalCount);
        }

        const totalPages = Math.max(2, Math.ceil(totalCount / itemsPerPage));

        setManuallyFetchedProducts({
          products,
          totalPages,
          totalCount,
        });

        // If successful, update the Redux store
        if (products.length > 0) {
          dispatch(setTotalPages(totalPages));
        }
      }
    } catch (error) {
      console.error("Direct fetch failed:", error);
    }
  };

  // Handle page changes
  const handlePageChange = (page) => {
    console.log("Page change requested:", page);
    if (page !== currentPage) {
      setIsChangingPage(true);
      dispatch(setCurrentPage(page));

      // Directly fetch new page data
      setTimeout(() => {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        fetch(`http://localhost:3004/products?_start=${start}&_end=${end}`)
          .then((response) => response.json())
          .then((products) => {
            console.log(
              "Page change direct fetch success:",
              products.length,
              "products"
            );
            setManuallyFetchedProducts({
              products,
              totalPages: Math.max(2, Math.ceil(16 / itemsPerPage)), // Assuming 16+ total products
              totalCount: 16, // Assuming at least 16 products
            });
            setIsChangingPage(false);
          })
          .catch((error) => {
            console.error("Page change fetch error:", error);
            setIsChangingPage(false);
          });
      }, 100);
    }
  };

  // When page changes, update UI and fetch data
  useEffect(() => {
    if (data && data.totalPages) {
      dispatch(setTotalPages(data.totalPages));
    }

    const timeout = setTimeout(() => {
      setIsChangingPage(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [data, currentPage, dispatch]);

  // Show loading state with timeout fallback
  if ((isLoading || isChangingPage) && !manuallyFetchedProducts) {
    if (loadingTimeout) {
      // If loading takes too long, show a message with options
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-amber-600 mb-4">
              Loading is taking longer than expected. There might be a
              connection issue to the server.
            </p>
            <p className="mb-4">
              Please make sure the JSON server is running at port 3004 with the
              command:
              <br />
              <code className="bg-gray-100 p-2 rounded block mt-2 mb-2">
                npm run server
              </code>
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setLoadingTimeout(false);
                  refetch();
                }}
                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Retry API Query
              </button>
              <button
                onClick={tryDirectFetch}
                className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600"
              >
                Try Direct Fetch
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <p className="mb-4">Loading products for page {currentPage}...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
      </div>
    );
  }

  // Handle errors from RTK Query
  if (error && !manuallyFetchedProducts) {
    return (
      <div className="text-center py-8">
        <p className="text-amber-600 mb-4">
          Error loading products: {error.message || "Unknown error"}
        </p>
        <p className="mb-4">
          Please check if the JSON server is running at port 3004 with:
          <br />
          <code className="bg-gray-100 p-2 rounded block mt-2 mb-2">
            npm run server
          </code>
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => refetch()}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Retry
          </button>
          <button
            onClick={tryDirectFetch}
            className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600"
          >
            Try Direct Fetch
          </button>
        </div>
      </div>
    );
  }

  // Use either RTK Query data or manually fetched data
  const productData = manuallyFetchedProducts ||
    data || { products: [], totalPages: 2 };
  const { products = [], totalPages = 2 } = productData;

  // Handle case when no products are found
  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Products (0)</h2>
          <div className="text-sm text-gray-600 border border-gray-300 rounded px-3 py-1">
            Page {currentPage} of {totalPages}
          </div>
        </div>
        <div className="text-center py-8">No products found for this page</div>
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Products ({products.length})
        </h2>
        <div className="text-sm text-gray-600 border border-gray-200 rounded-full px-4 py-1 bg-white shadow-sm">
          Page {currentPage} of {totalPages}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ProductList;
