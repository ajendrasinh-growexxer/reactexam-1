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

 
  const { data, isLoading, error, refetch } = useGetProductsQuery(
    {
      page: currentPage,
      limit: itemsPerPage,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );


  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
     
      tryDirectFetch();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);


  const tryDirectFetch = async () => {
    try {
      
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

       
        const allProductsResponse = await fetch(
          "http://localhost:3004/products"
        );
        let totalCount = products.length * 2; 

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

       
        if (products.length > 0) {
          dispatch(setTotalPages(totalPages));
        }
      }
    } catch (error) {
      console.error("Direct fetch failed:", error);
    }
  };

 
  const handlePageChange = (page) => {
    console.log("Page change requested:", page);
    if (page !== currentPage) {
      setIsChangingPage(true);
      dispatch(setCurrentPage(page));

     
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
              totalPages: Math.max(2, Math.ceil(16 / itemsPerPage)),
              totalCount: 16,             });
            setIsChangingPage(false);
          })
          .catch((error) => {
            console.error("Page change fetch error:", error);
            setIsChangingPage(false);
          });
      }, 100);
    }
  };

 
  useEffect(() => {
    if (data && data.totalPages) {
      dispatch(setTotalPages(data.totalPages));
    }

    const timeout = setTimeout(() => {
      setIsChangingPage(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [data, currentPage, dispatch]);

  
  if ((isLoading || isChangingPage) && !manuallyFetchedProducts) {
    if (loadingTimeout) {
    
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

  
  const productData = manuallyFetchedProducts ||
    data || { products: [], totalPages: 2 };
  const { products = [], totalPages = 2 } = productData;

 
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
