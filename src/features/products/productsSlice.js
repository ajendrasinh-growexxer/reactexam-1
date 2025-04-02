import { createSlice } from "@reduxjs/toolkit";
import {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../api/apiSlice";

const initialState = {
  currentPage: 1,
  totalPages: 1,
  itemsPerPage: 8,
  lastPageChange: Date.now(),
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      const newPage = parseInt(action.payload) || 1;
      if (newPage !== state.currentPage) {
        state.currentPage = newPage;
        state.lastPageChange = Date.now();
      }
    },
    setTotalPages: (state, action) => {
      state.totalPages = Math.max(1, parseInt(action.payload) || 1);
    },
  },
});

export const { setCurrentPage, setTotalPages } = productsSlice.actions;

export default productsSlice.reducer;
