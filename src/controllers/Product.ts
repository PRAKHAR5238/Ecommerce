import { Request, Response, NextFunction } from "express";
import { TryCatch } from "../middleware/error";
import { Product } from "../models/Product.js";
import { NewProductRequestBody } from "../types/type";
import fs from "fs/promises";
import { myCache } from "../app";
import { findAverageRatings, invalidatecacheproduct, uploadToCloudinary } from "../utils/features";
import mongoose, { Types } from "mongoose";
import ErrorHandler from "../utils/utilityclass";
import { Review } from "../models/Review";
import { User } from "../models/user";



export const NewProduct = TryCatch(
  async (
    req: Request<{}, {}, NewProductRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, description, price, stock, category, isActive } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    console.log("Request body:", req.body);
    console.log("Files received:", files?.map(f => f.originalname));

    if (!name || !price || !stock || !category || !files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, price, stock, category, or photos.",
      });
    }

    if (files.length > 5) {
      return res.status(400).json({
        success: false,
        message: "You can only upload up to 5 photos.",
      });
    }

    const photosURL = await uploadToCloudinary(files);
    if (!Array.isArray(photosURL) || photosURL.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Photo upload failed",
      });
    }

    let newProduct;
    try {
      newProduct = await Product.create({
        name,
        price,
        description,
        stock,
        category: category.toLowerCase(),
        isActive: isActive ?? true,
        photos: photosURL,
        reviews: [],
        rating: 0,
        numOfReviews: 0,
      });
    } catch (error) {
      console.error("Product creation failed:", error);
      return res.status(500).json({
        success: false,
        message: "Error creating product",
      });
    }

    await invalidatecacheproduct({ product: true, admin: true });

    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
      product: newProduct,
    });
  }
);


export const latestProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let products: any[] = [];

    
      products = await Product.find().sort({ createdAt: -1 }).limit(5);
      myCache.set("latest-product", JSON.stringify(products));
    

    res.status(200).json({
      success: true,
      message: "Latest products fetched successfully.",
      products,
    });
  }
);

export const categoryproduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let categories: string[] = [];

    if (myCache.has("categories")) {
      categories = JSON.parse(myCache.get("categories") as string);
    } else {
      categories = await Product.distinct("category");
      myCache.set("categories", JSON.stringify(categories));
    }

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully.",
      categories,
    });
  }
);

export const adminproduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let products: any[] = [];

    if (myCache.has("admin-products")) {
      products = JSON.parse(myCache.get("admin-products") as string);
    } else {
      products = await Product.find();
      myCache.set("admin-products", JSON.stringify(products));
    }

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      products,
    });
  }
);

export const singleproduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;

    // 🔐 Prevent invalid ObjectId errors
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  }
);


export const updateProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, description, price, stock, category, isActive } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category.toLowerCase();
    if (typeof isActive === "boolean") product.isActive = isActive;

    if (files && files.length > 0) {
      const photosURL = await uploadToCloudinary(files);

      // If you need to delete old photos from disk, do it here if stored locally.
      // Cloudinary photos don't need fs.unlink unless you're deleting from a local backup.
      product.photos = photosURL;
    }

    const updatedProduct = await product.save();

    await invalidatecacheproduct({ product: true, admin: true });

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  }
);

export const DELETEPRODUCT = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Remove photos from Cloudinary here if applicable
    if (product.photos && product.photos.length > 0) {
      for (const photo of product.photos) {
        try {
          // Cloudinary delete API goes here if necessary
          if (photo.path) await fs.unlink(photo.path);
        } catch (err) {
          console.error(`Error deleting photo: ${photo.path}`, err);
        }
      }
    }

    await product.deleteOne();

    await invalidatecacheproduct({ product: true, admin: true });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  }
);

export const allProductSearch = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { search, sort, price, category } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PER_PAGE) || 10;
    const skip = limit * (page - 1);

    const query: any = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (price) query.price = { $lte: Number(price) };
    if (category) query.category = category;

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .sort(sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {})
        .limit(limit)
        .skip(skip),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      products,
      totalPages,
      totalCount,
    });
  }
);





export const deleteReview = TryCatch(async (req: { query: { id: any; }; params: { id: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success: boolean; message: string; }): any; new(): any; }; }; }, next: (arg0: ErrorHandler) => any) => {
  const user = await User.findById(req.query.id);

  if (!user) return next(new ErrorHandler("Not Logged In", 404));

  const review = await Review.findById(req.params.id);
  if (!review) return next(new ErrorHandler("Review Not Found", 404));

  const isAuthenticUser = review.user.toString() === user._id.toString();

  if (!isAuthenticUser) return next(new ErrorHandler("Not Authorized", 401));

  await review.deleteOne();

  const product = await Product.findById(review.product);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  const { ratings, numOfReviews } = await findAverageRatings(product._id as Types.ObjectId);

  product.rating = ratings;
  product.numOfReviews = numOfReviews;

  await product.save();

  await invalidatecacheproduct({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Review Deleted",
  });
});


export const newReview = TryCatch(async (req: { query: { id: any; }; params: { id: any; }; body: { comment: any; rating: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success: boolean; message: string; }): any; new(): any; }; }; }, next: (arg0: ErrorHandler) => any) => {
  const user = await User.findById(req.query.id);

  if (!user) return next(new ErrorHandler("Not Logged In", 404));

  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  const { comment, rating } = req.body;

  const alreadyReviewed = await Review.findOne({
    user: user._id,
    product: product._id,
  });

  if (alreadyReviewed) {
    alreadyReviewed.comment = comment;
    alreadyReviewed.rating = rating;

    await alreadyReviewed.save();
  } else {
    await Review.create({
      comment,
      rating,
      user: user._id,
      product: product._id,
    });
  }

 const { ratings, numOfReviews } = await findAverageRatings(product._id as Types.ObjectId);

  product.rating = ratings;
  product.numOfReviews = numOfReviews;

  await product.save();

  await invalidatecacheproduct({
    product: true,
    productId: String(product._id),
    admin: true,
    review: true,
  });

  return res.status(alreadyReviewed ? 200 : 201).json({
    success: true,
    message: alreadyReviewed ? "Review Update" : "Review Added",
  });
});


export const allReviewsOfProduct = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name photo")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      reviews,
    });
  }
);