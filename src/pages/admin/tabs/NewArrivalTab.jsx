import { FaPlus, FaTrash } from "react-icons/fa";
import { resolveMediaUrl } from "../../../utils/mediaUrl";

const NewArrivalTab = ({
  form,
  setForm,
  preview,
  setImageFile,
  products,
  items,
  handleCreateNewArrival,
  handleDeleteNewArrival,
  uploading,
}) => {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">New Arrival Section</h2>
          <p className="mt-1 text-sm text-gray-500">
            Add a custom image linked to a product for the homepage new arrival tab.
          </p>
        </div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px,1fr]">
        <div className="rounded-lg border bg-gray-50 p-5">
          <h3 className="mb-4 text-xl font-semibold">Add New Arrival</h3>
          <form className="space-y-4" onSubmit={handleCreateNewArrival}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product
              </label>
              <select
                value={form.productId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, productId: e.target.value }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Image
              </label>
              {preview && (
                <img
                  src={preview}
                  alt="New arrival preview"
                  className="mb-3 h-32 w-full rounded-lg object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImageFile(file);
                  const reader = new FileReader();
                  reader.onload = (event) =>
                    setForm((prev) => ({
                      ...prev,
                      preview: event.target?.result || "",
                    }));
                  reader.readAsDataURL(file);
                }}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Alt Text / Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="Signature Collection"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="flex items-center space-x-2 rounded bg-[#68a300] px-4 py-2 text-white hover:bg-[#5f9600] disabled:opacity-60"
            >
              <FaPlus />
              <span>{uploading ? "Uploading..." : "Add New Arrival"}</span>
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {items.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500 xl:col-span-2">
              No new arrival entries yet.
            </div>
          )}

          {items.map((item) => {
            const product = products.find((entry) => entry._id === item.productId);

            return (
              <div
                key={item._id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <img
                  src={resolveMediaUrl(item.image)}
                  alt={item.title || product?.name || "New arrival"}
                  className="h-44 w-full object-cover"
                />

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.title || product?.name || "New Arrival"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {product?.name || "Linked product"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteNewArrival(item._id)}
                      className="text-red-600 hover:text-red-900"
                      aria-label="Delete new arrival"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {product && (
                    <a
                      href={`/products/${product.slug || product._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-sm font-medium text-sky-700 hover:text-sky-900"
                    >
                      Open product
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NewArrivalTab;
