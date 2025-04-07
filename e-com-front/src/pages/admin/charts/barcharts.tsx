import { RootState } from "../../../redux/store";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { BarChart } from "../../../components/admin/Charts";
import { useBarQuery } from "../../../redux/api/dashboardapi";
import { CustomError } from "../../../types/api-types";
import { getLastMonths } from "../../../utils/features";



const { last12Months, last6Months } = getLastMonths();
const Barcharts = () => {
  const { user } = useSelector((state: RootState) => state.user);

  const { isLoading, data, isError, error } = useBarQuery(user?._id!);
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

  useEffect(() => {
    if (isError && error) {
      const err = error as CustomError;
      toast.error(err.data.message);
    }
  }, [isError, error]);

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="chart-container">
        <h1>Bar Charts</h1>
        <section>
          <BarChart
            data_1={Products}
            data_2={users}
            title_1="Products"
            title_2="Users"
            bgColor_1="hsl(260, 50%, 30%)"
            bgColor_2="hsl(360, 90%, 90%)"
            labels={last6Months}
          />
          <h2>Top Products & Top Customers</h2>
        </section>

        <section>
          <BarChart
            horizontal={true}
            data_1={orders}
            data_2={revenue}
            title_1="Orders"
            title_2="Revenue"
            bgColor_1="hsl(180, 40%, 50%)"
            bgColor_2="hsl(0, 70%, 50%)"
            labels={last12Months}
          />
          <h2>Orders & Revenue throughout the year</h2>
        </section>
      </main>
    </div>
  );
};

export default Barcharts;
