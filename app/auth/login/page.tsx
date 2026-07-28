// app/auth/login/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Eye, EyeOff, Phone, Lock, 
  Utensils, Clock, Truck, 
  ShoppingBag, Shield, Bell
} from 'lucide-react';

export default function LoginPage() {
  const { isDarkMode } = useTheme();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, loginWithOtp } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      let user;
      if (isOtpLogin) {
        user = await loginWithOtp(phone, otp);
      } else {
        user = await login(phone, password);
      }

      if (user && user.role) {
        toast.success('Login successful! Welcome back!', {
          position: 'top-right',
          autoClose: 2000,
        });

        if (user.role === 'admin' || user.role === 'Priesedant' || user.role === 'Vice-Priesedant' || user.role === 'manager' || user.role === 'chef' || user.role === 'waiter' || user.role === 'customer') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setMessage('Login failed: User data is missing');
        toast.error('Login failed: User data is missing');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Login failed';
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone) {
      setMessage('Please enter your phone number');
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        setMessage('OTP sent to your phone');
        toast.success('OTP sent to your phone');
        setIsOtpLogin(true);
      } else {
        const error = await response.json();
        const errorMsg = error.message || 'Failed to send OTP';
        setMessage(errorMsg);
        toast.error(errorMsg);
      }
    } catch {
      const errorMsg = 'Failed to send OTP';
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" />, title: "Fast Service", description: "Quick order processing" },
    { icon: <Truck className="w-4 h-4 sm:w-5 sm:h-5" />, title: "Delivery", description: "Campus-wide delivery" },
    { icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />, title: "Online Orders", description: "Order ahead online" },
    { icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" />, title: "Secure", description: "Safe & secure payments" },
  ];

  const categories = [
    { emoji: "☕", name: "Coffee" },
    { emoji: "🍕", name: "Pizza" },
    { emoji: "🍔", name: "Burgers" },
    { emoji: "🍜", name: "Noodles" },
    { emoji: "🥗", name: "Salads" },
    { emoji: "🍰", name: "Desserts" },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a192f]' : 'bg-[#f0f0f0]'}`}>
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pt-16 sm:pt-20 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 ${
                isDarkMode ? 'text-[#00ffff]' : 'text-[#007bff]'
              }`}
            >
              Campus Café
            </motion.h1>
            <p className={`text-sm sm:text-base md:text-lg ${
              isDarkMode ? 'text-[#a8b2d1]' : 'text-[#666666]'
            } max-w-2xl mx-auto px-4`}>
              Login to order food, track deliveries, and manage your account
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-start">
            {/* Login Form */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border ${
                isDarkMode 
                  ? 'bg-[#0f172a80] border-[#334155] backdrop-blur-[10px]' 
                  : 'bg-white border-[#e5e7eb]'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className={`p-2 sm:p-3 rounded-xl ${
                  isDarkMode ? 'bg-[#00ffff20]' : 'bg-[#007bff10]'
                }`}>
                  <Utensils className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    isDarkMode ? 'text-[#00ffff]' : 'text-[#007bff]'
                  }`} />
                </div>
                <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${
                  isDarkMode ? 'text-[#00ffff]' : 'text-[#007bff]'
                }`}>
                  Welcome Back
                </h2>
              </div>

              <p className={`text-xs sm:text-sm mb-4 sm:mb-6 ${
                isDarkMode ? 'text-[#a8b2d1]' : 'text-[#666666]'
              }`}>
                Sign in to order food, check your meal plan, or manage your account.
              </p>

              {message && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mb-4 p-3 sm:p-4 rounded-lg text-sm ${
                    message.includes('sent') || message.includes('success')
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  } ${isDarkMode ? 'bg-opacity-20' : ''}`}
                >
                  {message}
                </motion.div>
              )}

              <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin}>
                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phone"
                    className={`block text-xs sm:text-sm font-medium mb-1.5 ${
                      isDarkMode ? 'text-[#a8b2d1]' : 'text-[#666666]'
                    }`}
                  >
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className={`${isDarkMode ? 'text-[#94a3b8]' : 'text-[#999999]'} text-xs sm:text-sm`}>
                        +251
                      </span>
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className={`w-full pl-14 sm:pl-16 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 ${
                        isDarkMode
                          ? 'bg-[#1e293b] border-[#334155] text-[#ccd6f6] placeholder-[#94a3b8] focus:ring-[#00ffff]'
                          : 'bg-white border-[#e5e7eb] text-[#333333] placeholder-[#999999] focus:ring-[#007bff]'
                      }`}
                      placeholder="912345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password or OTP */}
                {!isOtpLogin ? (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="password"
                        className={`block text-xs sm:text-sm font-medium ${
                          isDarkMode ? 'text-[#a8b2d1]' : 'text-[#666666]'
                        }`}
                      >
                        Password *
                      </label>
                      <Link
                        href="/forgot-password"
                        className={`text-xs ${
                          isDarkMode ? 'text-[#00ffff] hover:text-[#00b3b3]' : 'text-[#007bff] hover:text-[#0056b3]'
                        }`}
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 pr-10 sm:pr-12 ${
                          isDarkMode
                            ? 'bg-[#1e293b] border-[#334155] text-[#ccd6f6] placeholder-[#94a3b8] focus:ring-[#00ffff]'
                            : 'bg-white border-[#e5e7eb] text-[#333333] placeholder-[#999999] focus:ring-[#007bff]'
                        }`}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className={`absolute inset-y-0 right-3 flex items-center ${
                          isDarkMode ? 'text-[#94a3b8] hover:text-[#00ffff]' : 'text-[#999999] hover:text-[#007bff]'
                        }`}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="otp"
                      className={`block text-xs sm:text-sm font-medium mb-1.5 ${
                        isDarkMode ? 'text-[#a8b2d1]' : 'text-[#666666]'
                      }`}
                    >
                      OTP Code *
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300 ${
                        isDarkMode
                          ? 'bg-[#1e293b] border-[#334155] text-[#ccd6f6] placeholder-[#94a3b8] focus:ring-[#00ffff]'
                          : 'bg-white border-[#e5e7eb] text-[#333333] placeholder-[#999999] focus:ring-[#007bff]'
                      }`}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <p className="text-[10px] sm:text-xs mt-1 text-[#94a3b8]">
                      We've sent a one-time password to your phone
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-[#00ffff] to-[#00b3b3] text-[#0a192f] hover:opacity-90'
                      : 'bg-gradient-to-r from-[#007bff] to-[#0056b3] text-white hover:opacity-90'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* OTP Option */}
                {!isOtpLogin && (
                  <div className="pt-3 sm:pt-4 border-t border-[#e5e7eb] dark:border-[#334155]">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 border-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? 'border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff20]'
                          : 'border-[#007bff] text-[#007bff] hover:bg-[#007bff10]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Bell className="w-4 h-4" />
                        Login with OTP
                      </div>
                    </button>
                  </div>
                )}
              </form>

              {/* Register Link */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#e5e7eb] dark:border-[#334155]">
                <p className={`text-center text-xs sm:text-sm ${
                  isDarkMode ? 'text-[#a8b2d1]' : 'text-[#666666]'
                }`}>
                  New to Campus Café?{' '}
                  <Link
                    href="/auth/register"
                    className={`font-semibold ${
                      isDarkMode ? 'text-[#00ffff] hover:text-[#00b3b3]' : 'text-[#007bff] hover:text-[#0056b3]'
                    } transition duration-200`}
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </motion.div>

            {/* Features Section */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Quick Categories */}
              <div className={`rounded-2xl shadow-xl p-4 sm:p-6 border ${
                isDarkMode 
                  ? 'bg-[#0f172a80] border-[#334155] backdrop-blur-[10px]' 
                  : 'bg-white border-[#e5e7eb]'
              }`}>
                <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${
                  isDarkMode ? 'text-[#00ffff]' : 'text-[#007bff]'
                }`}>
                  Popular Categories
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {categories.map((cat, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className={`p-2 sm:p-3 rounded-xl text-center ${
                        isDarkMode 
                          ? 'bg-[#1e293b] hover:bg-[#2d3748]' 
                          : 'bg-[#f8fafc] hover:bg-[#e5e7eb]'
                      } transition-colors duration-300`}
                    >
                      <div className="text-2xl sm:text-3xl md:text-4xl mb-1">{cat.emoji}</div>
                      <div className={`text-xs sm:text-sm font-medium ${
                        isDarkMode ? 'text-[#ccd6f6]' : 'text-[#333333]'
                      }`}>
                        {cat.name}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className={`rounded-2xl shadow-xl p-4 sm:p-6 border ${
                isDarkMode 
                  ? 'bg-[#0f172a80] border-[#334155] backdrop-blur-[10px]' 
                  : 'bg-white border-[#e5e7eb]'
              }`}>
                <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${
                  isDarkMode ? 'text-[#00ffff]' : 'text-[#007bff]'
                }`}>
                  Why Campus Café?
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className={`p-2 sm:p-3 rounded-lg ${
                        isDarkMode ? 'bg-[#1e293b]' : 'bg-[#f8fafc]'
                      }`}
                    >
                      <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full mb-1 sm:mb-2 ${
                        isDarkMode ? 'bg-[#00ffff20]' : 'bg-[#007bff10]'
                      }`}>
                        <span className={isDarkMode ? 'text-[#00ffff]' : 'text-[#007bff]'}>
                          {feature.icon}
                        </span>
                      </div>
                      <div className={`text-xs sm:text-sm font-medium ${
                        isDarkMode ? 'text-[#ccd6f6]' : 'text-[#333333]'
                      }`}>
                        {feature.title}
                      </div>
                      <div className={`text-[10px] sm:text-xs ${
                        isDarkMode ? 'text-[#94a3b8]' : 'text-[#999999]'
                      }`}>
                        {feature.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className={`rounded-2xl shadow-xl p-4 sm:p-6 border ${
                isDarkMode 
                  ? 'bg-[#0f172a80] border-[#334155] backdrop-blur-[10px]' 
                  : 'bg-white border-[#e5e7eb]'
              }`}>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Link
                    href="/menu"
                    className={`p-3 sm:p-4 rounded-xl text-center transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-[#00ffff10] hover:bg-[#00ffff20] border border-[#00ffff30]'
                        : 'bg-[#007bff10] hover:bg-[#007bff20] border border-[#007bff30]'
                    }`}
                  >
                    <div className={`font-semibold text-sm sm:text-base ${
                      isDarkMode ? 'text-[#00ffff]' : 'text-[#007bff]'
                    }`}>
                      View Menu
                    </div>
                    <div className={`text-[10px] sm:text-xs mt-1 ${
                      isDarkMode ? 'text-[#94a3b8]' : 'text-[#999999]'
                    }`}>
                      Browse delicious options
                    </div>
                  </Link>
                  <Link
                    href="/about"
                    className={`p-3 sm:p-4 rounded-xl text-center transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-[#1e293b] hover:bg-[#2d3748] border border-[#334155]'
                        : 'bg-[#f8fafc] hover:bg-[#e5e7eb] border border-[#e5e7eb]'
                    }`}
                  >
                    <div className={`font-semibold text-sm sm:text-base ${
                      isDarkMode ? 'text-[#ccd6f6]' : 'text-[#333333]'
                    }`}>
                      About Us
                    </div>
                    <div className={`text-[10px] sm:text-xs mt-1 ${
                      isDarkMode ? 'text-[#94a3b8]' : 'text-[#999999]'
                    }`}>
                      Our story & values
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className={`text-[10px] sm:text-xs ${
              isDarkMode ? 'text-[#94a3b8]' : 'text-[#999999]'
            }`}>
              By signing in, you agree to our{' '}
              <Link href="/terms" className={`${isDarkMode ? 'text-[#00ffff]' : 'text-[#007bff]'} hover:underline`}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className={`${isDarkMode ? 'text-[#00ffff]' : 'text-[#007bff]'} hover:underline`}>
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}