import Order from "../models/Order.js";
import Expense from "../models/Expense.js";
import Product from "../models/Product.js";

const ORDER_EXCLUDED_STATUSES = new Set(["cancelled", "refunded"]);
const MARKETING_CHANNEL_ALIASES = {
  facebook: "Facebook Ads",
  fb: "Facebook Ads",
  instagram: "Instagram Ads",
  google: "Google Ads",
  tiktok: "TikTok Ads",
  influencer: "Influencer Marketing",
  organic: "Organic Search",
  direct: "Direct Traffic",
  referral: "Referral",
  affiliate: "Affiliate Marketing",
};

const toNumber = (value) => Number(value || 0);

const safeDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const resolveRange = (period = "30d", customStart = null, customEnd = null) => {
  const end = customEnd ? safeDate(customEnd) : new Date();
  const start = customStart ? safeDate(customStart) : new Date(end);

  if (customStart && customEnd) {
    if (start && end) {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    return { start: null, end: null };
  }

  if (!start || !end) {
    return { start: new Date(), end: new Date() };
  }

  switch (String(period).toLowerCase()) {
    case "today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "7d":
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "30d":
      start.setDate(end.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "90d":
      start.setDate(end.getDate() - 89);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "thismonth":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "lastmonth": {
      start.setMonth(end.getMonth() - 1, 1);
      end.setMonth(end.getMonth(), 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "last3months":
      start.setMonth(end.getMonth() - 2);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "last6months":
      start.setMonth(end.getMonth() - 5);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case "thisyear":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start.setDate(end.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
};

const normalizeChannelName = (value = "") => {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "Other";

  const directMatch = Object.entries(MARKETING_CHANNEL_ALIASES).find(
    ([key]) => text.includes(key),
  );
  if (directMatch) {
    return directMatch[1];
  }

  if (text.includes("meta") || text.includes("facebook")) return "Facebook Ads";
  if (text.includes("instagram")) return "Instagram Ads";
  if (text.includes("google") || text.includes("search")) return "Google Ads";
  if (text.includes("tiktok")) return "TikTok Ads";
  if (text.includes("affiliate")) return "Affiliate Marketing";
  if (text.includes("referral")) return "Referral";
  if (text.includes("organic")) return "Organic Search";
  if (text.includes("direct")) return "Direct Traffic";
  if (text.includes("influencer")) return "Influencer Marketing";

  return "Other";
};

const getCustomerKey = (order) => {
  const userId = order?.user ? String(order.user) : "";
  if (userId) return `user:${userId}`;

  const email = String(
    order?.customerSnapshot?.email || order?.shippingAddress?.email || "",
  )
    .trim()
    .toLowerCase();
  if (email) return `email:${email}`;

  const name = String(
    order?.customerSnapshot?.name ||
      [order?.shippingAddress?.firstName, order?.shippingAddress?.lastName]
        .filter(Boolean)
        .join(" ") ||
      "",
  )
    .trim()
    .toLowerCase();
  if (name) return `guest:${name}`;

  return `order:${String(order?._id || "unknown")}`;
};

const isPaidOrder = (order) => {
  if (!order || order.isPaid !== true) return false;
  return !ORDER_EXCLUDED_STATUSES.has(
    String(order.status || "").trim().toLowerCase(),
  );
};

const getCustomerOrderStats = (orders, productMap) => {
  const customerMap = new Map();
  let totalRevenue = 0;
  let totalGrossProfit = 0;
  let totalOrders = 0;

  for (const order of orders) {
    if (!isPaidOrder(order)) continue;

    const customerKey = getCustomerKey(order);
    const orderRevenue = toNumber(order.totalPrice);
    const productCost = (order.orderItems || []).reduce((sum, item) => {
      const product = productMap.get(String(item.product || ""));
      const itemCost = product
        ? toNumber(product.costPrice) * toNumber(item.quantity || 0)
        : 0;
      return sum + itemCost;
    }, 0);
    const grossProfit = orderRevenue - productCost;

    totalRevenue += orderRevenue;
    totalGrossProfit += grossProfit;
    totalOrders += 1;

    const existing = customerMap.get(customerKey) || {
      customerKey,
      orders: 0,
      revenue: 0,
      grossProfit: 0,
      firstPurchase: new Date(order.createdAt || order.paidAt || Date.now()),
      lastPurchase: new Date(order.createdAt || order.paidAt || Date.now()),
      orderDates: [],
      userId: order.user || null,
      customerName:
        order.customerSnapshot?.name ||
        [order.shippingAddress?.firstName, order.shippingAddress?.lastName]
          .filter(Boolean)
          .join(" ") ||
        "Guest Customer",
      email:
        order.customerSnapshot?.email || order.shippingAddress?.email || "",
    };

    existing.orders += 1;
    existing.revenue += orderRevenue;
    existing.grossProfit += grossProfit;
    existing.orderDates.push(new Date(order.createdAt || order.paidAt || Date.now()));
    existing.firstPurchase = new Date(
      Math.min(
        new Date(existing.firstPurchase).getTime(),
        new Date(order.createdAt || order.paidAt || Date.now()).getTime(),
      ),
    );
    existing.lastPurchase = new Date(
      Math.max(
        new Date(existing.lastPurchase).getTime(),
        new Date(order.createdAt || order.paidAt || Date.now()).getTime(),
      ),
    );

    customerMap.set(customerKey, existing);
  }

  const customerRows = [...customerMap.values()].map((customer) => ({
    ...customer,
    aov: customer.orders > 0 ? customer.revenue / customer.orders : 0,
    purchaseFrequency: customer.orders > 0 ? customer.orders / customer.orders : 0,
  }));

  const uniqueCustomers = customerRows.length;
  const newCustomers = customerRows.filter((customer) => customer.orders === 1).length;
  const returningCustomers = customerRows.filter((customer) => customer.orders > 1).length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const purchaseFrequency = uniqueCustomers > 0 ? totalOrders / uniqueCustomers : 0;
  const repeatPurchaseRate = uniqueCustomers > 0 ? returningCustomers / uniqueCustomers : 0;

  return {
    customerRows,
    totalRevenue,
    totalGrossProfit,
    totalOrders,
    uniqueCustomers,
    newCustomers,
    returningCustomers,
    averageOrderValue,
    purchaseFrequency,
    repeatPurchaseRate,
  };
};

const getPreviousPeriod = (range) => {
  const duration =
    Math.max(1, (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const previousEnd = new Date(range.start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  previousEnd.setHours(23, 59, 59, 999);

  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - duration + 1);
  previousStart.setHours(0, 0, 0, 0);

  return { start: previousStart, end: previousEnd };
};

const getMarketingSpend = async (start, end) => {
  const expenses = await Expense.find({
    category: "marketing",
    date: { $gte: start, $lte: end },
  }).lean();

  return expenses.reduce((sum, expense) => sum + toNumber(expense.amount), 0);
};

const getMarketingChannelBreakdown = async (start, end) => {
  const expenses = await Expense.find({
    category: "marketing",
    date: { $gte: start, $lte: end },
  }).lean();

  const grouped = new Map();

  for (const expense of expenses) {
    const name = normalizeChannelName(
      expense.campaign || expense.description || expense.notes,
    );
    const entry = grouped.get(name) || {
      channel: name,
      spend: 0,
      campaigns: 0,
      expenses: 0,
    };
    entry.spend += toNumber(expense.amount);
    entry.expenses += 1;
    if (expense.campaign) entry.campaigns += 1;
    grouped.set(name, entry);
  }

  return [...grouped.values()].map((item) => ({
    ...item,
    avgCostPerCampaign: item.campaigns ? item.spend / item.campaigns : 0,
  }));
};

export const getCustomerAnalyticsOverview = async (req, res) => {
  try {
    const { period = "30d", startDate, endDate } = req.query;
    const range = resolveRange(period, startDate, endDate);

    const orders = await Order.find({
      createdAt: { $gte: range.start, $lte: range.end },
    }).lean();

    const productMap = new Map(
      (await Product.find({}).select("_id costPrice").lean()).map((product) => [
        String(product._id),
        product,
      ]),
    );

    const metrics = getCustomerOrderStats(orders, productMap);
    const marketingSpend = await getMarketingSpend(range.start, range.end);
    const channels = await getMarketingChannelBreakdown(range.start, range.end);

    const previousRange = getPreviousPeriod(range);
    const previousOrders = await Order.find({
      createdAt: { $gte: previousRange.start, $lte: previousRange.end },
    }).lean();
    const previousMetrics = getCustomerOrderStats(previousOrders, productMap);

    const cac = metrics.newCustomers > 0 ? marketingSpend / metrics.newCustomers : null;
    const ltvRevenue = metrics.uniqueCustomers > 0 ? metrics.totalRevenue / metrics.uniqueCustomers : 0;
    const grossProfitLtv = metrics.uniqueCustomers > 0 ? metrics.totalGrossProfit / metrics.uniqueCustomers : 0;
    const ltvRatio = cac && cac > 0 ? grossProfitLtv / cac : null;

    const previousCac =
      previousMetrics.newCustomers > 0
        ? (await getMarketingSpend(previousRange.start, previousRange.end)) /
          previousMetrics.newCustomers
        : null;

    const data = {
      period,
      summary: {
        totalUniqueCustomers: metrics.uniqueCustomers,
        newCustomers: metrics.newCustomers,
        returningCustomers: metrics.returningCustomers,
        customerAcquisitionCost: cac,
        averageCustomerLifetimeValue: ltvRevenue,
        customerLifetimeGrossProfit: grossProfitLtv,
        ltvRatio,
        averageOrderValue: metrics.averageOrderValue,
        averagePurchaseFrequency: metrics.purchaseFrequency,
        repeatPurchaseRate: metrics.repeatPurchaseRate,
        totalRevenue: metrics.totalRevenue,
        totalGrossProfit: metrics.totalGrossProfit,
        marketingSpend,
        previousPeriod: {
          totalUniqueCustomers: previousMetrics.uniqueCustomers,
          newCustomers: previousMetrics.newCustomers,
          repeatingCustomers: previousMetrics.returningCustomers,
          customerAcquisitionCost: previousCac,
          averageCustomerLifetimeValue:
            previousMetrics.uniqueCustomers > 0
              ? previousMetrics.totalRevenue / previousMetrics.uniqueCustomers
              : 0,
          customerLifetimeGrossProfit:
            previousMetrics.uniqueCustomers > 0
              ? previousMetrics.totalGrossProfit / previousMetrics.uniqueCustomers
              : 0,
          ltvRatio:
            previousCac && previousCac > 0
              ? (previousMetrics.totalGrossProfit / previousMetrics.uniqueCustomers) /
                previousCac
              : null,
        },
      },
      channels: channels
        .map((channel) => ({
          ...channel,
          customerCount: metrics.customerRows.filter((customer) =>
            customer.revenue > 0,
          ).length,
        }))
        .sort((a, b) => b.spend - a.spend),
      topCustomers: [...metrics.customerRows]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map((customer) => ({
          customerKey: customer.customerKey,
          customerName: customer.customerName,
          email: customer.email,
          totalOrders: customer.orders,
          totalRevenue: customer.revenue,
          totalGrossProfit: customer.grossProfit,
          firstPurchase: customer.firstPurchase,
          lastPurchase: customer.lastPurchase,
          averageOrderValue: customer.aov,
          lifetimeValue: customer.revenue,
        })),
      customerBreakdown: metrics.customerRows.map((customer) => ({
        customerKey: customer.customerKey,
        customerName: customer.customerName,
        email: customer.email,
        totalOrders: customer.orders,
        totalRevenue: customer.revenue,
        totalGrossProfit: customer.grossProfit,
        averageOrderValue: customer.aov,
        firstPurchase: customer.firstPurchase,
        lastPurchase: customer.lastPurchase,
      })),
      dateRange: {
        start: range.start,
        end: range.end,
      },
    };

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load customer analytics",
    });
  }
};

export const getCustomerAnalyticsCAC = async (req, res) => {
  try {
    const overview = await getCustomerAnalyticsOverviewInternal(req.query);
    res.json({ success: true, data: overview.summary });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load CAC analytics",
    });
  }
};

export const getCustomerAnalyticsLTV = async (req, res) => {
  try {
    const overview = await getCustomerAnalyticsOverviewInternal(req.query);
    res.json({ success: true, data: {
      averageCustomerLifetimeValue: overview.summary.averageCustomerLifetimeValue,
      customerLifetimeGrossProfit: overview.summary.customerLifetimeGrossProfit,
      ltvRatio: overview.summary.ltvRatio,
      topCustomers: overview.topCustomers,
    }});
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load LTV analytics",
    });
  }
};

export const getCustomerAnalyticsCustomers = async (req, res) => {
  try {
    const overview = await getCustomerAnalyticsOverviewInternal(req.query);
    res.json({ success: true, data: overview.customerBreakdown });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load customer list",
    });
  }
};

