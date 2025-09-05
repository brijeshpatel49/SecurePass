import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="flex h-screen transition-all duration-500 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-all duration-500"></div>

      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-32 h-32 md:w-72 md:h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
      <div className="absolute top-0 right-0 w-32 h-32 md:w-72 md:h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-200"></div>
      <div className="absolute -bottom-8 left-20 w-32 h-32 md:w-72 md:h-72 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-400"></div>

      <div className="relative z-10 flex w-full">
        <Sidebar />
        {/* Main content area - full width on mobile, adjusted for sidebar on desktop */}
        <main className="flex-1 w-full md:w-auto overflow-x-hidden overflow-y-auto p-3 md:p-6 transition-all duration-300 pt-16 md:pt-3">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
