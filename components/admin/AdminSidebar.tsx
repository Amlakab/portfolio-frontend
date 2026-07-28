'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth';
import { 
  Home, Users, X, Settings, LogOut, ChevronLeft, ChevronRight,
  MessageSquare, Shield, Layers, TrendingUp, Folder, School, Code,
  QrCode, Users as UsersIcon, ChevronUp, ChevronDown, User as UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Article, FormatQuote, Work } from '@mui/icons-material';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: string[];
  parent?: string;
}

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface User {
  role: string;
  name?: string;
  phone?: string;
  email?: string;
}

const allMenuItems: MenuItem[] = [
  { 
    name: 'Home', 
    href: '/admin',
    icon: Home,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'accountant', 'Secretary', 'Limat', 'Abalat-Guday', 'Mezmur', 'Timhrt', 'Muyana-Terado', 'Bachna-Department', 'Audite', 'manager', 'chef', 'waiter', 'customer'] 
  },
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: Users,
    allowedRoles: ['admin']
  },
  { 
    name: 'Portfolio', 
    href: '/admin', 
    icon: Layers,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'accountant', 'Secretary', 'Limat', 'manager'] 
  },
  { 
    name: 'Projects', 
    href: '/admin?tab=projects', 
    icon: Folder,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'accountant', 'Secretary', 'Limat', 'manager'],
    parent: 'Portfolio'
  },
  { 
    name: 'Experiences', 
    href: '/admin?tab=experiences', 
    icon: Work,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'accountant', 'Secretary', 'Limat', 'manager'],
    parent: 'Portfolio'
  },
  { 
    name: 'Educations', 
    href: '/admin?tab=educations', 
    icon: School,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'accountant', 'Secretary', 'Limat', 'manager'],
    parent: 'Portfolio'
  },
  { 
    name: 'Testimonials', 
    href: '/admin?tab=testimonials', 
    icon: FormatQuote,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'accountant', 'Secretary', 'Limat', 'manager'],
    parent: 'Portfolio'
  },
  { 
    name: 'Blog', 
    href: '/admin?tab=blog', 
    icon: Article,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'accountant', 'Secretary', 'Limat', 'manager'],
    parent: 'Portfolio'
  },
  { 
    name: 'Skills', 
    href: '/admin?tab=skills', 
    icon: Code,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'accountant', 'Secretary', 'Limat', 'manager'],
    parent: 'Portfolio'
  },
  { 
    name: 'Settings', 
    href: '/admin?tab=settings', 
    icon: Settings,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'accountant', 'Secretary', 'Limat', 'manager'],
    parent: 'Portfolio'
  },
  { 
    name: 'Feedback', 
    href: '/admin/feedback', 
    icon: MessageSquare,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'Secretary', 'Limat', 'manager', 'chef', 'waiter', 'customer'] 
  },
  { 
    name: 'Security', 
    href: '/admin/security', 
    icon: Shield,
    allowedRoles: ['admin', 'Priesedant'] 
  }
];

