import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const categoryRouter = express.Router();

categoryRouter.post("/", protect, createCategory);
categoryRouter.get("/", protect, getCategories);
categoryRouter.put("/:id", protect, updateCategory);
categoryRouter.delete("/:id", protect, deleteCategory);

export default categoryRouter;