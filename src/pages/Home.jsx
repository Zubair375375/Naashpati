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
    let isMounted = true;

    const fetchHomeSections = async () => {
      try {
        setLatestProductsLoading(true);
        setLensesProductsLoading(true);
        const [latestResponse, lensesResponse] = await Promise.all([
          api.get("/products?newArrival=true&sort=newest&limit=100&page=1"),
          api.get("/products?lenses=true&sort=newest&limit=100&page=1"),
        ]);
        if (isMounted) {
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
        <section className="bg-white px-4 py-6 sm:px-6">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5">
            {saleOffers.map((offer) => (
              <Link
                key={offer._id}
                to={`/sales/${offer.slug || offer._id}`}
                className="group block"
                aria-label={`Open ${offer.name}`}
              >
                <div className="relative h-[180px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:h-[260px] lg:h-[500px]">
                  <img
                    src={resolveMediaUrl(offer.banner)}
                    alt={offer.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.01]"
                    loading="lazy"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-white px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-left text-2xl font-bold text-[#232323]">
            Shop By Gender
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-3 md:gap-5">
            <Link
              to="/products?gender-category=male-collection"
              className="group relative block overflow-hidden rounded-xl border border-gray-200"
              aria-label="Open male collection"
            >
              <img
                src={maleCollectionImage}
                alt="Male collection"
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                    Men
                  </p>
                  <h3 className="mt-1 text-base font-bold text-white sm:text-2xl">
                    Male Collection
                  </h3>
                </div>
                <span className="rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#232323] sm:px-3 sm:text-xs">
                  Explore
                </span>
              </div>
            </Link>

            <Link
              to="/products?gender-category=female-collection"
              className="group relative block overflow-hidden rounded-xl border border-gray-200"
              aria-label="Open female collection"
            >
              <img
                src={femaleCollectionImage}
                alt="Female collection"
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                    Women
                  </p>
                  <h3 className="mt-1 text-base font-bold text-white sm:text-2xl">
                    Female Collection
                  </h3>
                </div>
                <span className="rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#232323] sm:px-3 sm:text-xs">
                  Explore
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-8">
        <div className="mx-auto max-w-7xl rounded-lg bg-white-100/80 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <div className="flex items-center justify-center gap-2 lg:justify-start">
              <MdLocalShipping className="text-4xl lg:text-5xl text-[#68a300]" />
              <h3
                style={{
                  fontFamily: "Poppins, sans-serif, Inter, system-ui",
                  fontSize: "14px",
                }}
              >
                Free Shipping
              </h3>
            </div>

            <div className="flex items-center justify-center gap-2 lg:justify-start">
              <MdCalendarToday className="text-4xl lg:text-5xl text-[#68a300]" />
              <h3
                style={{
                  fontFamily: "Poppins, sans-serif, Inter, system-ui",
                  fontSize: "14px",
                }}
              >
                Cash on Delivery in all Pakistan
              </h3>
            </div>

            <div className="flex items-center justify-center gap-2 lg:justify-start">
              <MdMonetizationOn className="text-4xl lg:text-5xl text-[#68a300]" />
              <h3
                style={{
                  fontFamily: "Poppins, sans-serif, Inter, system-ui",
                  fontSize: "14px",
                }}
              >
                100% Money Back Guaranteed
              </h3>
            </div>

            <div className="flex items-center justify-center gap-2 lg:justify-start">
              <MdShield className="text-4xl lg:text-5xl text-[#68a300]" />
              <h3
                style={{
                  fontFamily: "Poppins, sans-serif, Inter, system-ui",
                  fontSize: "14px",
                }}
              >
                Quality Assured
              </h3>
            </div>
          </div>
        </div>
      </section>
      {/* Trending Products */}
      <TrendingProducts />

      {/* Categories */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 flex items-center justify-between border-b border-gray-900 pb-4">
            <h2
              className="text-xl font-semibold text-gray-900"
              style={{ fontFamily: "Poppins, sans-serif, Inter, system-ui" }}
            >
              Shop by Category
            </h2>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => scrollCategories(-1)}
              className="absolute left-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-md transition hover:bg-white"
              aria-label="Scroll categories left"
            >
              <FaChevronLeft className="text-sm" />
            </button>

            <button
              type="button"
              onClick={() => scrollCategories(1)}
              className="absolute right-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-md transition hover:bg-white"
              aria-label="Scroll categories right"
            >
              <FaChevronRight className="text-sm" />
            </button>

            <div
              ref={categoryScrollRef}
              className="flex gap-5 overflow-x-auto px-14 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {categories
                .filter((category) => {
                  const value = String(category.value || "")
                    .trim()
                    .toLowerCase();
                  return (
                    value !== "male-collection" && value !== "female-collection"
                  );
                })
                .map((category) => (
                  <Link
                    key={category.value}
                    to={`/products?category=${category.value}`}
                    className="group min-w-[220px] shrink-0"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
                      {category.image ? (
                        <img
                          src={resolveMediaUrl(category.image)}
                          alt={category.name}
                          loading="lazy"
                          className="h-[224px] w-[224px] object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FaSeedling className="text-4xl text-[#68a300]" />
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-center text-sm font-medium text-gray-700">
                      {category.name}
                    </p>
                  </Link>
                ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center bg-[#232323] border border-[#232323] text-white px-4 py-2 text-[14px] font-semibold text-black transition hover:bg-[#ffffff] hover:text-black hover:border hover:border-[#232323]"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Collection */}
      <section className="bg-white px-6 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-center justify-between border-b border-gray-900 pb-4">
            <h2
              className="text-xl font-semibold text-gray-900"
              style={{ fontFamily: "Poppins, sans-serif, Inter, system-ui" }}
            >
              Latest Collection
            </h2>
          </div>

          {latestProductsLoading ? (
            <p className="text-center text-gray-500">
              Loading latest products...
            </p>
          ) : latestProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {visibleLatestProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {canLoadMoreLatestProducts && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleLatestProductCount((count) =>
                        Math.min(
                          count + LATEST_PRODUCTS_BATCH_SIZE,
                          latestProducts.length,
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
              No latest collection products yet.
            </p>
          )}
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
