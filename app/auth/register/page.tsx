'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Eye, EyeOff, User, Mail, Phone, Lock, 
  Coffee, Truck, Award, Users
} from 'lucide-react';
import { useAuth } from '@/lib/auth'; // Import useAuth

export default function RegisterPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { register } = useAuth(); // Get register function from auth context
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    background: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setMessage('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!agreeTerms) {
      setMessage('Please agree to the Terms of Service');
      toast.error('Please agree to the Terms of Service');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Use the register function from auth context
      const userData = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        background: formData.background || '',
        role: 'customer'
      });

      // If registration returns user data (with token), user is already logged in
      if (userData) {
        toast.success('Registration successful! Welcome to Campus Café!');
        router.push('/menu'); // or wherever you want to redirect
      } else {
        // If no user data returned, redirect to login
        toast.success('Registration successful! Please login.');
        router.push('/auth/login');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Registration failed. Please try again.';
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />, title: "Campus Café", description: "Delicious food" },
    { icon: <Truck className="w-4 h-4 sm:w-5 sm:h-5" />, title: "Free Delivery", description: "On campus" },
    { icon: <Award className="w-4 h-4 sm:w-5 sm:h-5" />, title: "Quality Food", description: "Fresh ingredients" },
    { icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />, title: "Community", description: "Join us" },
  ];

  const inputClasses = `w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg 
    focus:outline-none focus:ring-2 transition-colors duration-300 
    ${theme === 'dark'
      ? 'bg-[#1e293b] border-[#334155] text-[#ccd6f6] placeholder-[#94a3b8] focus:ring-[#00ffff]'
      : 'bg-white border-[#e5e7eb] text-[#333333] placeholder-[#999999] focus:ring-[#007bff]'
    }`;

  const labelClasses = `block text-xs sm:text-sm font-medium mb-1.5 ${
    theme === 'dark' ? 'text-[#a8b2d1]' : 'text-[#666666]'
  }`;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#0a192f]' : 'bg-[#f0f0f0]'
    }`}>
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
                theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
              }`}
            >
              Create Account
            </motion.h1>
            <p className={`text-sm sm:text-base md:text-lg ${
              theme === 'dark' ? 'text-[#a8b2d1]' : 'text-[#666666]'
            } max-w-2xl mx-auto px-4`}>
              Join Campus Café and start ordering delicious food today
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-start">
            {/* Registration Form */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border ${
                theme === 'dark' 
                  ? 'bg-[#0f172a80] border-[#334155] backdrop-blur-[10px]' 
                  : 'bg-white border-[#e5e7eb]'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className={`p-2 sm:p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-[#00ffff20]' : 'bg-[#007bff10]'
                }`}>
                  <User className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                  }`} />
                </div>
                <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${
                  theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'
                }`}>
                  Register
                </h2>
              </div>

              <p className={`text-xs sm:text-sm mb-4 sm:mb-6 ${
                theme === 'dark' ? 'text-[#a8b2d1]' : 'text-[#666666]'
              }`}>
                Create your account to order food and track deliveries.
              </p>

              {message && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mb-4 p-3 sm:p-4 rounded-lg text-sm ${
                    message.includes('success') || message.includes('successful')
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  } ${theme === 'dark' ? 'bg-opacity-20' : ''}`}
                >
                  {message}
                </motion.div>
              )}

              <form className="space-y-4 sm:space-y-5" onSubmit={handleRegister}>
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className={labelClasses}>
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`w-4 h-4 ${
                        theme === 'dark' ? 'text-[#94a3b8]' : 'text-[#999999]'
                      }`} />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      className={`${inputClasses} pl-9 sm:pl-10`}
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className={labelClasses}>
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className={`w-4 h-4 ${
                        theme === 'dark' ? 'text-[#94a3b8]' : 'text-[#999999]'
                      }`} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      className={`${inputClasses} pl-9 sm:pl-10`}
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className={labelClasses}>
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className={`w-4 h-4 ${
                        theme === 'dark' ? 'text-[#94a3b8]' : 'text-[#999999]'
                      }`} />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      required
                      className={`${inputClasses} pl-9 sm:pl-10`}
                      placeholder="912345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className={labelClasses}>
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`w-4 h-4 ${
                        theme === 'dark' ? 'text-[#94a3b8]' : 'text-[#999999]'
                      }`} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className={`${inputClasses} pl-9 sm:pl-10 pr-10 sm:pr-12`}
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute inset-y-0 right-3 flex items-center ${
                        theme === 'dark' ? 'text-[#94a3b8] hover:text-[#00ffff]' : 'text-[#999999] hover:text-[#007bff]'
                      }`}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                  </div>
                  <p className="text-[10px] sm:text-xs mt-1 text-[#94a3b8]">
                    Password must be at least 6 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className={labelClasses}>
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`w-4 h-4 ${
                        theme === 'dark' ? 'text-[#94a3b8]' : 'text-[#999999]'
                      }`} />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className={`${inputClasses} pl-9 sm:pl-10 pr-10 sm:pr-12`}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute inset-y-0 right-3 flex items-center ${
                        theme === 'dark' ? 'text-[#94a3b8] hover:text-[#00ffff]' : 'text-[#999999] hover:text-[#007bff]'
                      }`}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                  </div>
                </div>

                {/* Background (Optional) */}
                <div>
                  <label htmlFor="background" className={labelClasses}>
                    Background (Optional)
                  </label>
                  <textarea
                    id="background"
                    rows={2}
                    className={`${inputClasses} resize-none`}
                    placeholder="Tell us about yourself (optional)"
                    value={formData.background}
                    onChange={(e) => setFormData({...formData, background: e.target.value})}
                  />
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-2 sm:gap-3">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className={`mt-1 w-4 h-4 rounded border-2 focus:ring-2 flex-shrink-0 ${
                      theme === 'dark'
                        ? 'bg-[#1e293b] border-[#334155] text-[#00ffff] focus:ring-[#00ffff]'
                        : 'bg-white border-[#e5e7eb] text-[#007bff] focus:ring-[#007bff]'
                    }`}
                  />
                  <label htmlFor="agreeTerms" className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-[#a8b2d1]' : 'text-[#666666]'}`}>
                    I agree to the{' '}
                    <Link href="/terms" className={theme === 'dark' ? 'text-[#00ffff] hover:underline' : 'text-[#007bff] hover:underline'}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className={theme === 'dark' ? 'text-[#00ffff] hover:underline' : 'text-[#007bff] hover:underline'}>
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    theme === 'dark'
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
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#e5e7eb] dark:border-[#334155]">
                <p className={`text-center text-xs sm:text-sm ${theme === 'dark' ? 'text-[#a8b2d1]' : 'text-[#666666]'}`}>
                  Already have an account?{' '}
                  <Link href="/auth/login" className={`font-semibold ${theme === 'dark' ? 'text-[#00ffff] hover:text-[#00b3b3]' : 'text-[#007bff] hover:text-[#0056b3]'} transition duration-200`}>
                    Sign in
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
              {/* Welcome Card */}
              <div className={`rounded-2xl shadow-xl p-4 sm:p-6 border ${
                theme === 'dark' 
                  ? 'bg-[#0f172a80] border-[#334155] backdrop-blur-[10px]' 
                  : 'bg-white border-[#e5e7eb]'
              }`}>
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4">🍽️</div>
                  <h3 className={`text-lg sm:text-xl font-bold mb-2 ${theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'}`}>
                    Welcome to Campus Café
                  </h3>
                  <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-[#a8b2d1]' : 'text-[#666666]'}`}>
                    Join our community and enjoy delicious meals delivered to your doorstep.
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className={`rounded-2xl shadow-xl p-4 sm:p-6 border ${
                theme === 'dark' 
                  ? 'bg-[#0f172a80] border-[#334155] backdrop-blur-[10px]' 
                  : 'bg-white border-[#e5e7eb]'
              }`}>
                <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'}`}>
                  Why Join Us?
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className={`flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-[#1e293b]' : 'bg-[#f8fafc]'}`}>
                      <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 ${theme === 'dark' ? 'bg-[#00ffff20]' : 'bg-[#007bff10]'}`}>
                        <span className={theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'}>
                          {feature.icon}
                        </span>
                      </div>
                      <div>
                        <div className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-[#333333]'}`}>
                          {feature.title}
                        </div>
                        <div className={`text-[10px] sm:text-xs ${theme === 'dark' ? 'text-[#94a3b8]' : 'text-[#999999]'}`}>
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className={`rounded-2xl shadow-xl p-4 sm:p-6 border ${
                theme === 'dark' 
                  ? 'bg-[#0f172a80] border-[#334155] backdrop-blur-[10px]' 
                  : 'bg-white border-[#e5e7eb]'
              }`}>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Link href="/menu" className={`p-3 sm:p-4 rounded-xl text-center transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-[#00ffff10] hover:bg-[#00ffff20] border border-[#00ffff30]'
                      : 'bg-[#007bff10] hover:bg-[#007bff20] border border-[#007bff30]'
                  }`}>
                    <div className={`font-semibold text-sm sm:text-base ${theme === 'dark' ? 'text-[#00ffff]' : 'text-[#007bff]'}`}>
                      View Menu
                    </div>
                    <div className={`text-[10px] sm:text-xs mt-1 ${theme === 'dark' ? 'text-[#94a3b8]' : 'text-[#999999]'}`}>
                      See what's available
                    </div>
                  </Link>
                  <Link href="/about" className={`p-3 sm:p-4 rounded-xl text-center transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-[#1e293b] hover:bg-[#2d3748] border border-[#334155]'
                      : 'bg-[#f8fafc] hover:bg-[#e5e7eb] border border-[#e5e7eb]'
                  }`}>
                    <div className={`font-semibold text-sm sm:text-base ${theme === 'dark' ? 'text-[#ccd6f6]' : 'text-[#333333]'}`}>
                      About
                    </div>
                    <div className={`text-[10px] sm:text-xs mt-1 ${theme === 'dark' ? 'text-[#94a3b8]' : 'text-[#999999]'}`}>
                      Learn about us
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}