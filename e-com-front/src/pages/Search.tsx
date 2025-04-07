import React, { useState, useEffect } from "react";
import ProductCard from "../components/productcard";
import { useDispatch } from "react-redux";
import {
  useCategoriesQuery,
  useSearchProductQuery,
} from "../redux/api/Productapi";
import { CustomError } from "../types/api-types";
import "react-toastify/dist/ReactToastify.css";
import toast from "react-hot-toast";
import { SkeletonLoader } from "../components/loader";
import { addToCart } from "../redux/reducer/cartReducer";
import { CartItem } from "../types/types";

const Search = () => {
  const dispatch = useDispatch(); // ✅ You missed this line!

  const {
    data: categoriesResponse,
    isLoading: loadingCategories,
    isError,
    error,
  } = useCategoriesQuery(undefined);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);

  const {
    data: productsResponse,
    isLoading: loadingProducts,
    isError: productsError,
    error: productsErrorMsg,
  } = useSearchProductQuery({ search, sort, price: maxPrice, category, page });

  const addToCartHandler = (cartItem: CartItem): string | undefined => {
    if (cartItem.stock < 1) {
      toast.error("Out of Stock");
      return;
    }

    dispatch(addToCart(cartItem));
    toast.success("Added to cart");

    return "Success";
  };

  useEffect(() => {
    if (isError && error) {
      const err = error as CustomError;
      toast.error(err?.data?.message || "Failed to fetch categories.");
    }

    if (productsError && productsErrorMsg) {
      const err = productsErrorMsg as CustomError;
      toast.error(err?.data?.message || "Failed to fetch products.");
    }
  }, [isError, error, productsError, productsErrorMsg]);

  useEffect(() => {
    if (productsResponse?.totalPage) {
      setMaxPage(productsResponse.totalPage);
    }
  }, [productsResponse]);

  return (
    <div className="product-search">
      <aside>
        <h2>Filters</h2>

        <div>
          <h4>Sort</h4>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">None</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
          </select>
        </div>

        <div>
          <h4>Max Price: {maxPrice}</h4>
          <input
            type="range"
            min={100}
            max={100000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </div>

        <div>
          <h4>Category</h4>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {loadingCategories ? (
              <option value="" disabled>
                Loading categories...
              </option>
            ) : (
              categoriesResponse?.categories?.map((cat: string) => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()}
                </option>
              ))
            )}
          </select>
        </div>
      </aside>

      <main>
        <h1>Products</h1>
        <input
          type="text"
          placeholder="Search by Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      <div className="search-product-list">
  {loadingProducts ? (
    <SkeletonLoader length={10} />
  ) : productsResponse?.products?.length ? (
    productsResponse.products.map((product) => (
      <ProductCard
        key={product._id}
        productId={product._id}
        name={product.name}        
        price={product.price}      
        photo={
          product.photos?.[0]?.url 
            ? (product.photos[0].url.includes('http') ? '' : 'http://localhost:4000/') + product.photos[0].url 
            : ''
        }
        stock={product.stock}
        handler={addToCartHandler}
        server=""
      />
    ))
  ) : (
    <p>No products found.</p>
  )}
</div>


        {maxPage > 1 && (
          <article>
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span>
              {page} of {maxPage}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, maxPage))}
              disabled={page === maxPage}
            >
              Next
            </button>
          </article>
        )}
      </main>
    </div>
  );
};

export default Search;
