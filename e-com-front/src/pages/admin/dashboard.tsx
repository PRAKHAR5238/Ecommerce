import { BsSearch } from "react-icons/bs";
import { FaRegBell } from "react-icons/fa";
import { HiTrendingDown, HiTrendingUp } from "react-icons/hi";


import AdminSidebar from "../../components/admin/AdminSidebar";

import { useStatsQuery } from "../../redux/api/dashboardapi";
import { useSelector } from "react-redux";
import { useEffect } from "react";

import toast from "react-hot-toast";
import { CustomError } from "../../types/api-types";
import { RootState } from "../../redux/store";
import { SkeletonLoader } from "../../components/loader";
import Table from "../../components/admin/DashboardTable";
import { BiMaleFemale } from "react-icons/bi";
import { BarChart, DoughnutChart } from "../../components/admin/Charts";
import { getLastMonths } from "../../utils/features";

const userImg =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJxA5cTf-5dh5Eusm0puHbvAhOrCRPtckzjA&usqp";

  const { last6Months: months } = getLastMonths();

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.user);

  // Early return if user is not loaded yet
  if (!user) return <div>Loading user...</div>;

  const { isLoading, data, isError, error } = useStatsQuery(user._id);
  const stats: any = data?.stats;

  // Handle toast error in useEffect to avoid triggering it during render
  useEffect(() => {
    if (isError && error) {
      const err = error as CustomError;
      toast.error(err.data.message);
    }
  }, [isError, error]);

  return (
    <div className="admin-container">
      <AdminSidebar />

      <main className="dashboard">
        {isLoading ? (
          <SkeletonLoader length={20} />
        ) : (
          <>
            {/* Top Bar */}
            <div className="bar">
              <BsSearch />
              <input type="text" placeholder="Search for data, users, docs" />
              <FaRegBell />
              <img src={userImg} alt="User" />
            </div>

            {/* Widget Section */}
            <section className="widget-container">
              <WidgetItem
                percent={stats.revenue.percentageChange ?? 0}
                amount={true}
                value={(stats.revenue.lastMonth.total) +(stats.revenue.thisMonth.total) }
                heading="Revenue"
                color="rgb(0, 115, 255)"
              />

              <WidgetItem
                percent={stats.users.percentageChange }
                value={(stats.users.lastMonth.count)+(stats.users.thisMonth.count) }
                color="rgb(0 198 202)"
                heading="Users"
              />

              <WidgetItem
                percent={stats.orders.percentageChange }
                value={(stats.orders.lastMonth.count)+(stats.orders.thisMonth.count) }
                color="rgb(255 196 0)"
                heading="Transactions"
              />

              <WidgetItem
                percent={ (stats.categories.camera?.totalProducts || 0) +
                  (stats.categories.laptop?.totalProducts || 0)} // Placeholder since no percentage provided in API
                value={
                  (stats.categories.camera?.totalProducts || 0) +
                  (stats.categories.laptop?.totalProducts || 0)
                 
                }
                color="rgb(76 0 255)"
                heading="Products"
              />
            </section>

            {/* Graph and Categories Section */}
            <section className="graph-container">
              <div className="revenue-chart">
                <h2>Revenue & Transaction </h2>
                <BarChart
                  labels={months}
                  data_1={[stats.revenue.lastMonth.total, stats.revenue.thisMonth.total]}
                  data_2={[stats.orders.lastMonth.count, stats.orders.thisMonth.count]}
                  title_1="Revenue"
                  title_2="Transaction"
                  bgColor_1="rgb(0, 115, 255)"
                  bgColor_2="rgba(53, 162, 235, 0.8)"
                />
              </div>

              <div className="dashboard-categories">
                <h2>Inventory</h2>
                <div>
                  {Object.entries(stats.categories).map(
                    ([categoryName, { totalProducts }]: [string, any]) => (
                      <CategoryItem
                        key={categoryName}
                        value={totalProducts || 0}
                        heading={categoryName}
                        color={`hsl(${(totalProducts || 0) * 40}, 70%, 50%)`}
                      />
                    )
                  )}
                </div>
              </div>
            </section>

            {/* Gender & Transactions Section */}
            <section className="transaction-container">
              <div className="gender-chart">
                <h2>Gender Ratio</h2>
                <DoughnutChart
                  labels={["Female", "Male"]}
                  data={[stats.users.female || 30, stats.users.male || 10]}
                  backgroundColor={[
                    "hsl(340, 82%, 56%)",
                    "rgba(53, 162, 235, 0.8)",
                  ]}
                  cutout={90}
                />
                <p>
                  <BiMaleFemale />
                </p>
              </div>
              <Table data={stats.latestTransactions} />

            </section>
          </>
        )}
      </main>
    </div>
  );
};

// ==================== WidgetItem ====================
interface WidgetItemProps {
  heading: string;
  value: number;
  percent: number;
  color: string;
  amount?: boolean;
}

const WidgetItem = ({
  heading,
  value,
  percent,
  color,
  amount = false
}: WidgetItemProps) => (
  <article className="widget">
    <div className="widget-info">
      <p>{heading}</p>
      <h4>{amount ? `₹${value}` : value}</h4>

      {percent > 0 ? (
        <span className="green">
          <HiTrendingUp /> +{`${percent > 10000 ? 9999 : percent}%`}
        </span>
      ) : (
        <span className="red">
          <HiTrendingDown /> {`${percent < -10000 ? -9999 : percent}%`}
        </span>
      )}
    </div>

    <div
      className="widget-circle"
      style={{
        background: `conic-gradient(
          ${color} ${(Math.abs(percent) / 100) * 360}deg,
          rgb(255, 255, 255) 0
        )`
      }}
    >
      <span
        style={{
          color
        }}
      >
        {percent > 0 && `${percent > 10000 ? 9999 : percent}%`}
        {percent < 0 && `${percent < -10000 ? -9999 : percent}%`}
      </span>
    </div>
  </article>
);

// ==================== CategoryItem ====================
interface CategoryItemProps {
  color: string;
  value: number;
  heading: string;
}

const CategoryItem = ({
  color,
  value,
  heading
}: CategoryItemProps) => (
  <div className="category-item">
    <h5>{heading}</h5>
    <div>
      <div
        style={{
          backgroundColor: color,
          width: `${value}%`
        }}
      ></div>
    </div>
    <span>{value}%</span>
  </div>
);

export default Dashboard;
