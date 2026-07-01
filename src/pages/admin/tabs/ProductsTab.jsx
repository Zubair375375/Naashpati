import { FaEdit, FaFileExcel, FaPlus, FaTrash } from "react-icons/fa";

const ProductsTab = ({
  handleOpenAddProduct,
  activeProductCategory,
  adminManageableCategories,
  activeProductCategoryName,
  onExportProducts,
  lensesProductsSection,
  setActiveProductCategory,
  visibleProducts,
  resolveMediaUrl,
  handleEditProduct,
  handleDeleteProduct,
}) => {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Product Management</h2>
          <p className="text-sm text-gray-500">
            Manage products inside the selected category tab.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenAddProduct()}
            disabled={
              activeProductCategory === "all" &&
              adminManageableCategories.length === 0
            }
            className="flex items-center space-x-2 rounded bg-[#68a300] px-4 py-2 text-white hover:bg-[#5f9600]"
          >
            <FaPlus />
            <span>
              Add{" "}
              {activeProductCategory === "all"
                ? "Product"
                : activeProductCategoryName}
            </span>
          </button>
          <button
            onClick={onExportProducts}
            className="flex items-center space-x-2 rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800"
          >
            <FaFileExcel />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div>
        {(adminManageableCategories.length > 0 ||
          activeProductCategory === lensesProductsSection) && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveProductCategory("all")}
              className={`rounded border px-3 py-2 text-sm font-medium ${
                activeProductCategory === "all"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Products
            </button>
            <button
              type="button"
              onClick={() => setActiveProductCategory(lensesProductsSection)}
              className={`rounded border px-3 py-2 text-sm font-medium ${
                activeProductCategory === lensesProductsSection
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Lenses Products
            </button>
            {adminManageableCategories.map((category) => (
              <button
                key={category._id || category.value}
                type="button"
                onClick={() => setActiveProductCategory(category.value)}
                className={`rounded border px-3 py-2 text-sm font-medium ${
                  activeProductCategory === category.value
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">{activeProductCategoryName}</h3>
            <p className="text-sm text-gray-500">
              Showing {visibleProducts.length} product
              {visibleProducts.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Cost Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {visibleProducts.map((product) => (
                <tr key={product._id}>
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex items-center">
                      <img
                        src={
                          product.image
                            ? resolveMediaUrl(product.image)
                            : resolveMediaUrl(
                                product.images?.[0]?.url || product.images?.[0],
                              )
                        }
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.lenses ? "Lens product" : "Product"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm capitalize text-gray-500">
                    {product.lenses ? "Lenses" : product.category || "Uncategorized"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                    {product.sku || "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                    ${Number(product.costPrice || 0).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                    ${product.price?.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        product.stock > 10
                          ? "bg-green-100 text-green-800"
                          : product.stock > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="whitespace-nowrap space-x-2 px-4 py-4 text-sm font-medium">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visibleProducts.length === 0 && (
            <div className="border-t p-8 text-center text-gray-400">
              No products found in this section yet.
              {activeProductCategory !== "all" && (
                <button
                  type="button"
                  onClick={() => handleOpenAddProduct(activeProductCategory)}
                  className="ml-2 font-medium text-green-700 hover:text-green-800"
                >
                  Add one now.
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsTab;
