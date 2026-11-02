import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MdShield,
  MdLocalShipping,
  MdCalendarToday,
  MdMonetizationOn,
  MdAdd,
  MdRemove,
} from "react-icons/md";
import { FaSeedling } from "react-icons/fa";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  fetchCategories,
  selectCategories,
} from "../store/slices/productSlice";
import {
  fetchHeroBadges,
  selectHeroBadges,
  selectHeroGenderImages,
} from "../store/slices/heroBadgeSlice";
import {
  fetchSaleOffers,
  selectSaleOffers,
} from "../store/slices/saleOfferSlice";
import ProductCard from "../components/ProductCard";
import TrendingProducts from "../components/TrendingProducts";
import api from "../api/axios";
import { resolveMediaUrl } from "../utils/mediaUrl";

const BADGE_MARQUEE_STYLE = `
@keyframes heroBadgesMarquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.hero-badge-marquee-track {
  display: flex;
  width: max-content;
  will-change: transform;
  animation: heroBadgesMarquee 24s linear infinite;
}
`;

const LATEST_PRODUCTS_BATCH_SIZE = 4;
const LENSES_PRODUCTS_BATCH_SIZE = 4;

const HOME_FAQS = [
  {
    question: "How can I customize my lens package?",
    answer:
      "You can choose lens type, power options, and add-ons on the product details page before adding to cart.",
  },
  {
    question: "Can I reorder my previous items?",
    answer:
      "Yes. Visit your account orders page and use the reorder action to place the same items again quickly.",
  },
  {
    question: "Can I restrict access to specific products?",
    answer:
      "Selected products can be set as private or member-only through catalog settings in the admin dashboard.",
  },
  {
    question: "Does the product page show key details clearly?",
    answer:
      "Yes. Each product page includes highlights, pricing, ratings, stock, and shipping-related information.",
  },
  {
    question: "How can I contact support for order help?",
    answer:
      "Use the contact page or order support options from your account dashboard for quick assistance.",
  },
];

