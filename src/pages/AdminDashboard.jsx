import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectAuthChecked,
  selectAuthUser,
  selectIsAuthenticated,
} from "../store/slices/authSlice";
import {
  fetchCategories,
  fetchProducts,
  selectProducts,
  selectCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteProduct,
} from "../store/slices/productSlice";
import {
  getOrders,
  selectOrders,
  updateOrderStatus,
} from "../store/slices/orderSlice";
import { getUsers, selectAllUsers } from "../store/slices/userSlice";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
const CreateProduct = lazy(() => import("./admin/CreateProduct"));
const EditProduct = lazy(() => import("./admin/EditProduct"));

const MEDIA_API_ORIGIN = (import.meta.env.VITE_API_URL || "/api").replace(
  /\/api\/?$/,
  "",
);

// Helper to resolve image/media URLs (handles absolute and relative paths)
const resolveMediaUrl = (url) => {
  if (!url) return "/placeholder-product.jpg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${MEDIA_API_ORIGIN}${url}`;
  return url;
};
import {
  FaEye,
  FaCopy,
  FaTimes,
} from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa";
import {
  exportToExcel,
  formatProductsForExport,
  formatOrdersForExport,
  formatUsersForExport,
  formatCategoriesForExport,
} from "../utils/exportToExcel";
import {
  fetchAnnouncements,
  fetchAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  selectAllAnnouncements,
} from "../store/slices/announcementSlice";
import {
  fetchAllHeroSlides,
  createHeroSlide,
  deleteHeroSlide,
  selectAllHeroSlides,
} from "../store/slices/heroSlideSlice";
import {
  fetchHeroBadges,
  updateHeroBadges,
  updateHeroGenderImages,
  selectHeroBadges,
  selectHeroGenderImages,
} from "../store/slices/heroBadgeSlice";
import {
  fetchAllProductBanners,
  createProductBanner,
  deleteProductBanner,
  selectAllProductBanners,
} from "../store/slices/productBannerSlice";
import {
  fetchAllSaleOffers,
  createSaleOffer,
  deleteSaleOffer,
  selectAllSaleOffers,
} from "../store/slices/saleOfferSlice";
import AdminStatsCards from "./admin/components/AdminStatsCards";
import AdminSidebarNav from "./admin/components/AdminSidebarNav";
import { useAboutContent } from "./admin/hooks/useAboutContent";
import AboutContentTab from "./admin/tabs/AboutContentTab";
import SalesTab from "./admin/tabs/SalesTab";
import BatchesTab from "./admin/tabs/BatchesTab";
import HeroTab from "./admin/tabs/HeroTab";
import AnnouncementsTab from "./admin/tabs/AnnouncementsTab";
import ProductsTab from "./admin/tabs/ProductsTab";
import CategoriesTab from "./admin/tabs/CategoriesTab";

const LENSES_PRODUCTS_SECTION = "lenses-products";

