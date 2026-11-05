import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import FinancialAccount from "../models/FinancialAccount.js";
import FinancialTransaction from "../models/FinancialTransaction.js";
import {
  getCashFlowSummary,
  buildChartSeries,
  getBreakEvenSummary as computeBreakEvenSummary,
  getBreakEvenTrends as computeBreakEvenTrends,
  getBreakEvenProducts as computeBreakEvenProducts,
  getBreakEvenCosts as computeBreakEvenCosts,
  simulateBreakEven as simulateBreakEvenScenario,
} from "../services/financialService.js";

const serializeAmount = (value) => Number(value || 0);

const resolvePeriodDateRange = (period) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (!period) {
    start.setDate(now.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  switch (period) {
    case "7d":
      start.setDate(now.getDate() - 6);
      break;
    case "30d":
      start.setDate(now.getDate() - 29);
      break;
    case "90d":
      start.setDate(now.getDate() - 89);
      break;
    case "thisMonth":
      start.setDate(1);
      break;
    case "lastMonth": {
      start.setMonth(now.getMonth() - 1, 1);
      end.setMonth(now.getMonth(), 0);
      break;
    }
    case "thisYear":
      start.setMonth(0, 1);
      break;
    default:
      start.setDate(now.getDate() - 29);
      break;
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const resolveQueryDateRange = (query) => {
  const { startDate, endDate, period } = query || {};
  if (startDate || endDate) {
    return {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
  }

  const resolved = resolvePeriodDateRange(period);
  return {
    startDate: resolved.start.toISOString(),
    endDate: resolved.end.toISOString(),
  };
};

export const getFinancialAccounts = async (req, res) => {
  try {
    const accounts = await FinancialAccount.find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch accounts",
    });
  }
};

export const createFinancialAccount = async (req, res) => {
  try {
    const payload = {
      name: String(req.body.name || "").trim(),
      type: String(req.body.type || "cash").trim(),
      accountNumber: String(req.body.accountNumber || "").trim(),
      bankName: String(req.body.bankName || "").trim(),
      currency: String(req.body.currency || "PKR")
        .trim()
        .toUpperCase(),
      openingBalance: Number(req.body.openingBalance || 0),
      currentBalance: Number(
        req.body.currentBalance || req.body.openingBalance || 0,
      ),
      notes: String(req.body.notes || "").trim(),
      isActive: req.body.isActive !== false,
      createdBy: req.user?._id || null,
    };

    if (!payload.name) {
      return res
        .status(400)
        .json({ success: false, error: "Account name is required" });
    }

    const account = await FinancialAccount.create(payload);
    res.status(201).json({ success: true, data: account });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Failed to create account",
    });
  }
};

export const updateFinancialAccount = async (req, res) => {
  try {
    const account = await FinancialAccount.findById(req.params.id);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: "Account not found" });
    }

    account.name = String(req.body.name || account.name).trim();
    account.type = String(req.body.type || account.type).trim();
    account.accountNumber = String(
      req.body.accountNumber ?? account.accountNumber ?? "",
    ).trim();
    account.bankName = String(
      req.body.bankName ?? account.bankName ?? "",
    ).trim();
    account.notes = String(req.body.notes ?? account.notes ?? "").trim();
    account.isActive =
      req.body.isActive !== undefined
        ? Boolean(req.body.isActive)
        : account.isActive;

    if (req.body.openingBalance !== undefined) {
      account.openingBalance = Number(req.body.openingBalance || 0);
    }
    if (req.body.currentBalance !== undefined) {
      account.currentBalance = Number(req.body.currentBalance || 0);
    }

    await account.save();
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Failed to update account",
    });
  }
};

export const deleteFinancialAccount = async (req, res) => {
  try {
    const account = await FinancialAccount.findById(req.params.id);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: "Account not found" });
    }

    const linkedTransactions = await FinancialTransaction.countDocuments({
      $or: [
        { account: account._id },
        { fromAccount: account._id },
        { toAccount: account._id },
      ],
      status: { $ne: "reversed" },
    });

    if (linkedTransactions > 0) {
      return res.status(400).json({
        success: false,
        error:
          "This account has linked transactions. Reverse or remove them before deleting.",
      });
    }

    await account.deleteOne();
    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete account",
    });
  }
};

export const getFinancialTransactions = async (req, res) => {
  try {
    const {
      type,
      category,
      paymentMethod,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 200,
    } = req.query;

    const query = {};
    if (type) query.type = String(type);
    if (category) query.category = String(category);
    if (paymentMethod) query.paymentMethod = String(paymentMethod);

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      const needle = String(search).trim();
      query.$or = [
        { description: { $regex: needle, $options: "i" } },
        { referenceNumber: { $regex: needle, $options: "i" } },
        { notes: { $regex: needle, $options: "i" } },
      ];
    }

    const transactions = await FinancialTransaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("account", "name type currentBalance")
      .populate("fromAccount", "name type currentBalance")
      .populate("toAccount", "name type currentBalance")
      .lean();

    const total = await FinancialTransaction.countDocuments(query);

    res.json({
      success: true,
      data: transactions,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch transactions",
    });
  }
};

