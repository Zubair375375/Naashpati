import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser, setAuthChecked } from "./store/slices/authSlice";
import Layout from "./components/Layout";
import Loader from "./components/Loader";
import { lazyWithRetry } from "./utils/lazyWithRetry";

const Home = lazyWithRetry(() => import("./pages/Home"), "Home");
const Products = lazyWithRetry(() => import("./pages/Products"), "Products");
const ProductDetail = lazyWithRetry(
  () => import("./pages/ProductDetail"),
  "ProductDetail",
);
const SaleOffer = lazyWithRetry(() => import("./pages/SaleOffer"), "SaleOffer");
const Cart = lazyWithRetry(() => import("./pages/Cart"), "Cart");
const Checkout = lazyWithRetry(() => import("./pages/Checkout"), "Checkout");
const Login = lazyWithRetry(() => import("./pages/Login"), "Login");
const Register = lazyWithRetry(() => import("./pages/Register"), "Register");
const ForgotPassword = lazyWithRetry(
  () => import("./pages/ForgotPassword"),
  "ForgotPassword",
);
const ResetPassword = lazyWithRetry(
  () => import("./pages/ResetPassword"),
  "ResetPassword",
);
const Profile = lazyWithRetry(() => import("./pages/Profile"), "Profile");
const Contact = lazyWithRetry(() => import("./pages/Contact"), "Contact");
const About = lazyWithRetry(() => import("./pages/About"), "About");
const AdminDashboard = lazyWithRetry(
  () => import("./pages/AdminDashboard"),
  "AdminDashboard",
);
const EditProduct = lazyWithRetry(
  () => import("./pages/admin/EditProduct"),
  "EditProduct",
);

const OrderDetail = lazyWithRetry(
  () => import("./pages/admin/OrderDetail"),
  "OrderDetail",
);
const UserDetail = lazyWithRetry(
  () => import("./pages/admin/UserDetail"),
  "UserDetail",
);

const NotFound = lazyWithRetry(() => import("./pages/NotFound"), "NotFound");

function App() {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    if (accessToken) {
      dispatch(getCurrentUser());
      return;
    }

    dispatch(setAuthChecked(true));
  }, [accessToken, dispatch]);

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route
            path="female-collection"
            element={
              <Navigate
                to="/products?gender-category=female-collection"
                replace
              />
            }
          />
          <Route
            path="male-collection"
            element={
              <Navigate
                to="/products?gender-category=male-collection"
                replace
              />
            }
          />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="sales/:id" element={<SaleOffer />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/orders/:id" element={<OrderDetail />} />
          <Route path="admin/products/:id" element={<EditProduct />} />
          <Route path="admin/users/:id" element={<UserDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
