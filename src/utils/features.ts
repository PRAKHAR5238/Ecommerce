import mongoose from "mongoose";
import { invalidatecacheprops, Orderitemstype } from "../types/type";
import { myCache } from "../app";
import { Product } from "../models/Product";
import { config } from "dotenv";
import { Order } from "../models/Order";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import fs from 'fs';
import { Review } from "../models/Review";


export const findAverageRatings = async (
  productId: mongoose.Types.ObjectId
) => {
  let totalRating = 0;

  const reviews = await Review.find({ product: productId });
  reviews.forEach((review) => {
    totalRating += review.rating;
  });

  const averateRating = Math.floor(totalRating / reviews.length) || 0;

  return {
    numOfReviews: reviews.length,
    ratings: averateRating,
  };
};

config({
  path: "./.env",
});
cloudinary.config({
  cloud_name: 'dzf5jbmrx', // Replace with your Cloudinary cloud name
  api_key: '151218136631922',       // Replace with your API key
  api_secret: 'Kym7DvrkXWn93QMS1v2a5JrVfnc', // Replace with your API secret
});
export const connectDB = (uri: string) => {
  mongoose
    .connect(uri, {
      dbName: "Ecommerce24",
    })
    .then((c) => console.log(`DB Connected to ${c.connections[0].name}`))
    .catch((e) => console.log(e));
};



const getBase64 = (file: Express.Multer.File) =>{
  // Read the file as a binary buffer
const fileBuffer = fs.readFileSync(file.path);

// Convert to Base64
const base64String = fileBuffer.toString('base64');
return  `data:${file.mimetype};base64,${base64String}`;
}
 

export const uploadToCloudinary = async (files: Express.Multer.File[]) => {
  const promises = files.map(async (file) => {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      console.log(file.buffer);
      
      cloudinary.uploader.upload(getBase64(file), (error:any, result:any) => {
        if (error) return reject(error);
        resolve(result!);
      });
    });
  });

  const result = await Promise.all(promises);

  return result.map((i) => ({
    url: i.secure_url,
    path: i.public_id,
  }));
};


export const invalidatecacheproduct = async ({
  product,
  order,
  admin,
  review,
 
}: invalidatecacheprops) => {

if (review && product) {
  myCache.del([`reviews-${product.toString()}`]);
}

  console.log(product);
  
  if (product) {
    const productKeys: string[] = [
      "latest-product",
      "categories",
      "admin-products",
    ];

    const products = await Product.find({}).select("_id");
    products.forEach((i) => {
      productKeys.push(`product-${i._id}`);
    });

    myCache.del(productKeys);
  }

  if (order) {
    const orderKeys: string[] = [];

    // Delete "allOrders" cache
    orderKeys.push("allOrders");

    // Delete individual orders cache (optional but recommended)
    const orders = await Order.find({}).select("_id user");
    orders.forEach((order) => {
      console.log(order.user);
      
      orderKeys.push(`order-${order._id}`); // Single order cache
      orderKeys.push(order.user?.toString()); // Per-user orders cache
    });

    myCache.del(orderKeys);
  }

  if (admin) {
    const adminKeys = ["admin-dashboard", "admin-users"];
    myCache.del(adminKeys);
  }
};

export const reducestock = async (orderitem: Orderitemstype[]) => {
  for (let i = 0; i < orderitem.length; i++) {
    const order = orderitem[i];
    const product = await Product.findById(order.product_id);
    if (!product) throw new Error("product not found");
    product.stock = order.quantity;
    await product.save();

    // Perform necessary operations with `order`
    console.log(order); // Replace with actual stock reduction logic
  }
};

export const getInventories = async ({
  categories,
  productsCount,
}: {
  categories: string[];
  productsCount: number;
}) => {
  const categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );

  const categoriesCount = await Promise.all(categoriesCountPromise);
  
  const categoryCount: Record<string, number>[] = [];

  categories.forEach((category, i) => {
    categoryCount.push({
      [category]: Math.round((categoriesCount[i] / productsCount) * 100),
    });
  });

  return categoryCount;
};

export const calculatepercentage = (thisMonth: number, lastMonth: number) => {
   if(lastMonth == 0) lastMonth = 1;
  const percent = ((thisMonth - lastMonth) / lastMonth) * 100;
  return Number(percent.toFixed(0));
}