import { FaPlus } from "react-icons/fa";

const BatchesTab = ({
  batchStockTotal,
  handleCreateBatch,
  selectedBatchProductId,
  setSelectedBatchProductId,
  products,
  batchForm,
  setBatchForm,
  creatingBatch,
  selectedBatchProduct,
  loadingBatches,
  productBatches,
}) => {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Batch Management</h2>
        <p className="text-sm text-gray-500">Total batch stock: {batchStockTotal}</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-[360px,1fr]">
        <div className="rounded-lg border bg-gray-50 p-5">
          <h3 className="mb-4 text-xl font-semibold">Add New Batch</h3>
          <form className="space-y-4" onSubmit={handleCreateBatch}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product
              </label>
              <select
                value={selectedBatchProductId}
                onChange={(e) => setSelectedBatchProductId(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                required
              >
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Batch Number
              </label>
              <input
                type="text"
                value={batchForm.batchNumber}
                onChange={(e) =>
                  setBatchForm((prev) => ({
                    ...prev,
                    batchNumber: e.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g. LOT-2026-001"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={batchForm.quantity}
                onChange={(e) =>
                  setBatchForm((prev) => ({
                    ...prev,
                    quantity: e.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Cost Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={batchForm.costPrice}
                onChange={(e) =>
                  setBatchForm((prev) => ({
                    ...prev,
                    costPrice: e.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Purchase Date
              </label>
              <input
                type="date"
                value={batchForm.purchaseDate}
                onChange={(e) =>
                  setBatchForm((prev) => ({
                    ...prev,
                    purchaseDate: e.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={batchForm.expiryDate}
                onChange={(e) =>
                  setBatchForm((prev) => ({
                    ...prev,
                    expiryDate: e.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={creatingBatch}
              className="flex items-center space-x-2 rounded bg-[#68a300] px-4 py-2 text-white hover:bg-[#5f9600] disabled:opacity-60"
            >
              <FaPlus />
              <span>{creatingBatch ? "Saving..." : "Add Batch"}</span>
            </button>
          </form>
        </div>

        <div>
          <h3 className="mb-4 text-xl font-semibold">Existing Batches</h3>
          <p className="mb-3 text-sm text-gray-600">
            Product: {selectedBatchProduct?.name || "-"}
          </p>

          {loadingBatches ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-gray-400">
              Loading batches...
            </div>
          ) : productBatches.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-gray-400">
              No batches found for selected product.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border bg-white">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Batch Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Remaining
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Cost Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Purchase Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                      Expiry Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {productBatches.map((batch) => (
                    <tr key={batch._id}>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {selectedBatchProduct?.name || "-"}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {batch.batch_number}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {Number(batch.quantity || 0)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {Number(batch.remaining_quantity || 0)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        ${Number(batch.cost_price || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {batch.purchase_date
                          ? new Date(batch.purchase_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {batch.expiry_date
                          ? new Date(batch.expiry_date).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchesTab;