export default function AdminSidebar({ 
  isOpen = false, 
  onClose = () => {}, 
  isCollapsed = false,
  onToggleCollapse = () => {} 
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  
  // Track open state for expandable menus (e.g. Portfolio)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  
  // Track profile dropdown menu state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user?.role) {
      const filtered = allMenuItems.filter(item => 
        item.allowedRoles.includes((user as User).role)
      );
      setFilteredMenuItems(filtered);
    } else {
      setFilteredMenuItems([]);
    }
  }, [user]);

  // Auto-expand Portfolio if an active tab belongs to its sub-items
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (pathname === '/admin' && currentTab) {
      setExpandedMenus(prev => prev.includes('Portfolio') ? prev : [...prev, 'Portfolio']);
    }
  }, [pathname, searchParams]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSubMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) ? prev.filter(name => name !== menuName) : [...prev, menuName]
    );
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    router.push('/');
    onClose?.();
  };

  if (!mounted) return null;

  const userRole = (user as User)?.role || 'unknown';
  const userDisplayName = (user as User)?.name || (user as User)?.phone || 'Admin User';
  const userRoleDisplay = (user as User)?.role ? 
    (user as User).role.charAt(0).toUpperCase() + (user as User).role.slice(1).replace('-', ' ') : 
    'Administrator';

  const getSidebarTitle = () => {
    switch(userRole) {
      case 'admin': return 'Admin Panel';
      case 'Priesedant': return 'President Panel';
      case 'Vice-Priesedant': return 'Vice President Panel';
      case 'accountant': return 'Accountant Panel';
      case 'Secretary': return 'Secretary Panel';
      case 'Limat': return 'Finance Panel';
      case 'manager': return 'Manager Panel';
      case 'chef': return 'Chef Panel';
      case 'waiter': return 'Waiter Panel';
      default: return 'Admin Panel';
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'admin': theme === 'dark' ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700',
      'Priesedant': theme === 'dark' ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700',
      'Vice-Priesedant': theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700',
      'accountant': theme === 'dark' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700',
      'Secretary': theme === 'dark' ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700',
      'Limat': theme === 'dark' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700',
      'manager': theme === 'dark' ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700',
      'chef': theme === 'dark' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-fuchsia-100 text-fuchsia-700',
      'waiter': theme === 'dark' ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-700',
    };
    return colors[role] || (theme === 'dark' ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700');
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}
      
      <div className={cn(
        "fixed top-0 left-0 h-full z-50 transform transition-all duration-300 ease-in-out",
        "lg:relative lg:translate-x-0 lg:z-auto lg:h-screen lg:sticky lg:top-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-20" : "w-64",
        theme === 'dark' 
          ? "bg-[#0a192f] border-r border-[#00ffff]/20" 
          : "bg-white border-r border-gray-200"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b transition-colors duration-300",
          theme === 'dark' ? 'border-[#00ffff]/20' : 'border-gray-200',
          isCollapsed && 'justify-center'
        )}>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className={cn(
                "text-lg font-semibold transition-colors duration-300",
                theme === 'dark' ? 'text-[#ccd6f6]' : 'text-gray-900'
              )}>
                {getSidebarTitle()}
              </h2>
              <span className={`text-xs px-2 py-1 rounded-full w-fit mt-1 ${getRoleColor(userRole)}`}>
                {userRoleDisplay}
              </span>
            </div>
          )}
          
          {!isCollapsed && (
            <button 
              onClick={onClose}
              className={cn(
                "p-1 rounded-md transition-all duration-300 hover:scale-105 lg:hidden",
                theme === 'dark' ? 'hover:bg-[#00ffff20] text-white' : 'hover:bg-gray-100 text-gray-900'
              )}
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={onToggleCollapse}
            className={cn(
              "hidden lg:flex items-center justify-center p-1.5 rounded-md transition-all duration-300 hover:scale-105",
              theme === 'dark' ? 'hover:bg-[#00ffff20] text-white' : 'hover:bg-gray-100 text-gray-900',
              isCollapsed && 'w-full'
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        
        {/* Navigation List */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-140px)]">
          <ul className="space-y-2">
            {filteredMenuItems.length > 0 ? (
              filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isPortfolioParent = item.name === 'Portfolio' && item.href === '/admin';
                const subItems = isPortfolioParent 
                  ? filteredMenuItems.filter(sub => sub.parent === 'Portfolio')
                  : [];
                
                // Hide sub-items from top-level rendering loop
                if (item.parent) return null;
                
                const isMenuExpanded = expandedMenus.includes(item.name);
                const isActive = pathname === '/admin' && item.href === '/admin' ? 
                  !searchParams.get('tab') : 
                  pathname === item.href || pathname.startsWith(item.href.split('?')[0] + '/');

                return (
                  <li key={item.name} className="relative">
                    {/* Parent Menu Item */}
                    {isPortfolioParent ? (
                      <button
                        onClick={() => toggleSubMenu(item.name)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-300 group",
                          isActive 
                            ? theme === 'dark'
                              ? "bg-[#00ffff20] text-[#00ffff]" 
                              : "bg-blue-100 text-blue-700"
                            : theme === 'dark'
                              ? "text-gray-300 hover:bg-[#00ffff10] hover:text-[#00ffff]"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <div className="flex items-center">
                          <Icon className={cn(
                            "h-5 w-5 flex-shrink-0 transition-colors duration-300",
                            isCollapsed ? "mx-auto" : "mr-3"
                          )} />
                          
                          {!isCollapsed && (
                            <span className="font-medium text-sm truncate">
                              {item.name}
                            </span>
                          )}
                        </div>

                        {!isCollapsed && (
                          <ChevronDown className={cn(
                            "h-4 w-4 transition-transform duration-300 text-gray-400",
                            isMenuExpanded && "rotate-180"
                          )} />
                        )}

                        {isCollapsed && (
                          <div className={cn(
                            "absolute left-full ml-2 px-3 py-2 rounded-md opacity-0 invisible",
                            "group-hover:opacity-100 group-hover:visible transition-all duration-300",
                            "whitespace-nowrap z-50 shadow-lg pointer-events-none",
                            theme === 'dark' 
                              ? 'bg-[#0a192f] border border-[#00ffff]/20 text-white' 
                              : 'bg-white border border-gray-200 text-gray-900'
                          )}>
                            {item.name}
                          </div>
                        )}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-3 rounded-lg transition-all duration-300 group",
                          isActive 
                            ? theme === 'dark'
                              ? "bg-[#00ffff20] border-l-2 border-[#00ffff] text-[#00ffff]" 
                              : "bg-blue-100 border-l-2 border-blue-600 text-blue-700"
                            : theme === 'dark'
                              ? "text-gray-300 hover:bg-[#00ffff10] hover:text-[#00ffff] hover:border-l-2 hover:border-[#00ffff]/50"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:border-l-2 hover:border-gray-300"
                        )}
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            onClose?.();
                          }
                        }}
                      >
                        <Icon className={cn(
                          "h-5 w-5 flex-shrink-0 transition-colors duration-300",
                          isCollapsed ? "mx-auto" : "mr-3"
                        )} />
                        
                        {!isCollapsed && (
                          <span className="font-medium text-sm truncate">
                            {item.name}
                          </span>
                        )}

                        {isCollapsed && (
                          <div className={cn(
                            "absolute left-full ml-2 px-3 py-2 rounded-md opacity-0 invisible",
                            "group-hover:opacity-100 group-hover:visible transition-all duration-300",
                            "whitespace-nowrap z-50 shadow-lg pointer-events-none",
                            theme === 'dark' 
                              ? 'bg-[#0a192f] border border-[#00ffff]/20 text-white' 
                              : 'bg-white border border-gray-200 text-gray-900'
                          )}>
                            {item.name}
                          </div>
                        )}
                      </Link>
                    )}
                    
                    {/* Collapsible Sub-menu under Portfolio */}
                    {!isCollapsed && isPortfolioParent && subItems.length > 0 && isMenuExpanded && (
                      <ul className="ml-6 mt-1 space-y-1 border-l-2 border-[#00ffff]/20 pl-3 transition-all duration-300">
                        {subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = pathname === '/admin' && 
                            searchParams.get('tab') === subItem.href.split('?tab=')[1];
                          
                          return (
                            <li key={subItem.name}>
                              <Link
                                href={subItem.href}
                                className={cn(
                                  "flex items-center px-3 py-2 rounded-lg transition-all duration-300 text-sm",
                                  isSubActive 
                                    ? theme === 'dark'
                                      ? "bg-[#00ffff20] text-[#00ffff] font-semibold" 
                                      : "bg-blue-100 text-blue-700 font-semibold"
                                    : theme === 'dark'
                                      ? "text-gray-400 hover:bg-[#00ffff10] hover:text-[#00ffff]"
                                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                )}
                                onClick={() => {
                                  if (window.innerWidth < 1024) {
                                    onClose?.();
                                  }
                                }}
                              >
                                <SubIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="truncate">{subItem.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-4 text-center">
                <div className={cn(
                  "p-3 rounded-lg transition-colors duration-300",
                  theme === 'dark' ? 'bg-[#00ffff10] text-[#a8b2d1]' : 'bg-blue-50 text-gray-600'
                )}>
                  <p className="text-sm font-medium">No Access</p>
                  <p className="text-xs mt-1">Contact administrator for permissions</p>
                </div>
              </li>
            )}
          </ul>
        </nav>
        
        {/* User Footer with Toggle Dropdown Menu */}
        <div 
          ref={profileMenuRef}
          className={cn(
            "absolute bottom-0 w-full p-3 border-t transition-colors duration-300",
            theme === 'dark' ? 'border-[#00ffff]/20 bg-[#0a192f]' : 'border-gray-200 bg-white'
          )}
        >
          {/* Dropdown Popup Panel */}
          {isProfileOpen && (
            <div className={cn(
              "absolute bottom-full left-2 right-2 mb-2 p-2 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-200 z-50 animate-in fade-in slide-in-from-bottom-2",
              theme === 'dark' 
                ? 'bg-[#0a192f]/95 border-[#00ffff]/30 text-white' 
                : 'bg-white/95 border-gray-200 text-gray-800'
            )}>
              <div className="p-2 border-b border-gray-200/20">
                <p className="font-semibold text-sm truncate">{userDisplayName}</p>
                <p className="text-xs text-gray-400 truncate">{(user as User)?.email || (user as User)?.phone || 'User Account'}</p>
              </div>

              <div className="py-1 space-y-0.5">
                <Link
                  href="/admin/profile"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (window.innerWidth < 1024) onClose?.();
                  }}
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                    theme === 'dark' 
                      ? 'hover:bg-[#00ffff]/10 text-gray-200 hover:text-[#00ffff]' 
                      : 'hover:bg-gray-100 text-gray-700'
                  )}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  View Profile
                </Link>

                <Link
                  href="/admin?tab=settings"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (window.innerWidth < 1024) onClose?.();
                  }}
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                    theme === 'dark' 
                      ? 'hover:bg-[#00ffff]/10 text-gray-200 hover:text-[#00ffff]' 
                      : 'hover:bg-gray-100 text-gray-700'
                  )}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Link>
              </div>

              <div className="pt-1 border-t border-gray-200/20">
                <button
                  onClick={handleLogout}
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                    theme === 'dark' 
                      ? 'hover:bg-red-500/20 text-red-400' 
                      : 'hover:bg-red-50 text-red-600'
                  )}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </button>
              </div>
            </div>
          )}

          {/* User Profile Button Trigger */}
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={cn(
              "w-full flex items-center p-2 rounded-xl transition-all duration-200",
              isProfileOpen 
                ? (theme === 'dark' ? 'bg-[#00ffff]/10' : 'bg-gray-100')
                : (theme === 'dark' ? 'hover:bg-[#00ffff]/10' : 'hover:bg-gray-50'),
              isCollapsed && "justify-center"
            )}
          >
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 flex-shrink-0",
              theme === 'dark' ? 'bg-[#00ffff20]' : 'bg-blue-100'
            )}>
              <UsersIcon className={cn(
                "h-4 w-4 transition-colors duration-300",
                theme === 'dark' ? 'text-[#00ffff]' : 'text-blue-600'
              )} />
            </div>

            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0 text-left ml-3">
                  <p className={cn(
                    "text-sm font-medium truncate transition-colors duration-300",
                    theme === 'dark' ? 'text-[#ccd6f6]' : 'text-gray-900'
                  )}>
                    {userDisplayName}
                  </p>
                  <p className={`text-[10px] truncate px-1.5 py-0.5 rounded-full w-fit ${getRoleColor(userRole)}`}>
                    {userRoleDisplay}
                  </p>
                </div>
                <ChevronUp className={cn(
                  "h-4 w-4 ml-1 transition-transform duration-200 text-gray-400",
                  isProfileOpen ? "rotate-0" : "rotate-180"
                )} />
              </>
            )}
          </button>
        </div>

        {/* Floating Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className={cn(
            "hidden absolute -right-3 top-16 items-center justify-center p-1.5 rounded-full",
            "transition-all duration-300 hover:scale-105 z-40 shadow-lg lg:flex",
            theme === 'dark' 
              ? 'bg-[#00ffff] hover:bg-[#00ffff]/80 text-[#0a192f]' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </>
  );
}