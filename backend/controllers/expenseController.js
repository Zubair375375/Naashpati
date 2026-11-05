import mongoose from "mongoose";
import Expense from "../models/Expense.js";

export const getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 100, startDate, endDate, category } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    if (category) {
      query.category = String(category);
    }

    const expenses = await Expense.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate("product", "name sku costPrice price");

    const total = await Expense.countDocuments(query);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch expenses",
    });
  }
};

export const createExpense = async (req, res) => {
  try {
    const payload = {
      description: String(req.body.description || "").trim(),
      amount: Number(req.body.amount || 0),
      category: String(req.body.category || "").trim(),
      date: req.body.date || new Date(),
      paymentMethod: String(req.body.paymentMethod || "other").trim(),
      product: req.body.product && mongoose.Types.ObjectId.isValid(req.body.product)
        ? req.body.product
        : null,
      campaign: String(req.body.campaign || "").trim(),
      notes: String(req.body.notes || "").trim(),
      createdBy: req.user?._id || null,
    };

    if (!payload.description) {
      return res.status(400).json({ success: false, error: "Description is required" });
    }
    if (!payload.category) {
      return res.status(400).json({ success: false, error: "Category is required" });
    }
    if (!Number.isFinite(payload.amount) || payload.amount < 0) {
      return res.status(400).json({ success: false, error: "Amount must be a valid non-negative number" });
    }

    const expense = await Expense.create(payload);
    const saved = await expense.populate("product", "name sku costPrice price");
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Failed to create expense",
    });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, error: "Expense not found" });
    }

    const next = {
      description: String(req.body.description || expense.description).trim(),
      amount: Number(req.body.amount ?? expense.amount),
      category: String(req.body.category || expense.category).trim(),
      date: req.body.date || expense.date,
      paymentMethod: String(req.body.paymentMethod || expense.paymentMethod || "other").trim(),
      product: req.body.product && mongoose.Types.ObjectId.isValid(req.body.product)
        ? req.body.product
        : expense.product,
      campaign: String(req.body.campaign ?? expense.campaign ?? "").trim(),
      notes: String(req.body.notes ?? expense.notes ?? "").trim(),
    };

    if (!next.description) {
      return res.status(400).json({ success: false, error: "Description is required" });
    }
    if (!next.category) {
      return res.status(400).json({ success: false, error: "Category is required" });
    }
    if (!Number.isFinite(next.amount) || next.amount < 0) {
      return res.status(400).json({ success: false, error: "Amount must be a valid non-negative number" });
    }

    Object.assign(expense, next);
    await expense.save();
    await expense.populate("product", "name sku costPrice price");
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Failed to update expense",
    });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, error: "Expense not found" });
    }

    await expense.deleteOne();
    res.json({ success: true, message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};
