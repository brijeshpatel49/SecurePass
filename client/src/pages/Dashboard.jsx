import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { passwordService } from "../services/passwordService";
import {
  Key,
  Star,
  Shield,
  Plus,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    favorites: 0,
    categories: {},
  });
  const [recentPasswords, setRecentPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, passwordsResponse] = await Promise.all([
        passwordService.getPasswordStats(),
        passwordService.getPasswords({ limit: 5 }),
      ]);

      // Handle stats data
      const statsData = statsResponse?.data || {
        total: 0,
        favorites: 0,
        categories: {},
      };
      setStats(statsData);

      // Handle passwords data
      const passwordsData = passwordsResponse?.data?.passwords || [];
      setRecentPasswords(passwordsData);
    } catch (error) {
      setError(error.message);
      // Set default values on error
      setStats({ total: 0, favorites: 0, categories: {} });
      setRecentPasswords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner className="h-64" />;
  }

  const statCards = [
    {
      title: "Total Passwords",
      value: stats?.total || 0,
      icon: Key,
      color: "bg-blue-500",
    },
    {
      title: "Favorites",
      value: stats?.favorites || 0,
      icon: Star,
      color: "bg-yellow-500",
    },
    {
      title: "Categories",
      value: Object.keys(stats?.categories || {}).length,
      icon: Shield,
      color: "bg-green-500",
    },
    {
      title: "Security Score",
      value: "85%",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8 min-h-full animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold gradient-text">
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              Welcome back! Here's your security overview
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-3">
          <Link
            to="/passwords"
            className="btn-primary flex items-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Password</span>
          </Link>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200">
              Failed to load dashboard data: {error}
            </p>
            <button
              onClick={fetchDashboardData}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => {
          // Make Total Passwords card clickable
          const isClickable = stat.title === "Total Passwords";
          const CardWrapper = isClickable ? Link : "div";
          const cardProps = isClickable ? { to: "/passwords" } : {};

          return (
            <CardWrapper
              key={index}
              {...cardProps}
              className={`card p-4 md:p-6 hover:shadow-2xl transition-all duration-300 animate-scale-in group relative ${
                isClickable
                  ? "cursor-pointer hover:scale-105 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                  : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div
                    className={`${stat.color} p-3 md:p-4 rounded-xl md:rounded-2xl group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div
                  className={`hidden sm:flex w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl md:rounded-2xl items-center justify-center transition-opacity duration-300 ${
                    isClickable
                      ? "opacity-40 group-hover:opacity-60"
                      : "opacity-20 group-hover:opacity-40"
                  }`}
                >
                  <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" />
                </div>
                {isClickable && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </CardWrapper>
          );
        })}
      </div>

      {/* Recent Passwords & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Recent Passwords */}
        <div className="card p-4 md:p-8 animate-slide-in-left">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg md:rounded-xl flex items-center justify-center">
                <Key className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                Recent Passwords
              </h2>
            </div>
            <Link
              to="/passwords"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs md:text-sm font-semibold hover:underline transition-all duration-200"
            >
              View all →
            </Link>
          </div>

          {recentPasswords.length > 0 ? (
            <div className="space-y-4">
              {recentPasswords.map((password, index) => (
                <div
                  key={password._id}
                  className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl md:rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate">
                      {password.title}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                      {password.website || password.email}
                    </p>
                  </div>
                  {password.isFavorite && (
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-current" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Key className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No passwords yet
              </p>
              <Link
                to="/passwords"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add your first password</span>
              </Link>
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="card p-4 md:p-8 animate-slide-in-right">
          <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg md:rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              Categories
            </h2>
          </div>

          {stats?.categories && Object.keys(stats.categories).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(stats.categories).map(
                ([category, count], index) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl md:rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                      <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex-shrink-0"></div>
                      <span className="capitalize font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base truncate">
                        {category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="font-bold text-gray-900 dark:text-white text-base md:text-lg">
                        {count}
                      </span>
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          {count}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                No categories yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
