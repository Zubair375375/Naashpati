import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./Header";
import Footer from "./Footer";
import AnnouncementBanner from "./AnnouncementBanner";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
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
