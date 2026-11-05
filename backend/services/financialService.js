import mongoose from "mongoose";
import Order from "../models/Order.js";
import Expense from "../models/Expense.js";
import FinancialAccount from "../models/FinancialAccount.js";
import FinancialTransaction from "../models/FinancialTransaction.js";

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "string") return Number(value) || 0;
  if (typeof value === "number") return Number(value) || 0;
  if (typeof value === "object" && typeof value.toString === "function") {
    const str = value.toString();
    if (str.startsWith("Decimal128(")) {
      return Number(str.replace(/^Decimal128\(|\)$/g, "")) || 0;
    }
    return Number(str) || 0;
  }
  return 0;
};

const normalizeDateRange = (startDate, endDate) => {
  const build = (dateValue, isEnd) => {
    if (!dateValue) return null;
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return null;
    if (isEnd) {
      parsed.setHours(23, 59, 59, 999);
    } else {
      parsed.setHours(0, 0, 0, 0);
    }
    return parsed;
  };

  return {
    start: build(startDate, false),
    end: build(endDate, true),
  };
};

export const getCashFlowSummary = async ({
  startDate = null,
  endDate = null,
} = {}) => {
  const dateRange = normalizeDateRange(startDate, endDate);
  const accounts = await FinancialAccount.find({ isActive: true }).lean();
  const accountOpeningBalance = accounts.reduce(
    (sum, account) =>
      sum + toNumber(account.openingBalance ?? account.currentBalance ?? 0),
    0,
  );

  const transactionQuery = {
    status: "posted",
    isBusinessImpact: true,
  };

  if (dateRange.start || dateRange.end) {
    transactionQuery.date = {};
    if (dateRange.start) transactionQuery.date.$gte = dateRange.start;
    if (dateRange.end) transactionQuery.date.$lte = dateRange.end;
  }

  const transactions = await FinancialTransaction.find(transactionQuery).lean();

  const totalCashInflow = transactions
    .filter((transaction) => ["income", "refund"].includes(transaction.type))
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);

  const totalCashOutflow = transactions
    .filter((transaction) => ["expense"].includes(transaction.type))
    .reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);

  const netCashFlow = totalCashInflow - totalCashOutflow;
  const closingCashBalance = accountOpeningBalance + netCashFlow;

  const availableCashBalance = accounts.reduce(
    (sum, account) => sum + toNumber(account.currentBalance ?? 0),
    0,
  );

  const orderQuery = {
    isPaid: false,
    status: { $nin: ["cancelled", "refunded"] },
  };

  if (dateRange.start || dateRange.end) {
    orderQuery.createdAt = {};
    if (dateRange.start) orderQuery.createdAt.$gte = dateRange.start;
    if (dateRange.end) orderQuery.createdAt.$lte = dateRange.end;
  }

  const pendingOrders = await Order.find(orderQuery).lean();
  const pendingCustomerPayments = pendingOrders.reduce(
    (sum, order) => sum + toNumber(order.totalPrice ?? 0),
    0,
  );

  const expenseQuery = {
    isPaid: false,
  };

  if (dateRange.start || dateRange.end) {
    expenseQuery.date = {};
    if (dateRange.start) expenseQuery.date.$gte = dateRange.start;
    if (dateRange.end) expenseQuery.date.$lte = dateRange.end;
  }

  const unpaidExpenses = await Expense.find(expenseQuery).lean();
  const outstandingSupplierPayments = unpaidExpenses.reduce(
    (sum, expense) => sum + toNumber(expense.amount ?? 0),
    0,
  );

  return {
    openingCashBalance: accountOpeningBalance,
    totalCashInflow,
    totalCashOutflow,
    netCashFlow,
    closingCashBalance,
    availableCashBalance,
    pendingCustomerPayments,
    outstandingSupplierPayments,
  };
};

export const buildChartSeries = async ({
  startDate = null,
  endDate = null,
} = {}) => {
  const dateRange = normalizeDateRange(startDate, endDate);
  const query = {
    status: "posted",
    isBusinessImpact: true,
  };

  if (dateRange.start || dateRange.end) {
    query.date = {};
    if (dateRange.start) query.date.$gte = dateRange.start;
    if (dateRange.end) query.date.$lte = dateRange.end;
  }

  const transactions = await FinancialTransaction.find(query).lean();

  const bucketMap = new Map();
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const current = bucketMap.get(label) || {
      date: label,
      inflow: 0,
      outflow: 0,
    };
    if (["income", "refund"].includes(transaction.type)) {
      current.inflow += toNumber(transaction.amount);
    }
    if (["expense"].includes(transaction.type)) {
      current.outflow += toNumber(transaction.amount);
    }
    bucketMap.set(label, current);
  });

  return Array.from(bucketMap.values()).sort((a, b) =>
    a.date > b.date ? 1 : -1,
  );
};

export const getSummaryForDateRange = async (startDate, endDate) => {
  return getCashFlowSummary({ startDate, endDate });
};
