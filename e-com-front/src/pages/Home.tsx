import { Link } from "react-router-dom";
import ProductCard from "../components/productcard";
import { useLatestProductsQuery } from "../redux/api/Productapi";
import toast from "react-hot-toast";

import { SkeletonLoader } from "../components/loader";
import { useDispatch } from "react-redux";
import { CartItem } from "../types/types";
import { addToCart } from "../redux/reducer/cartReducer";

// Type for the product data response, ensure this matches your API response
interface Product {
  _id: string;
  name: string;
  price: number;
  photos: any[];
  stock: number;
}

const Home = () => {
  const dispatch=useDispatch()
  // Make sure to call the query without an argument if it's not expecting one
  const { data, isError, isLoading } = useLatestProductsQuery(); // No argument passed

  // Handler for adding to the cart
  const addtocartHandler = (cartitem:CartItem) => {
    if(cartitem.stock<1)return toast.error("out of stock");
    dispatch(addToCart(cartitem));
    toast.success("Add to Cart")
   
  };

  // Handling loading and error states
  if (isLoading) {
    return <SkeletonLoader />; // Use Loader component for loading state
  }

  if (isError) {
    toast.error("Cannot fetch Product");
   
  }

  return (
    <div className="home">
    <section className="banner" />

    <h1 className="title">
      Latest Products
      <Link to="/search" className="findmore">
        See More
      </Link>
    </h1>

      <main className="products">
        {isLoading?(<SkeletonLoader/>): data?.products.map((product: Product) => (
          <ProductCard
            key={product._id} // Key prop for unique rendering
            productId={product._id}
            name={product.name}
            price={product.price}
            photo={
              product.photos?.[0]?.url 
                ? (product.photos[0].url.includes('http') ? '' : 'http://localhost:4000/') + product.photos[0].url 
                : ''
            }
            stock={product.stock}
            handler={addtocartHandler} // Pass the productId to the handler
                server=""
          />
        ))}
      </main>
    </div>
  );
};

export default Home;