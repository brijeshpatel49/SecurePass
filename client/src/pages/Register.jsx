import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { validatePassword } from "../utils/passwordValidation";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");
  const masterPassword = watch("masterPassword");
  const passwordValidation = password ? validatePassword(password) : null;
  const masterPasswordValidation = masterPassword
    ? validatePassword(masterPassword)
    : null;



  const onSubmit = async (data, event) => {
    event?.preventDefault(); // Prevent form refresh
    if (passwordValidation && !passwordValidation.isValid) {
      const missing = [];
      if (!passwordValidation.checks.length)
        missing.push("at least 8 characters");
      if (!passwordValidation.checks.uppercase)
        missing.push("uppercase letter");
      if (!passwordValidation.checks.lowercase)
        missing.push("lowercase letter");
      if (!passwordValidation.checks.number) missing.push("number");
      if (!passwordValidation.checks.special)
        missing.push("special character (@$!%*?&)");

      toast.error(`Password must contain: ${missing.join(", ")}`);
      return;
    }

    if (masterPasswordValidation && !masterPasswordValidation.isValid) {
      const missing = [];
      if (!masterPasswordValidation.checks.length)
        missing.push("at least 8 characters");
      if (!masterPasswordValidation.checks.uppercase)
        missing.push("uppercase letter");
      if (!masterPasswordValidation.checks.lowercase)
        missing.push("lowercase letter");
      if (!masterPasswordValidation.checks.number) missing.push("number");
      if (!masterPasswordValidation.checks.special)
        missing.push("special character (@$!%*?&)");

      toast.error(`Master password must contain: ${missing.join(", ")}`);
      return;
    }

    const result = await registerUser(data);
    
    if (result.success) {
      toast.success("Registration initiated! Please check your email for OTP verification.");
      // Navigate to OTP verification page with email
      navigate('/verify-otp', { 
        state: { 
          email: data.email,
          fromRegistration: true 
        } 
      });
    } else {
      console.error('Registration failed:', result.error); // Debug log
      toast.error(result.error || 'Registration failed');
    }
  };



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
            Create Your Account
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Join thousands of users securing their digital life
          </p>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>

        <form
          className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  First Name
                </label>
                <input
                  {...register("firstName", {
                    required: "First name is required",
                    minLength: {
                      value: 2,
                      message: "First name must be at least 2 characters",
                    },
                  })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-slide-in-right">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Last Name
                </label>
                <input
                  {...register("lastName", {
                    required: "Last name is required",
                    minLength: {
                      value: 2,
                      message: "Last name must be at least 2 characters",
                    },
                  })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-slide-in-right">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-slide-in-right">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Account Password
              </label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Password is required",
                    validate: (value) => {
                      const validation = validatePassword(value);
                      if (!validation.isValid) {
                        const missing = [];
                        if (!validation.checks.length)
                          missing.push("8+ characters");
                        if (!validation.checks.uppercase)
                          missing.push("uppercase letter");
                        if (!validation.checks.lowercase)
                          missing.push("lowercase letter");
                        if (!validation.checks.number) missing.push("number");
                        if (!validation.checks.special)
                          missing.push("special character");
                        return `Required: ${missing.join(", ")}`;
                      }
                      return true;
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter your password"
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
                htmlFor="masterPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Master Password
              </label>
              <div className="relative">
                <input
                  {...register("masterPassword", {
                    required: "Master password is required",
                    validate: (value) => {
                      const validation = validatePassword(value);
                      if (!validation.isValid) {
                        const missing = [];
                        if (!validation.checks.length)
                          missing.push("8+ characters");
                        if (!validation.checks.uppercase)
                          missing.push("uppercase letter");
                        if (!validation.checks.lowercase)
                          missing.push("lowercase letter");
                        if (!validation.checks.number) missing.push("number");
                        if (!validation.checks.special)
                          missing.push("special character");
                        return `Required: ${missing.join(", ")}`;
                      }
                      return true;
                    },
                  })}
                  type={showMasterPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Enter your master password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                  onClick={() => setShowMasterPassword(!showMasterPassword)}
                >
                  {showMasterPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.masterPassword && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-slide-in-right">
                  {errors.masterPassword.message}
                </p>
              )}
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Important:</strong> This password encrypts all your
                  stored passwords. Make it strong and memorable - you cannot
                  recover it if forgotten.
                </p>
              </div>
              {masterPassword && (
                <PasswordStrengthIndicator password={masterPassword} />
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={
                loading ||
                (password && !passwordValidation?.isValid) ||
                (masterPassword && !masterPasswordValidation?.isValid)
              }
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" inline />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>Create Secure Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
