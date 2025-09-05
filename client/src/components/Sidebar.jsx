import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Key, Settings, Shield, Sparkles, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      to: '/passwords',
      icon: Key,
      label: 'Passwords',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      to: '/settings',
      icon: Settings,
      label: 'Settings',
      gradient: 'from-green-500 to-emerald-500'
    }
  ]

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {/* Mobile Menu Button - Fixed position */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-lg border border-white/20 dark:border-gray-700/50 shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile by default, overlay when open */}
      <aside className={`
        ${isMobileMenuOpen ? 'fixed' : 'hidden'} md:block md:relative
        top-0 left-0 z-40 md:z-auto
        w-72 md:w-64 lg:w-72 
        h-full
        transform transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : 'md:translate-x-0'}
        flex flex-col
        card-glass border-r border-white/20 dark:border-gray-700/50 backdrop-blur-xl
        py-6 md:py-8 px-4
      `}>
        {/* Logo Section */}
        <div className="flex items-center space-x-3 px-2 animate-fade-in mt-8 md:mt-0">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold gradient-text">SecurePass</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-3 px-2 mt-8">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `group flex items-center space-x-4 py-4 px-4 rounded-2xl transition-all duration-200 animate-fade-in ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-600 dark:text-blue-400 shadow-lg border border-blue-500/30'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                }`
              }
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                item.gradient ? `bg-gradient-to-r ${item.gradient}` : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="px-2 pt-6">
          <div className="card-glass rounded-2xl p-4 border border-white/20 dark:border-gray-700/50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Security Score</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Excellent</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full w-4/5 animate-pulse"></div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar