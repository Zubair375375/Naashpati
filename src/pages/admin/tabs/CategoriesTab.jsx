import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";

const CategoriesTab = ({
  categoryForm,
  setCategoryForm,
  categoryImagePreview,
  setCategoryImageFile,
  setCategoryImagePreview,
  uploadingCategoryImage,
  handleCreateCategory,
  adminManageableCategories,
  resolveMediaUrl,
  handleEditCategory,
  handleDeleteCategory,
}) => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px,1fr]">
        <div className="rounded-lg border bg-gray-50 p-5">
          <h2 className="mb-4 text-2xl font-semibold">Add Category</h2>
          <form className="space-y-4" onSubmit={handleCreateCategory}>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category Name
              </label>
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="e.g. Skincare"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2"
                placeholder="Optional short description for the home page"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category Image
              </label>
              {categoryImagePreview && (
                <img
                  src={categoryImagePreview}
                  alt="Preview"
                  className="mb-2 h-20 w-20 rounded-full border-2 border-[#68a300] object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setCategoryImageFile(file);
                    const reader = new FileReader();
                    reader.onload = (ev) =>
                      setCategoryImagePreview(ev.target.result);
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={uploadingCategoryImage}
              className="flex items-center space-x-2 rounded bg-[#68a300] px-4 py-2 text-white hover:bg-[#5f9600] disabled:opacity-60"
            >
              <FaPlus />
              <span>
                {uploadingCategoryImage ? "Uploading..." : "Add Category"}
              </span>
            </button>
          </form>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-semibold">Category Management</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {adminManageableCategories.map((category) => (
              <div
                key={category._id || category.value}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  {category.image ? (
                    <img
                      src={resolveMediaUrl(category.image)}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                        {category.value}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteCategory(category._id, category.value)
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {category.description || "No description yet."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesTab;
