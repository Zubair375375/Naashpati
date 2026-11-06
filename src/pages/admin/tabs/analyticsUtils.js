export const money = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

export const periodOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "thisYear", label: "This year" },
];

export const toNumber = (value) => Number(value || 0);

export const getRange = (period) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

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
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const buildTrend = (current, previous) => {
  const validPrevious = previous || 0;
  if (validPrevious === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - validPrevious) / validPrevious) * 100;
};

export const formatCurrency = (value) => money(value);
