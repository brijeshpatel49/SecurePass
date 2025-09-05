import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ShieldCheckIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { authService } from "../services/authService";
import { validatePassword } from "../utils/passwordValidation";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const ForgotPasswordOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(2); // Start at step 2 (OTP) since email is already provided
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(location.state?.email || "");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // If no email is provided, redirect to forgot password page
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const emailForm = useForm();
  const otpForm = useForm();
  const passwordForm = useForm();

  const handleEmailSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setEmail(data.email);
      setStep(2);
      toast.success("OTP sent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.verifyOTP(email, data.otp);
      setStep(3);
      toast.success("OTP verified successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const validation = validatePassword(data.password);
    if (!validation.isValid) {
      toast.error("Please create a stronger password");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(
        email,
        otpForm.getValues("otp"),
        data.password
      );
      toast.success("Password reset successful!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success("New OTP sent to your email!");
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-12 px-4 sm:px-6 lg:px-8 transition-all duration-700">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse animation-delay-300"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8 animate-fade-in-up">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    step >= stepNumber
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step > stepNumber ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 rounded-full transition-all duration-300 ${
                      step > stepNumber
                        ? "bg-gradient-to-r from-blue-600 to-purple-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce-in">
                <ShieldCheckIcon className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl opacity-20 blur-xl animate-pulse-glow"></div>
            </div>
          </div>

          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
            {step === 1 && "Reset Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "New Password"}
          </h2>

          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {step === 1 && "Enter your email to receive a verification code"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Create a new secure password"}
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 transition-all duration-300">
          {/* Step 1: Email */}
          {step === 1 && (
            <form
              onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
              className="space-y-6"
            >
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>Email Address</span>
                </label>
                <div className="relative">
                  <input
                    {...emailForm.register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email address",
                      },
                    })}
                    type="email"
                    className="w-full px-4 py-4 pl-12 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-lg"
                    placeholder="Enter your email address"
                  />
                  <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-slide-in-right">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[56px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl text-lg"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" inline />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <EnvelopeIcon className="h-5 w-5" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <form
              onSubmit={otpForm.handleSubmit(handleOTPSubmit)}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We sent a 6-digit code to
                </p>
                <p className="text-blue-600 dark:text-blue-400 font-semibold">
                  {email}
                </p>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <KeyIcon className="w-4 h-4" />
                  <span>Verification Code</span>
                </label>
                <input
                  {...otpForm.register("otp", {
                    required: "OTP is required",
                    pattern: {
                      value: /^\d{6}$/,
                      message: "OTP must be 6 digits",
                    },
                  })}
                  type="text"
                  maxLength="6"
                  className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                />
                {otpForm.formState.errors.otp && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-slide-in-right">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[56px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl text-lg"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" inline />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Verify Code</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={resendOTP}
                  disabled={isLoading}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors duration-200 text-sm"
                >
                  Didn't receive the code? Resend
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
              className="space-y-6"
            >
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <KeyIcon className="w-4 h-4" />
                  <span>New Password</span>
                </label>
                <div className="relative">
                  <input
                    {...passwordForm.register("password", {
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
                    className="w-full px-4 py-4 pr-12 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-lg"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.password && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-slide-in-right">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
                {passwordForm.watch("password") && (
                  <PasswordStrengthIndicator
                    password={passwordForm.watch("password")}
                  />
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <KeyIcon className="w-4 h-4" />
                  <span>Confirm New Password</span>
                </label>
                <div className="relative">
                  <input
                    {...passwordForm.register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === passwordForm.watch("password") ||
                        "Passwords do not match",
                    })}
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full px-4 py-4 pr-12 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-lg"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-slide-in-right">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[56px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl text-lg"
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
            </form>
          )}

          <div className="text-center pt-6 border-t border-gray-200/50 dark:border-gray-700/50 mt-8">
            <Link
              to="/login"
              className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordOTP;
