import React from "react";
import ProductList from "./components/ProductList";
import { useAppDispatch } from "./app/hooks";
import { fetchProducts } from "./features/products/productsSlice";

function App() {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Product App</h1>
      <ProductList />
    </div>
  );
}

export default App;
