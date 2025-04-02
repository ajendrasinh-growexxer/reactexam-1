import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ProductList from "./components/ProductList";
import ProductFormModal from "./components/ProductFormModal";
import { useAddProductMutation } from "./features/api/apiSlice";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const [addProduct, { isLoading }] = useAddProductMutation();

  const handleAddProduct = async (productData) => {
    try {
      await addProduct(productData).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Product Management
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 mb-4"
          >
            Add New Product
          </button>
          <ProductList />
        </div>
      </main>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProduct}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
