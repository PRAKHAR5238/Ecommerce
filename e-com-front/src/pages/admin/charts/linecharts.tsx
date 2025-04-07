import { useEffect } from "react";
import { RootState } from "../../../redux/store";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { LineChart } from "../../../components/admin/Charts";
import { useLineQuery } from "../../../redux/api/dashboardapi";
import { CustomError } from "../../../types/api-types";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Linecharts = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const { isLoading, data, error, isError } = user?._id ? useLineQuery(user?._id!):{};

  // Extract and format data from API response
  const Products =
  data?.charts?.productsByMonth?.map(
    (item: { totalProducts: any }) => item.totalProducts
  ) || Array(12).fill(0);
const users =
  data?.charts?.usersByMonth?.map(
    (item: { totalUsers: any }) => item.totalUsers
  ) || Array(12).fill(0);
const orders =
  data?.charts?.ordersByMonth?.map(
    (item: { totalOrders: any }) => item.totalOrders
  ) || Array(12).fill(0);
const revenue =
  data?.charts?.ordersByMonth?.map(
    (item: { totalRevenue: any }) => item.totalRevenue
  ) || Array(12).fill(0);
const discount =
  data?.charts?.discountsByMonth?.map(
    (item: {
      totalDiscount: any; totalRevenue: any 
}) => item.totalDiscount
  ) || Array(12).fill(0);

  // Handle errors
  useEffect(() => {
    if (isError && error && user?._id) {
      const err = error as CustomError;
      toast.error(err.data.message);
    }
  }, [isError, error]);

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="chart-container">
        <h1>Line Charts</h1>

        <section>
          <LineChart
            data={users}
            label="New Users"
            borderColor="rgb(53, 162, 255)"
            labels={months}
            backgroundColor="rgba(53, 162, 255, 0.5)"
          />
          <h2>New Users per Month</h2>
        </section>

        <section>
          <LineChart
            data={Products}
            backgroundColor="hsla(269,80%,40%,0.4)"
            borderColor="hsl(269,80%,40%)"
            labels={months}
            label="New Products"
          />
          <h2>New Products per Month</h2>
        </section>

        <section>
          <LineChart
            data={orders}
            backgroundColor="hsla(129,80%,40%,0.4)"
            borderColor="hsl(129,80%,40%)"
            label="Total Orders"
            labels={months}
          />
          <h2>Total Orders per Month</h2>
        </section>

        <section>
          <LineChart
            data={revenue}
            backgroundColor="hsla(29,80%,40%,0.4)"
            borderColor="hsl(29,80%,40%)"
            label="Revenue"
            labels={months}
          />
          <h2>Revenue per Month</h2>
        </section>

        <section>
          <LineChart
            data={discount}
            backgroundColor="hsla(0,80%,40%,0.4)"
            borderColor="hsl(0,80%,40%)"
            label="Total Discounts"
            labels={months}
          />
          <h2>Total Discounts per Month</h2>
        </section>
      </main>
    </div>
  );
};

export default Linecharts;
