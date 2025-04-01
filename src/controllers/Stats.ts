import { myCache } from "../app";
import { Request, Response, NextFunction } from "express";
import { TryCatch } from "../middleware/error";
import { Product } from "../models/Product";
import { User } from "../models/user";
import { Order } from "../models/Order";
import { calculatepercentage, getInventories } from "../utils/features";

// Helper function to calculate category stats
const calculateCategoryStats = async (): Promise<Record<string, { totalProducts: number; totalOrders: number }>> => {
    const categories = await Product.distinct("category");
    const stats: Record<string, { totalProducts: number; totalOrders: number }> = {};

    for (const category of categories) {
        stats[category] = {
            totalProducts: await Product.countDocuments({ category }),
            totalOrders: await Order.countDocuments({ "items.category": category }),
        };
    }

    return stats;
};


// Helper function to fetch user and order statistics
interface UserOrderStats {
    users: any[];  // Replace 'any' with a more specific type if needed
    orders: any[];  // Replace 'any' with a more specific type if needed
    revenue: number;
}

// Function to fetch user and order stats with specified date range
const fetchUserAndOrderStats = async (start: Date, end: Date): Promise<UserOrderStats> => {
    const users = await User.find({ createdAt: { $gte: start, $lte: end } });
    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } });

    // Calculate total revenue
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);

    return { users, orders, revenue };
};

// Helper function to fetch latest transactions
const fetchLatestTransactions = async () => {
    const transactions = await Order.find()
        .sort({ createdAt: -1 })
        .populate("user", "name")
        .select("orderId orderItems items quantity discount status total user createdAt");

    return transactions.map(transaction => ({
        orderId: transaction._id,
        quantity: transaction.orderItems?.length || 0,
        discount: transaction.discount || 0,
        status: transaction.status,
        amount: transaction.total,
        createdAt: transaction.createdAt,
    }));
};

// Dashboard Stats
export const dashboardstats = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    if (myCache.has("admin-stats")) {
        try {
            return res.status(200).json({ success: true, stats: JSON.parse(myCache.get("admin-stats") as string) });
        } catch (error) {
            console.error("Error parsing cached data:", error);
        }
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [categoryStats, thisMonth, lastMonth, latestTransactions, maleUsers, femaleUsers] = await Promise.all([
        calculateCategoryStats(),
        fetchUserAndOrderStats(startOfMonth, endOfMonth),
        fetchUserAndOrderStats(startOfLastMonth, endOfLastMonth),
        fetchLatestTransactions(),
        User.countDocuments({ gender: "male" }),
        User.countDocuments({ gender: "female" }),
    ]);

    const userChange = calculatepercentage(thisMonth.users.length, lastMonth.users.length);
    const orderChange = calculatepercentage(thisMonth.orders.length, lastMonth.orders.length);
    const revenueChange = calculatepercentage(thisMonth.revenue, lastMonth.revenue);
   console.log(thisMonth, startOfMonth, today, revenueChange);
   
    const stats = {
        categories: categoryStats,
        users: {
            male: maleUsers,
            female: femaleUsers,
            thisMonth: { count: thisMonth.users.length },
            lastMonth: { count: lastMonth.users.length },
            percentageChange: userChange,
        },
        orders: {
            thisMonth: { count: thisMonth.orders.length },
            lastMonth: { count: lastMonth.orders.length },
            percentageChange: orderChange,
        },
        revenue: {
            thisMonth: { total: thisMonth.revenue },
            lastMonth: { total: lastMonth.revenue },
            percentageChange: revenueChange,
        },
        latestTransactions,
    };

    myCache.set("admin-stats", JSON.stringify(stats), 3600);
    return res.status(200).json({ success: true, stats });
});

