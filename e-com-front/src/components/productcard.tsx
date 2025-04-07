import React from "react";
import { FaPlus } from "react-icons/fa";
import { CartItem } from "../types/types";

type ProductProps = {
  productId: string;
  name: string;
  price: number;
  stock: number;
  photo: string;
  handler: (cartitem: CartItem) => void;
  server: string;
};


const ProductCard = ({
  productId,
  name,
  price,
  stock,
  photo,
  handler,
  server,
}: ProductProps) => {
  // Handler for the button click, passing the correct cart item to the handler
  console.log({ productId, name, price, stock, photo, server });

  
  return (
    <div className="productcard" onClick={() => {}}>
      <img src={`${server}${photo}`} alt={name} />
      <h2>{name}</h2>
      <p>Price: ${price}</p>
   
      <span className={stock === 0 ? "out-of-stock" : ""}>
        {stock === 0 ? "Out of Stock" : `${stock} in stock`}
      </span>
      {stock > 0 && (
        <div>
         <button
  onClick={() =>
    handler({
      productId,
      price,
      name,
      stock,
      quantity: 1,
      photo,
      _id: productId, // assuming productId is the unique identifier for the product
      id: Date.now(), // ✅ number instead of string
    })
  }
>
  <FaPlus />
</button>

        </div>
      )}
    </div>
  );
};

export default ProductCard;
