import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";

const VerifyEmail = () => {
  const { token } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        if (!isMounted) return;

        setIsSuccess(true);
        setMessage(
          response?.data?.message ||
            "Thank you! your email is successfully verified",
        );
      } catch (error) {
        if (!isMounted) return;

        setIsSuccess(false);
        setMessage(
          error?.response?.data?.error ||
            "This verification link is invalid or has expired.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (!token) {
      setIsLoading(false);
      setIsSuccess(false);
      setMessage("Invalid verification link.");
      return () => {
        isMounted = false;
      };
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          {isSuccess ? "Email Verified" : "Verification Failed"}
        </h1>
        <p
          className={`mt-4 text-sm ${isSuccess ? "text-green-700" : "text-red-600"}`}
        >
          {message}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/login"
            className="rounded-full bg-[#68a300] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#5f9600]"
          >
            Go to Login
          </Link>
          <Link
            to="/"
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
