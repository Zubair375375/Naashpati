import { FaChevronDown } from "react-icons/fa";

const AdminSidebarNav = ({
  activeTab,
  setActiveTab,
  getTabButtonClass,
  activeProductCategory,
  setActiveProductCategory,
  productCategoriesOpen,
  setProductCategoriesOpen,
  adminManageableCategories,
  lensesProductsSection,
}) => {
  return (
    <div className="h-fit rounded-lg border bg-white p-4 shadow-md">
      <h2 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Dashboard Sections
      </h2>
      <nav className="space-y-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={getTabButtonClass("overview")}
        >
          Overview
        </button>
        <button
          onClick={() => {
            if (activeTab !== "products") {
              setActiveTab("products");
              setActiveProductCategory("all");
              setProductCategoriesOpen(true);
              return;
            }

            setProductCategoriesOpen((prev) => !prev);
          }}
          className={getTabButtonClass("products")}
        >
          <span className="flex w-full items-center justify-between gap-3">
            <span>Products</span>
            <FaChevronDown
              className={`text-xs opacity-80 transition-transform ${
                productCategoriesOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>
        {productCategoriesOpen && (
          <div className="space-y-1 border-l border-gray-200 pl-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab("products");
                setActiveProductCategory("all");
              }}
              className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                activeTab === "products" && activeProductCategory === "all"
                  ? "bg-green-50 text-green-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              All Products
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("products");
                setActiveProductCategory(lensesProductsSection);
                setProductCategoriesOpen(true);
              }}
              className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                activeTab === "products" &&
                activeProductCategory === lensesProductsSection
                  ? "bg-green-50 text-green-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Lenses Products
            </button>
            {adminManageableCategories.map((category) => (
              <button
                key={category._id || category.value}
                type="button"
                onClick={() => {
                  setActiveTab("products");
                  setActiveProductCategory(category.value);
                  setProductCategoriesOpen(true);
                }}
                className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                  activeTab === "products" &&
                  activeProductCategory === category.value
                    ? "bg-green-50 text-green-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setActiveTab("orders")}
          className={getTabButtonClass("orders")}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={getTabButtonClass("users")}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={getTabButtonClass("categories")}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab("hero")}
          className={getTabButtonClass("hero")}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab("sales")}
          className={getTabButtonClass("sales")}
        >
          Sales
        </button>
        <button
          onClick={() => setActiveTab("batches")}
          className={getTabButtonClass("batches")}
        >
          Batches
        </button>
        <button
          onClick={() => setActiveTab("about-video")}
          className={getTabButtonClass("about-video")}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={getTabButtonClass("announcements")}
        >
          Announcements
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebarNav;
