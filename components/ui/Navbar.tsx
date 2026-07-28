// components/ui/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/app/context/ThemeContext';
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
  // Added for the new sections:
  FaGraduationCap, // for 'education'
  FaBriefcase,     // for 'experience'
  FaTools,         // for 'skills'
  FaFolderOpen,    // for 'work'
  FaQuoteRight,    // for 'testimonials'
  FaNewspaper,     // for 'blog'
} from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
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
  { href: '#home', label: 'Home', icon: <FaHome /> },
  { href: '#about', label: 'About', icon: <FaUser /> },
  { href: '#education', label: 'Education', icon: <FaGraduationCap /> },
  { href: '#experience', label: 'Experience', icon: <FaBriefcase /> },
  { href: '#skills', label: 'Skills', icon: <FaTools /> },
  { href: '#work', label: 'Work', icon: <FaFolderOpen /> },
  { href: '#testimonials', label: 'Testimonials', icon: <FaQuoteRight /> },
  { href: '#blog', label: 'Blog', icon: <FaNewspaper /> },
  { href: '#contact', label: 'Contact', icon: <FaEnvelope /> },
];

  const isActive = (href: string) => pathname === href;

  if (!mounted) return null;

  return (
    <nav className={`fixed w-full z-50 border-b shadow-sm transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-[#0a192f] border-[#334155]' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 md:space-x-3 group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/logo1.avif"
                alt="Amlakie Logo"
                fill
                className="object-contain rounded-lg"
                sizes="48px"
                priority
              />
            </div>
            <span className={`text-lg md:text-xl font-bold transition-colors duration-300 ${
              isDarkMode 
                ? 'text-[#ccd6f6] group-hover:text-[#00ffff]' 
                : 'text-gray-800 group-hover:text-blue-600'
            }`}>
              Amlakie
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
                    ? isDarkMode ? 'text-[#00ffff]' : 'text-blue-600'
                    : isDarkMode ? 'text-[#a8b2d1] hover:text-[#00ffff]' : 'text-gray-700 hover:text-blue-600'
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
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isDarkMode 
                        ? 'hover:bg-[#1e293b]' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-[#00ffff] flex items-center justify-center text-white dark:text-[#0a192f] font-bold text-sm">
                      {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-[#a8b2d1]' : 'text-gray-700'} hidden xl:block`}>
                      {user.name || user.email}
                    </span>
                    <FaChevronDown className={`${isDarkMode ? 'text-[#94a3b8]' : 'text-gray-400'} text-xs transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-2 z-50 border ${
                      isDarkMode 
                        ? 'bg-[#0f172a] border-[#334155]' 
                        : 'bg-white border-gray-200'
                    }`}>
                      <div className={`px-4 py-2 border-b ${
                        isDarkMode ? 'border-[#334155]' : 'border-gray-200'
                      }`}>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-[#ccd6f6]' : 'text-gray-800'}`}>
                          {user.name || user.email}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-[#94a3b8]' : 'text-gray-500'}`}>
                          {user.email}
                        </p>
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className={`flex items-center px-4 py-2 text-sm transition-colors duration-200 ${
                            isDarkMode 
                              ? 'text-[#a8b2d1] hover:bg-[#1e293b]' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaCog className="mr-2" /> Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        className={`flex items-center px-4 py-2 text-sm transition-colors duration-200 ${
                          isDarkMode 
                            ? 'text-[#a8b2d1] hover:bg-[#1e293b]' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaUser className="mr-2" /> Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className={`flex items-center w-full px-4 py-2 text-sm border-t transition-colors duration-200 ${
                          isDarkMode 
                            ? 'text-red-400 hover:bg-[#1e293b] border-[#334155]' 
                            : 'text-red-600 hover:bg-gray-100 border-gray-200'
                        }`}
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
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isDarkMode 
                        ? 'hover:bg-[#1e293b]' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <FaGlobe className={isDarkMode ? 'text-[#a8b2d1]' : 'text-gray-600'} />
                    <span className={`text-sm ${isDarkMode ? 'text-[#a8b2d1]' : 'text-gray-700'}`}>EN</span>
                    <FaChevronDown className={`${isDarkMode ? 'text-[#94a3b8]' : 'text-gray-400'} text-xs transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isLanguageOpen && (
                    <div className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg py-2 z-50 border ${
                      isDarkMode 
                        ? 'bg-[#0f172a] border-[#334155]' 
                        : 'bg-white border-gray-200'
                    }`}>
                      <button className={`block w-full px-4 py-2 text-left text-sm transition-colors duration-200 ${
                        isDarkMode 
                          ? 'text-[#a8b2d1] hover:bg-[#1e293b]' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                        English
                      </button>
                      <button className={`block w-full px-4 py-2 text-left text-sm transition-colors duration-200 ${
                        isDarkMode 
                          ? 'text-[#a8b2d1] hover:bg-[#1e293b]' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                        Amharic
                      </button>
                    </div>
                  )}
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'hover:bg-[#1e293b]' 
                      : 'hover:bg-gray-100'
                  }`}
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? (
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
                  className={`px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'text-[#00ffff] border-[#00ffff] hover:bg-[#00ffff] hover:text-[#0a192f]' 
                      : 'text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  <FaSignInAlt className="inline mr-1" /> Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-[#00ffff] text-[#0a192f] hover:bg-[#00b3b3]' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <FaUserPlus className="inline mr-1" /> Sign up
                </Link>

                {/* Language Dropdown for non-logged in */}
                <div className="relative">
                  <button
                    onClick={toggleLanguage}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isDarkMode 
                        ? 'hover:bg-[#1e293b]' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <FaGlobe className={isDarkMode ? 'text-[#a8b2d1]' : 'text-gray-600'} />
                    <span className={`text-sm ${isDarkMode ? 'text-[#a8b2d1]' : 'text-gray-700'}`}>EN</span>
                    <FaChevronDown className={`${isDarkMode ? 'text-[#94a3b8]' : 'text-gray-400'} text-xs transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isLanguageOpen && (
                    <div className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg py-2 z-50 border ${
                      isDarkMode 
                        ? 'bg-[#0f172a] border-[#334155]' 
                        : 'bg-white border-gray-200'
                    }`}>
                      <button className={`block w-full px-4 py-2 text-left text-sm transition-colors duration-200 ${
                        isDarkMode 
                          ? 'text-[#a8b2d1] hover:bg-[#1e293b]' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                        English
                      </button>
                      <button className={`block w-full px-4 py-2 text-left text-sm transition-colors duration-200 ${
                        isDarkMode 
                          ? 'text-[#a8b2d1] hover:bg-[#1e293b]' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                        Amharic
                      </button>
                    </div>
                  )}
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'hover:bg-[#1e293b]' 
                      : 'hover:bg-gray-100'
                  }`}
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? (
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
              className={`p-2 rounded-lg transition-all duration-300 ${
                isDarkMode 
                  ? 'hover:bg-[#1e293b]' 
                  : 'hover:bg-gray-100'
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <FaSun className="text-yellow-500" size={18} />
              ) : (
                <FaMoon className="text-gray-600" size={18} />
              )}
            </button>
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isDarkMode 
                  ? 'hover:bg-[#1e293b]' 
                  : 'hover:bg-gray-100'
              }`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`lg:hidden py-4 border-t animate-slideDown ${
            isDarkMode ? 'border-[#334155]' : 'border-gray-200'
          }`}>
            {/* Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200
                    ${isActive(link.href) 
                      ? isDarkMode ? 'text-[#00ffff] bg-[#1e293b]' : 'text-blue-600 bg-blue-50'
                      : isDarkMode ? 'text-[#a8b2d1] hover:bg-[#1e293b]' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-[#334155]' : 'border-gray-200'}`}>
              {user ? (
                <>
                  <div className="px-4 py-2 mb-2">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-[#ccd6f6]' : 'text-gray-800'}`}>
                      {user.name || user.email}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-[#94a3b8]' : 'text-gray-500'}`}>
                      {user.email}
                    </p>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                        isDarkMode 
                          ? 'text-[#a8b2d1] hover:bg-[#1e293b]' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaCog className="mr-3" /> Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                      isDarkMode 
                        ? 'text-[#a8b2d1] hover:bg-[#1e293b]' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser className="mr-3" /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                      isDarkMode 
                        ? 'text-red-400 hover:bg-[#1e293b]' 
                        : 'text-red-600 hover:bg-gray-50'
                    }`}
                  >
                    <FaSignOutAlt className="mr-3" /> Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/login"
                    className={`flex items-center justify-center px-4 py-3 rounded-lg text-base font-medium border transition-all duration-200 ${
                      isDarkMode 
                        ? 'text-[#00ffff] border-[#00ffff] hover:bg-[#00ffff] hover:text-[#0a192f]' 
                        : 'text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaSignInAlt className="mr-2" /> Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className={`flex items-center justify-center px-4 py-3 rounded-lg text-base font-medium text-white transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-[#00ffff] text-[#0a192f] hover:bg-[#00b3b3]' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUserPlus className="mr-2" /> Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Language Selector Mobile */}
            <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-[#334155]' : 'border-gray-200'}`}>
              <p className={`text-xs font-medium uppercase px-4 mb-2 ${
                isDarkMode ? 'text-[#94a3b8]' : 'text-gray-500'
              }`}>
                Language
              </p>
              <button className={`flex items-center w-full px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-[#a8b2d1] hover:bg-[#1e293b]' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}>
                <FaGlobe className="mr-3" /> English
              </button>
              <button className={`flex items-center w-full px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-[#a8b2d1] hover:bg-[#1e293b]' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}>
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