const Home = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const heroCertificateBadges = useSelector(selectHeroBadges);
  const heroGenderImages = useSelector(selectHeroGenderImages);
  const saleOffers = useSelector(selectSaleOffers);
  const [latestProducts, setLatestProducts] = useState([]);
  const [shopOurInstagramImages, setShopOurInstagramImages] = useState([]);
  const [newArrivalItems, setNewArrivalItems] = useState([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState("categories");
  const [visibleLatestProductCount, setVisibleLatestProductCount] = useState(
    LATEST_PRODUCTS_BATCH_SIZE,
  );
  const [latestProductsLoading, setLatestProductsLoading] = useState(false);
  const [lensesProducts, setLensesProducts] = useState([]);
  const [visibleLensesProductCount, setVisibleLensesProductCount] = useState(
    LENSES_PRODUCTS_BATCH_SIZE,
  );
  const [lensesProductsLoading, setLensesProductsLoading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [activeSaleOfferIndex, setActiveSaleOfferIndex] = useState(0);
  const categoryScrollRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || "/api";

  const femaleCollectionImage =
    resolveMediaUrl(heroGenderImages?.female) ||
    "/images/banners/hero_banner1.jpg";
  const maleCollectionImage =
    resolveMediaUrl(heroGenderImages?.male) ||
    "/images/banners/hero_banner1.jpg";

  useEffect(() => {
    dispatch(fetchCategories({ force: true }));
    dispatch(fetchHeroBadges());
    dispatch(fetchSaleOffers());
  }, [dispatch]);

  useEffect(() => {
    if (!saleOffers.length || saleOffers.length === 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveSaleOfferIndex(
        (previousIndex) => (previousIndex + 1) % saleOffers.length,
      );
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [saleOffers]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("naashpati-new-arrivals");
      setNewArrivalItems(saved ? JSON.parse(saved) : []);
    } catch {
      setNewArrivalItems([]);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchHomeSections = async () => {
      try {
        setLatestProductsLoading(true);
        setLensesProductsLoading(true);
        const [allProductsResponse, latestResponse, lensesResponse] =
          await Promise.all([
            api.get("/products?limit=100&page=1"),
            api.get("/products?newArrival=true&sort=newest&limit=100&page=1"),
            api.get("/products?lenses=true&sort=newest&limit=100&page=1"),
          ]);
        if (isMounted) {
          const allProducts = Array.isArray(allProductsResponse.data?.data)
            ? allProductsResponse.data.data
            : [];
          const galleryImages = allProducts
            .filter((product) => product?.instagramPicture)
            .map((product) => product.instagramPicture)
            .filter(Boolean);

          setLatestProducts(
            Array.isArray(latestResponse.data?.data)
              ? latestResponse.data.data
              : [],
          );
          setLensesProducts(
            Array.isArray(lensesResponse.data?.data)
              ? lensesResponse.data.data
              : [],
          );
          setShopOurInstagramImages(Array.from(new Set(galleryImages)));
          setVisibleLatestProductCount(LATEST_PRODUCTS_BATCH_SIZE);
          setVisibleLensesProductCount(LENSES_PRODUCTS_BATCH_SIZE);
        }
      } catch {
        if (isMounted) {
          setLatestProducts([]);
          setLensesProducts([]);
        }
      } finally {
        if (isMounted) {
          setLatestProductsLoading(false);
          setLensesProductsLoading(false);
        }
      }
    };

    fetchHomeSections();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleLatestProducts = latestProducts.slice(
    0,
    visibleLatestProductCount,
  );
  const canLoadMoreLatestProducts =
    visibleLatestProductCount < latestProducts.length;
  const visibleLensesProducts = lensesProducts.slice(
    0,
    visibleLensesProductCount,
  );
  const canLoadMoreLensesProducts =
    visibleLensesProductCount < lensesProducts.length;
  const filteredHomeCategories = categories.filter((category) => {
    const value = String(category.value || "")
      .trim()
      .toLowerCase();
    return value !== "male-collection" && value !== "female-collection";
  });
  const isCategoryRowCentered = filteredHomeCategories.length <= 4;

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

  return (
    <div className="min-h-screen">
      {saleOffers.length > 0 && (
        <section className="bg-white py-0">
          <div className="overflow-hidden bg-white">
            <Link
              to={`/sales/${saleOffers[activeSaleOfferIndex]?.slug || saleOffers[activeSaleOfferIndex]?._id || ""}`}
              className="group block"
              aria-label={`Open ${saleOffers[activeSaleOfferIndex]?.saleName || saleOffers[activeSaleOfferIndex]?.name || "sale offer"}`}
            >
              <div className="relative h-[220px] w-full overflow-hidden bg-white shadow-[0_2px_14px_rgba(0,0,0,0.04)] sm:h-[300px] lg:h-[86vh]">
                <img
                  key={
                    saleOffers[activeSaleOfferIndex]?._id ||
                    activeSaleOfferIndex
                  }
                  src={resolveMediaUrl(
                    saleOffers[activeSaleOfferIndex]?.banner,
                  )}
                  alt={
                    saleOffers[activeSaleOfferIndex]?.saleName ||
                    saleOffers[activeSaleOfferIndex]?.name ||
                    "Sale offer"
                  }
                  className="h-full w-full object-cover"
                  loading="lazy"
                />

                <div className="absolute inset-0 z-10 flex items-center p-5 text-left text-[#383838] sm:p-8 lg:p-12">
                  <div className="max-w-3xl">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-black/75 sm:text-base">
                      {saleOffers[activeSaleOfferIndex]?.saleName ||
                        saleOffers[activeSaleOfferIndex]?.name ||
                        "Sale Offer"}
                    </p>
                    <h3 className="text-2xl font-black uppercase tracking-[-0.06em] text-[#393939] sm:text-4xl lg:text-5xl">
                      {saleOffers[activeSaleOfferIndex]?.productName ||
                        "Featured Product"}
                    </h3>
                    {saleOffers[activeSaleOfferIndex]?.productDescription && (
                      <p className="mt-3 max-w-lg text-xl text-[#383838]/80 sm:text-[1.9rem]">
                        {saleOffers[activeSaleOfferIndex].productDescription}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link
                        to="/products?gender-category=male-collection"
                        className="inline-flex items-center justify-center rounded-full bg-[#111111] px-9 py-5 text-lg font-semibold text-white transition hover:bg-[#2a2a2a]"
                      >
                        Explore Men&apos;s
                      </Link>
                      <Link
                        to="/products?gender-category=female-collection"
                        className="inline-flex items-center justify-center rounded-full border border-[#111111]/20 bg-white/80 px-9 py-5 text-lg font-semibold text-[#111111] backdrop-blur-sm transition hover:bg-white"
                      >
                        Explore Women&apos;s
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 bg-white px-4 py-3">
            {saleOffers.map((offer, index) => (
              <span
                key={`${offer._id}-dot`}
                className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 ${
                  index === activeSaleOfferIndex
                    ? "border-[#1d1d1d] bg-[#1d1d1d]"
                    : "border-[#1d1d1d] bg-white"
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      <section className="bg-white pb-10 pt-5">
        <div className="mb-6 w-full">
          <div className="mb-0 flex items-center justify-center gap-8 sm:gap-12">
            <button
              type="button"
              onClick={() => setActiveCategoryTab("categories")}
              className={`relative pb-3 text-sm font-black uppercase tracking-[0.08em] transition sm:text-base ${
                activeCategoryTab === "categories"
                  ? "text-[#1f1f1f]"
                  : "text-[#1f1f1f]/70"
              }`}
            >
              Categories
              {activeCategoryTab === "categories" && (
                <span className="absolute -bottom-0.5 left-0 h-[3px] w-full bg-[#1f1f1f]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryTab("new-arrival")}
              className={`relative pb-3 text-sm font-black uppercase tracking-[0.08em] transition sm:text-base ${
                activeCategoryTab === "new-arrival"
                  ? "text-[#1f1f1f]"
                  : "text-[#1f1f1f]/70"
              }`}
            >
              New Arrival
              {activeCategoryTab === "new-arrival" && (
                <span className="absolute -bottom-0.5 left-0 h-[3px] w-full bg-[#1f1f1f]" />
              )}
            </button>
          </div>
          <div className="mt-2 h-px w-full bg-[#d4d4d4]" />
        </div>

        <div className="mx-auto max-w-[1700px] px-0 pt-2 sm:px-1">
          {activeCategoryTab === "categories" ? (
            <div
              className={`flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-px-2 px-2 pb-2 pt-1 sm:px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
                isCategoryRowCentered ? "justify-center" : "justify-start"
              }`}
            >
              {filteredHomeCategories.map((category) => (
                <Link
                  key={category.value}
                  to={`/products?category=${category.value}`}
                  className="group relative block h-[580px] w-[335px] shrink-0 snap-start overflow-hidden border border-[#e5e5e5] bg-[#f2f2f2] sm:w-[355px] md:w-[385px] lg:w-[395px]"
                  aria-label={`Open ${category.name}`}
                >
                  <div className="absolute inset-0">
                    {category.image ? (
                      <img
                        src={resolveMediaUrl(category.image)}
                        alt={category.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#c7d7b5] to-[#8da86d]">
                        <FaSeedling className="text-6xl text-white/80" />
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="relative flex h-full flex-col justify-end p-5 sm:p-6">
                    <div className="space-y-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                        Collection
                      </p>
                      <h3 className="text-3xl font-black tracking-[-0.06em] text-white md:text-[2.6rem]">
                        {category.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="mt-5 inline-flex w-fit items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1f1f1f] shadow-md transition hover:bg-[#f1f1f1]"
                    >
                      Shop Now
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-[1700px] px-2 pb-2 sm:px-3">
              {newArrivalItems.length > 0 ? (
                <div className="flex snap-x snap-mandatory justify-center gap-2.5 overflow-x-auto scroll-px-2 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {newArrivalItems.slice(0, 4).map((item) => {
                    const product = latestProducts.find(
                      (entry) => entry._id === item.productId,
                    );
                    const targetProduct = product || { _id: item.productId };

                    return (
                      <Link
                        key={item._id}
                        to={`/products/${targetProduct.slug || targetProduct._id}`}
                        className="group relative block h-[580px] w-[335px] shrink-0 snap-start overflow-hidden border border-[#e5e5e5] bg-[#f2f2f2] sm:w-[355px] md:w-[385px] lg:w-[395px]"
                        aria-label={item.title || "New arrival product"}
                      >
                        <div className="absolute inset-0">
                          <img
                            src={resolveMediaUrl(item.image)}
                            alt={item.title || "New arrival"}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        <div className="relative flex h-full flex-col justify-end p-5 sm:p-6">
                          <div className="space-y-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                              New Arrival
                            </p>
                            <h3 className="text-3xl font-black tracking-[-0.06em] text-white md:text-[2.6rem]">
                              {item.title ||
                                targetProduct.name ||
                                "Featured Product"}
                            </h3>
                          </div>

                          <button
                            type="button"
                            className="mt-5 inline-flex w-fit items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1f1f1f] shadow-md transition hover:bg-[#f1f1f1]"
                          >
                            Shop Now
                          </button>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : latestProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {latestProducts.slice(0, 4).map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      viewMode="trending"
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d4d4d4] bg-[#fafafa] px-6 py-10 text-center text-sm text-[#555]">
                  No new arrivals yet.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white px-5 pb-5 pt-5 sm:px-5 lg:px-6">
        <div className="mx-auto grid max-w-[1600px] items-center gap-0 overflow-hidden bg-white lg:grid-cols-[1.2fr_1fr]">
          <div className="flex h-full flex-col justify-center bg-white px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="mb-6 flex items-start justify-start">
              <span className="text-[3.2rem] font-black leading-[0.8] tracking-[-0.08em] sm:text-[4rem] lg:text-[6.4rem]">
                <span className="inline-block text-[#e10098]">C</span>
                <span className="inline-block text-[#00b5ff]">H</span>
                <span className="inline-block text-[#ffb400]">R</span>
                <span className="inline-block text-[#04c29f]">O</span>
                <span className="inline-block text-[#ff6f41]">M</span>
                <span className="inline-block text-[#6a34ff]">A</span>
                <span className="inline-block text-[#ff7f00]"> </span>
                <span className="inline-block text-black ml-5">R</span>
                <span className="inline-block text-gray-500">U</span>
                <span className="inline-block text-[#ff7f00]">S</span>
                <span className="inline-block text-[#00b3b3]">H</span>
              </span>
            </div>

            <h2 className="mb-4 text-[2.3rem] leading-[1.2] tracking-[0.04em] text-[#171717] sm:text-[1rem] lg:text-[2rem]">
              <span className="inline-block mr-3">Experience</span>
              <span className="inline-block mr-3">every</span>
              <span className="inline-block mr-3">view</span>
              <br className="mt-2" />
              <span className="inline-block mr-3">like</span>
              <span className="inline-block mr-3">never</span>
              <span className="inline-block">before</span>
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <span className="relative h-7 w-7 overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                  <span className="absolute left-[3px] top-[3px] h-3.5 w-3.5 rounded-full bg-[#00d7ff]" />
                  <span className="absolute right-[3px] top-[3px] h-3.5 w-3.5 rounded-full bg-[#ffd84d]" />
                  <span className="absolute bottom-[3px] left-[3px] h-3.5 w-3.5 rounded-full bg-[#ff4d7a]" />
                  <span className="absolute bottom-[3px] right-[3px] h-3.5 w-3.5 rounded-full bg-[#33d17a]" />
                </span>
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#1a1a1a]">
                  Advanced Color
                  <br />
                  Vision Technology
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="relative h-7 w-7 overflow-hidden rounded-full border border-[#1b1b1b] bg-[#111111] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                  <span className="absolute inset-[3px] rounded-full border border-white/10 bg-[#0b0b0b]" />
                  <span className="absolute left-[7px] top-[7px] h-3.5 w-3 rounded-[0.45rem] border border-[#2a2a2a] bg-[#dfeaf0]/90" />
                  <span className="absolute right-[7px] top-[7px] h-3.5 w-3 rounded-[0.45rem] border border-[#2a2a2a] bg-[#dfeaf0]/90" />
                  <span className="absolute left-[6px] top-[11px] h-1 w-3.5 rounded-full bg-[#1a1a1a]" />
                  <span className="absolute right-[6px] top-[11px] h-1 w-3.5 rounded-full bg-[#1a1a1a]" />
                  <span className="absolute left-1/2 top-[10px] h-2 w-1 -translate-x-1/2 rounded-full bg-[#1a1a1a]" />
                  <span className="absolute inset-1/2 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1a1a1a]" />
                </span>
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#1a1a1a]">
                  Precision Optical
                  <br />
                  Performance
                </span>
              </div>
            </div>
          </div>

          <div className="relative min-h-[360px] max-h-[360px] bg-[#dfeee9]">
            <img
              src="/assets/logos/pexels-cottonbro-8718335.jpg"
              alt="Chroma Rush experience"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <TrendingProducts />

      <section className="relative flex min-h-[300px] items-center overflow-hidden bg-[#111111] md:min-h-[340px]">
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-10 pt-8 text-white sm:px-8 lg:px-10 lg:pb-12 lg:pt-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="max-w-xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
                Style That Moves With You.
              </p>
              <h3 className="text-2xl font-black uppercase tracking-[-0.06em] text-white sm:text-4xl lg:text-5xl">
                Your Satisfaction Comes First
              </h3>
              <p className="mt-4 max-w-xl text-sm text-white/80 sm:text-base">
                Discover statement pieces, everyday staples, and
                precision-crafted eyewear designed for every look, every moment,
                and every view.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#111111] transition hover:bg-[#f3f3f3]"
                >
                  Shop Collection
                </Link>
                <Link
                  to="/products?category=eyewear"
                  className="inline-flex items-center justify-center rounded-full border border-white/60 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  Explore Frames
                </Link>
              </div>
            </div>

            <div className="lg:pt-8">
              <div className="space-y-3 rounded-2xl p-4 backdrop-blur-[2px] sm:p-5 sm:space-y-4">
                {[
                  "Free Shipping",
                  "Cash on Delivery in all Pakistan",
                  "100% Money Back Guaranteed",
                  "Quality Assured",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-white/90 sm:text-base"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15 text-[10px] text-white">
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Lenses */}
      <section className="bg-white px-6 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-center justify-between border-b border-gray-900 pb-4">
            <h2
              className="text-xl font-semibold text-gray-900"
              style={{ fontFamily: "Poppins, sans-serif, Inter, system-ui" }}
            >
              Contact Lenses
            </h2>
            <Link
              to="/products?lenses=true"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900"
            >
              View all
            </Link>
          </div>

          {lensesProductsLoading ? (
            <p className="text-center text-gray-500">
              Loading contact lenses...
            </p>
          ) : lensesProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {visibleLensesProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {canLoadMoreLensesProducts && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleLensesProductCount((count) =>
                        Math.min(
                          count + LENSES_PRODUCTS_BATCH_SIZE,
                          lensesProducts.length,
                        ),
                      )
                    }
                    className="inline-flex items-center justify-center border border-[#232323] bg-[#232323] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-white hover:text-black"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500">
              No contact lenses products yet.
            </p>
          )}
        </div>
      </section>

      {/* Certificates Strip */}
      {heroCertificateBadges.length > 0 && (
        <section className="bg-[#ffffff] py-8">
          <style>{BADGE_MARQUEE_STYLE}</style>
          <div className="flex w-full flex-col-reverse items-center gap-6 px-4 lg:flex-row lg:items-center">
            <div className="w-full rounded-2xl bg-gradient-to-r from-[#2f80ed] to-[#1f63d8] px-6 py-5 text-white lg:max-w-[34rem]">
              <h3 className="text-center text-3xl font-extrabold leading-tight lg:text-left">
                20+ Certificates
              </h3>
              <p className="mt-1 text-center text-xl font-medium lg:text-left">
                From Global Regulatory Authorities
              </p>
            </div>

            <div className="relative w-full overflow-hidden pb-2 lg:pl-2">
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-14 bg-gradient-to-r from-white via-white/90 to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-14 bg-gradient-to-l from-white via-white/90 to-transparent" />
              {(() => {
                const MIN_PER_HALF = 10;
                const repeatCount = Math.max(
                  1,
                  Math.ceil(MIN_PER_HALF / heroCertificateBadges.length),
                );
                const half = Array.from(
                  { length: heroCertificateBadges.length * repeatCount },
                  (_, i) =>
                    heroCertificateBadges[i % heroCertificateBadges.length],
                );
                const marqueeItems = [...half, ...half];
                return (
                  <div className="hero-badge-marquee-track items-start gap-5 pr-2">
                    {marqueeItems.map((badgeImage, index) => (
                      <div
                        key={`${badgeImage}-${index}`}
                        className="flex w-24 flex-col items-center"
                      >
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[#ccb8d9] bg-white shadow-sm">
                          <img
                            src={resolveMediaUrl(badgeImage)}
                            alt={`Certificate badge ${(index % heroCertificateBadges.length) + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#ffffff] px-0 py-14 sm:px-0 lg:px-0">
        <div className="mx-auto w-full max-w-[100vw]">
          <h2 className="mb-8 flex items-center justify-center gap-3 text-center text-[1.5rem] font-semibold uppercase tracking-[-0.06em] text-[#393939] sm:text-[2rem] lg:text-[2.2rem]">
            <span>SHOP OUR</span>
            <img
              src="/assets/logos/sr-IG.avif"
              alt="Instagram logo"
              className="h-[1.4em] w-auto rounded-[0.2em] object-contain"
            />
          </h2>

          {shopOurInstagramImages.length > 0 && (
            <div
              className={`grid gap-0 ${
                shopOurInstagramImages.length === 1
                  ? "grid-cols-1"
                  : shopOurInstagramImages.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-4"
              }`}
            >
              {shopOurInstagramImages.map((image, index) => {
                return (
                  <div
                    key={`${image}-${index}`}
                    className={[
                      "group relative overflow-hidden bg-white",
                      shopOurInstagramImages.length === 1
                        ? "aspect-square w-full"
                        : "aspect-square w-full",
                    ].join(" ")}
                  >
                    <img
                      src={image}
                      alt="Shop our Instagram feature"
                      loading="lazy"
                      className="h-full w-full rounded-none object-cover transition duration-300 group-hover:scale-[1.02] group-hover:brightness-[0.96]"
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/60 opacity-0 transition duration-300 group-hover:opacity-100">
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-10 w-10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.24)]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
                        <circle cx="12" cy="12" r="4.2" />
                        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white px-6 pb-16 pt-6">
        <div className="mx-auto max-w-7xl rounded-md bg-[#ffffff] px-4 py-6 sm:px-6">
          <h2
            className="mb-4 text-center text-2xl font-bold text-gray-700"
            style={{ fontFamily: "Poppins, sans-serif, Inter, system-ui" }}
          >
            FAQ
          </h2>

          <div className="divide-y divide-gray-200 bg-white">
            {HOME_FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaqIndex((current) =>
                        current === index ? -1 : index,
                      )
                    }
                    className="flex w-full items-center justify-between px-3 py-3 text-left text-sm font-bold text-gray-700 transition hover:bg-gray-50 sm:px-4"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <MdRemove className="h-5 w-5 text-[#68a300]" />
                    ) : (
                      <MdAdd className="h-5 w-5 text-gray-500" />
                    )}
                  </button>

                  <div
                    className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0">
                      <div className="border-t border-gray-100 bg-white px-3 py-3 text-xs leading-6 text-gray-600 sm:px-4 sm:text-sm">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
