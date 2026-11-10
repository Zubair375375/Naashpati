import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";
import { selectAuthUser } from "../store/slices/authSlice";
import toast from "react-hot-toast";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { canManageWishlist } from "../utils/wishlistAuth";
import { MdStar, MdFavoriteBorder, MdVisibility } from "react-icons/md";
import { FiShoppingCart } from "react-icons/fi";

const ProductCard = ({ product, viewMode = "grid" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectAuthUser);
  const isAdmin = user?.role === "admin";
  const ratingValue = product.averageRating ?? product.rating ?? 0;
  const reviewCount = product.numReviews ?? product.reviewCount ?? 0;
  const productUrl = `/products/${product.slug || product._id}`;
  const basePrice = Number(product.price ?? product.originalPrice ?? 0);
  const salePrice = Number(product.salePrice ?? basePrice ?? 0);
  const originalPrice = Number(product.originalPrice ?? basePrice ?? 0);
  const stockCount = Number(product.stock ?? 0);
  const isOutOfStock = stockCount <= 0;
  const hasDiscount =
    Number.isFinite(basePrice) &&
    Number.isFinite(salePrice) &&
    basePrice > salePrice;
  const computedDiscountPercent = hasDiscount
    ? ((basePrice - salePrice) / basePrice) * 100
    : 0;
  const persistedSalePercentage = Number(product.salePercentage);
  const hasPersistedSalePercentage =
    Number.isFinite(persistedSalePercentage) && persistedSalePercentage > 0;
  const salePercentage = hasPersistedSalePercentage
    ? persistedSalePercentage
    : computedDiscountPercent;
  const formatSalePercentage = (value) => {
    return String(Math.round(Number(value) || 0));
  };
  const salePercentageLabel = hasPersistedSalePercentage
    ? formatSalePercentage(persistedSalePercentage)
    : Number.isFinite(salePercentage)
      ? formatSalePercentage(salePercentage)
      : "0";
  const saleBadge = hasDiscount ? (
    <span className="rounded-sm bg-[#ff3b3b] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white">
      {salePercentageLabel}% Discount
    </span>
  ) : null;
  const productImage = product.image
    ? resolveMediaUrl(product.image)
    : resolveMediaUrl(product.images?.[0]?.url || product.images?.[0]);
  const summaryText =
    product.shortDescription ||
    product.briefDescriptionPoints?.[0] ||
    product.briefDescription ||
    "";

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdmin) {
      toast.error("Admin accounts cannot add products to cart");
      return;
    }

    if (isOutOfStock) {
      toast.error("Product is out of stock");
      return;
    }

    dispatch(addToCart({ product, quantity: 1 }));
    toast.success("Added to cart!");
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canManageWishlist(Boolean(user))) {
      toast.error("Please login or register to add products to wishlist");
      navigate("/login");
      return;
    }

    toast.error("Wishlist access is available to registered users only");
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <MdStar
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-secondary-300"
        }`}
      />
    ));
  };

  if (viewMode === "list") {
    return (
      <Link
        to={productUrl}
        className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-soft sm:flex-row"
      >
        <div className="relative h-52 w-full overflow-hidden sm:h-auto sm:w-56">
          <img
            src={productImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          {hasDiscount ? (
            <div className="absolute left-2 top-2">{saleBadge}</div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-secondary-900 transition-colors duration-150 group-hover:text-blue-600">
              {product.name}
            </h3>

            <div className="mb-2 flex items-center">
              <div className="flex items-center">
                {renderStars(ratingValue)}
              </div>
              <span className="ml-2 text-sm text-secondary-600">
                ({reviewCount})
              </span>
            </div>

            <p className="mb-2 line-clamp-2 text-sm text-secondary-600">
              {summaryText}
            </p>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              {product.category ? (
                <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                  {product.category}
                </span>
              ) : null}
              <span
                className={`rounded-full px-2 py-1 font-medium ${
                  !isOutOfStock
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {!isOutOfStock ? `Stock: ${stockCount}` : "Out of stock"}
              </span>
              {hasDiscount ? (
                <span className="rounded-full bg-orange-50 px-2 py-1 font-semibold text-orange-700">
                  -{salePercentageLabel}%
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasDiscount ? (
                <span className="text-lg text-gray-400 line-through">
                  <span className="mr-1 text-xs align-super text-black-100">
                    PKR
                  </span>
                  {basePrice.toFixed(2)}
                </span>
              ) : null}
              <span className="text-lg">{salePrice.toFixed(2)}</span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdmin}
              className="bg-transparent border-0 p-0 text-black disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Add to cart"
            >
              <FiShoppingCart className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>

          {isOutOfStock && (
            <p className="mt-2 text-sm text-accent-600">Out of stock</p>
          )}
        </div>
      </Link>
    );
  }

  if (viewMode === "trending") {
    return (
      <Link
        to={productUrl}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      >
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img
            src={productImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {saleBadge}
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                !isOutOfStock
                  ? "bg-emerald-500/90 text-white"
                  : "bg-red-500/90 text-white"
              }`}
            >
              {!isOutOfStock ? `Stock: ${stockCount}` : "Out of stock"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label="Add to wishlist"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm"
          >
            <MdFavoriteBorder className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col p-4">
          {product.category ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              {product.category}
            </p>
          ) : null}
          <h3 className="mt-2 line-clamp-2 text-base font-semibold text-gray-900 transition-colors duration-150 group-hover:text-blue-600">
            {product.name}
          </h3>

          <div className="mt-3 flex items-center gap-2">
            {hasDiscount ? (
              <span className="text-lg font-semibold text-gray-400 line-through">
                {basePrice.toFixed(2)}
              </span>
            ) : null}
            <span className="text-lg font-semibold text-gray-900">
              <span className="mr-1 text-xs align-super text-black-100">
                PKR
              </span>
              {salePrice.toFixed(2)}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdmin}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#68a300] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiShoppingCart className="h-4 w-4" strokeWidth={1.8} />
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleQuickViewClick}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700"
            >
              <MdVisibility className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  if (viewMode === "compact") {
    return (
      <Link
        to={productUrl}
        className="group overflow-hidden rounded-lg bg-white shadow-soft"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={productImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          {hasDiscount ? (
            <div className="absolute left-2 top-2">{saleBadge}</div>
          ) : null}
        </div>

        <div className="p-3">
          <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-secondary-900 transition-colors duration-150 group-hover:text-blue-600">
            {product.name}
          </h3>

          <p className="mb-2 line-clamp-2 text-xs text-secondary-600">
            {summaryText}
          </p>

          <div className="mb-2 flex items-center">
            <div className="flex items-center">{renderStars(ratingValue)}</div>
            <span className="ml-1 text-xs text-secondary-600">
              ({reviewCount})
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {hasDiscount ? (
                <span className="text-sm font-medium text-gray-400 line-through">
                  {basePrice.toFixed(2)}
                </span>
              ) : null}
              <span className="text-sm font-medium">
                <span className="mr-1 text-[10px] align-super text-black-100">
                  PKR
                </span>
                {salePrice.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdmin}
              className="bg-transparent border-0 p-0 text-black disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Add to cart"
            >
              <FiShoppingCart className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>

          {isOutOfStock && (
            <p className="mt-1 text-xs text-accent-600">Out of stock</p>
          )}
        </div>
      </Link>
    );
  }

  if (viewMode === "tiny") {
    return (
      <Link
        to={productUrl}
        className="group overflow-hidden rounded-md bg-white shadow-soft"
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={productImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          {hasDiscount ? (
            <div className="absolute left-1.5 top-1.5">
              <span className="rounded-sm bg-[#ff3b3b] px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white">
                Discount {salePercentageLabel}%
              </span>
            </div>
          ) : null}
        </div>

        <div className="p-2">
          <h3 className="mb-1 line-clamp-1 text-xs font-semibold text-secondary-900 transition-colors duration-150 group-hover:text-blue-600">
            {product.name}
          </h3>

          <p className="mb-2 line-clamp-2 text-[11px] text-secondary-600">
            {summaryText}
          </p>

          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-medium">
              <span className="mr-1 text-[9px] align-super text-black-100">
                PKR
              </span>
              {salePrice.toFixed(2)}
            </span>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdmin}
              className="bg-transparent border-0 p-0 text-black disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Add to cart"
            >
              <FiShoppingCart className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={productUrl}
      className="group bg-white rounded-lg shadow-soft overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={productImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {hasDiscount ? (
          <div className="absolute left-2 top-2">{saleBadge}</div>
        ) : null}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2 transition-colors duration-150 group-hover:text-blue-600">
          {product.name}
        </h3>

        <div className="flex items-center mb-2">
          <div className="flex items-center">{renderStars(ratingValue)}</div>
          <span className="text-sm text-secondary-600 ml-2">
            ({reviewCount})
          </span>
        </div>

        <p className="text-secondary-600 text-sm mb-3 line-clamp-2">
          {summaryText}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <span className="text-lg text-gray-400 line-through">
                {basePrice.toFixed(2)}
              </span>
            ) : null}
            <span className="text-lg">
              <span className="text-xs align-super mr-1 text-black-100">
                PKR
              </span>
              {salePrice.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdmin}
            className="bg-transparent border-0 p-0 text-black disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Add to cart"
          >
            <FiShoppingCart className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>

        {isOutOfStock && (
          <p className="text-accent-600 text-sm mt-2">Out of stock</p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