export const getCustomerAnalyticsChannels = async (req, res) => {
  try {
    const { period = "30d", startDate, endDate } = req.query;
    const range = resolveRange(period, startDate, endDate);
    const channels = await getMarketingChannelBreakdown(range.start, range.end);
    res.json({ success: true, data: channels });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load channel analytics",
    });
  }
};

export const getCustomerAnalyticsRatio = async (req, res) => {
  try {
    const { period = "30d", startDate, endDate } = req.query;
    const range = resolveRange(period, startDate, endDate);

    const orders = await Order.find({
      createdAt: { $gte: range.start, $lte: range.end },
    }).lean();

    const productMap = new Map(
      (await Product.find({}).select("_id costPrice").lean()).map((product) => [
        String(product._id),
        product,
      ]),
    );

    const metrics = getCustomerOrderStats(orders, productMap);
    const marketingSpend = await getMarketingSpend(range.start, range.end);
    const cac = metrics.newCustomers > 0 ? marketingSpend / metrics.newCustomers : null;
    const grossProfitLtv =
      metrics.uniqueCustomers > 0 ? metrics.totalGrossProfit / metrics.uniqueCustomers : 0;

    const ratio = cac && cac > 0 ? grossProfitLtv / cac : null;

    const status =
      ratio === null
        ? "N/A"
        : ratio < 1
          ? "Below 1:1"
          : ratio < 3
            ? "Needs improvement"
            : ratio < 5
              ? "Healthy benchmark"
              : "Strong economics";

    res.json({
      success: true,
      data: {
        overall: ratio,
        revenueBased:
          cac && cac > 0
            ? (metrics.totalRevenue / metrics.uniqueCustomers) / cac
            : null,
        grossProfitBased: ratio,
        status,
        marketingSpend,
        grossProfitLtv,
        cac,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load LTV ratio analytics",
    });
  }
};

export const getCustomerAnalyticsCohorts = async (req, res) => {
  try {
    const { period = "180d", startDate, endDate } = req.query;
    const range = resolveRange(period, startDate, endDate);
    const orders = await Order.find({
      createdAt: { $gte: range.start, $lte: range.end },
    }).lean();

    const productMap = new Map(
      (await Product.find({}).select("_id costPrice").lean()).map((product) => [
        String(product._id),
        product,
      ]),
    );

    const customerRows = getCustomerOrderStats(orders, productMap).customerRows;
    const monthlyMap = new Map();

    for (const customer of customerRows) {
      const firstPurchase = customer.firstPurchase || new Date();
      const monthKey = `${firstPurchase.getFullYear()}-${String(
        firstPurchase.getMonth() + 1,
      ).padStart(2, "0")}`;

      const entry = monthlyMap.get(monthKey) || {
        cohort: monthKey,
        customers: 0,
        revenue: 0,
        grossProfit: 0,
        repeatCustomers: 0,
      };

      entry.customers += 1;
      entry.revenue += customer.revenue;
      entry.grossProfit += customer.grossProfit;
      if (customer.orders > 1) entry.repeatCustomers += 1;
      monthlyMap.set(monthKey, entry);
    }

    const rows = [...monthlyMap.values()].map((item) => ({
      ...item,
      repeatRate: item.customers > 0 ? (item.repeatCustomers / item.customers) * 100 : 0,
      avgLtv: item.customers > 0 ? item.grossProfit / item.customers : 0,
    }));

    res.json({ success: true, data: rows.sort((a, b) => b.cohort.localeCompare(a.cohort)) });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load cohort analytics",
    });
  }
};

