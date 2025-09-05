import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { authService } from "../services/authService";
import { validatePassword } from "../utils/passwordValidation";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");
  const passwordValidation = password ? validatePassword(password) : null;

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset token");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordValidation && !passwordValidation.isValid) {
      toast.error("Please create a stronger password");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      toast.success("Password reset successful! You are now logged in.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8 transition-all duration-500">
      <div className="max-w-lg w-full space-y-8 animate-fade-in-up">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ShieldCheckIcon className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-bounce-in" />
              <div className="absolute inset-0 bg-blue-600 dark:bg-blue-400 rounded-full opacity-20 blur-lg animate-pulse-glow"></div>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 gradient-text">
            Reset Your Password
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Create a new secure password for your account
          </p>
        </div>

        <form
          className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Password is required",
                    validate: (value) => {
                      const validation = validatePassword(value);
                      return (
                        validation.isValid ||
                        "Password does not meet security requirements"
                      );
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-slide-in-right">
                  {errors.password.message}
                </p>
              )}
              {password && <PasswordStrengthIndicator password={password} />}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-slide-in-right">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || (password && !passwordValidation?.isValid)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" inline />
                  <span>Resetting Password...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Reset Password</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/login"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
            >
              Remember your password? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
