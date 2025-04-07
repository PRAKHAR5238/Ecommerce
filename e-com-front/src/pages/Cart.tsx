import React, { useEffect, useState } from "react";
import CartItem from "../components/cartitem";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, server } from "../redux/store";
import { CartItem as CartItemType } from "../types/types";
import {
  addToCart,
  removeFromCart,
  discountApplied,
  saveCoupon,
  calculatePrice, // ✅ Import this!
} from "../redux/reducer/cartReducer";
import axios from "axios";

const Cart = () => {
  const {
    Cartitems, // ✅ Make sure this matches your reducer naming
    subtotal,
    tax,
    total,
    discount,
    shippingCharges,
  } = useSelector((state: RootState) => state.cart);

  const dispatch = useDispatch();

  const [couponCode, setCouponCode] = useState<string>("");
  const [isValidCode, setIsValidCode] = useState<boolean>(false);
  const [couponMessage, setCouponMessage] = useState<string>("");

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
  };

  const incrementHandler = (cartItem: CartItemType) => {
    if (cartItem.quantity < cartItem.stock) {
      dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity + 1 }));
      dispatch(calculatePrice());
    }
  };

  const decrementHandler = (cartItem: CartItemType) => {
    if (cartItem.quantity > 1) {
      dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity - 1 }));
      dispatch(calculatePrice());
    }
  };

  const removeItem = (productId: string) => {
    dispatch(removeFromCart(productId));
    dispatch(calculatePrice());
  };

  useEffect(() => {
    if (!couponCode) {
      setIsValidCode(false);
      setCouponMessage("");
      dispatch(discountApplied(0));
      dispatch(calculatePrice());
      return;
    }

    const {token,cancel}=axios.CancelToken.source()



    const timeOutId = setTimeout(() => {
      axios
        .get(`${server}/api/v1/coupon/discount?coupon=${couponCode}`,{
          cancelToken:token,
          
        })
        .then((res) => {
          const discountValue = res.data.discount;
          dispatch(discountApplied(discountValue));
          dispatch(saveCoupon(couponCode));
          setIsValidCode(true);
          setCouponMessage(`Coupon applied! Discount: $${discountValue}`);
          dispatch(calculatePrice());
        })
        .catch(() => {
          dispatch(discountApplied(0));
          setIsValidCode(false);
          setCouponMessage("Invalid coupon code.");
          dispatch(calculatePrice());
        });
    }, 1000);

    return () => clearTimeout(timeOutId);
    cancel()
  }, [couponCode, dispatch]);

  return (
    <div className="cart">
      <main>
        {Cartitems.length > 0 ? (
          Cartitems.map((item, idx) => (
            <CartItem
              key={item.id || idx}
              Cartitem={item}
              incrementhandeler={incrementHandler}
              decrementhandeler={decrementHandler}
              removeitem={removeItem}
            />
          ))
        ) : (
          <p>No items in the cart.</p>
        )}
      </main>

      <aside>
        <p>Subtotal: ${subtotal}</p>
        <p>Tax: ${tax}</p>
        <p>Shipping Charges: ${shippingCharges}</p>
        <p>
          Discount: <em>- ${discount}</em>
        </p>
        <p>
          <b>Total: ${total}</b>
        </p>

        <input
          type="text"
          value={couponCode}
          onChange={handleCouponChange}
          placeholder="Enter coupon code"
        />

        {couponCode && (
          <p style={{ color: isValidCode ? "green" : "red" }}>
            {couponMessage}
          </p>
        )}

        {Cartitems.length > 0 && (
          <Link to="/shipping" className="btn-proceed">
            Proceed to Shipping
          </Link>
        )}
      </aside>
    </div>
  );
};

export default Cart;
