import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import Header from "./Header";
import Footer from "./Footer";
import AnnouncementBanner from "./AnnouncementBanner";
import {
  closeCart,
  removeFromCart,
  selectCartItems,
  selectCartTotal,
  updateQuantity,
} from "../store/slices/cartSlice";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";

const CartDrawer = () => {
  const dispatch = useDispatch();
  const isCartOpen = useSelector((state) => state.cart.isCartOpen);
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const handleQuantityChange = (productId, nextQuantity) => {
    if (nextQuantity < 1) {
      dispatch(removeFromCart(productId));
      return;
    }
    dispatch(updateQuantity({ productId, quantity: nextQuantity }));
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[120]">
      <button
        type="button"
        aria-label="Close cart"
        className="absolute inset-0 bg-black/15"
        onClick={() => dispatch(closeCart())}
      />

      <aside className="absolute right-0 top-0 flex h-full w-[80%] max-w-[480px] flex-col bg-[#f5f5f4] shadow-[0_0_0_1px_rgba(17,17,17,0.04),-24px_20px_60px_rgba(0,0,0,0.08)] transition-transform duration-300 sm:w-[40%] xl:w-[30%] md:w-[40%]">
        <div className="px-5 pb-3 pt-5 sm:px-7 sm:pb-4 sm:pt-5">
          <h3 className="text-[1.6rem] font-black leading-[0.95] tracking-[-0.06em] text-[#111111] sm:text-2xl mt-2 mb-6">
            Shopping Cart
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 sm:px-7">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-[#4b4b4b]">
              <p className="text-lg font-semibold">Your cart is empty</p>
              <p className="mt-2 text-sm text-[#666]">
                Add some products to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {cartItems.map((item) => (
                <div
                  key={item.product._id}
                  className="relative border-b border-[#d9d4cd] pb-5 sm:pb-5"
                >
                  <div className="flex items-start gap-0 sm:gap-0">
                    <div className="flex flex-col items-start gap-2">
                      <div className="h-[94px] w-[94px] shrink-0 overflow-hidden rounded-md border border-[#e4dfd8] bg-white p-1.5 sm:h-[110px] sm:w-[110px] sm:p-2">
                        <img
                          src={item.product.image || "/placeholder-product.jpg"}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="inline-flex items-center border border-[#cfc8c0] bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              item.product._id,
                              item.quantity - 1,
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center text-lg text-[#1a1a1a] transition hover:bg-[#f3f0eb]"
                          aria-label="Decrease quantity"
                        >
                          <FaMinus className="text-[10px]" />
                        </button>
                        <span className="min-w-[42px] border-x border-[#cfc8c0] px-3 py-2 text-center text-base font-medium text-[#171717]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              item.product._id,
                              item.quantity + 1,
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center text-lg text-[#1a1a1a] transition hover:bg-[#f3f0eb]"
                          aria-label="Increase quantity"
                        >
                          <FaPlus className="text-[10px]" />
                        </button>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[1.05rem] font-semibold leading-snug text-[#171717] sm:text-[1.1rem]">
                            {item.product.name}
                          </h4>
                          <p className="mt-1 text-[0.9rem] font-semibold text-[#171717] sm:text-[0.95rem]">
                            Rs. {Number(item.price || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(removeFromCart(item.product._id))
                          }
                          className="shrink-0 border-0 bg-transparent p-0 text-[0.8rem] font-medium text-red-600 underline decoration-red-600 underline-offset-2 transition hover:text-red-700"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[#d9d4cd] bg-[#f5f5f4] px-5 py-4 sm:px-7">
          <div className="flex items-center justify-between text-[1.05rem] sm:text-[1.05rem]">
            <span className="font-semibold text-[#171717]">Subtotal</span>
            <span className="font-bold text-[#171717]">
              Rs. {Number(cartTotal || 0).toFixed(2)}
            </span>
          </div>

          <div className="mt-4 flex gap-3">
            <Link
              to="/cart"
              onClick={() => dispatch(closeCart())}
              className="flex-1 border border-[#171717] bg-white px-4 py-3 text-center text-sm font-semibold text-[#171717] transition hover:bg-[#efeae3]"
            >
              View cart
            </Link>
            <Link
              to="/checkout"
              onClick={() => dispatch(closeCart())}
              className="flex-1 bg-[#171717] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#2d2d2d]"
            >
              Checkout
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
};

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <CartDrawer />
      <Footer />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3200,
          style: {
            maxWidth: "min(92vw, 420px)",
            width: "fit-content",
            minWidth: "220px",
            padding: "10px 14px",
            borderRadius: "14px",
            fontSize: "0.78rem",
            fontWeight: 500,
            lineHeight: 1.4,
            background: "rgba(255,255,255,0.62)",
            color: "#1f2937",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
            border: "1px solid rgba(255,255,255,0.7)",
          },
          success: {
            style: {
              background: "rgba(255,255,255,0.66)",
              color: "#14532d",
              borderLeft: "4px solid #22c55e",
            },
          },
          error: {
            style: {
              background: "rgba(255,255,255,0.66)",
              color: "#7f1d1d",
              borderLeft: "4px solid #ef4444",
            },
          },
          loading: {
            style: {
              background: "rgba(255,255,255,0.66)",
              color: "#374151",
            },
          },
        }}
      />
    </div>
  );
};

export default Layout;
