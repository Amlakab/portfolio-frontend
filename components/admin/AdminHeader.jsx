'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme-context';
import { Bell, LogOut, User, Menu } from 'lucide-react';
import { FaSun, FaMoon, FaChevronDown } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import api from '@/app/utils/api';

export default function AdminHeader({ 
  onMenuClick, 
  onSidebarToggle, 
  isSidebarCollapsed 
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchPendingFeedbackCount();
      const interval = setInterval(fetchPendingFeedbackCount, 30000);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  const fetchPendingFeedbackCount = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/feedback');
      const feedbacks = response.data;
      const pending = feedbacks.filter((fb) => fb.status === 'pending').length;
      setPendingCount(pending);
    } catch (error) {
      console.error('Error fetching feedback count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleNotificationClick = () => {
    if (pendingCount > 0) {
      router.push('/admin/feedback');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLanguageOpen) {
        const target = event.target;
        if (!target.closest('.language-dropdown')) {
          setIsLanguageOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isLanguageOpen]);

  if (!mounted) return null;

  return (
    <header className="bg-surface dark:bg-surface border-b border-border dark:border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between transition-colors duration-300 shadow-md">
      <div className="flex items-center">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="mr-3 sm:mr-4 p-2 rounded-md transition-all duration-300 hover:scale-105 text-text-primary dark:text-text-primary hover:bg-border dark:hover:bg-border lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}

        {onSidebarToggle && (
          <button
            onClick={onSidebarToggle}
            className="hidden mr-3 sm:mr-4 p-2 rounded-md transition-all duration-300 hover:scale-105 text-text-primary dark:text-text-primary hover:bg-border dark:hover:bg-border lg:flex items-center"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}

        <h1 className="text-lg sm:text-xl font-semibold transition-colors duration-300 text-text-primary dark:text-text-primary">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-border dark:hover:bg-border"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <FaSun className="text-warning h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <FaMoon className="text-text-primary h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </button>

        <button 
          onClick={handleNotificationClick}
          className="p-2 rounded-full transition-all duration-300 hover:scale-105 relative text-text-primary dark:text-text-primary hover:bg-border dark:hover:bg-border"
          aria-label={`${pendingCount} pending feedback${pendingCount !== 1 ? 's' : ''}`}
          title={pendingCount > 0 ? `${pendingCount} pending feedback${pendingCount !== 1 ? 's' : ''} need response` : 'No pending feedback'}
        >
          <Bell className="h-5 w-5 sm:h-5 sm:w-5" />
          
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] sm:text-xs font-bold min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-[20px] flex items-center justify-center px-1 shadow-lg animate-pulse border-2 border-white dark:border-gray-800">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
          
          {isLoading && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gray-400 animate-spin border-2 border-white dark:border-gray-800" />
          )}
        </button>

        {/* <div className="relative language-dropdown">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLanguageOpen(!isLanguageOpen);
            }}
            className="flex items-center space-x-1 sm:space-x-2 p-2 rounded-lg transition-all duration-300 hover:scale-105 text-text-primary dark:text-text-primary hover:bg-border dark:hover:bg-border"
            aria-label="Select language"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
              />
            </svg>
            <span className="hidden sm:inline text-sm">EN</span>
            <FaChevronDown 
              className={`transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`} 
              size={12} 
            />
          </button>
          
          {isLanguageOpen && (
            <div 
              className="absolute right-0 mt-2 w-40 bg-surface dark:bg-surface border border-border dark:border-border rounded-lg shadow-lg py-2 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="block w-full px-4 py-2 text-left transition-colors duration-200 text-sm text-text-primary dark:text-text-primary hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/20">
                English
              </button>
              <button className="block w-full px-4 py-2 text-left transition-colors duration-200 text-sm text-text-primary dark:text-text-primary hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/20">
                Amharic
              </button>
            </div>
          )}
        </div> */}

        {/* <div className="flex items-center">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center transition-all duration-300 bg-primary/10 dark:bg-primary/20">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-primary" />
          </div>
          <div className="ml-2 hidden md:block">
            <p className="text-sm font-medium transition-colors duration-300 text-text-primary dark:text-text-primary">
              {user?.name || user?.email || user?.phone || 'Admin User'}
            </p>
            <p className="text-xs transition-colors duration-300 text-text-secondary dark:text-text-secondary">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Administrator'}
            </p>
          </div>
        </div> */}

        {/* <button
          onClick={handleLogout}
          className="p-2 rounded-md transition-all duration-300 hover:scale-105 text-error hover:bg-error/10 dark:text-error dark:hover:bg-error/20"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
        </button> */}
      </div>
    </header>
  );
}