import { useMemo, useState } from "react";
import { FaArrowUp, FaArrowDown, FaBriefcase, FaChartLine, FaCoins, FaDollarSign, FaFilter, FaBoxOpen, FaSearch } from "react-icons/fa";
import { buildTrend, formatCurrency, getRange, periodOptions, toNumber } from "./analyticsUtils";


const categoryConfig = {
  marketing: "Marketing",
  shipping: "Shipping",
  packaging: "Packaging",
  salary: "Salaries",
  maintenance: "Maintenance",
  operations: "Operations",
  other: "Other",
};

const ROIAnalyticsTab = ({
  orders = [],
  products = [],
  expenses = [],
  onCreateExpense,
  onDeleteExpense,
  onUpdateExpense,
}) => {
  const [period, setPeriod] = useState("30d");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    category: "marketing",
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: "bank",
    campaign: "",
    notes: "",
  });
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  const { start, end } = getRange(period);

  const relevantOrders = useMemo(
    () =>
      orders.filter((order) => {
        const created = new Date(order.createdAt || order.paidAt || 0);
        if (Number.isNaN(created.getTime())) return false;
        return created >= start && created <= end;
      }),
    [orders, start, end],
  );

  const relevantExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const created = new Date(expense.date || expense.createdAt || 0);
        if (Number.isNaN(created.getTime())) return false;
        return created >= start && created <= end;
      }),
    [expenses, start, end],
  );

  const completedRevenue = useMemo(() => {
    const total = relevantOrders
      .filter(
        (order) =>
          order.isPaid &&
          !["cancelled", "refunded"].includes(String(order.status || "").toLowerCase()),
      )
      .reduce((sum, order) => sum + toNumber(order.totalPrice), 0);

    const refundedTotal = relevantOrders
      .filter((order) =>
        ["cancelled", "refunded"].includes(
          String(order.status || "").toLowerCase(),
        ),
      )
      .reduce((sum, order) => sum + toNumber(order.totalPrice), 0);

    return Math.max(total - refundedTotal, 0);
  }, [relevantOrders]);

  const cogs = useMemo(() => {
    const productMap = new Map(products.map((product) => [String(product._id), product]));
    let total = 0;

    relevantOrders.forEach((order) => {
      if (!order.isPaid || ["cancelled", "refunded"].includes(String(order.status || "").toLowerCase())) {
        return;
      }

      (order.orderItems || []).forEach((item) => {
        const product = productMap.get(String(item.product || item.productId || ""));
        const unitCost = toNumber(product?.costPrice || 0);
        total += unitCost * toNumber(item.quantity || 0);
      });
    });

    return total;
  }, [products, relevantOrders]);

  const operatingExpenses = useMemo(
    () => relevantExpenses.reduce((sum, expense) => sum + toNumber(expense.amount), 0),
    [relevantExpenses],
  );

  const grossProfit = completedRevenue - cogs;
  const netProfit = grossProfit - operatingExpenses;
  const totalInvestment = cogs + operatingExpenses;
  const roiPercentage = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
  const netMargin = completedRevenue > 0 ? (netProfit / completedRevenue) * 100 : 0;

  const previousRange = useMemo(() => {
    const previousEnd = new Date(start);
    previousEnd.setHours(23, 59, 59, 999);
    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) - 1);
    previousStart.setHours(0, 0, 0, 0);
    return { start: previousStart, end: previousEnd };
  }, [start, end]);

  const previousOrders = useMemo(
    () =>
      orders.filter((order) => {
        const created = new Date(order.createdAt || order.paidAt || 0);
        if (Number.isNaN(created.getTime())) return false;
        return created >= previousRange.start && created <= previousRange.end;
      }),
    [orders, previousRange],
  );

  const previousRevenue = useMemo(() => {
    const total = previousOrders
      .filter(
        (order) =>
          order.isPaid &&
          !["cancelled", "refunded"].includes(String(order.status || "").toLowerCase()),
      )
      .reduce((sum, order) => sum + toNumber(order.totalPrice), 0);

    const refunded = previousOrders
      .filter((order) =>
        ["cancelled", "refunded"].includes(
          String(order.status || "").toLowerCase(),
        ),
      )
      .reduce((sum, order) => sum + toNumber(order.totalPrice), 0);

    return Math.max(total - refunded, 0);
  }, [previousOrders]);

  const previousExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const created = new Date(expense.date || expense.createdAt || 0);
        if (Number.isNaN(created.getTime())) return false;
        return created >= previousRange.start && created <= previousRange.end;
      }),
    [expenses, previousRange],
  );

  const previousOperatingExpenses = previousExpenses.reduce(
    (sum, expense) => sum + toNumber(expense.amount),
    0,
  );

  const previousCogs = useMemo(() => {
    const productMap = new Map(products.map((product) => [String(product._id), product]));
    let total = 0;
    previousOrders.forEach((order) => {
      if (!order.isPaid || ["cancelled", "refunded"].includes(String(order.status || "").toLowerCase())) {
        return;
      }
      (order.orderItems || []).forEach((item) => {
        const product = productMap.get(String(item.product || item.productId || ""));
        total += toNumber(product?.costPrice || 0) * toNumber(item.quantity || 0);
      });
    });
    return total;
  }, [previousOrders, products]);

  const previousGrossProfit = previousRevenue - previousCogs;
  const previousNetProfit = previousGrossProfit - previousOperatingExpenses;
  const previousInvestment = previousCogs + previousOperatingExpenses;
  const previousRoi = previousInvestment > 0 ? (previousNetProfit / previousInvestment) * 100 : 0;

  const kpis = [
    {
      label: "Total Investment",
      value: totalInvestment,
      previousValue: previousInvestment,
      icon: <FaBriefcase className="text-indigo-600" />, 
      color: "bg-indigo-50 text-indigo-700",
      border: "border-indigo-200",
    },
    {
      label: "Total Sales Revenue",
      value: completedRevenue,
      previousValue: previousRevenue,
      icon: <FaDollarSign className="text-emerald-600" />, 
      color: "bg-emerald-50 text-emerald-700",
      border: "border-emerald-200",
    },
    {
      label: "COGS",
      value: cogs,
      previousValue: previousCogs,
      icon: <FaBoxOpen className="text-amber-600" />, 
      color: "bg-amber-50 text-amber-700",
      border: "border-amber-200",
    },
    {
      label: "Operating Expenses",
      value: operatingExpenses,
      previousValue: previousOperatingExpenses,
      icon: <FaCoins className="text-rose-600" />, 
      color: "bg-rose-50 text-rose-700",
      border: "border-rose-200",
    },
    {
      label: "Gross Profit",
      value: grossProfit,
      previousValue: previousGrossProfit,
      icon: <FaChartLine className="text-sky-600" />, 
      color: "bg-sky-50 text-sky-700",
      border: "border-sky-200",
    },
    {
      label: "Net Profit",
      value: netProfit,
      previousValue: previousNetProfit,
      icon: <FaArrowUp className="text-violet-600" />, 
      color: "bg-violet-50 text-violet-700",
      border: "border-violet-200",
    },
    {
      label: "ROI %",
      value: roiPercentage,
      previousValue: previousRoi,
      icon: <FaFilter className="text-cyan-600" />, 
      color: "bg-cyan-50 text-cyan-700",
      border: "border-cyan-200",
      suffix: "%",
    },
    {
      label: "Net Profit Margin",
      value: netMargin,
      previousValue: previousNetProfit > 0 && previousRevenue > 0 ? (previousNetProfit / previousRevenue) * 100 : 0,
      icon: <FaArrowDown className="text-teal-600" />, 
      color: "bg-teal-50 text-teal-700",
      border: "border-teal-200",
      suffix: "%",
    },
  ];

  const productAnalytics = useMemo(() => {
    const productMap = new Map(products.map((product) => [String(product._id), product]));
    const totals = new Map();

    relevantOrders.forEach((order) => {
      if (!order.isPaid || ["cancelled", "refunded"].includes(String(order.status || "").toLowerCase())) {
        return;
      }

      (order.orderItems || []).forEach((item) => {
        const key = String(item.product || item.productId || "");
        const current = totals.get(key) || { qty: 0, revenue: 0, cogs: 0, expenses: 0 };
        const product = productMap.get(key) || {};
        current.qty += Number(item.quantity || 0);
        current.revenue += Number(item.price || 0) * Number(item.quantity || 0);
        current.cogs += Number(product.costPrice || 0) * Number(item.quantity || 0);
        current.expenses += relevantExpenses
          .filter((expense) => String(expense.product || "") === key)
          .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
        totals.set(key, current);
      });
    });

    return products
      .map((product) => {
        const row = totals.get(String(product._id)) || { qty: 0, revenue: 0, cogs: 0, expenses: 0 };
        const currentRevenue = row.revenue || 0;
        const currentCogs = row.cogs || 0;
        const currentExpenses = row.expenses || 0;
        const netProfit = currentRevenue - currentCogs - currentExpenses;
        const roi = currentCogs + currentExpenses > 0 ? (netProfit / (currentCogs + currentExpenses)) * 100 : 0;
        return {
          ...product,
          unitsSold: row.qty || 0,
          remainingStock: Number(product.stock || 0),
          totalRevenue: currentRevenue,
          totalCogs: currentCogs,
          additionalExpenses: currentExpenses,
          netProfit,
          roi,
        };
      })
      .filter((product) => {
        if (!search) return true;
        const text = `${product.name || ""} ${product.sku || ""}`.toLowerCase();
        return text.includes(search.toLowerCase());
      })
      .sort((a, b) => b.roi - a.roi);
  }, [products, relevantExpenses, relevantOrders, search]);

  const filteredExpenseList = useMemo(() => {
    return relevantExpenses.filter((expense) => {
      if (categoryFilter !== "all" && expense.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [categoryFilter, relevantExpenses]);

  const canvasBars = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const max = Math.max(
      1,
      ...months.map((_, index) => {
        const current = 100 + index * 45;
        return current;
      }),
    );
    return months.map((label, index) => ({
      label,
      value: 30 + index * 15,
      max,
    }));
  }, []);

  const handleExpenseSubmit = (event) => {
    event.preventDefault();
    const payload = {
      description: expenseForm.description,
      amount: Number(expenseForm.amount || 0),
      category: expenseForm.category,
      date: expenseForm.date,
      paymentMethod: expenseForm.paymentMethod,
      campaign: expenseForm.campaign,
      notes: expenseForm.notes,
    };

    if (!payload.description || payload.amount <= 0) {
      return;
    }

    if (editingExpenseId) {
      onUpdateExpense(editingExpenseId, payload);
    } else {
      onCreateExpense(payload);
    }

    setExpenseForm({
      description: "",
      amount: "",
      category: "marketing",
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: "bank",
      campaign: "",
      notes: "",
    });
    setEditingExpenseId(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">ROI & Profit Analytics</h2>
          <p className="text-sm text-gray-500">Track sales performance, profit quality, cost efficiency, and investment health.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const change = buildTrend(kpi.value, kpi.previousValue);
          const isPositive = change >= 0;
          return (
            <div key={kpi.label} className={`rounded-xl border bg-white p-4 shadow-sm ${kpi.border}`}>
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.color}`}>
                  {kpi.icon}
                </div>
                <span
                  className={`flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                    isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {Math.abs(change).toFixed(1)}%
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">{kpi.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {kpi.suffix === "%" ? `${Number(kpi.value || 0).toFixed(1)}%` : formatCurrency(kpi.value)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr,0.9fr]">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Revenue vs Expenses</h3>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">{period}</span>
          </div>
          <div className="mt-4 flex h-56 items-end gap-3">
            {canvasBars.map((bar, index) => (
              <div key={labelValue(index, bar.label)} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end gap-1">
                  <div
                    className="w-1/2 rounded-t bg-emerald-500"
                    style={{ height: `${Math.max(18, bar.value * 1.4)}%` }}
                  />
                  <div
                    className="w-1/2 rounded-t bg-rose-400"
                    style={{ height: `${Math.max(18, 55 + index * 8)}%` }}
                  />
                </div>
                <span className="text-[10px] uppercase tracking-wide text-gray-500">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-sm text-gray-600">Revenue</span>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(completedRevenue)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-sm text-gray-600">COGS</span>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(cogs)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-sm text-gray-600">Operating Spend</span>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(operatingExpenses)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-sm text-gray-600">Net Profit</span>
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(netProfit)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-sm text-gray-600">ROI</span>
              <span className="text-sm font-semibold text-gray-900">{Number(roiPercentage || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Product Profitability</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search product or SKU"
                  className="rounded border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-2 font-semibold text-gray-700">Product</th>
                  <th className="px-3 py-2 font-semibold text-gray-700">SKU</th>
                  <th className="px-3 py-2 font-semibold text-gray-700">Sold</th>
                  <th className="px-3 py-2 font-semibold text-gray-700">Revenue</th>
                  <th className="px-3 py-2 font-semibold text-gray-700">COGS</th>
                  <th className="px-3 py-2 font-semibold text-gray-700">Net Profit</th>
                  <th className="px-3 py-2 font-semibold text-gray-700">ROI</th>
                </tr>
              </thead>
              <tbody>
                {productAnalytics.slice(0, 8).map((product) => (
                  <tr key={product._id} className="border-b border-gray-100">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image || product.thumbnail || ""} alt={product.name} className="h-10 w-10 rounded object-cover" />
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.category || "General"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{product.sku || "-"}</td>
                    <td className="px-3 py-3 text-gray-600">{product.unitsSold}</td>
                    <td className="px-3 py-3 text-gray-600">{formatCurrency(product.totalRevenue)}</td>
                    <td className="px-3 py-3 text-gray-600">{formatCurrency(product.totalCogs)}</td>
                    <td className={`px-3 py-3 font-semibold ${product.netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {formatCurrency(product.netProfit)}
                    </td>
                    <td className={`px-3 py-3 font-semibold ${product.roi >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {Number(product.roi || 0).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Expense Tracker</h3>
          </div>

          <form onSubmit={handleExpenseSubmit} className="space-y-3">
            <input
              value={expenseForm.description}
              onChange={(event) => setExpenseForm({ ...expenseForm, description: event.target.value })}
              placeholder="Expense description"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                step="0.01"
                value={expenseForm.amount}
                onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })}
                placeholder="Amount"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <select
                value={expenseForm.category}
                onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })}
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              >
                {Object.entries(categoryConfig).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={expenseForm.date}
                onChange={(event) => setExpenseForm({ ...expenseForm, date: event.target.value })}
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <select
                value={expenseForm.paymentMethod}
                onChange={(event) => setExpenseForm({ ...expenseForm, paymentMethod: event.target.value })}
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="bank">Bank</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="paypal">Paypal</option>
                <option value="stripe">Stripe</option>
                <option value="other">Other</option>
              </select>
            </div>
            <input
              value={expenseForm.campaign}
              onChange={(event) => setExpenseForm({ ...expenseForm, campaign: event.target.value })}
              placeholder="Campaign or associated product"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <textarea
              value={expenseForm.notes}
              onChange={(event) => setExpenseForm({ ...expenseForm, notes: event.target.value })}
              placeholder="Notes"
              rows={3}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <button type="submit" className="w-full rounded bg-[#68a300] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5c9300]">
              {editingExpenseId ? "Update expense" : "Add expense"}
            </button>
          </form>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">Recent expenses</span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded border border-gray-300 px-2 py-1 text-xs">
                <option value="all">All</option>
                {Object.entries(categoryConfig).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            {filteredExpenseList.slice(0, 6).map((expense) => (
              <div key={expense._id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                  <p className="text-xs text-gray-500">{categoryConfig[expense.category] || expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <button type="button" onClick={() => {
                      setEditingExpenseId(expense._id);
                      setExpenseForm({
                        description: expense.description,
                        amount: String(expense.amount),
                        category: expense.category,
                        date: new Date(expense.date).toISOString().slice(0, 10),
                        paymentMethod: expense.paymentMethod || "bank",
                        campaign: expense.campaign || "",
                        notes: expense.notes || "",
                      });
                    }} className="text-xs text-blue-600">Edit</button>
                    <button type="button" onClick={() => onDeleteExpense(expense._id)} className="text-xs text-red-600">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function labelValue(index, label) {
  return `${index}-${label}`;
}

export default ROIAnalyticsTab;
