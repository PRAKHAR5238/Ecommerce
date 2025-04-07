import { FaTrash } from "react-icons/fa";
import {
  Link,
  useNavigate,
  useParams,
  Navigate as RouterNavigate
} from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";

import { RootState } from "../../../redux/store";
import { useState, useEffect } from "react";
import { OrderItems } from "../../../types/types";
import { useSelector } from "react-redux";
import {
  useDeleteOrderMutation,
  useOrderDetailsQuery,
  useUpdateOrderMutation
} from "../../../redux/api/Orderapi";
import { SkeletonLoader } from "../../../components/loader"; // Optional: Replace with your loader if you have one
import { responseToast } from "../../../utils/features";

const TransactionManagement = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const params = useParams();
  const navigate = useNavigate();

  const { isLoading, data, isError } = useOrderDetailsQuery(params.id!) ;

  const [order, setOrder] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: 0,
    status: "",
    subtotal: 0,
    discount: 0,
    shippingCharges: 0,
    tax: 0,
    total: 0,
    orderItems: [] as OrderItems[],
    user: { name: "", _id: "" },
    _id: ""
  });

  // Debugging: See what's coming from the API
  console.log("OrderDetailsQuery Data: ", data);

  useEffect(() => {
    if (data?.order) {
      const d:any = data.order;
        console.log(d);
        
      setOrder({
        name: d.name || "ff",
        address: d.shippingInfo?.address || "",
        city: d.shippingInfo?.city || "",
        state: d.shippingInfo?.state || "",
        country: d.shippingInfo?.country || "",
        pinCode: d.shippingInfo?.pinCode || 0,
        status: d.status || "",
        subtotal: d.subtotal || 0,
        discount: d.discount || 0,
        shippingCharges: d.shippingCharges || 0,
        tax: d.tax || 0,
        total: d.total || 0,
        orderItems: d.orderItems || [],
        user: d.user || { name: "", _id: "" },
        _id: d._id || "",
      });
    }
  }, [data]);
  

  // Redirect to 404 if order not found
  if (isError) return <RouterNavigate to="/404" />;

  const {
    name,
    address,
    city,
    country,
    state,
    pinCode,
    subtotal,
    shippingCharges,
    tax,
    discount,
    total,
    status,
    orderItems,
    user: orderUser,
    _id: orderID
  } = order;

  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const updateHandler = async () => {
    const res = await updateOrder({
      userId: user?._id!,
      orderID: orderID
    });
    responseToast(res, navigate, "/admin/transaction");
  };
  
  const deleteHandler = async () => {
    const res = await deleteOrder({
      userId: user?._id!,   // ✅ Pass the user ID here
      orderID: orderID,     // ✅ Pass the order ID here
    });
  
    responseToast(res, navigate, "/admin/transaction");
  };
  

  return (
    <div className="admin-container">
      <AdminSidebar />

      <main className="product-management">
        {isLoading ? (
          <SkeletonLoader length={10} />
        ) : (
          <>
            <section style={{ padding: "2rem" }}>
              <h2>Order Items</h2>

              {orderItems.length > 0 ? (
                orderItems.map((item) => (
                  <ProductCard
                  key={item._id}
                  id={item.id} // <-- Add this line
                  name={item.name}
                  photo={item.photo}
                  productId={item.productId}
                  _id={item._id}
                  quantity={item.quantity}
                  price={item.price}
                />
                
                
                ))
              ) : (
                <p>No items in this order.</p>
              )}
            </section>

            <article className="shipping-info-card">
              <button className="product-delete-btn" onClick={deleteHandler}>
                <FaTrash />
              </button>

              <h1>Order Info</h1>

              <h5>User Info</h5>
              <p>
                <strong>Name:</strong> {name}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {`${address}, ${city}, ${state}, ${country} - ${pinCode}`}
              </p>

              <h5>Amount Info</h5>
              <p>
                <strong>Subtotal:</strong> ₹{subtotal}
              </p>
              <p>
                <strong>Shipping Charges:</strong> ₹{shippingCharges}
              </p>
              <p>
                <strong>Tax:</strong> ₹{tax}
              </p>
              <p>
                <strong>Discount:</strong> ₹{discount}
              </p>
              <p>
                <strong>Total:</strong> ₹{total}
              </p>

              <h5>Status Info</h5>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    status === "Delivered"
                      ? "purple"
                      : status === "Shipped"
                      ? "green"
                      : "red"
                  }
                >
                  {status}
                </span>
              </p>

              <button className="shipping-btn" onClick={updateHandler}>
                Process Status
              </button>
            </article>
          </>
        )}
      </main>
    </div>
  );
};

interface ProductCardProps extends OrderItems {}

const ProductCard = ({
  name,
  photo,
  price,
  quantity,
  productId
}: ProductCardProps) => (
  <div className="transaction-product-card">
    <img src={photo} alt={name} />
    <Link to={`/product/${productId}`}>{name}</Link>
    <span>
      ₹{price} x {quantity} = ₹{price * quantity}
    </span>
  </div>
);

export default TransactionManagement;
