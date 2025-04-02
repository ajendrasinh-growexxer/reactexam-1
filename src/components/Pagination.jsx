import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  
  const current = Math.max(
    1,
    Math.min(parseInt(currentPage) || 1, parseInt(totalPages) || 1)
  );
  const total = Math.max(1, parseInt(totalPages) || 1);

  const handlePageClick = (page) => {
    if (page >= 1) {
      console.log("Page change requested:", page);
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (total <= maxVisiblePages) {
     
      for (let i = 1; i <= total; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={`px-3 py-1 mx-1 rounded ${
              current === i
                ? "bg-indigo-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            aria-label={`Go to page ${i}`}
          >
            {i}
          </button>
        );
      }
    } else {
     
      pages.push(
        <button
          key={1}
          onClick={() => handlePageClick(1)}
          className={`px-3 py-1 mx-1 rounded ${
            current === 1
              ? "bg-indigo-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          aria-label="Go to first page"
        >
          1
        </button>
      );

      
      let startPage = Math.max(2, current - 1);
      let endPage = Math.min(total - 1, current + 1);

      if (current > 3) {
        pages.push(
          <span key="ellipsis1" className="px-3 py-1">
            ...
          </span>
        );
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={`px-3 py-1 mx-1 rounded ${
              current === i
                ? "bg-indigo-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            aria-label={`Go to page ${i}`}
          >
            {i}
          </button>
        );
      }

      if (current < total - 2) {
        pages.push(
          <span key="ellipsis2" className="px-3 py-1">
            ...
          </span>
        );
      }

     
      pages.push(
        <button
          key={total}
          onClick={() => handlePageClick(total)}
          className={`px-3 py-1 mx-1 rounded ${
            current === total
              ? "bg-indigo-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          aria-label={`Go to last page (${total})`}
        >
          {total}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center my-4 w-full">
      <button
        onClick={() => handlePageClick(current - 1)}
        disabled={current === 1}
        className={`px-3 py-1 mx-1 rounded ${
          current === 1
            ? "bg-gray-300 cursor-not-allowed text-gray-500"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
        aria-label="Go to previous page"
      >
        Previous
      </button>
      {renderPageNumbers()}
      <button
        onClick={() => handlePageClick(current + 1)}
        className="px-3 py-1 mx-1 rounded bg-gray-200 hover:bg-gray-300"
        aria-label="Go to next page"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