const toLocalDateBoundaryIso = (dateValue, boundary) => {
  if (!dateValue) return boundary === "end" ? null : undefined;

  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return dateValue;

  const date =
    boundary === "end"
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day, 0, 0, 0, 0);

  return date.toISOString();
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authChecked = useSelector(selectAuthChecked);
  const user = useSelector(selectAuthUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const products = useSelector(selectProducts);
  const categories = useSelector(selectCategories);
  const orders = useSelector(selectOrders);
  const users = useSelector(selectAllUsers);
  const productPagination = useSelector((state) => state.products.pagination);
  const orderPagination = useSelector((state) => state.orders.pagination);
  const userPagination = useSelector((state) => state.users.pagination);
  const heroSlides = useSelector(selectAllHeroSlides);
  const heroBadgeImages = useSelector(selectHeroBadges);
  const heroGenderImages = useSelector(selectHeroGenderImages);
  const productBanners = useSelector(selectAllProductBanners);
  const saleOffers = useSelector(selectAllSaleOffers);

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [activeProductCategory, setActiveProductCategory] = useState("all");
  const [productCategoriesOpen, setProductCategoriesOpen] = useState(false);
  const [addProductCategory, setAddProductCategory] = useState("");
  const [addProductIsLenses, setAddProductIsLenses] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState(null);
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryEditForm, setCategoryEditForm] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [categoryEditImageFile, setCategoryEditImageFile] = useState(null);
  const [categoryEditImagePreview, setCategoryEditImagePreview] = useState("");
  const [savingCategoryEdit, setSavingCategoryEdit] = useState(false);
  const [productBannerForm, setProductBannerForm] = useState({
    displayOrder: 0,
  });
  const [productBannerImageFile, setProductBannerImageFile] = useState(null);
  const [productBannerImagePreview, setProductBannerImagePreview] =
    useState(null);
  const [uploadingProductBannerImage, setUploadingProductBannerImage] =
    useState(false);
  const [saleOfferForm, setSaleOfferForm] = useState({
    name: "",
    displayOrder: 0,
    productIds: [],
  });
  const [saleOfferBannerFile, setSaleOfferBannerFile] = useState(null);
  const [saleOfferBannerPreview, setSaleOfferBannerPreview] = useState(null);
  const [uploadingSaleOfferBanner, setUploadingSaleOfferBanner] =
    useState(false);
  const [heroForm, setHeroForm] = useState({
    displayOrder: 0,
  });
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState(null);
  const [heroBadgeImageFiles, setHeroBadgeImageFiles] = useState([]);
  const [heroBadgeImagePreviews, setHeroBadgeImagePreviews] = useState([]);
  const [updatingHeroBadges, setUpdatingHeroBadges] = useState(false);
  const [genderImageFiles, setGenderImageFiles] = useState({
    female: null,
    male: null,
  });
  const [genderImagePreviews, setGenderImagePreviews] = useState({
    female: "",
    male: "",
  });
  const [genderImageRemovals, setGenderImageRemovals] = useState({
    female: false,
    male: false,
  });
  const [savingGenderImages, setSavingGenderImages] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const aboutContent = useAboutContent();
  const { fetchAboutContent } = aboutContent;
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    type: "info",
    isActive: true,
    startDate: "",
    endDate: "",
  });
  const [selectedBatchProductId, setSelectedBatchProductId] = useState("");
  const [productBatches, setProductBatches] = useState([]);
  const [batchStockTotal, setBatchStockTotal] = useState(0);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [creatingBatch, setCreatingBatch] = useState(false);
  const [batchForm, setBatchForm] = useState({
    batchNumber: "",
    quantity: "",
    costPrice: "",
    purchaseDate: "",
    expiryDate: "",
  });
  const announcements = useSelector(selectAllAnnouncements);
  const API_URL = import.meta.env.VITE_API_URL || "/api";
  const adminManageableCategories = useMemo(
    () =>
      categories.filter((category) => {
        const value = String(category.value || "")
          .trim()
          .toLowerCase();
        return value !== "male-collection" && value !== "female-collection";
      }),
    [categories],
  );
  const selectedProductCategory = useMemo(
    () =>
      adminManageableCategories.find(
        (category) => category.value === activeProductCategory,
      ),
    [activeProductCategory, adminManageableCategories],
  );
  const visibleProducts = useMemo(() => {
    if (activeProductCategory === "all") {
      return products;
    }

    if (activeProductCategory === LENSES_PRODUCTS_SECTION) {
      return products.filter((product) => product.lenses);
    }

    return products.filter(
      (product) => product.category === activeProductCategory,
    );
  }, [activeProductCategory, products]);
  const activeProductCategoryName =
    activeProductCategory === LENSES_PRODUCTS_SECTION
      ? "Lenses Products"
      : selectedProductCategory?.name || "All Products";

  const getDashboardProductsFetchParams = useCallback(
    (section = activeProductCategory) => ({
      page: 1,
      limit: 200,
      includeDraft: true,
      ...(section === LENSES_PRODUCTS_SECTION ? { lenses: true } : {}),
    }),
    [activeProductCategory],
  );

  const getAuthToken = () => {
    const rawToken = localStorage.getItem("accessToken");
    return rawToken ? JSON.parse(rawToken) : null;
  };

  const fetchProductBatches = async (productId) => {
    if (!productId) {
      setProductBatches([]);
      setBatchStockTotal(0);
      return;
    }

    try {
      setLoadingBatches(true);
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/batches/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to fetch batches");
      }

      setProductBatches(
        Array.isArray(result?.data?.batches) ? result.data.batches : [],
      );
      setBatchStockTotal(Number(result?.data?.totalStock || 0));
    } catch (error) {
      setProductBatches([]);
      setBatchStockTotal(0);
      toast.error(error.message || "Failed to fetch batches");
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();

    if (!selectedBatchProductId) {
      toast.error("Please select a product first");
      return;
    }

    if (!batchForm.batchNumber.trim()) {
      toast.error("Batch number is required");
      return;
    }

    const quantity = Number(batchForm.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }

    const costPrice = Number(batchForm.costPrice);
    if (!Number.isFinite(costPrice) || costPrice < 0) {
      toast.error("Cost price must be a non-negative number");
      return;
    }

    try {
      setCreatingBatch(true);
      const token = getAuthToken();
      const payload = {
        productId: selectedBatchProductId,
        batchNumber: batchForm.batchNumber.trim(),
        quantity,
        costPrice,
        purchaseDate: batchForm.purchaseDate || new Date().toISOString(),
        expiryDate: batchForm.expiryDate || null,
      };

      const response = await fetch(`${API_URL}/batches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Failed to create batch");
      }

      toast.success("Batch added successfully");
      setBatchForm({
        batchNumber: "",
        quantity: "",
        costPrice: "",
        purchaseDate: "",
        expiryDate: "",
      });
      await fetchProductBatches(selectedBatchProductId);
      dispatch(fetchProducts({ page: 1, limit: 200, includeDraft: true }));
    } catch (error) {
      toast.error(error.message || "Failed to create batch");
    } finally {
      setCreatingBatch(false);
    }
  };

  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await dispatch(deleteProduct(productId)).unwrap();
        toast.success("Product deleted successfully");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  useEffect(() => {
    if (!authChecked) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: { from: { pathname: "/admin" } },
      });
      return;
    }

    if (user?.role !== "admin") {
      navigate("/", { replace: true });
      toast.error("Access denied. Admin privileges required.");
      return;
    }
  }, [authChecked, isAuthenticated, navigate, user]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      // Prefetch core dashboard datasets so overview and stat cards are accurate immediately.
      dispatch(fetchProducts({ page: 1, limit: 200, includeDraft: true }));
      dispatch(fetchCategories());
      dispatch(getOrders({ page: 1, limit: 200 }));
      dispatch(getUsers({ page: 1, limit: 200 }));
      dispatch(fetchAllAnnouncements());
      dispatch(fetchAllHeroSlides());
      dispatch(fetchAllProductBanners());
      dispatch(fetchAllSaleOffers());
      fetchAboutContent();
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    if (!(isAuthenticated && user?.role === "admin")) return;

    if (activeTab === "products") {
      dispatch(fetchProducts(getDashboardProductsFetchParams()));
      dispatch(fetchAllProductBanners());
    } else if (activeTab === "categories") {
      dispatch(fetchCategories());
    } else if (activeTab === "orders") {
      dispatch(getOrders({ page: 1, limit: 200 }));
    } else if (activeTab === "users") {
      dispatch(getUsers({ page: 1, limit: 200 }));
    } else if (activeTab === "announcements") {
      dispatch(fetchAllAnnouncements());
    } else if (activeTab === "hero") {
      dispatch(fetchAllHeroSlides());
      dispatch(fetchHeroBadges());
    } else if (activeTab === "sales") {
      dispatch(
        fetchProducts({
          page: 1,
          limit: 200,
          includeDraft: true,
          lenses: "all",
        }),
      );
      dispatch(fetchAllSaleOffers());
    } else if (activeTab === "batches") {
      dispatch(fetchProducts({ page: 1, limit: 200, includeDraft: true }));
    } else if (activeTab === "about-video") {
      fetchAboutContent();
    }
  }, [
    activeTab,
    dispatch,
    getDashboardProductsFetchParams,
    isAuthenticated,
    user,
  ]);

  useEffect(() => {
    if (
      activeProductCategory === "all" ||
      activeProductCategory === LENSES_PRODUCTS_SECTION
    ) {
      return;
    }

    const categoryExists = adminManageableCategories.some(
      (category) => category.value === activeProductCategory,
    );

    if (!categoryExists) {
      setActiveProductCategory("all");
    }
  }, [activeProductCategory, adminManageableCategories]);

  useEffect(() => {
    if (activeTab !== "batches") return;
    if (!products.length) return;

    const productId = selectedBatchProductId || products[0]?._id;
    if (!productId) return;

    if (!selectedBatchProductId) {
      setSelectedBatchProductId(productId);
    }

    fetchProductBatches(productId);
  }, [activeTab, products, selectedBatchProductId]);




  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await dispatch(deleteProduct(productId)).unwrap();
        toast.success("Product deleted successfully");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowEditProductModal(true);
  };

  const handleOpenAddProduct = (categoryValue = activeProductCategory) => {
    const isLensesSection = categoryValue === LENSES_PRODUCTS_SECTION;
    const categoryForForm =
      categoryValue && categoryValue !== "all" && !isLensesSection
        ? categoryValue
        : adminManageableCategories[0]?.value || "";

    setAddProductCategory(isLensesSection ? "" : categoryForForm);
    setAddProductIsLenses(isLensesSection);
    setShowAddProductModal(true);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      let imageUrl = "";
      if (categoryImageFile) {
        setUploadingCategoryImage(true);
        const formDataUpload = new FormData();
        formDataUpload.append("image", categoryImageFile);
        const rawToken = localStorage.getItem("accessToken");
        const token = rawToken ? JSON.parse(rawToken) : null;
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "/api"}/upload`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formDataUpload,
            credentials: "include",
          },
        );
        if (!response.ok) throw new Error("Failed to upload image");
        const result = await response.json();
        imageUrl = result.data.url;
        setUploadingCategoryImage(false);
      }
      const createdCategory = await dispatch(
        createCategory({ ...categoryForm, image: imageUrl }),
      ).unwrap();
      setCategoryForm({ name: "", description: "" });
      setCategoryImageFile(null);
      setCategoryImagePreview(null);
      setActiveProductCategory(createdCategory.value);
      setProductCategoriesOpen(true);
      toast.success(`${createdCategory.name} created successfully`);
    } catch (error) {
      setUploadingCategoryImage(false);
      toast.error(error || "Failed to create category");
      toast.error(
        error?.message || String(error) || "Failed to create category",
      );
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Delete this category?")) {
      return;
    }

    try {
      await dispatch(deleteCategory(categoryId)).unwrap();
      toast.success("Category deleted successfully");
    } catch (error) {
      toast.error(error || "Failed to delete category");
      toast.error(
        error?.message || String(error) || "Failed to delete category",
      );
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryEditForm({
      name: category?.name || "",
      description: category?.description || "",
      image: category?.image || "",
    });
    setCategoryEditImageFile(null);
    setCategoryEditImagePreview("");
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!editingCategory?._id) {
      return;
    }

    if (!categoryEditForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSavingCategoryEdit(true);
      let imageUrl = categoryEditForm.image || "";

      if (categoryEditImageFile) {
        imageUrl = await uploadDashboardImage(categoryEditImageFile);
      }

      await dispatch(
        updateCategory({
          id: editingCategory._id,
          data: {
            name: categoryEditForm.name.trim(),
            description: categoryEditForm.description.trim(),
            image: imageUrl,
          },
        }),
      ).unwrap();

      setEditingCategory(null);
      setCategoryEditForm({ name: "", description: "", image: "" });
      setCategoryEditImageFile(null);
      setCategoryEditImagePreview("");
      toast.success("Category updated successfully");
    } catch (error) {
      toast.error(
        error?.message || String(error) || "Failed to update category",
      );
    } finally {
      setSavingCategoryEdit(false);
    }
  };

  const handleCreateHeroSlide = async (e) => {
    e.preventDefault();

    if (!heroImageFile) {
      toast.error("Hero image is required");
      return;
    }

    try {
      setUploadingHeroImage(true);
      const imageUrl = await uploadDashboardImage(heroImageFile);

      await dispatch(
        createHeroSlide({
          image: imageUrl,
          displayOrder: Number(heroForm.displayOrder || 0),
        }),
      ).unwrap();
      setHeroForm({ displayOrder: 0 });
      setHeroImageFile(null);
      setHeroImagePreview(null);
      toast.success("Hero slide created successfully");
    } catch (error) {
      toast.error(error || "Failed to create hero slide");
      toast.error(
        error?.message || String(error) || "Failed to create hero slide",
      );
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const handleCreateProductBanner = async (e) => {
    e.preventDefault();

    if (!productBannerImageFile) {
      toast.error("Banner image is required");
      return;
    }

    try {
      setUploadingProductBannerImage(true);
      const imageUrl = await uploadDashboardImage(productBannerImageFile);
      await dispatch(
        createProductBanner({
          image: imageUrl,
          displayOrder: Number(productBannerForm.displayOrder || 0),
        }),
      ).unwrap();
      setProductBannerForm({ displayOrder: 0 });
      setProductBannerImageFile(null);
      setProductBannerImagePreview(null);
      toast.success("Products banner created successfully");
    } catch (error) {
      toast.error(error || "Failed to create products banner");
    } finally {
      setUploadingProductBannerImage(false);
    }
  };

  const handleDeleteProductBanner = async (bannerId) => {
    if (!window.confirm("Delete this products banner?")) {
      return;
    }

    try {
      await dispatch(deleteProductBanner(bannerId)).unwrap();
      toast.success("Products banner deleted successfully");
    } catch (error) {
      toast.error(error || "Failed to delete products banner");
    }
  };

  const handleSaleOfferProductToggle = (productId) => {
    setSaleOfferForm((prev) => {
      const selected = new Set(prev.productIds);
      if (selected.has(productId)) {
        selected.delete(productId);
      } else {
        selected.add(productId);
      }

      return {
        ...prev,
        productIds: Array.from(selected),
      };
    });
  };

  const handleCreateSaleOffer = async (e) => {
    e.preventDefault();

    if (!saleOfferForm.name.trim()) {
      toast.error("Sale name is required");
      return;
    }

    if (!saleOfferBannerFile) {
      toast.error("Sale banner is required");
      return;
    }

    if (saleOfferForm.productIds.length === 0) {
      toast.error("Please select at least one existing product for this sale");
      return;
    }

    try {
      setUploadingSaleOfferBanner(true);
      const bannerUrl = await uploadDashboardImage(saleOfferBannerFile);
      await dispatch(
        createSaleOffer({
          name: saleOfferForm.name.trim(),
          banner: bannerUrl,
          products: saleOfferForm.productIds,
          displayOrder: Number(saleOfferForm.displayOrder || 0),
        }),
      ).unwrap();

      setSaleOfferForm({ name: "", displayOrder: 0, productIds: [] });
      setSaleOfferBannerFile(null);
      setSaleOfferBannerPreview(null);
      toast.success("Sale offer created successfully");
    } catch (error) {
      toast.error(error || "Failed to create sale offer");
    } finally {
      setUploadingSaleOfferBanner(false);
    }
  };

  const handleDeleteSaleOffer = async (offerId) => {
    if (!window.confirm("Delete this sale offer?")) {
      return;
    }

    try {
      await dispatch(deleteSaleOffer(offerId)).unwrap();
      toast.success("Sale offer deleted successfully");
    } catch (error) {
      toast.error(error || "Failed to delete sale offer");
    }
  };

  const handleDeleteHeroSlide = async (slideId) => {
    if (!window.confirm("Delete this hero slide?")) {
      return;
    }

    try {
      await dispatch(deleteHeroSlide(slideId)).unwrap();
      toast.success("Hero slide deleted successfully");
    } catch (error) {
      toast.error(error || "Failed to delete hero slide");
    }
  };

  const handleHeroBadgeImageSelection = (files) => {
    if (!files?.length) {
      return;
    }

    const maxNew = Math.max(0, 20 - heroBadgeImages.length);
    const selectedFiles = Array.from(files).slice(0, maxNew);

    if (selectedFiles.length < files.length) {
      toast.error("Maximum 20 certificate badges are allowed");
    }

    if (!selectedFiles.length) {
      return;
    }

    setHeroBadgeImageFiles(selectedFiles);
    setHeroBadgeImagePreviews([]);

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setHeroBadgeImagePreviews((prev) => [
          ...prev,
          event.target?.result || "",
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePendingHeroBadge = (index) => {
    setHeroBadgeImageFiles((prev) => prev.filter((_, i) => i !== index));
    setHeroBadgeImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveHeroBadges = async (e) => {
    e.preventDefault();

    if (!heroBadgeImageFiles.length) {
      toast.error("Please select at least one badge image");
      return;
    }

    try {
      setUpdatingHeroBadges(true);

      const uploadedBadgeImages = [];
      for (const file of heroBadgeImageFiles) {
        const uploadedUrl = await uploadDashboardImage(file);
        uploadedBadgeImages.push(uploadedUrl);
      }

      const mergedBadges = [...heroBadgeImages, ...uploadedBadgeImages].slice(
        0,
        20,
      );

      await dispatch(updateHeroBadges(mergedBadges)).unwrap();

      setHeroBadgeImageFiles([]);
      setHeroBadgeImagePreviews([]);
      toast.success("Hero certificate badges updated successfully");
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to update hero certificate badges",
      );
    } finally {
      setUpdatingHeroBadges(false);
    }
  };

  const handleRemoveSavedHeroBadge = async (index) => {
    const updated = heroBadgeImages.filter((_, i) => i !== index);

    try {
      await dispatch(updateHeroBadges(updated)).unwrap();
      toast.success("Badge removed");
    } catch {
      toast.error("Failed to remove badge");
    }
  };

  const handleGenderImageChange = (key, file) => {
    if (!file) {
      return;
    }

    setGenderImageFiles((prev) => ({
      ...prev,
      [key]: file,
    }));
    setGenderImageRemovals((prev) => ({
      ...prev,
      [key]: false,
    }));

    const reader = new FileReader();
    reader.onload = (event) => {
      setGenderImagePreviews((prev) => ({
        ...prev,
        [key]: event.target?.result || "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveGenderImage = (key) => {
    setGenderImageFiles((prev) => ({
      ...prev,
      [key]: null,
    }));
    setGenderImagePreviews((prev) => ({
      ...prev,
      [key]: "",
    }));
    setGenderImageRemovals((prev) => ({
      ...prev,
      [key]: true,
    }));
  };

  const handleSaveGenderImages = async (e) => {
    e.preventDefault();

    const updates = {};

    if (genderImageRemovals.female) {
      updates.female = "";
    }

    if (genderImageRemovals.male) {
      updates.male = "";
    }

    try {
      if (genderImageFiles.female) {
        updates.female = await uploadDashboardImage(genderImageFiles.female);
      }

      if (genderImageFiles.male) {
        updates.male = await uploadDashboardImage(genderImageFiles.male);
      }

      if (!Object.keys(updates).length) {
        toast.error("Select or clear at least one gender image");
        return;
      }

      setSavingGenderImages(true);
      await dispatch(updateHeroGenderImages(updates)).unwrap();
      setGenderImageFiles({ female: null, male: null });
      setGenderImagePreviews({ female: "", male: "" });
      setGenderImageRemovals({ female: false, male: false });
      toast.success("Shop by gender images updated successfully");
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Failed to update gender images",
      );
    } finally {
      setSavingGenderImages(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await dispatch(
        updateOrderStatus({ id: orderId, status: newStatus }),
      ).unwrap();
      toast.success("Order status updated");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleOpenCreateAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: "",
      message: "",
      type: "info",
      isActive: true,
      startDate: "",
      endDate: "",
    });
    setShowAnnouncementModal(true);
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      isActive: announcement.isActive,
      startDate: announcement.startDate ? announcement.startDate.slice(0, 10) : "",
      endDate: announcement.endDate ? announcement.endDate.slice(0, 10) : "",
    });
    setShowAnnouncementModal(true);
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm("Delete this announcement?")) {
      return;
    }

    try {
      await dispatch(deleteAnnouncement(announcementId)).unwrap();
      dispatch(fetchAnnouncements());
      toast.success("Announcement deleted");
    } catch {
      toast.error("Failed to delete announcement");
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTabButtonClass = (tab) =>
    `w-full rounded-md border px-3 py-2 text-left text-sm font-medium transition ${
      activeTab === tab
        ? "border-green-200 bg-green-50 text-green-700"
        : "border-transparent text-gray-600 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900"
    }`;

  const formatOrderDisplayId = (orderId) => {
    if (!orderId) return "#--------";
    return `#${String(orderId).slice(-8).toUpperCase()}`;
  };

  const handleCopyOrderId = async (orderId) => {
    if (!orderId) {
      toast.error("Order ID not available");
      return;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(orderId);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = orderId;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      toast.success("Full order ID copied");
    } catch {
      toast.error("Failed to copy order ID");
    }
  };

  const handleExportProducts = () =>
    exportToExcel(
      [
        {
          name: activeProductCategoryName,
          data: formatProductsForExport(visibleProducts),
        },
      ],
      "products.xlsx",
    ).catch(() => toast.error("Export failed"));

  // Calculate dashboard stats
  const totalRevenue = useMemo(
    () =>
      orders.reduce(
        (sum, order) => sum + Number(order.totalPrice ?? order.total ?? 0),
        0,
      ),
    [orders],
  );
  const totalOrders = orderPagination?.total || orders?.length || 0;
  const totalProducts = productPagination?.total || products?.length || 0;
  const totalUsers = userPagination?.total || users?.length || 0;
  const selectedBatchProduct = useMemo(
    () => products.find((product) => product._id === selectedBatchProductId),
    [products, selectedBatchProductId],
  );
  if (!authChecked || !isAuthenticated || user?.role !== "admin") {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">Manage your e-commerce platform</p>
      </div>

      <AdminStatsCards
        totalRevenue={totalRevenue}
        totalOrders={totalOrders}
        totalProducts={totalProducts}
        totalUsers={totalUsers}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px,1fr]">
        <AdminSidebarNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          getTabButtonClass={getTabButtonClass}
          activeProductCategory={activeProductCategory}
          setActiveProductCategory={setActiveProductCategory}
          productCategoriesOpen={productCategoriesOpen}
          setProductCategoriesOpen={setProductCategoriesOpen}
          adminManageableCategories={adminManageableCategories}
          lensesProductsSection={LENSES_PRODUCTS_SECTION}
        />

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6">
                Dashboard Overview
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between p-4 border rounded"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium" title={order._id}>
                              Order {formatOrderDisplayId(order._id)}
                            </p>
                            <button
                              type="button"
                              title="Copy full order ID"
                              onClick={() => handleCopyOrderId(order._id)}
                              className="text-gray-400 transition hover:text-gray-700"
                            >
                              <FaCopy className="text-xs" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">
                            {order.user?.name} - $
                            {Number(
                              order.totalPrice ?? order.total ?? 0,
                            ).toFixed(2)}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${getOrderStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Products */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Low Stock Alert
                  </h3>
                  <div className="space-y-4">
                    {products
                      .filter((product) => product.stock < 10)
                      .slice(0, 5)
                      .map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between p-4 border rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                product.image
                                  ? resolveMediaUrl(product.image)
                                  : resolveMediaUrl(
                                      product.images?.[0]?.url ||
                                        product.images?.[0],
                                    )
                              }
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-red-600">
                                Only {product.stock} left
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <ProductsTab
              handleOpenAddProduct={handleOpenAddProduct}
              activeProductCategory={activeProductCategory}
              adminManageableCategories={adminManageableCategories}
              activeProductCategoryName={activeProductCategoryName}
              onExportProducts={handleExportProducts}
              lensesProductsSection={LENSES_PRODUCTS_SECTION}
              setActiveProductCategory={setActiveProductCategory}
              visibleProducts={visibleProducts}
              resolveMediaUrl={resolveMediaUrl}
              handleEditProduct={handleEditProduct}
              handleDeleteProduct={handleDeleteProduct}
            />
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <CategoriesTab
              categoryForm={categoryForm}
              setCategoryForm={setCategoryForm}
              categoryImagePreview={categoryImagePreview}
              setCategoryImageFile={setCategoryImageFile}
              setCategoryImagePreview={setCategoryImagePreview}
              uploadingCategoryImage={uploadingCategoryImage}
              handleCreateCategory={handleCreateCategory}
              adminManageableCategories={adminManageableCategories}
              resolveMediaUrl={resolveMediaUrl}
              handleEditCategory={handleEditCategory}
              handleDeleteCategory={handleDeleteCategory}
            />
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Order Management</h2>
                <button
                  onClick={() =>
                    exportToExcel(
                      [{ name: "Orders", data: formatOrdersForExport(orders) }],
                      "orders.xlsx",
                    ).catch(() => toast.error("Export failed"))
                  }
                  className="flex items-center space-x-2 rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800"
                >
                  <FaFileExcel />
                  <span>Export</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Order ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Customer Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <span title={order._id}>
                              {formatOrderDisplayId(order._id)}
                            </span>
                            <button
                              type="button"
                              title="Copy full order ID"
                              onClick={() => handleCopyOrderId(order._id)}
                              className="text-gray-400 transition hover:text-gray-700"
                            >
                              <FaCopy className="text-xs" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.user?.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.user?._id ? "User" : "Guest Customer"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          Rs.{" "}
                          {Number(order.totalPrice ?? order.total ?? 0).toFixed(
                            2,
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order._id, e.target.value)
                            }
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() =>
                              navigate(`/admin/orders/${order._id}`)
                            }
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">User Management</h2>
                <button
                  onClick={() =>
                    exportToExcel(
                      [{ name: "Users", data: formatUsersForExport(users) }],
                      "users.xlsx",
                    ).catch(() => toast.error("Export failed"))
                  }
                  className="flex items-center space-x-2 rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800"
                >
                  <FaFileExcel />
                  <span>Export</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((userData) => (
                      <tr key={userData._id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {userData.name}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userData.email}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              userData.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {userData.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(userData.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/users/${userData._id}`)
                            }
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Hero Tab */}
          {activeTab === "hero" && (
            <HeroTab
              handleCreateHeroSlide={handleCreateHeroSlide}
              heroImagePreview={heroImagePreview}
              setHeroImageFile={setHeroImageFile}
              setHeroImagePreview={setHeroImagePreview}
              heroForm={heroForm}
              setHeroForm={setHeroForm}
              uploadingHeroImage={uploadingHeroImage}
              heroBadgeImages={heroBadgeImages}
              handleRemoveSavedHeroBadge={handleRemoveSavedHeroBadge}
              handleSaveHeroBadges={handleSaveHeroBadges}
              handleHeroBadgeImageSelection={handleHeroBadgeImageSelection}
              heroBadgeImagePreviews={heroBadgeImagePreviews}
              handleRemovePendingHeroBadge={handleRemovePendingHeroBadge}
              updatingHeroBadges={updatingHeroBadges}
              handleSaveGenderImages={handleSaveGenderImages}
              genderImagePreviews={genderImagePreviews}
              heroGenderImages={heroGenderImages}
              handleGenderImageChange={handleGenderImageChange}
              handleRemoveGenderImage={handleRemoveGenderImage}
              savingGenderImages={savingGenderImages}
              heroSlides={heroSlides}
              handleDeleteHeroSlide={handleDeleteHeroSlide}
            />
          )}

          {/* Sales Tab */}
          {activeTab === "sales" && (
            <SalesTab
              saleOffers={saleOffers}
              saleOfferForm={saleOfferForm}
              setSaleOfferForm={setSaleOfferForm}
              saleOfferBannerPreview={saleOfferBannerPreview}
              setSaleOfferBannerFile={setSaleOfferBannerFile}
              setSaleOfferBannerPreview={setSaleOfferBannerPreview}
              products={products}
              uploadingSaleOfferBanner={uploadingSaleOfferBanner}
              handleSaleOfferProductToggle={handleSaleOfferProductToggle}
              handleCreateSaleOffer={handleCreateSaleOffer}
              handleDeleteSaleOffer={handleDeleteSaleOffer}
            />
          )}

          {/* Batches Tab */}
          {activeTab === "batches" && (
            <BatchesTab
              batchStockTotal={batchStockTotal}
              handleCreateBatch={handleCreateBatch}
              selectedBatchProductId={selectedBatchProductId}
              setSelectedBatchProductId={setSelectedBatchProductId}
              products={products}
              batchForm={batchForm}
              setBatchForm={setBatchForm}
              creatingBatch={creatingBatch}
              selectedBatchProduct={selectedBatchProduct}
              loadingBatches={loadingBatches}
              productBatches={productBatches}
            />
          )}

          {/* About Video Tab */}
          {activeTab === "about-video" && <AboutContentTab {...aboutContent} />}

          {/* Announcements Tab */}
          {activeTab === "announcements" && (
            <AnnouncementsTab
              announcements={announcements}
              handleOpenCreateAnnouncement={handleOpenCreateAnnouncement}
              handleEditAnnouncement={handleEditAnnouncement}
              handleDeleteAnnouncement={handleDeleteAnnouncement}
            />
          )}
        </div>
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
              </h2>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <form
              className="p-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const payload = {
                    ...announcementForm,
                    startDate: toLocalDateBoundaryIso(
                      announcementForm.startDate,
                      "start",
                    ),
                    endDate: toLocalDateBoundaryIso(
                      announcementForm.endDate,
                      "end",
                    ),
                  };
                  if (editingAnnouncement) {
                    await dispatch(
                      updateAnnouncement({
                        id: editingAnnouncement._id,
                        data: payload,
                      }),
                    ).unwrap();
                    toast.success("Announcement updated");
                  } else {
                    await dispatch(createAnnouncement(payload)).unwrap();
                    toast.success("Announcement created");
                  }
                  setShowAnnouncementModal(false);
                  dispatch(fetchAllAnnouncements());
                  dispatch(fetchAnnouncements());
                } catch {
                  toast.error("Failed to save announcement");
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={announcementForm.title}
                  onChange={(e) =>
                    setAnnouncementForm((f) => ({
                      ...f,
                      title: e.target.value,
                    }))
                  }
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#68a300]"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  required
                  value={announcementForm.message}
                  onChange={(e) =>
                    setAnnouncementForm((f) => ({
                      ...f,
                      message: e.target.value,
                    }))
                  }
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#68a300]"
                  rows={3}
                  maxLength={500}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={announcementForm.type}
                    onChange={(e) =>
                      setAnnouncementForm((f) => ({
                        ...f,
                        type: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#68a300]"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="promo">Promo</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcementForm.isActive}
                      onChange={(e) =>
                        setAnnouncementForm((f) => ({
                          ...f,
                          isActive: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-[#68a300]"
                    />
                    Active
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={announcementForm.startDate}
                    onChange={(e) =>
                      setAnnouncementForm((f) => ({
                        ...f,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#68a300]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={announcementForm.endDate}
                    onChange={(e) =>
                      setAnnouncementForm((f) => ({
                        ...f,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#68a300]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-[#68a300] text-white rounded hover:bg-[#5f9600]"
                >
                  {editingAnnouncement ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Product
              </h2>
              <button
                onClick={() => {
                  setShowAddProductModal(false);
                  setAddProductCategory("");
                  setAddProductIsLenses(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <Suspense fallback={<Loader />}>
                <CreateProduct
                  key={
                    addProductIsLenses
                      ? LENSES_PRODUCTS_SECTION
                      : addProductCategory || "new-product"
                  }
                  initialCategory={addProductCategory}
                  initialLenses={addProductIsLenses}
                  onClose={() => {
                    setShowAddProductModal(false);
                    setAddProductCategory("");
                    setAddProductIsLenses(false);
                  }}
                  onSuccess={() => {
                    setShowAddProductModal(false);
                    setAddProductCategory("");
                    setAddProductIsLenses(false);
                    dispatch(
                      fetchProducts(
                        getDashboardProductsFetchParams(activeProductCategory),
                      ),
                    ); // Refresh products list
                  }}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Product
              </h2>
              <button
                onClick={() => {
                  setShowEditProductModal(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <Suspense fallback={<Loader />}>
                <EditProduct
                  product={editingProduct}
                  onClose={() => {
                    setShowEditProductModal(false);
                    setEditingProduct(null);
                  }}
                  onSuccess={() => {
                    setShowEditProductModal(false);
                    setEditingProduct(null);
                    dispatch(
                      fetchProducts(
                        getDashboardProductsFetchParams(activeProductCategory),
                      ),
                    ); // Refresh products list
                  }}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Category
              </h2>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <form className="space-y-4 p-6" onSubmit={handleUpdateCategory}>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryEditForm.name}
                  onChange={(e) =>
                    setCategoryEditForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g. Skincare"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={categoryEditForm.description}
                  onChange={(e) =>
                    setCategoryEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Optional short description for the home page"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category Image
                </label>
                {(categoryEditImagePreview || categoryEditForm.image) && (
                  <img
                    src={
                      categoryEditImagePreview ||
                      resolveMediaUrl(categoryEditForm.image)
                    }
                    alt="Preview"
                    className="mb-3 h-32 w-full rounded-lg object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setCategoryEditImageFile(file);
                      const reader = new FileReader();
                      reader.onload = (ev) =>
                        setCategoryEditImagePreview(ev.target.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCategoryEdit}
                  className="rounded bg-[#68a300] px-4 py-2 text-sm text-white hover:bg-[#5f9600] disabled:opacity-60"
                >
                  {savingCategoryEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
