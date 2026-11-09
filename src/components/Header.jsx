import { useState, useEffect, useMemo, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAuthChecked,
  selectAuthIsLoading,
  selectAuthUser,
  logoutUser,
} from "../store/slices/authSlice";
import { selectCartItemCount, resetCart } from "../store/slices/cartSlice";
import {
  createCategory,
  fetchCategories,
  selectCategories,
  selectCategoriesStatus,
} from "../store/slices/productSlice";
import { MdMenu, MdClose, MdSearch, MdKeyboardArrowDown } from "react-icons/md";
import { FiShoppingCart, FiUser } from "react-icons/fi";

const DEFAULT_CATEGORIES = [
  { name: "Male Collection", description: "" },
  { name: "Female Collection", description: "" },
];

const slugifyCategory = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const Header = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCollectionsMenuOpen, setIsCollectionsMenuOpen] = useState(false);
  const [isMobileCollectionsOpen, setIsMobileCollectionsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [shouldFocusMobileSearch, setShouldFocusMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const mobileSearchInputRef = useRef(null);
  const loginButtonRef = useRef(null);
  const loginPopupRef = useRef(null);
  const collectionsMenuRef = useRef(null);
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const categories = useSelector(selectCategories);
  const categoriesStatus = useSelector(selectCategoriesStatus);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const authChecked = useSelector(selectAuthChecked);
  const authLoading = useSelector(selectAuthIsLoading);
  const cartItemCount = useSelector(selectCartItemCount);
  const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
  const showAuthPendingState =
    !!accessToken && (!authChecked || (authLoading && !user));
  const defaultCategoriesEnsured = useRef(false);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setIsMobileCollectionsOpen(false);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen || !shouldFocusMobileSearch) return undefined;

    const focusTimer = window.setTimeout(() => {
      mobileSearchInputRef.current?.focus();
      setShouldFocusMobileSearch(false);
    }, 300);

    return () => window.clearTimeout(focusTimer);
  }, [isMobileMenuOpen, shouldFocusMobileSearch]);

  useEffect(() => {
    if (!isLoginPopupOpen) return undefined;

    const handlePointerDown = (event) => {
      const clickedInsideButton = loginButtonRef.current?.contains(
        event.target,
      );
      const clickedInsidePopup = loginPopupRef.current?.contains(event.target);

      if (!clickedInsideButton && !clickedInsidePopup) {
        setIsLoginPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isLoginPopupOpen]);

  useEffect(() => {
    if (!isCollectionsMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      const clickedInsideCollectionsMenu = collectionsMenuRef.current?.contains(
        event.target,
      );

      if (!clickedInsideCollectionsMenu) {
        setIsCollectionsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isCollectionsMenuOpen]);

  useEffect(() => {
    setIsCollectionsMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (
      !user &&
      !showAuthPendingState &&
      !location.pathname.startsWith("/login") &&
      !location.pathname.startsWith("/register")
    ) {
      setIsLoginPopupOpen(true);
    }
  }, [user, showAuthPendingState, location.pathname]);

  const avatarCandidates = useMemo(() => {
    if (!user?.avatar) return [];

    if (
      user.avatar.startsWith("http://") ||
      user.avatar.startsWith("https://")
    ) {
      return [user.avatar];
    }

    if (user.avatar.startsWith("/uploads/")) {
      const sameOrigin =
        typeof window !== "undefined"
          ? `${window.location.origin}${user.avatar}`
          : user.avatar;
      return [`${API_URL}${user.avatar}`, sameOrigin, user.avatar];
    }

    return [user.avatar];
  }, [API_URL, user?.avatar]);

  const [avatarSrcIndex, setAvatarSrcIndex] = useState(0);

  useEffect(() => {
    setAvatarSrcIndex(0);
  }, [avatarCandidates.length, user?.avatar]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (defaultCategoriesEnsured.current) {
      return;
    }

    if (categoriesStatus !== "succeeded") {
      return;
    }

    if (!user || user.role !== "admin") {
      return;
    }

    const existingValues = new Set(
      categories.map((category) => String(category.value || "").toLowerCase()),
    );
    const missingDefaults = DEFAULT_CATEGORIES.filter(
      (category) => !existingValues.has(slugifyCategory(category.name)),
    );

    if (missingDefaults.length === 0) {
      defaultCategoriesEnsured.current = true;
      return;
    }

    defaultCategoriesEnsured.current = true;
    missingDefaults.forEach((category) => {
      dispatch(createCategory(category)).catch(() => {});
    });
  }, [categories, categoriesStatus, dispatch, user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(resetCart());
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate("/products", { state: { search: q } });
    setIsMobileMenuOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (location.pathname === "/products") {
      navigate("/products", { replace: true, state: { search: "" } });
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);

    if (location.pathname !== "/products") {
      return;
    }

    navigate("/products", { replace: true, state: { search: value } });
  };

  const excludedCategoryValues = new Set(
    DEFAULT_CATEGORIES.map((category) => slugifyCategory(category.name)),
  );

  const categoryLinks = useMemo(() => {
    return categories
      .map((category) => ({
        value: String(category.value || "").toLowerCase(),
        label: category.name,
      }))
      .filter(
        (entry) => entry.value && !excludedCategoryValues.has(entry.value),
      )
      .map((entry) => ({
        to: `/products?category=${encodeURIComponent(entry.value)}`,
        label: entry.label,
      }));
  }, [categories]);

  const genderLinks = [
    {
      to: "/products?gender-category=male-collection",
      label: "Male Collection",
    },
    {
      to: "/products?gender-category=female-collection",
      label: "Female Collection",
    },
    {
      to: "/products",
      label: "Collections",
    },
  ];

  const navLinks = [
    { to: "/", label: "Home" },
    ...genderLinks,
    { to: "/customer-protection", label: "Customer Protection" },
    { to: "/contact", label: "Contact" },
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const collectionsDropdownItems = [
    { to: "/products", label: "All Collections" },
    ...categoryLinks,
  ];

  const isNavActive = (to) => {
    if (to === "/products") {
      if (location.pathname !== "/products") {
        return false;
      }

      const locationParams = new URLSearchParams(location.search);
      const hasCollectionFilter =
        locationParams.has("category") ||
        locationParams.has("gender-category") ||
        locationParams.has("collection");

      return !hasCollectionFilter;
    }

    if (to.startsWith("/products?")) {
      if (location.pathname !== "/products") {
        return false;
      }

      const locationParams = new URLSearchParams(location.search);
      const targetParams = new URLSearchParams(to.split("?")[1] || "");

      if (targetParams.has("category")) {
        const activeCategory = (
          locationParams.get("category") || ""
        ).toLowerCase();
        const targetCategory = (
          targetParams.get("category") || ""
        ).toLowerCase();
        return Boolean(activeCategory && activeCategory === targetCategory);
      }

      if (targetParams.has("gender-category")) {
        const activeGender = (
          locationParams.get("gender-category") ||
          locationParams.get("collection") ||
          ""
        ).toLowerCase();
        const targetGender = (
          targetParams.get("gender-category") || ""
        ).toLowerCase();
        return Boolean(activeGender && activeGender === targetGender);
      }
    }

    return location.pathname === to;
  };

  const renderNavItem = ({ to, label, compact = false }) => {
    const isActive = isNavActive(to);

    return (
      <NavLink
        key={`${compact ? "compact" : "default"}-${to}`}
        to={to}
        className={
          compact
            ? `text-[14px] font-medium transition-colors ${
                isActive
                  ? "text-[#68a300]"
                  : "text-gray-700 hover:text-[#68a300]"
              }`
            : `whitespace-nowrap pb-0.5 transition-colors font-medium text-[14px] ${
                isActive
                  ? "text-gray-900 border-b-4 border-[#68a300]"
                  : "text-gray-700 hover:text-[#68a300]"
              }`
        }
      >
        {label}
      </NavLink>
    );
  };

  const renderSearchForm = (className, inputRef) => (
    <form onSubmit={handleSearch} className={className}>
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-4 pr-16 text-sm outline-none focus:border-[#68a300] focus:ring-1 focus:ring-[#68a300]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            aria-label="Clear search"
          >
            <MdClose className="text-base" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#68a300]"
          aria-label="Search"
        >
          <MdSearch className="text-lg" />
        </button>
      </div>
    </form>
  );

  const mobileMenuButton = (
    <button
      type="button"
      className="flex h-10 w-10 items-center justify-center text-gray-800 md:hidden"
      onClick={() => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setIsProfileMenuOpen(false);
      }}
      aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
    >
      {isMobileMenuOpen ? (
        <MdClose className="text-2xl" />
      ) : (
        <MdMenu className="text-2xl" />
      )}
    </button>
  );

  const rightIcons = (
    <div className="flex items-center space-x-3">
      {/* <button
        type="button"
        className="flex h-8 w-8 items-center justify-center text-gray-700 md:hidden"
        onClick={() => {
          setIsMobileMenuOpen(true);
          setIsProfileMenuOpen(false);
          setShouldFocusMobileSearch(true);
        }}
        aria-label="Open search"
      >
        <MdSearch className="text-[1.8rem]" />
      </button> */}

      <Link to="/cart" className="relative z-10">
        <FiShoppingCart
          className="text-[1.55rem] text-black"
          strokeWidth={1.8}
        />
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {cartItemCount}
          </span>
        )}
      </Link>

      {showAuthPendingState ? (
        <div className="h-8 w-8 animate-pulse rounded-md bg-gray-100 md:w-20" />
      ) : user ? (
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsMobileMenuOpen(false);
            }}
            className="rounded-full border-0 bg-transparent p-1.5 hover:bg-transparent focus:outline-none focus:ring-0 focus-visible:outline-none"
          >
            {user?.avatar ? (
              <img
                src={avatarCandidates[avatarSrcIndex] || ""}
                alt={user?.name || "Profile"}
                className="h-8 w-8 rounded-full object-cover"
                onError={() => {
                  if (avatarSrcIndex < avatarCandidates.length - 1) {
                    setAvatarSrcIndex((prev) => prev + 1);
                  }
                }}
              />
            ) : (
              <FiUser className="text-[1.8rem]" />
            )}
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 z-[70] mt-2 min-w-[160px] overflow-hidden rounded-none border border-gray-200 bg-white shadow-lg">
              <Link
                to="/profile"
                onClick={() => setIsProfileMenuOpen(false)}
                className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 focus:outline-none border-0"
                style={{ boxShadow: "none" }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative hidden md:flex">
          <button
            ref={loginButtonRef}
            type="button"
            aria-label="Login options"
            onClick={() => setIsLoginPopupOpen((prev) => !prev)}
            className="flex items-center rounded-md px-2 py-1 text-left text-black transition"
          >
            <FiUser size={24} strokeWidth={2} className="text-black" />
          </button>

          {isLoginPopupOpen && (
            <div
              ref={loginPopupRef}
              className="absolute right-0 top-full z-[80] mt-2 w-48 border border-gray-200 bg-white p-3 shadow-[0_10px_24px_rgba(0,0,0,0.14)]"
            >
              <Link
                to="/login"
                onClick={() => setIsLoginPopupOpen(false)}
                className="block bg-[#68a300] px-3 py-2 text-center text-sm text-white transition hover:bg-white hover:border hover:border-[#68a300] hover:text-[#68a300]"
              >
                Sign in
              </Link>

              <p className="mt-3 text-center text-xs text-gray-700">
                New customer?{" "}
                <Link
                  to="/register"
                  onClick={() => setIsLoginPopupOpen(false)}
                  className="text-[#0055AA] underline hover:underline hover:text-gray-600"
                >
                  start here
                </Link>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-[1600px] px-4 xl:px-8">
        {/* ── Top row: logo + search + icons ── */}
        <div
          className={`relative flex h-16 items-center justify-between ${
            isProfileMenuOpen || isLoginPopupOpen
              ? "overflow-visible"
              : "overflow-visible md:overflow-hidden"
          }`}
        >
          {mobileMenuButton}

          <Link
            to="/"
            className="absolute left-1/2 flex -translate-x-1/2 items-center shrink-0 border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none md:static md:translate-x-0"
          >
            <img
              src="/assets/logos/Logo.png"
              alt="Naashpati"
              className="h-8 w-auto border-0 outline-none"
            />
          </Link>

          {renderSearchForm(
            "absolute left-1/2 hidden w-[min(42vw,520px)] -translate-x-1/2 items-center md:flex",
          )}

          <div className="ml-auto">{rightIcons}</div>
        </div>

        {/* ── Nav links row ── */}
        <div className="hidden md:block border-t border-gray-100">
          <nav className="flex h-11 items-center justify-center space-x-8">
            {navLinks.map((link) => {
              if (link.label === "Collections") {
                const isActive = isNavActive(link.to);

                return (
                  <div
                    key={link.to}
                    className="relative"
                    ref={collectionsMenuRef}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setIsCollectionsMenuOpen((prevOpen) => !prevOpen)
                      }
                      aria-expanded={isCollectionsMenuOpen}
                      aria-label="Toggle collections menu"
                      className={`whitespace-nowrap pb-0.5 transition-colors font-medium text-[14px] ${
                        isActive
                          ? "text-gray-900 border-b-4 border-[#68a300]"
                          : "text-gray-700 hover:text-[#68a300]"
                      }`}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        {link.label}
                        <MdKeyboardArrowDown
                          className={`text-base transition-transform ${
                            isCollectionsMenuOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </span>
                    </button>

                    {isCollectionsMenuOpen && (
                      <div className="absolute left-1/2 top-full z-[60] mt-2 w-56 -translate-x-1/2 border border-gray-200 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08)]">
                        {collectionsDropdownItems.map((item) => (
                          <Link
                            key={`${item.to}-${item.label}`}
                            to={item.to}
                            onClick={() => setIsCollectionsMenuOpen(false)}
                            className="block border-b border-gray-100 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 hover:text-[#68a300] last:border-b-0"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return renderNavItem(link);
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden fixed inset-0 z-[120] transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Close menu overlay"
          className="absolute inset-0 bg-black/35"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <aside
          className={`absolute left-0 top-0 flex h-full w-[82%] max-w-[340px] flex-col bg-white shadow-2xl border-r border-gray-200 transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-start border-b border-gray-100 px-4 py-4">
            <button
              type="button"
              className="rounded p-1 text-gray-700"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <MdClose className="text-xl" />
            </button>
          </div>

          <div className="border-b border-gray-100 px-4 py-4">
            {renderSearchForm("flex items-center", mobileSearchInputRef)}
          </div>

          <nav className="space-y-1 px-4 py-4">
            {navLinks.map(({ to, label }) => {
              if (label === "Collections") {
                return (
                  <div key={to}>
                    <button
                      type="button"
                      onClick={() =>
                        setIsMobileCollectionsOpen((prevOpen) => !prevOpen)
                      }
                      className={`w-full rounded px-2 py-2.5 font-medium transition-colors ${
                        isNavActive(to)
                          ? "bg-[#f2f5f3] text-gray-900"
                          : "text-gray-700 hover:bg-gray-50 hover:text-[#68a300]"
                      }`}
                      aria-expanded={isMobileCollectionsOpen}
                      aria-label="Toggle collections menu"
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span>{label}</span>
                        <MdKeyboardArrowDown
                          className={`text-lg transition-transform ${
                            isMobileCollectionsOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </span>
                    </button>

                    {isMobileCollectionsOpen && (
                      <div className="mt-1 space-y-1 pl-3">
                        {collectionsDropdownItems.map((item) => (
                          <Link
                            key={`${item.to}-${item.label}-mobile`}
                            to={item.to}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block rounded px-2 py-2 text-sm transition-colors ${
                              isNavActive(item.to)
                                ? "bg-[#f2f5f3] text-gray-900"
                                : "text-gray-600 hover:bg-gray-50 hover:text-[#68a300]"
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={() =>
                    `block rounded px-2 py-2.5 font-medium transition-colors md:text-gray-700 ${
                      isNavActive(to)
                        ? "bg-[#f2f5f3] text-gray-900 md:bg-[#f3f9e8] md:text-[#68a300]"
                        : "text-gray-700 hover:bg-gray-50 hover:text-[#68a300]"
                    }`
                  }
                >
                  {label}
                </NavLink>
              );
            })}
          </nav>

          {user ? (
            <div className="mt-auto border-t border-gray-100 px-4 py-4">
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded px-2 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#68a300]"
              >
                {user?.avatar ? (
                  <img
                    src={avatarCandidates[avatarSrcIndex] || ""}
                    alt={user?.name || "Profile"}
                    className="h-7 w-7 rounded-full object-cover"
                    onError={() => {
                      if (avatarSrcIndex < avatarCandidates.length - 1) {
                        setAvatarSrcIndex((prev) => prev + 1);
                      }
                    }}
                  />
                ) : (
                  <FiUser className="text-xl" />
                )}
                <span>Profile</span>
              </Link>
            </div>
          ) : !showAuthPendingState ? (
            <div className="mt-auto border-t border-gray-100 px-4 py-4">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Login"
                className="flex w-full items-center justify-center rounded-full border border-gray-300 bg-transparent p-3 text-black transition hover:border-[#68a300] hover:text-[#68a300]"
                style={{ width: "3.2rem", height: "3.2rem" }}
              >
                <FiUser
                  size={30}
                  strokeWidth={2.2}
                  color="black"
                  style={{ width: "2.5rem", height: "2.5rem" }}
                />
              </Link>
            </div>
          ) : null}
        </aside>
      </div>
    </header>
  );
};

export default Header;