// Pie Chart Stats
export const piechartstats = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Fetch data in parallel
      const [cat,totalProducts, totalUsers, totalOrders, orders, admincustomers, ageGroupCounts, outOfStock] = await Promise.all([
        calculateCategoryStats(),
        Product.countDocuments(),
        User.countDocuments(),
        Order.countDocuments(),
        Order.find(),
        getAdminCustomerCounts(), // admin and customer counts
        getUserAgeGroupCounts(), 
        Product.countDocuments({ stock: 0 }),   // age group counts
      ]);
 
      
  
      // Calculate total revenue
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      
    const stockAvailablity = {
        inStock: totalProducts - outOfStock,
        outOfStock,
      };
  
      const grossIncome = orders.reduce(
        (prev, order) => prev + (order.total || 0),
        0
      );
  
      const discount = orders.reduce(
        (prev, order) => prev + (order.discount || 0),
        0
      );
  
      const productionCost = orders.reduce(
        (prev, order) => prev + (order.shippingCharges || 0),
        0
      );
  
      const burnt = orders.reduce((prev, order) => prev + (order.tax || 0), 0);
  
      const marketingCost = Math.round(grossIncome * (30 / 100));
  
      const netMargin =
        grossIncome - discount - productionCost - burnt - marketingCost;
  
      // Revenue Breakdown (hardcoded values for now)
      const revenueBreakdown = {
        netMargin,
        discount,
        productionCost,
        burnt,
        marketingCost,
      };
  
      // Calculate Revenue Distribution (percentages)
      const revenueDistribution = (Object.keys(revenueBreakdown) as Array<keyof typeof revenueBreakdown>).reduce(
        (acc, key) => {
          const amount = revenueBreakdown[key];
          acc[key] = {
            amount,
            ratio: totalRevenue > 0 ? `${((amount / totalRevenue) * 100).toFixed(2)}%` : "0%",
          };
          return acc;
        },
        {} as Record<keyof typeof revenueBreakdown, { amount: number; ratio: string }>
      );
  
      // Order Fulfillment stats
      const orderFullfillment = {
        processing: orders.filter(order => order.status === "Processing").length,
        shipped: orders.filter(order => order.status === "Shipped").length,
        delivered: orders.filter(order => order.status === "Delivered").length,
      };
  
      // Define categories array for product categories (assuming these exist in your products)
      const categories = Object.keys(cat); 
  
      // Get product categories percentages
      const productCategories = await getInventories({
        categories,
        productsCount: totalProducts, // <--- You already fetched this above!
      });
  
      // Return the response with all the stats in the `charts` object
      return res.status(200).json({
        success: true,
        charts: {
          orderFullfillment,
          productCategories,
          stockAvailablity,
          revenueDistribution: {
            totalRevenue,
            ...revenueDistribution,
          },
          usersAgeGroup: ageGroupCounts,
          adminCustomer: admincustomers,
        },
      });
    } catch (error) {
      console.error("Error fetching pie chart stats:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching pie chart stats",
      });
    }
  });
  
// Helper function to get admin and customer counts
const getAdminCustomerCounts = async () => {
    try {
        // Count number of admin users
        const adminCount = await User.countDocuments({ role: 'admin' });

        // Count number of customer users
        const customerCount = await User.countDocuments({ role: 'customer' });

        // Return the counts as part of the response
        return {
            admin: adminCount,
            customer: customerCount,
        };

    } catch (error) {
        console.error("Error fetching admin and customer counts:", error);
        throw error;
    }
};

// Helper function to get user age group counts
const getUserAgeGroupCounts = async () => {
    try {
        // Get the current date for calculating age
        const currentDate = new Date();
        console.log("Current date:", currentDate);

        // Count users in each age group
        const ageGroupCounts = {
            teen: 0,
            adult: 0,
            old: 0
        };

        // Get users' birthdate and calculate age
        const users = await User.find({ dateOfBirth: { $exists: true } });
        console.log("Found users:", users);

        // Iterate over each user and calculate their age
        users.forEach((user) => {
            if (user.dob) {
                const birthDate = new Date(user.dob);
                console.log("User's birthdate:", birthDate);

                let age = currentDate.getFullYear() - birthDate.getFullYear(); // Use `let` here instead of `const`
                const monthDiff = currentDate.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
                    age--; // Modify the age here
                }

                console.log("User age:", age);

                // Categorize the user into an age group
                if (age >= 13 && age <= 19) {
                    ageGroupCounts.teen++;
                } else if (age >= 20 && age <= 64) {
                    ageGroupCounts.adult++;
                } else if (age >= 65) {
                    ageGroupCounts.old++;
                }
            }
        });

        console.log("Age group counts:", ageGroupCounts);
        return ageGroupCounts;

    } catch (error) {
        console.error("Error fetching age group counts:", error);
        throw error;
    }
};

