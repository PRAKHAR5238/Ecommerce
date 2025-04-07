import { ReactElement, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import { useSelector } from "react-redux";
import { userReducerinitialstate } from "../../types/reducer-types";
import {
  useAllUsersQuery,
  useDeleteUserMutation,
} from "../../redux/api/Userapi";
import toast from "react-hot-toast";
import { CustomError } from "../../types/api-types";
import { SkeletonLoader } from "../../components/loader";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";

interface DataType {
  avatar: ReactElement;
  name: string;
  email: string;
  gender: string;
  role: string;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  { Header: "Avatar", accessor: "avatar" },
  { Header: "Name", accessor: "name" },
  { Header: "Gender", accessor: "gender" },
  { Header: "Email", accessor: "email" },
  { Header: "Role", accessor: "role" },
  { Header: "Action", accessor: "action" },
];

const Customers = () => {
  const { user } = useSelector(
    (state: { user: userReducerinitialstate }) => state.user
  );

  const { isLoading, data, isError, error, refetch } = useAllUsersQuery(
    user?._id || ""
  );

  const [deleteUser] = useDeleteUserMutation();

  const [rows, setRows] = useState<DataType[]>([]);

  // ✅ Delete Handler (async with try-catch)
  const deleteHandler = async (userId: string) => {
    try {
      const res = await deleteUser({
        userId,
        adminUserId: user?._id || "", // fallback to empty string to avoid undefined
      }).unwrap();

      toast.success(res.message || `User deleted successfully`);
      refetch(); // Refresh user list after deletion
    } catch (err: any) {
      const customError = err as CustomError;
      toast.error(customError?.data?.message || "Failed to delete user");
    }
  };

  // ✅ Error handling inside useEffect to avoid multiple renders firing the toast
  useEffect(() => {
    if (isError && error  && user?._id) {
      const err = error as CustomError;
      toast.error(err?.data?.message || "An error occurred while fetching users");
    }
  }, [isError, error]);

  useEffect(() => {
    if (data) {
      const formattedRows: DataType[] = data.users.filter((i:any)=> i._id !== user?._id).map((i: any) => ({
        avatar: (
          <Avatar
            src={i.photo || ""}
            alt={i.name}
            sx={{ width: 50, height: 50 }}
          />
        ),
        name: i.name || "No name",
        gender: i.gender || "N/A",
        email: i.email ?? "No email provided", // ✅ Fix null emails
        role: i.role || "N/A",
        action: (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => deleteHandler(i._id)}
            startIcon={<FaTrash />}
          >
       
          </Button>
        ),
      }));

      setRows(formattedRows);
    }
  }, [data]);

  const Table = TableHOC<DataType>(
    columns,
    rows,
    "dashboard-product-box",
    "Customers",
    rows.length > 6
  )();

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main>{isLoading || !user ? <SkeletonLoader length={20} /> : Table}</main>
    </div>
  );
};

export default Customers;