export const getCustomerAnalyticsTrends = async (req, res) => {
  try {
    const { period = "90d", startDate, endDate } = req.query;
    const range = resolveRange(period, startDate, endDate);
    const now = new Date(range.end);
    const points = [];

    for (let i = 5; i >= 0; i -= 1) {
      const sliceEnd = new Date(now);
      sliceEnd.setDate(now.getDate() - i * 7);
      const sliceStart = new Date(sliceEnd);
      sliceStart.setDate(sliceEnd.getDate() - 6);

      const orders = await Order.find({
        createdAt: { $gte: sliceStart, $lte: sliceEnd },
      }).lean();

      const productMap = new Map(
        (await Product.find({}).select("_id costPrice").lean()).map((product) => [
          String(product._id),
          product,
        ]),
      );

      const metrics = getCustomerOrderStats(orders, productMap);
      points.push({
        label: `${sliceStart.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`,
        revenue: metrics.totalRevenue,
        customers: metrics.uniqueCustomers,
        grossProfit: metrics.totalGrossProfit,
      });
    }

    res.json({ success: true, data: points });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load trend analytics",
    });
  }
};

const getCustomerAnalyticsOverviewInternal = async (query) => {
  const { period = "30d", startDate, endDate } = query;
  const range = resolveRange(period, startDate, endDate);

  const orders = await Order.find({
    createdAt: { $gte: range.start, $lte: range.end },
  }).lean();

  const productMap = new Map(
    (await Product.find({}).select("_id costPrice").lean()).map((product) => [
      String(product._id),
      product,
    ]),
  );

  const metrics = getCustomerOrderStats(orders, productMap);
  const marketingSpend = await getMarketingSpend(range.start, range.end);
  const channels = await getMarketingChannelBreakdown(range.start, range.end);
  const cac = metrics.newCustomers > 0 ? marketingSpend / metrics.newCustomers : null;
  const ltvRevenue = metrics.uniqueCustomers > 0 ? metrics.totalRevenue / metrics.uniqueCustomers : 0;
  const grossProfitLtv = metrics.uniqueCustomers > 0 ? metrics.totalGrossProfit / metrics.uniqueCustomers : 0;
  const ltvRatio = cac && cac > 0 ? grossProfitLtv / cac : null;

  return {
    summary: {
      totalUniqueCustomers: metrics.uniqueCustomers,
      newCustomers: metrics.newCustomers,
      returningCustomers: metrics.returningCustomers,
      customerAcquisitionCost: cac,
      averageCustomerLifetimeValue: ltvRevenue,
      customerLifetimeGrossProfit: grossProfitLtv,
      ltvRatio,
      averageOrderValue: metrics.averageOrderValue,
      averagePurchaseFrequency: metrics.purchaseFrequency,
      repeatPurchaseRate: metrics.repeatPurchaseRate,
      totalRevenue: metrics.totalRevenue,
      totalGrossProfit: metrics.totalGrossProfit,
      marketingSpend,
    },
    channels,
    topCustomers: [...metrics.customerRows]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((customer) => ({
        customerKey: customer.customerKey,
        customerName: customer.customerName,
        email: customer.email,
        totalOrders: customer.orders,
        totalRevenue: customer.revenue,
        totalGrossProfit: customer.grossProfit,
        firstPurchase: customer.firstPurchase,
        lastPurchase: customer.lastPurchase,
        averageOrderValue: customer.aov,
      })),
    customerBreakdown: metrics.customerRows.map((customer) => ({
      customerKey: customer.customerKey,
      customerName: customer.customerName,
      email: customer.email,
      totalOrders: customer.orders,
      totalRevenue: customer.revenue,
      totalGrossProfit: customer.grossProfit,
      averageOrderValue: customer.aov,
      firstPurchase: customer.firstPurchase,
      lastPurchase: customer.lastPurchase,
    })),
  };
};