// Bar Chart Stats
export const barchartstats = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const key = "admin-bar-charts";

    if (myCache.has(key)) {
        const charts = JSON.parse(myCache.get(key) as string);
        return res.status(200).json({ success: true, charts });
    }

    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Fetch orders grouped by month for the past year
    const monthlyOrderStats = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: twelveMonthsAgo, $lte: today },
            },
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: "$total" },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    // Fetch user and product creation stats
    const userStats = await User.aggregate([
        {
            $group: {
                _id: { $month: "$createdAt" },
                totalUsers: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    const productStats = await Product.aggregate([
        {
            $group: {
                _id: { $month: "$createdAt" },
                totalProducts: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    // Transform the data into a consumable format for the bar chart
    const ordersByMonth = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalOrders: 0,
        totalRevenue: 0,
    }));

    const usersByMonth = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalUsers: 0,
    }));

    const productsByMonth = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalProducts: 0,
    }));

    monthlyOrderStats.forEach(({ _id, totalOrders, totalRevenue }) => {
        ordersByMonth[_id - 1].totalOrders = totalOrders;
        ordersByMonth[_id - 1].totalRevenue = totalRevenue;
    });

    userStats.forEach(({ _id, totalUsers }) => {
        usersByMonth[_id - 1].totalUsers = totalUsers;
    });

    productStats.forEach(({ _id, totalProducts }) => {
        productsByMonth[_id - 1].totalProducts = totalProducts;
    });

    const charts = {
        ordersByMonth,
        usersByMonth,
        productsByMonth,
    };

    // Cache the charts data
    myCache.set(key, JSON.stringify(charts), 3600);

    return res.status(200).json({ success: true, charts });
});

// Line Chart Stats
export const linechartstats = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const key = "admin-line-charts";

    if (myCache.has(key)) {
        try {
            return res.status(200).json({ success: true, charts: JSON.parse(myCache.get(key) as string) });
        } catch (error) {
            console.error("Error parsing cached data:", error);
        }
    }

    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999);

    // Aggregate orders, users, products, and discounts
    const [monthlyOrderStats, monthlyUserStats, monthlyProductStats, monthlyDiscountStats] = await Promise.all([
        Order.aggregate([
            { $match: { createdAt: { $gte: oneYearAgo, $lte: today } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$total" },
                    totalDiscount: { $sum: { $ifNull: ["$discount", 0] } } // Ensure discount is included
                },
            },
            { $sort: { _id: 1 } },
        ]),

        User.aggregate([
            { $match: { createdAt: { $gte: oneYearAgo, $lte: today } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalUsers: { $sum: 1 }
                },
            },
            { $sort: { _id: 1 } },
        ]),

        Product.aggregate([
            { $match: { createdAt: { $gte: oneYearAgo, $lte: today } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalProducts: { $sum: 1 }
                },
            },
            { $sort: { _id: 1 } },
        ]),

        Order.aggregate([
            { $match: { createdAt: { $gte: oneYearAgo, $lte: today } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalDiscount: { $sum: { $ifNull: ["$discount", 0] } }
                },
            },
            { $sort: { _id: 1 } },
        ])
    ]);

    // Initialize arrays for 12 months
    const ordersByMonth = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalOrders: 0,
        totalRevenue: 0,
        totalDiscount: 0
    }));

    const usersByMonth = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalUsers: 0
    }));

    const productsByMonth = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalProducts: 0
    }));

    const discountsByMonth = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalDiscount: 0
    }));

    // Populate arrays with data
    monthlyOrderStats.forEach(({ _id, totalOrders, totalRevenue, totalDiscount }) => {
        const index = _id - 1;
        ordersByMonth[index].totalOrders = totalOrders;
        ordersByMonth[index].totalRevenue = totalRevenue;
        ordersByMonth[index].totalDiscount = totalDiscount;
    });

    monthlyUserStats.forEach(({ _id, totalUsers }) => {
        usersByMonth[_id - 1].totalUsers = totalUsers;
    });

    monthlyProductStats.forEach(({ _id, totalProducts }) => {
        productsByMonth[_id - 1].totalProducts = totalProducts;
    });

    monthlyDiscountStats.forEach(({ _id, totalDiscount }) => {
        discountsByMonth[_id - 1].totalDiscount = totalDiscount;
    });

    const charts = { ordersByMonth, usersByMonth, productsByMonth, discountsByMonth };

    myCache.set(key, JSON.stringify(charts), 3600);
    return res.status(200).json({ success: true, charts });
});
