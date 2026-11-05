import { useEffect, useMemo, useState } from "react";
import {
  FaArrowUp,
  FaChartBar,
  FaDollarSign,
  FaUsers,
  FaPercentage,
  FaFilter,
} from "react-icons/fa";

const money = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

const periodOptions = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "thismonth", label: "This month" },
  { value: "lastmonth", label: "Last month" },
  { value: "90d", label: "Last 3 months" },
  { value: "last6months", label: "Last 6 months" },
  { value: "thisyear", label: "This year" },
];

const getTrendValue = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  if (current === 0 && previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

const metricCards = [
  { key: "totalUniqueCustomers", label: "Total Unique Customers", icon: <FaUsers className="text-sky-600" /> },
  { key: "newCustomers", label: "New Customers", icon: <FaArrowUp className="text-green-600" /> },
  { key: "returningCustomers", label: "Returning Customers", icon: <FaUsers className="text-violet-600" /> },
  { key: "customerAcquisitionCost", label: "Customer Acquisition Cost", icon: <FaDollarSign className="text-amber-600" /> },
  { key: "averageCustomerLifetimeValue", label: "Average Customer LTV", icon: <FaChartBar className="text-indigo-600" /> },
  { key: "customerLifetimeGrossProfit", label: "Customer Lifetime Gross Profit", icon: <FaDollarSign className="text-emerald-600" /> },
  { key: "ltvRatio", label: "LTV Ratio", icon: <FaPercentage className="text-fuchsia-600" /> },
  { key: "averageOrderValue", label: "Average Order Value", icon: <FaChartBar className="text-cyan-600" /> },
  { key: "averagePurchaseFrequency", label: "Average Purchase Frequency", icon: <FaFilter className="text-orange-600" /> },
  { key: "repeatPurchaseRate", label: "Repeat Purchase Rate", icon: <FaPercentage className="text-red-600" /> },
];

const CustomerAnalyticsTab = () => {
  const API_URL = import.meta.env.VITE_API_URL || "/api";
  const [period, setPeriod] = useState("30d");
  const [section, setSection] = useState("overview");
  const [data, setData] = useState(null);
  const [ratioData, setRatioData] = useState(null);
  const [cohortData, setCohortData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const token = (() => {
          const raw = localStorage.getItem("accessToken");
          if (!raw) return null;
          try {
            return JSON.parse(raw);
          } catch {
            return raw;
          }
        })();

        const [overviewRes, ratioRes, cohortsRes, trendsRes] = await Promise.all([
          fetch(`${API_URL}/customer-analytics/overview?period=${period}`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }),
          fetch(`${API_URL}/customer-analytics/ratio?period=${period}`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }),
          fetch(`${API_URL}/customer-analytics/cohorts?period=${period}`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }),
          fetch(`${API_URL}/customer-analytics/trends?period=${period}`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }),
        ]);

        const overview = await overviewRes.json();
        const ratio = await ratioRes.json();
        const cohorts = await cohortsRes.json();
        const trends = await trendsRes.json();

        if (!overviewRes.ok) throw new Error(overview?.error || "Failed to load customer analytics");
        if (!ratioRes.ok) throw new Error(ratio?.error || "Failed to load CAC/LTV ratio");
        if (!cohortsRes.ok) throw new Error(cohorts?.error || "Failed to load cohort analytics");
        if (!trendsRes.ok) throw new Error(trends?.error || "Failed to load trend analytics");

        setData(overview?.data || null);
        setRatioData(ratio?.data || null);
        setCohortData(Array.isArray(cohorts?.data) ? cohorts.data : []);
        setTrendData(Array.isArray(trends?.data) ? trends.data : []);
      } catch (err) {
        setError(err.message || "Unable to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, period]);

  const cards = useMemo(() => {
    if (!data?.summary) return [];
    const summary = data.summary;

    return metricCards.map((card) => {
      const value = summary[card.key];
      const previousValue = summary.previousPeriod?.[card.key] ?? 0;
      const change = getTrendValue(value, previousValue);

      return {
        ...card,
        value,
        previousValue,
        change,
      };
    });
  }, [data]);

  const sectionTabs = [
    "overview",
    "cac",
    "ltv",
    "retention",
    "cohorts",
    "marketing",
  ];

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.key} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                {card.icon}
              </div>
              <span className={`text-xs font-medium ${card.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {Number.isFinite(card.change) ? `${card.change.toFixed(1)}%` : "0%"}
              </span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {card.key === "customerAcquisitionCost" ||
               card.key === "averageCustomerLifetimeValue" ||
               card.key === "customerLifetimeGrossProfit" ||
               card.key === "averageOrderValue" ||
               card.key === "totalRevenue" ||
               card.key === "totalGrossProfit"
                ? money(card.value)
                : card.key === "ltvRatio"
                  ? (card.value == null ? "N/A" : `${Number(card.value).toFixed(2)}x`)
                  : card.key === "repeatPurchaseRate" || card.key === "averagePurchaseFrequency"
                    ? formatPercent(card.value)
                    : Number(card.value || 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Top customers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Orders</th>
                  <th className="px-3 py-2">Revenue</th>
                  <th className="px-3 py-2">Gross Profit</th>
                </tr>
              </thead>
              <tbody>
                {(data.topCustomers || []).map((customer) => (
                  <tr key={customer.customerKey} className="border-b border-gray-100">
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900">{customer.customerName || "Guest Customer"}</div>
                      <div className="text-xs text-gray-500">{customer.email || "No email"}</div>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{customer.totalOrders}</td>
                    <td className="px-3 py-2 font-semibold text-emerald-700">{money(customer.totalRevenue)}</td>
                    <td className="px-3 py-2 font-semibold text-indigo-700">{money(customer.totalGrossProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Marketing channels</h3>
          <div className="space-y-3">
            {(data.channels || []).map((channel) => (
              <div key={channel.channel} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-gray-900">{channel.channel}</p>
                  <span className="text-sm font-semibold text-gray-700">{money(channel.spend)}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {channel.expenses} spending entries • {channel.campaigns || 0} campaigns
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderCac = () => (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Blended CAC</h3>
        <p className="mt-3 text-3xl font-bold text-gray-900">{ratioData?.cac ? money(ratioData.cac) : "N/A"}</p>
        <p className="mt-2 text-sm text-gray-500">Marketing spend divided by new customers acquired in the selected period.</p>
      </div>
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Marketing Spend</h3>
        <p className="mt-3 text-3xl font-bold text-gray-900">{money(data?.summary?.marketingSpend || 0)}</p>
        <p className="mt-2 text-sm text-gray-500">Customer acquisition-related expense total.</p>
      </div>
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">New Customers</h3>
        <p className="mt-3 text-3xl font-bold text-gray-900">{Number(data?.summary?.newCustomers || 0).toLocaleString()}</p>
        <p className="mt-2 text-sm text-gray-500">Counted as unique first-time qualifying purchasers only.</p>
      </div>
    </div>
  );

  const renderLtv = () => (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Revenue-based LTV</h3>
        <p className="mt-3 text-3xl font-bold text-gray-900">{money(data?.summary?.averageCustomerLifetimeValue || 0)}</p>
      </div>
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Gross-profit LTV</h3>
        <p className="mt-3 text-3xl font-bold text-gray-900">{money(data?.summary?.customerLifetimeGrossProfit || 0)}</p>
      </div>
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">LTV Ratio</h3>
        <p className="mt-3 text-3xl font-bold text-gray-900">{ratioData?.overall == null ? "N/A" : `${Number(ratioData.overall).toFixed(2)}x`}</p>
        <p className="mt-2 text-sm text-gray-500">{ratioData?.status || "N/A"}</p>
      </div>
    </div>
  );

  const renderRetention = () => (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Returning Customers</h3>
        <p className="mt-3 text-3xl font-bold text-gray-900">{Number(data?.summary?.returningCustomers || 0).toLocaleString()}</p>
      </div>
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Repeat Purchase Rate</h3>
        <p className="mt-3 text-3xl font-bold text-gray-900">{formatPercent(data?.summary?.repeatPurchaseRate * 100 || 0)}</p>
      </div>
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Average Purchase Frequency</h3>
        <p className="mt-3 text-3xl font-bold text-gray-900">{Number(data?.summary?.averagePurchaseFrequency || 0).toFixed(2)}</p>
      </div>
    </div>
  );

  const renderCohorts = () => (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Cohort analysis</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-3 py-2">Cohort</th>
              <th className="px-3 py-2">Customers</th>
              <th className="px-3 py-2">Revenue</th>
              <th className="px-3 py-2">Gross Profit</th>
              <th className="px-3 py-2">Repeat Rate</th>
            </tr>
          </thead>
          <tbody>
            {(cohortData || []).map((cohort) => (
              <tr key={cohort.cohort} className="border-b border-gray-100">
                <td className="px-3 py-2 font-medium text-gray-900">{cohort.cohort}</td>
                <td className="px-3 py-2 text-gray-700">{cohort.customers}</td>
                <td className="px-3 py-2 text-emerald-700">{money(cohort.revenue)}</td>
                <td className="px-3 py-2 text-indigo-700">{money(cohort.grossProfit)}</td>
                <td className="px-3 py-2 text-gray-700">{formatPercent(cohort.repeatRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMarketing = () => (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Marketing performance</h3>
      <div className="space-y-3">
        {(data?.channels || []).map((channel) => (
          <div key={channel.channel} className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-gray-900">{channel.channel}</p>
              <p className="text-sm font-bold text-gray-800">{money(channel.spend)}</p>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-500">
              <span>Spend: {money(channel.spend)}</span>
              <span>Campaigns: {channel.campaigns || 0}</span>
              <span>Entries: {channel.expenses || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="text-sm text-gray-500">Loading customer analytics…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm text-sm text-gray-500">
        No customer analytics available for the selected period.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Customer Analytics</h2>
          <p className="text-sm text-gray-500">
            CAC, LTV, retention, cohort health, and customer profitability from your real order and marketing data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                period === option.value
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {sectionTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSection(tab)}
            className={`rounded-md border px-3 py-2 text-sm font-medium ${
              section === tab
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab === "overview" && "Overview"}
            {tab === "cac" && "CAC"}
            {tab === "ltv" && "LTV"}
            {tab === "retention" && "Retention"}
            {tab === "cohorts" && "Cohorts"}
            {tab === "marketing" && "Marketing"}
          </button>
        ))}
      </div>

      {section === "overview" && renderOverview()}
      {section === "cac" && renderCac()}
      {section === "ltv" && renderLtv()}
      {section === "retention" && renderRetention()}
      {section === "cohorts" && renderCohorts()}
      {section === "marketing" && renderMarketing()}
    </div>
  );
};

export default CustomerAnalyticsTab;
