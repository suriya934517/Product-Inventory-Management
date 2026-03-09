import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./db/db.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import Category from "./models/Category.js";
import { protect } from "./middlewares/auth.middleware.js";

dotenv.config();

const app = express();

connectDB();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello From Product Inventory Management System");
});

// Debug endpoint to verify token
app.post("/api/debug/verify-token", (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.json({ 
      status: "error",
      message: "No Authorization header found",
      hint: "Send header: Authorization: Bearer <token>"
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.json({
      status: "error",
      message: "Authorization header should start with 'Bearer '",
      received: authHeader.substring(0, 50)
    });
  }

  const token = authHeader.split(" ")[1];
  res.json({
    status: "info",
    message: "Token format looks correct",
    tokenLength: token.length,
    hint: "Try accessing /api/v1/products with this token"
  });
});

// Debug endpoint to show your categories with IDs
app.get("/api/debug/categories", protect, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.id }).select('_id name description');
    
    if (categories.length === 0) {
      return res.json({
        status: "info",
        message: "No categories found. Create one first!",
        step1: "POST /api/v1/categories",
        step1_body: { name: "Electronics", description: "Electronic devices" }
      });
    }

    res.json({
      status: "success",
      message: "Your categories (use the _id value when adding products):",
      categories: categories.map(cat => ({
        _id: cat._id.toString(),
        name: cat.name,
        description: cat.description
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
