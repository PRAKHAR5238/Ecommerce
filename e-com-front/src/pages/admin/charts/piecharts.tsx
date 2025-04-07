import { useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { usePieQuery } from "../../../redux/api/dashboardapi";
import { CustomError } from "../../../types/api-types";
import { RootState } from "../../../redux/store";
import { SkeletonLoader } from "../../../components/loader";
import { PieChart, DoughnutChart } from "../../../components/admin/Charts";

const PieCharts = () => {
  const { user } = useSelector((state: RootState) => state.user);

  if (!user) return <div>Loading user...</div>;

  const { isLoading, data, isError, error } = usePieQuery(user._id);
  const charts: any = data?.charts;

  const order = charts?.orderFullfillment;
  const categoriesData = charts?.productCategories;
  const revenue = charts?.revenueDistribution; // Using updated breakdown
  const age = charts?.usersAgeGroup;
  const adminCustomer = charts?.adminCustomer;
  const stockAvailability = charts?.stockAvailablity;

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
        <h1>Pie & Doughnut Charts</h1>

        {isLoading ? (
          <SkeletonLoader length={20} />
        ) : (
          <>
            {/* Order Fulfillment Ratio */}
            <section>
              <div>
                <PieChart
                  labels={["Processing", "Shipped", "Delivered"]}
                  data={[
                    order?.processing || 0,
                    order?.shipped || 0,
                    order?.delivered || 0,
                  ]}
                  backgroundColor={[
                    `hsl(110,80%, 80%)`,
                    `hsl(110,80%, 50%)`,
                    `hsl(110,40%, 50%)`,
                  ]}
                  offset={[0, 0, 50]}
                />
              </div>
              <h2>Order Fulfillment Ratio</h2>
            </section>

            {/* Product Categories Ratio */}
            <section>
              <div>
                <DoughnutChart
                  labels={categoriesData.map((i: any) => Object.keys(i)[0])}
                  data={categoriesData.map((i: any) => Object.values(i)[0])}
                  
                  backgroundColor={categoriesData.map(
                    (i: any, index: number) => `hsl(${index * 45}, 70%, 50%)`
                  )}
                  legends={false}
                  offset={categoriesData.map(() => 0)}
                />
              </div>
              <h2>Product Categories Ratio</h2>
            </section>

            {/* Stock Availability */}
            <section>
              <div>
                <DoughnutChart
                  labels={["In Stock", "Out Of Stock"]}
                  data={[
                    stockAvailability?.inStock || 0,
                    stockAvailability?.outOfStock || 0,
                  ]}
                  backgroundColor={["hsl(269,80%,40%)", "rgb(53, 162, 255)"]}
                  legends={false}
                  offset={[0, 80]}
                  cutout={"70%"}
                />
              </div>
              <h2>Stock Availability</h2>
            </section>

            {/* Revenue Distribution */}
            <section>
              <div>
                <DoughnutChart
                  labels={[
                    "Marketing Cost",
                    "Discount",
                    "Burnt",
                    "Production Cost",
                    "Net Margin",
                  ]}
                  data={
                    revenue
                      ? [
                          revenue.marketingCost.amount || 0,
                          revenue.discount.amount || 0,
                          revenue.burnt.amount || 0,
                          revenue.productionCost.amount || 0,
                          revenue.netMargin.amount || 0,
                        ]
                      : [0, 0, 0, 0, 0]
                  }
                  backgroundColor={[
                    "hsl(110,80%,40%)",
                    "hsl(19,80%,40%)",
                    "hsl(69,80%,40%)",
                    "hsl(300,80%,40%)",
                    "rgb(53, 162, 255)",
                  ]}
                  legends={false}
                  offset={[20, 30, 20, 30, 80]}
                />
              </div>
              <h2>Revenue Distribution</h2>
            </section>

            {/* Users Age Group */}
            <section>
              <div>
                <PieChart
                  labels={[
                    "Teenager (Below 20)",
                    "Adult (20-40)",
                    "Older (Above 40)",
                  ]}
                  data={
                    age
                      ? [age.teen || 0, age.adult || 0, age.old || 0]
                      : [0, 0, 0]
                  }
                  backgroundColor={[
                    `hsl(10, 80%, 80%)`,
                    `hsl(10, 80%, 50%)`,
                    `hsl(10, 40%, 50%)`,
                  ]}
                  offset={[0, 0, 50]}
                />
              </div>
              <h2>Users Age Group</h2>
            </section>

            {/* Admin vs Customers */}
            <section>
              <div>
                <DoughnutChart
                  labels={["Admin", "Customers"]}
                  data={
                    adminCustomer
                      ? [adminCustomer.admin || 0, adminCustomer.customer || 0]
                      : [0, 0]
                  }
                  backgroundColor={[
                    `hsl(335, 100%, 38%)`,
                    "hsl(44, 98%, 50%)",
                  ]}
                  offset={[0, 50]}
                />
              </div>
              <h2>Admin vs Customers</h2>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default PieCharts;
