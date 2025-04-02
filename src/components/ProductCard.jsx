import React, { useState } from "react";
import {
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../features/api/apiSlice";
import ProductFormModal from "./ProductFormModal";

const ProductCard = ({ product }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (updatedProduct) => {
    try {
      await updateProduct(updatedProduct).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(product.id).unwrap();
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
      <p className="text-gray-600 mb-2 line-clamp-2">{product.description}</p>
      <p className="text-xl font-bold text-indigo-600 mb-4">${product.price}</p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={handleEdit}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-400 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
        >
          Delete
        </button>
      </div>

      <ProductFormModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSubmit={handleSave}
        product={product}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default ProductCard;
