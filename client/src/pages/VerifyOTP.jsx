import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheckIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const { completeRegistration, resendRegistrationOTP, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from navigation state
  const email = location.state?.email;

  useEffect(() => {
    // Redirect if no email provided
    if (!email) {
      toast.error("No email provided for verification");
      navigate("/register");
    }
  }, [email, navigate]);

  // Cooldown timer effect
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auto-focus on OTP input when cooldown ends
  useEffect(() => {
    if (resendCooldown === 0 && !isResending) {
      const otpInput = document.getElementById("otp");
      if (otpInput) {
        otpInput.focus();
      }
    }
  }, [resendCooldown, isResending]);

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    const result = await completeRegistration(email, otp);

    if (result.success) {
      toast.success("Registration completed successfully!");
      navigate("/dashboard");
    } else {
      // Check if user is already registered
      if (result.error && result.error.includes("already exists")) {
        toast.error("User already registered. Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(result.error || "OTP verification failed");
      }
    }
  };

  const handleBackToRegister = () => {
    navigate("/register");
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);

    try {
      const result = await resendRegistrationOTP(email);

      if (result.success) {
        toast.success("New verification code sent to your email!");
        setResendCooldown(60); // 60 second cooldown
        setOtp(""); // Clear current OTP input
      } else {
        // Check if user is already registered
        if (result.error && result.error.includes("already")) {
          toast.error(
            "Registration already completed. Redirecting to login..."
          );
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          toast.error(result.error || "Failed to resend verification code");
        }
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8 transition-all duration-500">
      <div className="max-w-md w-full space-y-8 animate-fade-in-up">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <EnvelopeIcon className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-bounce-in" />
              <div className="absolute inset-0 bg-blue-600 dark:bg-blue-400 rounded-full opacity-20 blur-lg animate-pulse-glow"></div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 gradient-text">
            Verify Your Email
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            We've sent a 6-digit code to
          </p>
          <p className="text-blue-600 dark:text-blue-400 font-semibold break-all">
            {email}
          </p>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Enter the code below to complete your registration
          </p>
        </div>

        <form
          onSubmit={handleOtpSubmit}
          className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300"
        >
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Verification Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(value);
              }}
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              placeholder="000000"
              maxLength="6"
              autoComplete="one-time-code"
              autoFocus
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              Please check your email and enter the 6-digit code
            </p>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full min-h-[48px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" inline />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>Complete Registration</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToRegister}
              className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Registration</span>
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Didn't receive the code?{" "}
              <button
                type="button"
                disabled={resendCooldown > 0 || isResending}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                onClick={handleResendOTP}
              >
                {isResending ? (
                  <span className="inline-flex items-center space-x-1">
                    <LoadingSpinner size="sm" inline />
                    <span>Sending...</span>
                  </span>
                ) : resendCooldown > 0 ? (
                  <span className="inline-flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>Resend in {resendCooldown}s</span>
                  </span>
                ) : (
                  "Resend Code"
                )}
              </button>
            </p>
            {resendCooldown === 0 && !isResending && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Check your spam folder first
              </p>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help?{" "}
              <Link
                to="/register"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
              >
                Start over
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
