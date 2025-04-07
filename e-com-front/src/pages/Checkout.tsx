import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { NewOrderRequest } from "../types/api-types";
import { RootState } from "../redux/store"; // Make sure this path is correct
import { useSelector } from "react-redux";
import { useCreateOrderMutation } from "../redux/api/Orderapi";

const stripePromise = loadStripe(
 import.meta.env.VITE_STRIPE_KEY
);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.user);

  // ✅ Move the hook call to the top level of the component
  const [createOrder] = useCreateOrderMutation();

  const submitHandler = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.warn("Stripe.js has not loaded yet.");
      return;
    }

    setIsProcessing(true);

    const orderData: NewOrderRequest = {
      shippingInfo: {
        address: "",
        city: "",
        state: "",
        country: "",
        zip: "",
      },
      orderItems: [],
      subtotal: 0,
      tax: 0,
      shippingCharges: 0,
      discount: 0,
      total: 0,
      user: user?._id || "",
    };

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Something went wrong");
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");

        // ✅ Call the createOrder mutation
        try {
          const res = await createOrder(orderData).unwrap();
          toast.success("Order created successfully!");

          navigate("/orders");
        } catch (orderError) {
          console.error(orderError);
          toast.error("Order creation failed");
        }
      } else {
        toast(`Payment status: ${paymentIntent?.status}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-container">
      <form onSubmit={submitHandler}>
        <PaymentElement />
        <button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </button>
      </form>
    </div>
  );
};

const Checkout = () => {
  const location = useLocation();
  const clientSecret: string | undefined = location.state;

  if (!clientSecret) return <Navigate to={"/shipping"} />;

  return (
    <Elements
      options={{
        clientSecret,
      }}
      stripe={stripePromise}
    >
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;
