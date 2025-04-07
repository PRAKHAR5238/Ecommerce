import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { RootState, server } from "../redux/store"; // ✅ Correct import from your project
import { saveShippingInfo } from "../redux/reducer/cartReducer"; // ✅ Import action to save shipping info
import coupon from "./admin/apps/coupon";
import axios from "axios";
import toast from "react-hot-toast";

const Shipping = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { Cartitems } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.user);

  // ✅ Use lowercase field names for consistency
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    country: ""
  });

  const changeHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Redirect to cart if there are no items
  useEffect(() => {
    if (Cartitems.length <= 0) {
      navigate("/cart");
    }
  }, [Cartitems, navigate]);

  // ✅ Handle form submission
  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(saveShippingInfo(shippingInfo));

    try {
      const { data } = await axios.post(
        `${server}/api/v1/coupon/create?id=${user?._id}`,
        {
          items: Cartitems,
          shippingInfo,
          coupon,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      navigate("/pay", {
        state: data.client_secret,
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };


  return (
    <div className="shipping">
      <button
        className="back-btn"
        onClick={() => navigate("/cart")}
      >
        <BiArrowBack />
      </button>

      <form onSubmit={submitHandler}>
        <h1>Shipping Address</h1>

        <input
          type="text"
          placeholder="Address"
          name="address"
          value={shippingInfo.address}
          onChange={changeHandler}
          required
        />
        <input
          type="text"
          placeholder="City"
          name="city"
          value={shippingInfo.city}
          onChange={changeHandler}
          required
        />
        <input
          type="text"
          placeholder="State"
          name="state"
          value={shippingInfo.state}
          onChange={changeHandler}
          required
        />

        <select
          name="country"
          required
          value={shippingInfo.country}
          onChange={changeHandler}
        >
          <option value="">Select Country</option>
          <option value="India">India</option>
          <option value="America">America</option>
          <option value="London">London</option>
        </select>

        <input
          type="number"
          placeholder="Zip Code"
          name="zip"
          value={shippingInfo.zip}
          onChange={changeHandler}
          required
        />

        <button type="submit">Pay Now</button>
      </form>
    </div>
  );
};

export default Shipping;
