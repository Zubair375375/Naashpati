import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  fetchCategories,
  fetchProducts,
  selectCategories,
  selectProducts,
  selectProductsStatus,
  selectProductsError,
} from "../store/slices/productSlice";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { resolveMediaUrl } from "../utils/mediaUrl";

const Products = ({ collectionType = "" }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const products = useSelector(selectProducts);
  const categories = useSelector(selectCategories);
  const status = useSelector(selectProductsStatus);
  const error = useSelector(selectProductsError);
  const initialCategory = searchParams.get("category") || "";
  const lensesOnly = searchParams.get("lenses") === "true";
  const menBestSellers = searchParams.has("men-best-sellers");
  const womenBestSellers = searchParams.has("women-best-sellers");
  const rawGenderCategory = String(
    searchParams.get("gender-category") ||
      searchParams.get("collection") ||
      (menBestSellers ? "male-collection" : "") ||
      (womenBestSellers ? "female-collection" : "") ||
      "",
  )
    .trim()
    .toLowerCase();
  const normalizedCollection = (() => {
    const candidate = String(collectionType || rawGenderCategory || "")
      .trim()
      .toLowerCase();
    if (candidate === "male-collection" || candidate === "male") {
      return "male";
    }
    if (candidate === "female-collection" || candidate === "female") {
      return "female";
    }
    return "";
  })();
  const viewMode = "compact";
  const categoryScrollRef = useRef(null);

  const [filters, setFilters] = useState({
    category: initialCategory,
    priceRange: "",
    search: "",
    sortBy: "name",
  });

  const GENDER_CATEGORY_VALUES = new Set([
    "male-collection",
    "female-collection",
  ]);
  const genderCategories = categories.filter((category) =>
    GENDER_CATEGORY_VALUES.has(String(category.value || "").toLowerCase()),
  );
  const regularCategories = categories.filter(
    (category) =>
      !GENDER_CATEGORY_VALUES.has(String(category.value || "").toLowerCase()),
  );
  const featuredCategories = useMemo(
    () => regularCategories.slice(0, 8),
    [regularCategories],
  );

  const scrollCategories = (direction) => {
    const element = categoryScrollRef.current;
    if (!element) {
      return;
    }

    element.scrollBy({
      left: direction * 360,
      behavior: "smooth",
    });
  };

  const isGenderRoute =
    normalizedCollection === "male" || normalizedCollection === "female";
  const STATIC_COLLECTION_BANNER_KEYS = new Set([
    "all-products",
    "male-collection",
    "female-collection",
    "lenses",
    "men-best-sellers",
    "women-best-sellers",
  ]);
  const getCollectionBannerStorageKey = (key) => {
    const normalized = String(key || "").trim();
    if (!normalized) {
      return normalized;
    }
    if (normalized.startsWith("category:")) {
      return normalized;
    }
    return STATIC_COLLECTION_BANNER_KEYS.has(normalized)
      ? normalized
      : `category:${normalized}`;
  };
  const collectionBannerStorageKey = "naashpati-collection-page-banners";
  const collectionBannerRouteKey = (() => {
    if (menBestSellers)
      return getCollectionBannerStorageKey("men-best-sellers");
    if (womenBestSellers)
      return getCollectionBannerStorageKey("women-best-sellers");
    if (lensesOnly) return getCollectionBannerStorageKey("lenses");
    if (rawGenderCategory === "male-collection")
      return getCollectionBannerStorageKey("male-collection");
    if (rawGenderCategory === "female-collection")
      return getCollectionBannerStorageKey("female-collection");
    if (initialCategory) return getCollectionBannerStorageKey(initialCategory);
    return getCollectionBannerStorageKey("all-products");
  })();
  const getCollectionPageBanner = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(collectionBannerStorageKey) || "{}",
      );
      const legacyKey = collectionBannerRouteKey.replace(/^category:/, "");
      return saved[collectionBannerRouteKey] || saved[legacyKey] || "";
    } catch {
      return "";
    }
  };
  const genericCollectionBanner = getCollectionPageBanner();
  const hasGenderCollectionBanner = Boolean(genericCollectionBanner);

  useEffect(() => {
    const fetchParams = {};

    if (menBestSellers) {
      fetchParams["men-best-sellers"] = true;
      fetchParams["gender-category"] = "male-collection";
    } else if (womenBestSellers) {
      fetchParams["women-best-sellers"] = true;
      fetchParams["gender-category"] = "female-collection";
    } else if (rawGenderCategory) {
      fetchParams["gender-category"] = rawGenderCategory;
    } else if (collectionType) {
      fetchParams["gender-category"] = `${collectionType}-collection`;
    }

    if (initialCategory) {
      fetchParams.category = initialCategory;
    }

    if (lensesOnly) {
      fetchParams.lenses = true;
    }

    dispatch(fetchProducts(fetchParams));
    dispatch(fetchCategories());
  }, [
    dispatch,
    menBestSellers,
    womenBestSellers,
    rawGenderCategory,
    collectionType,
    initialCategory,
    lensesOnly,
  ]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get("category") || "",
    }));
  }, [searchParams]);

  useEffect(() => {
    const stateSearch = location.state?.search;
    if (typeof stateSearch !== "string") {
      return;
    }

    setFilters((prev) => ({
      ...prev,
      search: stateSearch,
    }));

    navigate(location.pathname + location.search, {
      replace: true,
      state: null,
    });
  }, [location.pathname, location.search, location.state, navigate]);

  const filteredProducts = products.filter((product) => {
    const searchValue = filters.search.trim().toLowerCase();
    const matchesCategory =
      !filters.category || product.category === filters.category;
    const matchesSearch =
      !searchValue || product.name.toLowerCase().startsWith(searchValue);

    let matchesPrice = true;
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number);
      matchesPrice = max
        ? product.price >= min && product.price <= max
        : product.price >= min;
    }

    const genderText = [
      product.name,
      product.category,
      product.subcategory,
      product.brand,
      ...(Array.isArray(product.tags) ? product.tags : []),
      product.attributes?.size,
      product.attributes?.material,
      product.shortDescription,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    let matchesCollection = true;
    if (normalizedCollection) {
      if (product.productCollection) {
        const collectionValue = String(product.productCollection || "")
          .trim()
          .toLowerCase();
        matchesCollection =
          collectionValue === normalizedCollection ||
          collectionValue === "both";
      } else if (normalizedCollection === "female") {
        matchesCollection =
          /\b(female|women|woman|ladies|lady|girl|girls)\b/.test(genderText);
      } else if (normalizedCollection === "male") {
        matchesCollection = /\b(male|men|man|boys|boy|gents|gentlemen)\b/.test(
          genderText,
        );
      }
    }

    return (
      matchesCategory && matchesSearch && matchesPrice && matchesCollection
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return (b.averageRating || 0) - (a.averageRating || 0);
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleFilterChange = (key, value) => {
    if (key === "category") {
      let target = "/products";
      if (value === "male-collection" || value === "female-collection") {
        target = `/products?gender-category=${encodeURIComponent(value)}`;
        value = "";
      } else if (value) {
        target = `/products?category=${encodeURIComponent(value)}`;
      }
      navigate(target, { replace: false });
    }

    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (status === "loading") {
    return <Loader />;
  }

  if (status === "failed") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Error loading products: {error}</p>
          <button
            onClick={() => dispatch(fetchProducts())}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {hasGenderCollectionBanner && (
        <section className="w-full bg-white px-0 pb-4 pt-0">
          <div className="relative w-full overflow-hidden">
            <img
              src={genericCollectionBanner}
              alt="Collection banner"
              className="h-[220px] w-full object-cover object-center sm:h-[300px] lg:h-[420px]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-black/5 to-black/15" />
          </div>
        </section>
      )}

      <div className="px-0 py-5">
        <div className="mx-auto max-w-[1500px] px-3">
          <div className="mb-6 min-w-0">
            <div className="mb-4 rounded-lg bg-white p-5 shadow-md">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  {normalizedCollection === "female" ? (
                    <h1 className="text-lg font-bold text-gray-900">
                      Female Collection
                    </h1>
                  ) : normalizedCollection === "male" ? (
                    <h1 className="text-lg font-bold text-gray-900">
                      Male Collection
                    </h1>
                  ) : null}
                  <p className="text-gray-600 text-[12px]">
                    {sortedProducts.length} products found
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 sm:hidden">
                      Price Range
                    </label>
                    <select
                      value={filters.priceRange}
                      onChange={(e) =>
                        handleFilterChange("priceRange", e.target.value)
                      }
                      className="text-[12px] w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 sm:w-[180px]"
                    >
                      <option value="">All Prices</option>
                      <option value="0-25">$0 - $25</option>
                      <option value="25-50">$25 - $50</option>
                      <option value="50-100">$50 - $100</option>
                      <option value="100">$100+</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 sm:hidden">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value)
                      }
                      className="text-[12px] w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 sm:w-[220px]"
                    >
                      <option value="name">Name</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Rating</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>

                  <div className="hidden" aria-hidden="true" />
                </div>
              </div>
            </div>

            {sortedProducts.length > 0 ? (
              <div
                className={
                  viewMode === "list"
                    ? "space-y-4"
                    : viewMode === "compact"
                      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                      : viewMode === "tiny"
                        ? "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
                        : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                }
              >
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-[14px] text-gray-500">
                  No products found matching your criteria.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      category: "",
                      priceRange: "",
                      search: "",
                      sortBy: "name",
                    })
                  }
                  className="mt-4 border border-[#232323] bg-[#ffffff] px-4 py-2 text-[14px] text-[#232323] transition-colors duration-300 hover:border-[#232323] hover:bg-[#232323] hover:text-[#ffffff]"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
