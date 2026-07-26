'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme-context';
import {
  FaSun,
  FaMoon,
  FaGlobe,
  FaChevronDown,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaHome,
  FaInfoCircle,
  FaUtensils,
  FaEnvelope,
  FaBars,
  FaTimes,
  FaCog,
} from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      setIsUserMenuOpen(false);
      setIsLanguageOpen(false);
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsLanguageOpen(false);
  };

  const toggleLanguage = () => {
    setIsLanguageOpen(!isLanguageOpen);
    setIsUserMenuOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: <FaHome /> },
    { href: '/about', label: 'About', icon: <FaInfoCircle /> },
    { href: '/menu', label: 'Food Menu', icon: <FaUtensils /> },
    { href: '/contact', label: 'Contact', icon: <FaEnvelope /> },
  ];

  const isActive = (href: string) => pathname === href;

  if (!mounted) return null;

  return (
    <nav className="fixed w-full z-50 bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-[#334155] shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 md:space-x-3 group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/logo1.jpeg"
                alt="Zelalem Cafterya Logo"
                fill
                className="object-contain rounded-lg"
                sizes="48px"
                priority
              />
            </div>
            <span className="text-lg md:text-xl font-bold text-gray-800 dark:text-[#ccd6f6] transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-[#00ffff]">
              Zelalem Cafterya
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-300
                  ${isActive(link.href) 
                    ? 'text-blue-600 dark:text-[#00ffff]' 
                    : 'text-gray-700 dark:text-[#a8b2d1] hover:text-blue-600 dark:hover:text-[#00ffff]'
                  }
                  after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:bg-blue-600 dark:after:bg-[#00ffff] after:transition-transform after:duration-300
                  after:origin-left ${isActive(link.href) ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'}`}
              >
                {link.label}
              </Link>
            ))}

            {/* User Section */}
            {user ? (
              <div className="flex items-center ml-4 space-x-2">
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-[#00ffff] flex items-center justify-center text-white dark:text-[#0a192f] font-bold text-sm">
                      {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-[#a8b2d1] hidden xl:block">
                      {user.name || user.email}
                    </span>
                    <FaChevronDown className={`text-gray-400 dark:text-[#94a3b8] text-xs transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-[#334155]">
                        <p className="text-sm font-medium text-gray-800 dark:text-[#ccd6f6]">{user.name || user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-[#94a3b8]">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-[#a8b2d1] hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaCog className="mr-2" /> Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-[#a8b2d1] hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaUser className="mr-2" /> Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors duration-200 border-t border-gray-200 dark:border-[#334155]"
                      >
                        <FaSignOutAlt className="mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>

                {/* Language Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-all duration-300"
                  >
                    <FaGlobe className="text-gray-600 dark:text-[#a8b2d1]" />
                    <span className="text-sm text-gray-700 dark:text-[#a8b2d1]">EN</span>
                    <FaChevronDown className={`text-gray-400 dark:text-[#94a3b8] text-xs transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isLanguageOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] rounded-lg shadow-lg py-2 z-50">
                      <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-[#a8b2d1] hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors duration-200">
                        English
                      </button>
                      <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-[#a8b2d1] hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors duration-200">
                        Amharic
                      </button>
                    </div>
                  )}
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-all duration-300"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <FaSun className="text-yellow-500" size={18} />
                  ) : (
                    <FaMoon className="text-gray-600" size={18} />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center ml-4 space-x-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-[#00ffff] border border-blue-600 dark:border-[#00ffff] rounded-lg hover:bg-blue-600 dark:hover:bg-[#00ffff] hover:text-white dark:hover:text-[#0a192f] transition-all duration-300"
                >
                  <FaSignInAlt className="inline mr-1" /> Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-[#00ffff] dark:text-[#0a192f] rounded-lg hover:bg-blue-700 dark:hover:bg-[#00b3b3] transition-all duration-300"
                >
                  <FaUserPlus className="inline mr-1" /> Sign up
                </Link>

                {/* Language Dropdown for non-logged in */}
                <div className="relative">
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-all duration-300"
                  >
                    <FaGlobe className="text-gray-600 dark:text-[#a8b2d1]" />
                    <span className="text-sm text-gray-700 dark:text-[#a8b2d1]">EN</span>
                    <FaChevronDown className={`text-gray-400 dark:text-[#94a3b8] text-xs transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isLanguageOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#334155] rounded-lg shadow-lg py-2 z-50">
                      <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-[#a8b2d1] hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors duration-200">
                        English
                      </button>
                      <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-[#a8b2d1] hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors duration-200">
                        Amharic
                      </button>
                    </div>
                  )}
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-all duration-300"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <FaSun className="text-yellow-500" size={18} />
                  ) : (
                    <FaMoon className="text-gray-600" size={18} />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <FaSun className="text-yellow-500" size={18} />
              ) : (
                <FaMoon className="text-gray-600" size={18} />
              )}
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-[#334155] animate-slideDown">
            {/* Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200
                    ${isActive(link.href) 
                      ? 'text-blue-600 dark:text-[#00ffff] bg-blue-50 dark:bg-[#1e293b]' 
                      : 'text-gray-700 dark:text-[#a8b2d1] hover:bg-gray-50 dark:hover:bg-[#1e293b]'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#334155]">
              {user ? (
                <>
                  <div className="px-4 py-2 mb-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-[#ccd6f6]">{user.name || user.email}</p>
                    <p className="text-xs text-gray-500 dark:text-[#94a3b8]">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-[#a8b2d1] hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaCog className="mr-3" /> Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/admin"
                    className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-[#a8b2d1] hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser className="mr-3" /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors duration-200"
                  >
                    <FaSignOutAlt className="mr-3" /> Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/login"
                    className="flex items-center justify-center px-4 py-3 rounded-lg text-base font-medium text-blue-600 dark:text-[#00ffff] border border-blue-600 dark:border-[#00ffff] hover:bg-blue-600 dark:hover:bg-[#00ffff] hover:text-white dark:hover:text-[#0a192f] transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaSignInAlt className="mr-2" /> Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center justify-center px-4 py-3 rounded-lg text-base font-medium text-white bg-blue-600 dark:bg-[#00ffff] dark:text-[#0a192f] hover:bg-blue-700 dark:hover:bg-[#00b3b3] transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUserPlus className="mr-2" /> Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Language Selector Mobile */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#334155]">
              <p className="text-xs font-medium text-gray-500 dark:text-[#94a3b8] uppercase px-4 mb-2">Language</p>
              <button className="flex items-center w-full px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-[#a8b2d1] hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors duration-200">
                <FaGlobe className="mr-3" /> English
              </button>
              <button className="flex items-center w-full px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-[#a8b2d1] hover:bg-gray-50 dark:hover:bg-[#1e293b] transition-colors duration-200">
                <FaGlobe className="mr-3" /> Amharic
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;