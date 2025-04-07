export type User = {
  name: string;
  email: string;
  gender: string;
  role: string;
  dob: string;
  photo: string;
  _id: string;
};
export type Product = {
  name: string;
  price: number;
  stock: number;
  category: string;
  photos: any[];
  _id: string;
};
export type shippinginfo = {
  // pinCode: number;

  address: string;
  city: string;
  state: string;
  country: string;
  zip: string; // Not 'zip'
  toFixed?: number; // Optional
};

export type CartItem = {
  id: number;       // << This is required
  _id: string;
  stock: number;
  productId: string;
  name: string;
  quantity: number;
  photo: string;
  price: number;
};
export type OrderItems = Omit<CartItem, "stock"> & { _id: string };


export type Order = {
  orderItems: OrderItems[];
  shippingInfo: shippinginfo;
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  status: string;
  user: {
    name: string;
    _id: string;
  };
  _id: string;
};




type CategoryStats = {
  totalProducts: number;
  totalOrders: number;
};

type UsersStats = {
  male: number;
  female: number;
  thisMonth: {
    count: number;
  };
  lastMonth: {
    count: number;
  };
  percentageChange: number | null;
};

type OrdersStats = {
  thisMonth: {
    count: number;
  };
  lastMonth: {
    count: number;
  };
  percentageChange: number | null;
};

type RevenueStats = {
  thisMonth: {
    total: number;
  };
  lastMonth: {
    total: number;
  };
  percentageChange: number | null;
};

type LatestTransaction = {
  orderId: string;
  quantity: number;
  discount: number;
  status: string;
  amount: number;
  createdAt: string; // or Date, depending on how you handle dates in your API
};

export type DashboardStats = {
  categories: Record<string, CategoryStats>;
  users: UsersStats;
  orders: OrdersStats;
  revenue: RevenueStats;
  latestTransactions: LatestTransaction[];
};

type OrderFullfillment = {
  processing: number;
  shipped: number;
  delivered: number;
};

type RevenueDistribution = {
  netMargin: number;
  discount: number;
  productionCost: number;
  burnt: number;
  marketingCost: number;
};
type UsersAgeGroup = {
  teen: number;
  adult: number;
  old: number;
};

export type Pie = {
  orderFullfillment: OrderFullfillment;
  productCategories: Record<string, number>[];
  stockAvailablity: {
    inStock: number;
    outOfStock: number;
  };
  revenueDistribution: RevenueDistribution;
  usersAgeGroup: UsersAgeGroup;
  adminCustomer: {
    admin: number;
    customer: number;
  };
};

export type bar = {
  ordersByMonth: any,
  usersByMonth: any,
  productsByMonth: any,
};


export type line = {
  usersByMonth: any,
  productsByMonth: any,
  totalOrders: any,
  ordersByMonth: any,
  discountsByMonth:any
  totalRevenue: any,
};