import { FaPlus, FaTrash } from "react-icons/fa";

const MEDIA_API_ORIGIN = (import.meta.env.VITE_API_URL || "/api").replace(
  /\/api\/?$/,
  "",
);

const resolveMediaUrl = (url) => {
  if (!url) return "/placeholder-product.jpg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${MEDIA_API_ORIGIN}${url}`;
  return url;
};

const SalesTab = ({
  saleOffers,
  saleOfferForm,
  setSaleOfferForm,
  saleOfferBannerPreview,
  setSaleOfferBannerFile,
  setSaleOfferBannerPreview,
  products,
  uploadingSaleOfferBanner,
  handleSaleOfferProductToggle,
  handleCreateSaleOffer,
  handleDeleteSaleOffer,
}) => {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Sales Offers</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create clickable home banners using products that already exist in
            the catalog.
          </p>
        </div>
        <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
          {saleOffers.length} offer{saleOffers.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px,1fr]">
        <div className="rounded-lg border bg-gray-50 p-5">
          <h3 className="mb-4 text-xl font-semibold">Add Sale Offer</h3>
          <form className="space-y-4" onSubmit={handleCreateSaleOffer}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sale Name
              </label>
              <input
                type="text"
                value={saleOfferForm.name}
                onChange={(e) =>
                  setSaleOfferForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="Summer Sale"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Banner
              </label>
              {saleOfferBannerPreview && (
                <img
                  src={saleOfferBannerPreview}
                  alt="Sale banner preview"
                  className="mb-3 h-32 w-full rounded-lg object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  setSaleOfferBannerFile(file);
                  const reader = new FileReader();
                  reader.onload = (event) =>
                    setSaleOfferBannerPreview(event.target.result);
                  reader.readAsDataURL(file);
                }}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={saleOfferForm.displayOrder}
                onChange={(e) =>
                  setSaleOfferForm((prev) => ({
                    ...prev,
                    displayOrder: e.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Existing Products
                </label>
                <span className="text-xs text-gray-500">
                  {saleOfferForm.productIds.length} selected
                </span>
              </div>
              <div className="max-h-72 space-y-2 overflow-y-auto rounded border bg-white p-3">
                {products.map((product) => (
                  <label
                    key={product._id}
                    className="flex cursor-pointer items-center gap-3 rounded p-2 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={saleOfferForm.productIds.includes(product._id)}
                      onChange={() => handleSaleOfferProductToggle(product._id)}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <img
                      src={resolveMediaUrl(
                        product.image ||
                          product.thumbnail ||
                          product.images?.[0]?.url ||
                          product.images?.[0],
                      )}
                      alt={product.name}
                      className="h-11 w-11 flex-none rounded border border-gray-200 object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-700">
                        {product.name}
                      </span>
                      <span className="block truncate text-xs text-gray-400">
                        {product.lenses ? "Lenses" : product.category || "Product"}
                      </span>
                    </span>
                  </label>
                ))}

                {products.length === 0 && (
                  <p className="py-6 text-center text-sm text-gray-400">
                    No products available yet.
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={uploadingSaleOfferBanner}
              className="flex items-center space-x-2 rounded bg-[#68a300] px-4 py-2 text-white hover:bg-[#5f9600] disabled:opacity-60"
            >
              <FaPlus />
              <span>
                {uploadingSaleOfferBanner ? "Uploading..." : "Add Sale Offer"}
              </span>
            </button>
          </form>
        </div>

        <div>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {saleOffers.map((offer) => (
              <div
                key={offer._id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <img
                  src={resolveMediaUrl(offer.banner)}
                  alt={offer.name}
                  className="h-44 w-full object-cover"
                />
                <div className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{offer.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Order: {offer.displayOrder || 0}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {(offer.products || []).length} product
                        {(offer.products || []).length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSaleOffer(offer._id)}
                      className="text-red-600 hover:text-red-900"
                      aria-label={`Delete ${offer.name}`}
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(offer.products || []).slice(0, 6).map((product) => (
                      <span
                        key={product._id || product}
                        className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                      >
                        {product.name || "Product"}
                      </span>
                    ))}
                    {(offer.products || []).length > 6 && (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        +{(offer.products || []).length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {saleOffers.length === 0 && (
              <div className="rounded-xl border border-dashed p-8 text-center text-gray-400 xl:col-span-2">
                No sale offers yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesTab;
