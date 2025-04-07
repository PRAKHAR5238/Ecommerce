import { ReactElement, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import { SkeletonLoader } from "../../components/loader";

import { RootState } from "../../redux/store";
import { CustomError } from "../../types/api-types";
import { useAllOrdersQuery } from "../../redux/api/Orderapi";
import { userReducerinitialstate } from "../../types/reducer-types";

interface DataType {
  user: string;
  amount: number;
  discount: number;
  quantity: number;
  status: ReactElement;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "Avatar",
    accessor: "user",
  },
  {
    Header: "Amount",
    accessor: "amount",
  },
  {
    Header: "Discount",
    accessor: "discount",
  },
  {
    Header: "Quantity",
    accessor: "quantity",
  },
  {
    Header: "Status",
    accessor: "status",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Transaction = () => {
  const { user, loading } = useSelector(
    (state:{
      user:userReducerinitialstate
      }) => state.user
      );
 
  const { isLoading, data, isError, error } = useAllOrdersQuery(user?._id! );

  const [rows, setRows] = useState<DataType[]>([]);

  if (user && isError && error && user?._id) {
    const err = error as CustomError;
  
    const message =
      err?.data?.message || "An unexpected error occurred. Please try again.";
  
    toast.error(message);
  }
  

  useEffect(() => {
    if (data)
      setRows(
        data.orders.map((i:any) => ({
          user: i.name,
          amount: i.total,
          discount: i.discount,
          quantity: i.orderItems.length,
          status: (
            <span
              className={
                i.status === "Processing"
                  ? "red"
                  : i.status === "Shipped"
                  ? "green"
                  : "purple"
              }
            >
              {i.status}
            </span>
          ),
          action: <Link to={`/admin/transaction/${i._id}`}>Manage</Link>,
        }))
      );
  }, [data]);

  const Table = TableHOC<DataType>(
    columns,
    rows,
    "dashboard-product-box",
    "Transactions",
    rows.length > 6
  )();
  return (
    <div className="admin-container">
      <AdminSidebar />
      <main>{isLoading || !user ? <SkeletonLoader length={20} /> : Table}</main>
    </div>
  );
};

export default Transaction;