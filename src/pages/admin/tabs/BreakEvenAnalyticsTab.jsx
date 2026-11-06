import { useEffect, useMemo, useState } from "react";
import {
  FaArrowUp,
  FaChartLine,
  FaCoins,
  FaDollarSign,
  FaExclamationTriangle,
  FaPercentage,
  FaPlus,
  FaTrash,
  FaWallet,
} from "react-icons/fa";
import { formatPercent, money, periodOptions } from "./analyticsUtils";

const getAuthToken = () => {
  const raw = localStorage.getItem("accessToken");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const BreakEvenAnalyticsTab = () => {
  const API_URL = import.meta.env.VITE_API_URL || "/api";
  const [period, setPeriod] = useState("30d");
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [products, setProducts] = useState([]);
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingCost, setSavingCost] = useState(false);
  const [error, setError] = useState("");
  const [costForm, setCostForm] = useState({
    description: "",
    amount: "",
    category: "marketing",
    costType: "variable",
    isRecurring: true,
    notes: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const fetchBreakEvenData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getAuthToken();
      const endpoints = [
        fetch(`${API_URL}/financial/break-even/summary?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }),
        fetch(`${API_URL}/financial/break-even/trends?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }),
        fetch(`${API_URL}/financial/break-even/products?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }),
        fetch(`${API_URL}/financial/break-even/costs?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }),
      ];

      const [summaryRes, trendsRes, productsRes, costsRes] =
        await Promise.all(endpoints);
      const summaryJson = await summaryRes.json();
      const trendsJson = await trendsRes.json();
      const productsJson = await productsRes.json();
      const costsJson = await costsRes.json();

      if (!summaryRes.ok)
        throw new Error(
          summaryJson?.error || "Failed to load break-even summary",
        );
      if (!trendsRes.ok)
        throw new Error(trendsJson?.error || "Failed to load trend data");
      if (!productsRes.ok)
        throw new Error(productsJson?.error || "Failed to load product data");
      if (!costsRes.ok)
        throw new Error(costsJson?.error || "Failed to load cost data");

      setSummary(summaryJson?.data || null);
      setTrends(Array.isArray(trendsJson?.data) ? trendsJson.data : []);
      setProducts(Array.isArray(productsJson?.data) ? productsJson.data : []);
      setCosts(Array.isArray(costsJson?.data) ? costsJson.data : []);
    } catch (err) {
      setError(err.message || "Unable to load break-even analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakEvenData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL, period]);

  const kpis = useMemo(() => {
    if (!summary?.summary) return [];
    const s = summary.summary;
    return [
      {
        label: "Break-Even Revenue",
        value: money(s.breakEvenRevenue || 0),
        icon: <FaWallet className="text-indigo-600" />,
      },
      {
        label: "Break-Even Orders",
        value: `${Number(s.breakEvenOrders || 0).toLocaleString()} orders`,
        icon: <FaChartLine className="text-cyan-600" />,
      },
      {
        label: "Actual Revenue",
        value: money(s.revenue || 0),
        icon: <FaDollarSign className="text-emerald-600" />,
      },
      {
        label: "Actual Orders",
        value: `${Number(s.orderCount || 0).toLocaleString()} orders`,
        icon: <FaCoins className="text-amber-600" />,
      },
      {
        label: "Operating Profit",
        value: money(s.operatingProfit || 0),
        icon: <FaArrowUp className="text-green-600" />,
      },
      {
        label: "Contribution Margin",
        value: formatPercent(s.contributionMarginPercent || 0),
        icon: <FaPercentage className="text-fuchsia-600" />,
      },
      {
        label: "Remaining Revenue",
        value: money(s.remainingRevenue || 0),
        icon: <FaExclamationTriangle className="text-red-500" />,
      },
      {
        label: "Margin of Safety",
        value: formatPercent(s.marginOfSafetyPercent || 0),
        icon: <FaWallet className="text-violet-600" />,
      },
    ];
  }, [summary]);

  const revenueProgress = useMemo(() => {
    const revenue = Number(summary?.summary?.revenue || 0);
    const target = Number(summary?.summary?.breakEvenRevenue || 0);
    if (!target) return 0;
    return Math.min((revenue / target) * 100, 100);
  }, [summary]);

  const handleCostInputChange = (field, value) => {
    setCostForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCostSave = async (event) => {
    event.preventDefault();
    setSavingCost(true);
    setError("");

    try {
      const token = getAuthToken();
      const payload = {
        description: costForm.description,
        amount: Number(costForm.amount || 0),
        category: costForm.category,
        costType: costForm.costType,
        isRecurring: Boolean(costForm.isRecurring),
        notes: costForm.notes,
        date: costForm.date,
      };

      const response = await fetch(`${API_URL}/financial/break-even/costs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Failed to save cost item");
      }

      setCostForm({
        description: "",
        amount: "",
        category: "marketing",
        costType: "variable",
        isRecurring: true,
        notes: "",
        date: new Date().toISOString().slice(0, 10),
      });
      await fetchBreakEvenData();
    } catch (err) {
      setError(err.message || "Failed to save cost item");
    } finally {
      setSavingCost(false);
    }
  };

  const handleDeleteCost = async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_URL}/financial/break-even/costs/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        },
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Failed to delete cost");
      }
      await fetchBreakEvenData();
    } catch (err) {
      setError(err.message || "Failed to delete cost");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-600">
        Loading break-even analytics…
      </div>
    );
  }

  if (error && !summary) {
    return <div className="p-6 text-sm text-red-600">{error}</div>;
  }

  const summaryData = summary?.summary || {};
  const statusText = summaryData.status || "Below Break-Even";

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Break-Even Analytics
          </h2>
          <p className="text-sm text-gray-500">
            Real operating leverage, break-even thresholds, and contribution
            margin from genuine business data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={`rounded-md border px-3 py-2 text-sm ${
                period === option.value
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {summary && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    {item.icon}
                  </div>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                  {item.label}
                </p>
                <p className="mt-2 text-xl font-bold text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Break-Even Progress
              </h3>
              <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                {statusText}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
                style={{ width: `${Math.min(revenueProgress, 100)}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>Revenue: {money(summaryData.revenue || 0)}</span>
              <span>Target: {money(summaryData.breakEvenRevenue || 0)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Monthly Break-Even Trend
              </h3>
              <div className="space-y-3">
                {(trends || []).map((item) => (
                  <div
                    key={item.month}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {item.month}
                      </span>
                      <span className="text-gray-500">
                        {money(item.revenue || 0)}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.min((Number(item.revenue || 0) / Math.max(Number(item.breakEvenRevenue || 0), 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Cost Classification
              </h3>
              <div className="space-y-3">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Fixed costs</span>
                    <span className="font-semibold text-gray-900">
                      {money(summaryData.fixedCosts || 0)}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Variable costs</span>
                    <span className="font-semibold text-gray-900">
                      {money(summaryData.variableCosts || 0)}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Contribution</span>
                    <span className="font-semibold text-gray-900">
                      {money(summaryData.contribution || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Product-level break-even
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-600">
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">Revenue</th>
                      <th className="px-3 py-2">Margin</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(products || []).slice(0, 8).map((product) => (
                      <tr
                        key={product.productId || product.productName}
                        className="border-b border-gray-100"
                      >
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {product.productName}
                        </td>
                        <td className="px-3 py-2 text-emerald-700">
                          {money(product.revenue || 0)}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {formatPercent(
                            product.contributionMarginPercent || 0,
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${product.profitabilityStatus === "Profitable" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {product.profitabilityStatus || "Below Break-Even"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Cost management
              </h3>
              <form onSubmit={handleCostSave} className="space-y-3">
                <input
                  value={costForm.description}
                  onChange={(event) =>
                    handleCostInputChange("description", event.target.value)
                  }
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Expense description"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costForm.amount}
                    onChange={(event) =>
                      handleCostInputChange("amount", event.target.value)
                    }
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Amount"
                    required
                  />
                  <input
                    type="date"
                    value={costForm.date}
                    onChange={(event) =>
                      handleCostInputChange("date", event.target.value)
                    }
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={costForm.costType}
                    onChange={(event) =>
                      handleCostInputChange("costType", event.target.value)
                    }
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="variable">Variable</option>
                    <option value="fixed">Fixed</option>
                  </select>
                  <select
                    value={costForm.category}
                    onChange={(event) =>
                      handleCostInputChange("category", event.target.value)
                    }
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="marketing">Marketing</option>
                    <option value="shipping">Shipping</option>
                    <option value="packaging">Packaging</option>
                    <option value="salary">Salary</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="operations">Operations</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <textarea
                  value={costForm.notes}
                  onChange={(event) =>
                    handleCostInputChange("notes", event.target.value)
                  }
                  rows={3}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Notes"
                />
                <button
                  type="submit"
                  disabled={savingCost}
                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                >
                  <FaPlus />
                  {savingCost ? "Saving…" : "Add Cost"}
                </button>
              </form>

              <div className="mt-4 space-y-2">
                {(costs || []).slice(0, 5).map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.costType} • {item.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {money(item.amount || 0)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCost(item._id)}
                        className="text-red-600 hover:text-red-700"
                        aria-label="Delete cost"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BreakEvenAnalyticsTab;