export const createFinancialTransaction = async (req, res) => {
  try {
    const transactionType = String(req.body.type || "income")
      .trim()
      .toLowerCase();
    const payload = {
      transactionId:
        req.body.transactionId ||
        `TX-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      date: req.body.date || new Date(),
      type: transactionType,
      category: String(req.body.category || "other").trim(),
      description: String(req.body.description || "").trim(),
      amount: Number(req.body.amount || 0),
      paymentMethod: String(req.body.paymentMethod || "cash").trim(),
      account:
        req.body.account && mongoose.Types.ObjectId.isValid(req.body.account)
          ? req.body.account
          : null,
      fromAccount:
        req.body.fromAccount &&
        mongoose.Types.ObjectId.isValid(req.body.fromAccount)
          ? req.body.fromAccount
          : null,
      toAccount:
        req.body.toAccount &&
        mongoose.Types.ObjectId.isValid(req.body.toAccount)
          ? req.body.toAccount
          : null,
      referenceNumber: String(req.body.referenceNumber || "").trim(),
      relatedOrder:
        req.body.relatedOrder &&
        mongoose.Types.ObjectId.isValid(req.body.relatedOrder)
          ? req.body.relatedOrder
          : null,
      relatedExpense:
        req.body.relatedExpense &&
        mongoose.Types.ObjectId.isValid(req.body.relatedExpense)
          ? req.body.relatedExpense
          : null,
      notes: String(req.body.notes || "").trim(),
      createdBy: req.user?._id || null,
      status: String(req.body.status || "posted").trim(),
      source: String(req.body.source || "manual").trim(),
      isBusinessImpact:
        req.body.isBusinessImpact !== undefined
          ? Boolean(req.body.isBusinessImpact)
          : true,
    };

    if (!payload.description) {
      return res
        .status(400)
        .json({ success: false, error: "Description is required" });
    }
    if (!Number.isFinite(payload.amount) || payload.amount < 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be a valid non-negative number",
      });
    }

    if (transactionType === "transfer") {
      payload.isBusinessImpact = false;
      payload.source = "transfer";
    }

    if (transactionType === "transfer") {
      if (!payload.fromAccount || !payload.toAccount) {
        return res.status(400).json({
          success: false,
          error: "Transfer requires both fromAccount and toAccount",
        });
      }
    }

    const transaction = await FinancialTransaction.create(payload);

    if (
      transactionType === "transfer" &&
      payload.fromAccount &&
      payload.toAccount
    ) {
      await FinancialAccount.findByIdAndUpdate(payload.fromAccount, {
        $inc: { currentBalance: -transaction.amount },
      });
      await FinancialAccount.findByIdAndUpdate(payload.toAccount, {
        $inc: { currentBalance: transaction.amount },
      });
    } else if (payload.account && payload.isBusinessImpact) {
      const delta =
        transactionType === "income" || transactionType === "refund"
          ? transaction.amount
          : -transaction.amount;
      await FinancialAccount.findByIdAndUpdate(payload.account, {
        $inc: { currentBalance: delta },
      });
    }

    const hydrated = await FinancialTransaction.findById(transaction._id)
      .populate("account", "name type currentBalance")
      .populate("fromAccount", "name type currentBalance")
      .populate("toAccount", "name type currentBalance")
      .lean();

    res.status(201).json({ success: true, data: hydrated });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Failed to create transaction",
    });
  }
};

export const updateFinancialTransaction = async (req, res) => {
  try {
    const transaction = await FinancialTransaction.findById(req.params.id);
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, error: "Transaction not found" });
    }

    if (req.body.description)
      transaction.description = String(req.body.description).trim();
    if (req.body.amount !== undefined)
      transaction.amount = Number(req.body.amount || 0);
    if (req.body.date) transaction.date = new Date(req.body.date);
    if (req.body.type)
      transaction.type = String(req.body.type).trim().toLowerCase();
    if (req.body.category)
      transaction.category = String(req.body.category).trim();
    if (req.body.paymentMethod)
      transaction.paymentMethod = String(req.body.paymentMethod).trim();
    if (req.body.referenceNumber !== undefined)
      transaction.referenceNumber = String(
        req.body.referenceNumber || "",
      ).trim();
    if (req.body.notes !== undefined)
      transaction.notes = String(req.body.notes || "").trim();

    await transaction.save();
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Failed to update transaction",
    });
  }
};

export const deleteFinancialTransaction = async (req, res) => {
  try {
    const transaction = await FinancialTransaction.findById(req.params.id);
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, error: "Transaction not found" });
    }

    transaction.status = "reversed";
    transaction.notes =
      `${transaction.notes || ""} Reversed by admin on ${new Date().toISOString()}`.trim();
    await transaction.save();
    res.json({ success: true, message: "Transaction reversed" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to reverse transaction",
    });
  }
};

export const getCashFlowDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await getCashFlowSummary({ startDate, endDate });
    const chartSeries = await buildChartSeries({ startDate, endDate });
    res.json({ success: true, data: { ...summary, chartSeries } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load financial summary",
    });
  }
};

export const getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await getCashFlowSummary({ startDate, endDate });
    const chartSeries = await buildChartSeries({ startDate, endDate });
    res.json({ success: true, data: { summary, chartSeries } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load report",
    });
  }
};

export const getBreakEvenSummary = async (req, res) => {
  try {
    const { startDate, endDate } = resolveQueryDateRange(req.query);
    const data = await computeBreakEvenSummary({ startDate, endDate });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load break-even summary",
    });
  }
};

export const getBreakEvenTrends = async (req, res) => {
  try {
    const { startDate, endDate } = resolveQueryDateRange(req.query);
    const data = await computeBreakEvenTrends({ startDate, endDate });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load break-even trends",
    });
  }
};

export const getBreakEvenProducts = async (req, res) => {
  try {
    const { startDate, endDate } = resolveQueryDateRange(req.query);
    const data = await computeBreakEvenProducts({ startDate, endDate });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load break-even product analysis",
    });
  }
};

export const getBreakEvenCosts = async (req, res) => {
  try {
    const { startDate, endDate } = resolveQueryDateRange(req.query);
    const data = await computeBreakEvenCosts({ startDate, endDate });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load break-even costs",
    });
  }
};

export const getBreakEvenCostById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).lean();
    if (!expense) {
      return res
        .status(404)
        .json({ success: false, error: "Cost entry not found" });
    }
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch cost entry",
    });
  }
};

export const createBreakEvenCost = async (req, res) => {
  try {
    const payload = {
      description: String(req.body.description || "").trim(),
      amount: Number(req.body.amount || 0),
      category: String(req.body.category || "other").trim(),
      costType: ["fixed", "variable"].includes(
        String(req.body.costType || "")
          .trim()
          .toLowerCase(),
      )
        ? String(req.body.costType).trim().toLowerCase()
        : "variable",
      isRecurring:
        req.body.isRecurring !== undefined
          ? Boolean(req.body.isRecurring)
          : true,
      isActive:
        req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
      effectiveFrom: req.body.effectiveFrom
        ? new Date(req.body.effectiveFrom)
        : null,
      effectiveTo: req.body.effectiveTo ? new Date(req.body.effectiveTo) : null,
      date: req.body.date || new Date(),
      paymentMethod: String(req.body.paymentMethod || "other").trim(),
      notes: String(req.body.notes || "").trim(),
      createdBy: req.user?._id || null,
    };

    if (!payload.description) {
      return res
        .status(400)
        .json({ success: false, error: "Description is required" });
    }
    if (!Number.isFinite(payload.amount) || payload.amount < 0) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Amount must be a valid non-negative number",
        });
    }

    const expense = await Expense.create(payload);
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Failed to create cost entry",
    });
  }
};

export const updateBreakEvenCost = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res
        .status(404)
        .json({ success: false, error: "Cost entry not found" });
    }

    const next = {
      description: String(req.body.description || expense.description).trim(),
      amount: Number(req.body.amount ?? expense.amount),
      category: String(req.body.category || expense.category || "other").trim(),
      costType: ["fixed", "variable"].includes(
        String(req.body.costType ?? (expense.costType || ""))
          .trim()
          .toLowerCase(),
      )
        ? String(req.body.costType ?? expense.costType ?? "")
            .trim()
            .toLowerCase()
        : expense.costType || "variable",
      isRecurring:
        req.body.isRecurring !== undefined
          ? Boolean(req.body.isRecurring)
          : expense.isRecurring,
      isActive:
        req.body.isActive !== undefined
          ? Boolean(req.body.isActive)
          : expense.isActive,
      effectiveFrom: req.body.effectiveFrom
        ? new Date(req.body.effectiveFrom)
        : expense.effectiveFrom || null,
      effectiveTo: req.body.effectiveTo
        ? new Date(req.body.effectiveTo)
        : expense.effectiveTo || null,
      date: req.body.date || expense.date,
      paymentMethod: String(
        req.body.paymentMethod || expense.paymentMethod || "other",
      ).trim(),
      notes: String(req.body.notes ?? expense.notes ?? "").trim(),
    };

    Object.assign(expense, next);
    await expense.save();
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Failed to update cost entry",
    });
  }
};

export const deleteBreakEvenCost = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res
        .status(404)
        .json({ success: false, error: "Cost entry not found" });
    }
    await expense.deleteOne();
    res.json({ success: true, message: "Cost entry deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete cost entry",
    });
  }
};

export const simulateBreakEven = async (req, res) => {
  try {
    const payload = req.body || {};
    const result = simulateBreakEvenScenario(payload);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Failed to simulate break-even scenario",
    });
  }
};
