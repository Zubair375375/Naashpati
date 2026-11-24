import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const getAuthToken = () => {
  const rawToken = localStorage.getItem("accessToken");
  if (!rawToken) return "";

  try {
    return JSON.parse(rawToken) || "";
  } catch {
    return rawToken;
  }
};

const toLocalDateTimeInput = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const PromoCodesTab = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState({
    code: "",
    discountPercent: "",
    validFrom: "",
    validUntil: "",
    notes: "",
    isActive: true,
  });

  const hasEditing = useMemo(() => Boolean(editingId), [editingId]);

  const fetchPromoCodes = async () => {
    setIsLoading(true);

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/promo-codes`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || "Failed to fetch promo codes");
      }

      setPromoCodes(Array.isArray(result?.data) ? result.data : []);
    } catch (error) {
      toast.error(error?.message || "Failed to fetch promo codes");
      setPromoCodes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const resetForm = () => {
    setEditingId("");
    setForm({
      code: "",
      discountPercent: "",
      validFrom: "",
      validUntil: "",
      notes: "",
      isActive: true,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedCode = String(form.code || "")
      .trim()
      .toUpperCase();
    const discountPercent = Number(form.discountPercent);

    if (!normalizedCode) {
      toast.error("Promo code is required");
      return;
    }

    if (
      !Number.isFinite(discountPercent) ||
      discountPercent <= 0 ||
      discountPercent > 100
    ) {
      toast.error("Discount percent must be between 0.01 and 100");
      return;
    }

    const payload = {
      code: normalizedCode,
      discountPercent,
      validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
      validUntil: form.validUntil
        ? new Date(form.validUntil).toISOString()
        : null,
      notes: String(form.notes || "").trim(),
      isActive: Boolean(form.isActive),
    };

    setIsSaving(true);

    try {
      const token = getAuthToken();
      const isUpdate = Boolean(editingId);
      const response = await fetch(
        isUpdate
          ? `${API_URL}/promo-codes/${editingId}`
          : `${API_URL}/promo-codes`,
        {
          method: isUpdate ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || "Failed to save promo code");
      }

      toast.success(isUpdate ? "Promo code updated" : "Promo code created");
      resetForm();
      await fetchPromoCodes();
    } catch (error) {
      toast.error(error?.message || "Failed to save promo code");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (promoCode) => {
    setEditingId(String(promoCode?._id || ""));
    setForm({
      code: String(promoCode?.code || ""),
      discountPercent: String(Number(promoCode?.discountPercent || 0)),
      validFrom: toLocalDateTimeInput(promoCode?.validFrom),
      validUntil: toLocalDateTimeInput(promoCode?.validUntil),
      notes: String(promoCode?.notes || ""),
      isActive: Boolean(promoCode?.isActive),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this promo code?")) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/promo-codes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || "Failed to delete promo code");
      }

      toast.success("Promo code deleted");
      if (editingId === id) {
        resetForm();
      }
      await fetchPromoCodes();
    } catch (error) {
      toast.error(error?.message || "Failed to delete promo code");
    }
  };

  const handleToggleActive = async (promoCode) => {
    const id = String(promoCode?._id || "");
    if (!id) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/promo-codes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ isActive: !promoCode.isActive }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "Failed to update promo status");
      }

      toast.success(
        `Promo code ${result?.data?.isActive ? "activated" : "deactivated"}`,
      );
      await fetchPromoCodes();
    } catch (error) {
      toast.error(error?.message || "Failed to update promo status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Promo Code Management</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Promo Code
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, code: e.target.value }))
              }
              placeholder="e.g. SUMMER25"
              className="w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              OFF Percentage
            </label>
            <input
              type="number"
              min="0.01"
              max="100"
              step="0.01"
              value={form.discountPercent}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  discountPercent: e.target.value,
                }))
              }
              placeholder="e.g. 15"
              className="w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Valid From (optional)
            </label>
            <input
              type="datetime-local"
              value={form.validFrom}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, validFrom: e.target.value }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Valid Until (optional)
            </label>
            <input
              type="datetime-local"
              value={form.validUntil}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, validUntil: e.target.value }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={2}
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="Internal notes"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            Active
          </label>

          <div className="flex items-end justify-end gap-2 md:col-span-2">
            {hasEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded border border-gray-300 px-4 py-2 text-sm"
              >
                Cancel Edit
              </button>
            ) : null}
            <button
              type="submit"
              disabled={isSaving}
              className="rounded bg-[#68a300] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSaving
                ? "Saving..."
                : hasEditing
                  ? "Update Promo"
                  : "Create Promo"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Existing Promo Codes</h3>
          <button
            type="button"
            onClick={fetchPromoCodes}
            className="rounded border border-gray-300 px-3 py-1 text-sm"
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {promoCodes.length === 0 ? (
          <p className="text-sm text-gray-500">No promo codes yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-2 py-2">Code</th>
                  <th className="px-2 py-2">OFF %</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Valid Window</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {promoCodes.map((promoCode) => (
                  <tr key={promoCode._id}>
                    <td className="px-2 py-2 font-semibold">
                      {promoCode.code}
                    </td>
                    <td className="px-2 py-2">
                      {Number(promoCode.discountPercent || 0).toFixed(2)}%
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${
                          promoCode.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {promoCode.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs text-gray-600">
                      <div>
                        {promoCode.validFrom
                          ? new Date(promoCode.validFrom).toLocaleString()
                          : "No start"}
                      </div>
                      <div>
                        {promoCode.validUntil
                          ? new Date(promoCode.validUntil).toLocaleString()
                          : "No end"}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(promoCode)}
                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(promoCode)}
                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                        >
                          {promoCode.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(promoCode._id)}
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoCodesTab;
