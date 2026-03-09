import Product from "../models/Product.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";


export const createProduct = async (req, res) => {
  try {
    const { name, price, quantity, description, category } = req.body;

    // Validation
    if (!name || !price || quantity === undefined || !category) {
      return res.status(400).json({ 
        message: "Missing required fields: name, price, quantity, category" 
      });
    }

    if (isNaN(price) || price < 0) {
      return res.status(400).json({ 
        message: "Price must be a positive number" 
      });
    }

    if (isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ 
        message: "Quantity must be a positive number" 
      });
    }

    // Check if category is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        message: "Invalid category ID format. Make sure you're using a real category ObjectId, not '<paste-category-id-here>'",
        received: category
      });
    }

    // Check if category exists and belongs to user
    const categoryExists = await Category.findOne({
      _id: category,
      userId: req.user.id
    });

    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found or doesn't belong to you"
      });
    }

    const product = await Product.create({
      name,
      price,
      quantity,
      description,
      category,
      userId: req.user.id,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { keyword } = req.query;

    let query = { userId: req.user.id };

    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }

    const products = await Product.find(query).populate('category').sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, price, quantity, description, category } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, price, quantity, description, category },
      { new: true }
    ).populate('category');

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};











export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate('category');

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};