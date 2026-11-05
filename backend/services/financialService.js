import mongoose from "mongoose";
import Order from "../models/Order.js";
import Expense from "../models/Expense.js";
import Product from "../models/Product.js";
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

const classifyExpense = (expense) => {
  const rawType = String(expense?.costType || "")
    .trim()
    .toLowerCase();
  if (rawType === "fixed" || rawType === "variable") {
    return rawType;
  }

  const category = String(expense?.category || "other")
    .trim()
    .toLowerCase();
  const fixedCategories = ["salary", "maintenance", "operations"];
  const variableCategories = ["marketing", "shipping", "packaging"];

  if (fixedCategories.includes(category)) return "fixed";
  if (variableCategories.includes(category)) return "variable";
  if (expense?.isRecurring === true) return "fixed";
  return "variable";
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

const buildBreakEvenFromSnapshot = ({
  orders,
  expenses,
  products,
  startDate,
  endDate,
}) => {
  const eligibleOrders = (orders || []).filter((order) => {
    if (!order?.isPaid) return false;
    const status = String(order?.status || "").toLowerCase();
    if (["cancelled", "refunded"].includes(status)) return false;
    const orderDate = new Date(order?.createdAt || order?.paidAt || 0);
    if (Number.isNaN(orderDate.getTime())) return false;
    if (startDate && orderDate < new Date(startDate)) return false;
    if (endDate && orderDate > new Date(endDate)) return false;
    return true;
  });

  const productMap = new Map(
    (products || []).map((product) => [
      String(product?._id || product?.id || ""),
      product,
    ]),
  );

  const revenue = eligibleOrders.reduce((sum, order) => {
    const total = toNumber(order?.totalPrice ?? 0);
    return sum + total;
  }, 0);

  const variableExpenses = (expenses || []).filter((expense) => {
    const date = new Date(expense?.date || expense?.createdAt || 0);
    if (Number.isNaN(date.getTime())) return false;
    if (startDate && date < new Date(startDate)) return false;
    if (endDate && date > new Date(endDate)) return false;
    return classifyExpense(expense) === "variable" && expense?.isPaid !== false;
  });

  const fixedExpenses = (expenses || []).filter((expense) => {
    const date = new Date(expense?.date || expense?.createdAt || 0);
    if (Number.isNaN(date.getTime())) return false;
    if (startDate && date < new Date(startDate)) return false;
    if (endDate && date > new Date(endDate)) return false;
    return classifyExpense(expense) === "fixed" && expense?.isPaid !== false;
  });

  const variableCostTotal = variableExpenses.reduce(
    (sum, expense) => sum + toNumber(expense?.amount ?? 0),
    0,
  );
  const fixedCostTotal = fixedExpenses.reduce(
    (sum, expense) => sum + toNumber(expense?.amount ?? 0),
    0,
  );

  const contribution = revenue - variableCostTotal;
  const contributionMarginRatio = revenue > 0 ? contribution / revenue : 0;
  const averageContributionPerOrder =
    eligibleOrders.length > 0 ? contribution / eligibleOrders.length : 0;
  const breakEvenRevenue =
    contributionMarginRatio > 0 ? fixedCostTotal / contributionMarginRatio : 0;
  const breakEvenOrdersRaw =
    averageContributionPerOrder > 0
      ? fixedCostTotal / averageContributionPerOrder
      : 0;
  const breakEvenOrders =
    Number.isFinite(breakEvenOrdersRaw) && breakEvenOrdersRaw > 0
      ? Math.ceil(breakEvenOrdersRaw)
      : 0;
  const operatingProfit = contribution - fixedCostTotal;
  const remainingRevenue = Math.max(0, breakEvenRevenue - revenue);
  const remainingOrders = Math.max(0, breakEvenOrders - eligibleOrders.length);
  const marginOfSafety = revenue - breakEvenRevenue;
  const marginOfSafetyPercent =
    revenue > 0 ? (marginOfSafety / revenue) * 100 : 0;
  const status =
    revenue > breakEvenRevenue
      ? "Above Break-Even"
      : revenue === breakEvenRevenue
        ? "At Break-Even"
        : "Below Break-Even";

  const productBreakdown = new Map();
  eligibleOrders.forEach((order) => {
    (order.orderItems || []).forEach((item) => {
      const productId = String(item?.product || item?.productId || "");
      const product = productMap.get(productId) || null;
      const quantity = toNumber(item?.quantity ?? 0);
      const unitPrice = toNumber(item?.price ?? product?.price ?? 0);
      const unitCost = toNumber(product?.costPrice ?? 0);
      const revenueValue = unitPrice * quantity;
      const costValue = unitCost * quantity;
      const entry = productBreakdown.get(productId) || {
        productId,
        productName: item?.name || product?.name || "Unknown Product",
        sellingPrice: unitPrice,
        productCost: unitCost,
        unitsSold: 0,
        revenue: 0,
        variableCost: 0,
      };
      entry.unitsSold += quantity;
      entry.revenue += revenueValue;
      entry.variableCost += costValue;
      entry.productName = item?.name || product?.name || entry.productName;
      entry.sellingPrice = unitPrice || entry.sellingPrice;
      entry.productCost = unitCost || entry.productCost;
      productBreakdown.set(productId, entry);
    });
  });

  const productAnalysis = Array.from(productBreakdown.values()).map((item) => {
    const contributionPerUnit = item.sellingPrice - item.productCost;
    const contribution = item.revenue - item.variableCost;
    const marginPercent =
      item.revenue > 0 ? (contribution / item.revenue) * 100 : 0;
    const estimatedBreakEvenUnits =
      contributionPerUnit > 0 ? fixedCostTotal / contributionPerUnit : 0;
    return {
      productId: item.productId,
      productName: item.productName,
      sellingPrice: item.sellingPrice,
      productCost: item.productCost,
      otherVariableCosts: 0,
      contributionPerUnit,
      contributionMarginPercent: marginPercent,
      unitsSold: item.unitsSold,
      revenue: item.revenue,
      breakEvenUnits:
        Number.isFinite(estimatedBreakEvenUnits) && estimatedBreakEvenUnits > 0
          ? Math.ceil(estimatedBreakEvenUnits)
          : 0,
      profitabilityStatus:
        contribution >= 0 ? "Profitable" : "Below Break-Even",
    };
  });

  return {
    summary: {
      revenue,
      variableCostTotal,
      fixedCostTotal,
      contribution,
      contributionMarginRatio,
      contributionMarginPercent: contributionMarginRatio * 100,
      averageContributionPerOrder,
      breakEvenRevenue,
      breakEvenOrders,
      orderCount: eligibleOrders.length,
      operatingProfit,
      remainingRevenue,
      remainingOrders,
      marginOfSafety,
      marginOfSafetyPercent,
      status,
      fixedCosts: fixedCostTotal,
      variableCosts: variableCostTotal,
      actualOrders: eligibleOrders.length,
    },
    productAnalysis,
    warnings:
      !fixedCostTotal && !variableCostTotal
        ? [
            "No cost classification data found for this date range. Add expense records or classify existing ones as fixed/variable to calculate break-even accurately.",
          ]
        : [],
    range: {
      startDate: startDate || null,
      endDate: endDate || null,
    },
  };
};

export const calculateBreakEvenSummary = async ({
  startDate = null,
  endDate = null,
} = {}) => {
  const dateRange = normalizeDateRange(startDate, endDate);
  const orderQuery = {
    isPaid: true,
    status: { $nin: ["cancelled", "refunded"] },
  };

  if (dateRange.start || dateRange.end) {
    orderQuery.createdAt = {};
    if (dateRange.start) orderQuery.createdAt.$gte = dateRange.start;
    if (dateRange.end) orderQuery.createdAt.$lte = dateRange.end;
  }

  const orders = await Order.find(orderQuery).lean();
  const expenses = await Expense.find({
    ...(dateRange.start || dateRange.end
      ? {
          date: {
            ...(dateRange.start ? { $gte: dateRange.start } : {}),
            ...(dateRange.end ? { $lte: dateRange.end } : {}),
          },
        }
      : {}),
    isPaid: { $ne: false },
  }).lean();
  const products = await Product.find({}).lean();

  return buildBreakEvenFromSnapshot({
    orders,
    expenses,
    products,
    startDate: startDate || dateRange.start,
    endDate: endDate || dateRange.end,
  });
};

export const getBreakEvenSummary = async ({
  startDate = null,
  endDate = null,
} = {}) => {
  const result = await calculateBreakEvenSummary({ startDate, endDate });
  return result;
};

export const getBreakEvenTrends = async ({
  startDate = null,
  endDate = null,
} = {}) => {
  const dateRange = normalizeDateRange(startDate, endDate);
  const orderQuery = {
    isPaid: true,
    status: { $nin: ["cancelled", "refunded"] },
  };

  if (dateRange.start || dateRange.end) {
    orderQuery.createdAt = {};
    if (dateRange.start) orderQuery.createdAt.$gte = dateRange.start;
    if (dateRange.end) orderQuery.createdAt.$lte = dateRange.end;
  }

  const orders = await Order.find(orderQuery).lean();
  const expenses = await Expense.find({
    ...(dateRange.start || dateRange.end
      ? {
          date: {
            ...(dateRange.start ? { $gte: dateRange.start } : {}),
            ...(dateRange.end ? { $lte: dateRange.end } : {}),
          },
        }
      : {}),
    isPaid: { $ne: false },
  }).lean();
  const products = await Product.find({}).lean();

  const monthMap = new Map();
  const start = dateRange.start
    ? new Date(dateRange.start)
    : new Date(
        new Date().setFullYear(
          new Date().getFullYear(),
          new Date().getMonth() - 5,
        ),
      );
  const end = dateRange.end ? new Date(dateRange.end) : new Date();

  const loopDate = new Date(start.getFullYear(), start.getMonth(), 1);
  while (loopDate <= end) {
    const key = `${loopDate.getFullYear()}-${String(loopDate.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, {
      month: key,
      revenue: 0,
      breakEvenRevenue: 0,
      operatingProfit: 0,
      orders: 0,
    });
    loopDate.setMonth(loopDate.getMonth() + 1);
  }

  const partial = buildBreakEvenFromSnapshot({
    orders,
    expenses,
    products,
    startDate: dateRange.start ? dateRange.start.toISOString() : null,
    endDate: dateRange.end ? dateRange.end.toISOString() : null,
  });

  const relevantOrders = (orders || []).filter((order) => {
    const date = new Date(order?.createdAt || order?.paidAt || 0);
    return (
      !Number.isNaN(date.getTime()) &&
      (dateRange.start ? date >= dateRange.start : true) &&
      (dateRange.end ? date <= dateRange.end : true)
    );
  });

  relevantOrders.forEach((order) => {
    const date = new Date(order.createdAt || order.paidAt || 0);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap.has(key)) return;
    const current = monthMap.get(key);
    current.revenue += toNumber(order.totalPrice ?? 0);
    current.orders += 1;
  });

  const monthlyBreakEven =
    partial.summary.breakEvenRevenue / Math.max(1, relevantOrders.length || 1);
  monthMap.forEach((entry) => {
    entry.breakEvenRevenue = monthlyBreakEven;
    entry.operatingProfit = entry.revenue - entry.breakEvenRevenue;
  });

  return Array.from(monthMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month),
  );
};

export const getBreakEvenProducts = async ({
  startDate = null,
  endDate = null,
} = {}) => {
  const result = await calculateBreakEvenSummary({ startDate, endDate });
  return result.productAnalysis;
};

export const getBreakEvenCosts = async ({
  startDate = null,
  endDate = null,
} = {}) => {
  const dateRange = normalizeDateRange(startDate, endDate);
  const expenseQuery = {};
  if (dateRange.start || dateRange.end) {
    expenseQuery.date = {};
    if (dateRange.start) expenseQuery.date.$gte = dateRange.start;
    if (dateRange.end) expenseQuery.date.$lte = dateRange.end;
  }

  const expenses = await Expense.find(expenseQuery)
    .sort({ date: -1, createdAt: -1 })
    .lean();
  return expenses.map((expense) => ({
    _id: expense._id,
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    costType: classifyExpense(expense),
    isRecurring: Boolean(expense.isRecurring),
    isActive: expense.isActive !== false,
    date: expense.date,
    paymentMethod: expense.paymentMethod,
  }));
};

export const simulateBreakEven = ({
  sellingPrice = 0,
  productCost = 0,
  packagingCost = 0,
  deliveryCost = 0,
  paymentFees = 0,
  fixedMonthlyExpenses = 0,
  expectedMonthlyOrders = 0,
} = {}) => {
  const selling = toNumber(sellingPrice);
  const product = toNumber(productCost);
  const packaging = toNumber(packagingCost);
  const delivery = toNumber(deliveryCost);
  const fees = toNumber(paymentFees);
  const fixedCosts = toNumber(fixedMonthlyExpenses);
  const orders = toNumber(expectedMonthlyOrders);

  const variableCostPerOrder = product + packaging + delivery + fees;
  const contributionPerOrder = selling - variableCostPerOrder;
  const contributionMarginRatio =
    selling > 0 ? contributionPerOrder / selling : 0;
  const breakEvenRevenue =
    contributionMarginRatio > 0 ? fixedCosts / contributionMarginRatio : 0;
  const breakEvenOrders =
    contributionPerOrder > 0 ? Math.ceil(fixedCosts / contributionPerOrder) : 0;
  const expectedContribution = contributionPerOrder * orders;
  const expectedOperatingProfit = expectedContribution - fixedCosts;
  const expectedOperatingLoss = Math.max(0, fixedCosts - expectedContribution);

  return {
    sellingPrice: selling,
    variableCostPerOrder,
    contributionPerOrder,
    contributionMarginRatio,
    contributionMarginPercent: contributionMarginRatio * 100,
    breakEvenRevenue,
    breakEvenOrders,
    expectedContribution,
    expectedOperatingProfit,
    expectedOperatingLoss,
    status: expectedOperatingProfit >= 0 ? "Profitable" : "Loss-making",
  };
};

export const buildBreakEvenChartSeries = async ({
  startDate = null,
  endDate = null,
} = {}) => {
  const summary = await calculateBreakEvenSummary({ startDate, endDate });
  const data = summary.summary;
  return {
    revenue: data.revenue,
    variableCosts: data.variableCostTotal,
    fixedCosts: data.fixedCostTotal,
    totalCosts: data.variableCostTotal + data.fixedCostTotal,
    operatingProfit: data.operatingProfit,
    breakEvenRevenue: data.breakEvenRevenue,
  };
};
