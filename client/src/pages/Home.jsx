import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheckIcon,
  LockClosedIcon,
  CloudIcon,
  DevicePhoneMobileIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  CheckIcon,
  SparklesIcon,
  BoltIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Military-Grade Encryption",
      description:
        "Your passwords are protected with AES-256 encryption, the same standard used by governments and banks.",
      gradient: "from-blue-500 to-cyan-500",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: LockClosedIcon,
      title: "Zero-Knowledge Architecture",
      description:
        "We never see your passwords. Everything is encrypted locally before reaching our servers.",
      gradient: "from-purple-500 to-pink-500",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: CloudIcon,
      title: "Secure Cloud Backup",
      description:
        "Your encrypted data is safely backed up in the cloud with multiple redundancy layers.",
      gradient: "from-green-500 to-emerald-500",
      color: "text-green-600 dark:text-green-400",
    },
    {
      icon: DevicePhoneMobileIcon,
      title: "Cross-Platform Sync",
      description:
        "Access your passwords securely across all your devices with real-time synchronization.",
      gradient: "from-orange-500 to-red-500",
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      icon: CpuChipIcon,
      title: "Advanced Security",
      description:
        "Multi-factor authentication, breach monitoring, and security audits keep you protected.",
      gradient: "from-indigo-500 to-blue-500",
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      icon: BoltIcon,
      title: "Lightning Fast",
      description:
        "Instant password generation, auto-fill, and seamless user experience across all platforms.",
      gradient: "from-yellow-500 to-orange-500",
      color: "text-yellow-600 dark:text-yellow-400",
    },
  ];

  const securityFeatures = [
    "End-to-end encryption",
    "Zero-knowledge architecture",
    "Multi-factor authentication",
    "Secure password sharing",
    "Breach monitoring",
    "Security audit reports",
    "Biometric authentication",
    "Emergency access",
  ];

  const highlights = [
    { label: "Military-Grade Security" },
    { label: "Zero-Knowledge Design" },
    { label: "Cross-Platform Access" },
    { label: "256-bit AES Encryption" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-r from-green-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Secure Your
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent py-2">
                Digital Life
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              The most secure and user-friendly password manager. Protect your
              digital identity with military-grade encryption.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="group bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2"
                  >
                    <span>Sign In</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm"
                >
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {highlight.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose SecurePass?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built with security-first principles and designed for the modern
              digital lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-600"
              >
                <div className="relative">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Enterprise-Grade
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Security
                </span>
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Your security is our top priority. We use the same encryption
                standards trusted by banks and governments worldwide.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-white to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl"></div>

                <div className="relative">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <EyeSlashIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">
                    Zero-Knowledge Encryption
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center leading-relaxed mb-6">
                    Your master password never leaves your device. Even we can't
                    see your data - that's true privacy.
                  </p>

                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-center space-x-2 text-green-700 dark:text-green-400">
                      <ShieldCheckIcon className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        256-bit AES Encryption
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10"></div>
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Ready to Secure Your Digital Life?
          </h2>

          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join users who trust SecurePass to protect their most important
            accounts.
          </p>

          {!user && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/register"
                className="group bg-white text-blue-600 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="group bg-transparent text-white font-semibold py-3 px-6 rounded-xl border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
