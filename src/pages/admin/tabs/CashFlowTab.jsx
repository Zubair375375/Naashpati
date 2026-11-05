import { useEffect, useMemo, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaBuilding,
  FaChartLine,
  FaMoneyBillWave,
  FaWallet,
} from "react-icons/fa";

const money = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const tabButton = (active, current, label) =>
  `rounded-lg border px-3 py-2 text-sm font-medium transition ${
    active === current
      ? "border-green-200 bg-green-50 text-green-700"
      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
  }`;

const defaultTransactionForm = {
  type: "income",
  category: "marketing",
  description: "",
  amount: "",
  paymentMethod: "bank",
  account: "",
  date: new Date().toISOString().slice(0, 10),
  referenceNumber: "",
  notes: "",
};

const defaultAccountForm = {
  name: "",
  type: "cash",
  accountNumber: "",
  bankName: "",
  openingBalance: "",
  notes: "",
};

const categoryOptions = [
  "marketing",
  "shipping",
  "packaging",
  "salary",
  "maintenance",
  "operations",
  "inventory",
  "other",
];

const CashFlowTab = ({ view = "cash-flow" }) => {
  const API_URL = import.meta.env.VITE_API_URL || "/api";
  const [activeView, setActiveView] = useState(view);
  const [summary, setSummary] = useState({
    openingCashBalance: 0,
    totalCashInflow: 0,
    totalCashOutflow: 0,
    netCashFlow: 0,
    closingCashBalance: 0,
    availableCashBalance: 0,
    pendingCustomerPayments: 0,
    outstandingSupplierPayments: 0,
    chartSeries: [],
  });
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactionForm, setTransactionForm] = useState(
    defaultTransactionForm,
  );
  const [accountForm, setAccountForm] = useState(defaultAccountForm);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [loading, setLoading] = useState(false);

  const token = (() => {
    const raw = localStorage.getItem("accessToken");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  })();

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${API_URL}/financial/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.error || "Failed to load accounts");
      setAccounts(Array.isArray(result?.data) ? result.data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.set("startDate", dateRange.startDate);
      if (dateRange.endDate) params.set("endDate", dateRange.endDate);

      const response = await fetch(
        `${API_URL}/financial/summary?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.error || "Failed to load summary");
      setSummary(result?.data || summary);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.set("startDate", dateRange.startDate);
      if (dateRange.endDate) params.set("endDate", dateRange.endDate);

      const response = await fetch(
        `${API_URL}/financial/transactions?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.error || "Failed to load transactions");
      setTransactions(Array.isArray(result?.data) ? result.data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setActiveView(view);
  }, [view]);

  useEffect(() => {
    fetchAccounts();
    fetchSummary();
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.startDate, dateRange.endDate]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Opening Cash Balance",
        value: summary.openingCashBalance,
        icon: <FaWallet className="text-sky-600" />,
        tone: "bg-sky-50 text-sky-700 border-sky-200",
      },
      {
        label: "Total Cash Inflow",
        value: summary.totalCashInflow,
        icon: <FaArrowUp className="text-emerald-600" />,
        tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
      },
      {
        label: "Total Cash Outflow",
        value: summary.totalCashOutflow,
        icon: <FaArrowDown className="text-rose-600" />,
        tone: "bg-rose-50 text-rose-700 border-rose-200",
      },
      {
        label: "Net Cash Flow",
        value: summary.netCashFlow,
        icon: <FaChartLine className="text-violet-600" />,
        tone: "bg-violet-50 text-violet-700 border-violet-200",
      },
      {
        label: "Closing Cash Balance",
        value: summary.closingCashBalance,
        icon: <FaMoneyBillWave className="text-amber-600" />,
        tone: "bg-amber-50 text-amber-700 border-amber-200",
      },
      {
        label: "Available Cash Balance",
        value: summary.availableCashBalance,
        icon: <FaBuilding className="text-cyan-600" />,
        tone: "bg-cyan-50 text-cyan-700 border-cyan-200",
      },
      {
        label: "Pending Customer Payments",
        value: summary.pendingCustomerPayments,
        icon: <FaArrowUp className="text-indigo-600" />,
        tone: "bg-indigo-50 text-indigo-700 border-indigo-200",
      },
      {
        label: "Outstanding Supplier Payments",
        value: summary.outstandingSupplierPayments,
        icon: <FaArrowDown className="text-orange-600" />,
        tone: "bg-orange-50 text-orange-700 border-orange-200",
      },
    ],
    [summary],
  );

  const handleTransactionSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/financial/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...transactionForm,
          amount: Number(transactionForm.amount || 0),
        }),
        credentials: "include",
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.error || "Failed to save transaction");
      setTransactionForm(defaultTransactionForm);
      await fetchSummary();
      await fetchTransactions();
      await fetchAccounts();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/financial/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...accountForm,
          openingBalance: Number(accountForm.openingBalance || 0),
        }),
        credentials: "include",
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.error || "Failed to save account");
      setAccountForm(defaultAccountForm);
      await fetchAccounts();
      await fetchSummary();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    try {
      const response = await fetch(
        `${API_URL}/financial/accounts/${accountId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.error || "Failed to delete account");
      await fetchAccounts();
      await fetchSummary();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      const response = await fetch(
        `${API_URL}/financial/transactions/${transactionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.error || "Failed to reverse transaction");
      await fetchTransactions();
      await fetchSummary();
      await fetchAccounts();
    } catch (error) {
      console.error(error);
    }
  };

  const recentTransactions = transactions.slice(0, 6);
  const maxSeries = Math.max(
    1,
    ...summary.chartSeries.map((item) =>
      Math.max(item.inflow, item.outflow, 1),
    ),
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Cash Flow Analytics
          </h2>
          <p className="text-sm text-gray-500">
            Track actual money movement, balances, receivables, and payables in
            real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(event) =>
              setDateRange((prev) => ({
                ...prev,
                startDate: event.target.value,
              }))
            }
            className="rounded border border-gray-300 bg-white px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(event) =>
              setDateRange((prev) => ({ ...prev, endDate: event.target.value }))
            }
            className="rounded border border-gray-300 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveView("cash-flow")}
          className={tabButton(activeView, "cash-flow", "Cash Flow")}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveView("transactions")}
          className={tabButton(activeView, "transactions", "Transactions")}
        >
          Transactions
        </button>
        <button
          type="button"
          onClick={() => setActiveView("accounts")}
          className={tabButton(activeView, "accounts", "Accounts")}
        >
          Cash & Bank Accounts
        </button>
        <button
          type="button"
          onClick={() => setActiveView("payables")}
          className={tabButton(activeView, "payables", "Payables")}
        >
          Payables & Receivables
        </button>
        <button
          type="button"
          onClick={() => setActiveView("reports")}
          className={tabButton(activeView, "reports", "Reports")}
        >
          Financial Reports
        </button>
      </div>

      {activeView === "cash-flow" && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className={`rounded-xl border bg-white p-4 shadow-sm ${card.tone}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80">
                    {card.icon}
                  </div>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {money(card.value)}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr,0.7fr]">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Cash Flow Trend
              </h3>
              <div className="flex h-52 items-end gap-3">
                {summary.chartSeries.length ? (
                  summary.chartSeries.slice(-7).map((item, index) => (
                    <div
                      key={`${item.date}-${index}`}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div className="flex h-40 w-full items-end gap-1">
                        <div
                          className="w-1/2 rounded-t bg-emerald-500"
                          style={{
                            height: `${Math.max(10, (item.inflow / maxSeries) * 100)}%`,
                          }}
                        />
                        <div
                          className="w-1/2 rounded-t bg-rose-400"
                          style={{
                            height: `${Math.max(10, (item.outflow / maxSeries) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {new Date(item.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">
                    No transaction data in this range.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Accounts
              </h3>
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account._id}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {account.name}
                        </p>
                        <p className="text-xs text-gray-500">{account.type}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {money(account.currentBalance || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeView === "transactions" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr,1.1fr]">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Add Transaction
            </h3>
            <form onSubmit={handleTransactionSubmit} className="space-y-3">
              <select
                value={transactionForm.type}
                onChange={(event) =>
                  setTransactionForm((prev) => ({
                    ...prev,
                    type: event.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
                <option value="refund">Refund</option>
                <option value="adjustment">Adjustment</option>
              </select>
              <select
                value={transactionForm.account}
                onChange={(event) =>
                  setTransactionForm((prev) => ({
                    ...prev,
                    account: event.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name}
                  </option>
                ))}
              </select>
              <input
                value={transactionForm.description}
                onChange={(event) =>
                  setTransactionForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Transaction description"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={transactionForm.amount}
                  onChange={(event) =>
                    setTransactionForm((prev) => ({
                      ...prev,
                      amount: event.target.value,
                    }))
                  }
                  placeholder="Amount"
                  className="rounded border border-gray-300 px-3 py-2 text-sm"
                />
                <select
                  value={transactionForm.category}
                  onChange={(event) =>
                    setTransactionForm((prev) => ({
                      ...prev,
                      category: event.target.value,
                    }))
                  }
                  className="rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={transactionForm.paymentMethod}
                  onChange={(event) =>
                    setTransactionForm((prev) => ({
                      ...prev,
                      paymentMethod: event.target.value,
                    }))
                  }
                  className="rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="card">Card</option>
                  <option value="paypal">Paypal</option>
                  <option value="stripe">Stripe</option>
                  <option value="cod">COD</option>
                  <option value="wallet">Wallet</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="date"
                  value={transactionForm.date}
                  onChange={(event) =>
                    setTransactionForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                  className="rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <input
                value={transactionForm.referenceNumber}
                onChange={(event) =>
                  setTransactionForm((prev) => ({
                    ...prev,
                    referenceNumber: event.target.value,
                  }))
                }
                placeholder="Reference number"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <textarea
                rows={3}
                value={transactionForm.notes}
                onChange={(event) =>
                  setTransactionForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                placeholder="Notes"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="w-full rounded bg-[#68a300] px-4 py-2 font-semibold text-white hover:bg-[#5c9300]"
                disabled={loading}
              >
                {loading ? "Saving..." : "Add transaction"}
              </button>
            </form>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Recent Transactions
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="border-b border-gray-100"
                    >
                      <td className="px-3 py-2 font-medium text-gray-700">
                        {transaction.type}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {transaction.description}
                      </td>
                      <td
                        className={`px-3 py-2 font-semibold ${transaction.type === "expense" ? "text-red-600" : "text-green-600"}`}
                      >
                        {money(transaction.amount)}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteTransaction(transaction._id)
                          }
                          className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          Reverse
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeView === "accounts" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr,1.1fr]">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Create Account
            </h3>
            <form onSubmit={handleAccountSubmit} className="space-y-3">
              <input
                value={accountForm.name}
                onChange={(event) =>
                  setAccountForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                placeholder="Account name"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <select
                value={accountForm.type}
                onChange={(event) =>
                  setAccountForm((prev) => ({
                    ...prev,
                    type: event.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="wallet">Wallet</option>
                <option value="other">Other</option>
              </select>
              <input
                value={accountForm.accountNumber}
                onChange={(event) =>
                  setAccountForm((prev) => ({
                    ...prev,
                    accountNumber: event.target.value,
                  }))
                }
                placeholder="Account number"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                value={accountForm.bankName}
                onChange={(event) =>
                  setAccountForm((prev) => ({
                    ...prev,
                    bankName: event.target.value,
                  }))
                }
                placeholder="Bank name"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={accountForm.openingBalance}
                onChange={(event) =>
                  setAccountForm((prev) => ({
                    ...prev,
                    openingBalance: event.target.value,
                  }))
                }
                placeholder="Opening balance"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <textarea
                rows={3}
                value={accountForm.notes}
                onChange={(event) =>
                  setAccountForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                placeholder="Notes"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="w-full rounded bg-[#68a300] px-4 py-2 font-semibold text-white hover:bg-[#5c9300]"
                disabled={loading}
              >
                {loading ? "Saving..." : "Create account"}
              </button>
            </form>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              All Accounts
            </h3>
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account._id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {account.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {account.type} • {account.accountNumber || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {money(account.currentBalance || 0)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteAccount(account._id)}
                        className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(activeView === "payables" || activeView === "reports") && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Pending Receivables
            </h3>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">
                Customer payments still pending
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {money(summary.pendingCustomerPayments)}
              </p>
            </div>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Outstanding Payables
            </h3>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Supplier payments due</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {money(summary.outstandingSupplierPayments)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowTab;
