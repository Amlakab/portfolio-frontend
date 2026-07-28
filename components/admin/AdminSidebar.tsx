'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth';
import { 
  Home, Users, X, Settings, LogOut, ChevronLeft, ChevronRight,
  FileText, MessageSquare, Wallet, Shield, 
  Layers, TrendingUp, Folder, School, Code,
  QrCode, Users as UsersIcon
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
    name: 'Food', 
    href: '/admin/foods', 
    icon: FileText,
    allowedRoles: ['admin', 'Priesedant', 'accountant', 'Secretary', 'Limat', 'manager'] 
  },
  { 
    name: 'Menu Approve', 
    href: '/admin/food-approve', 
    icon: FileText,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'accountant', 'Secretary', 'Limat', 'manager', 'chef']
  },
  { 
    name: 'Manager Order', 
    href: '/admin/manager/orders', 
    icon: Wallet,
    allowedRoles: ['admin', 'Priesedant', 'accountant', 'Limat', 'manager'] 
  },
  { 
    name: 'Chef Order', 
    href: '/admin/chef/orders', 
    icon: Wallet,
    allowedRoles: ['admin', 'Priesedant', 'accountant', 'Limat', 'chef'] 
  },
  { 
    name: 'Waiter Order', 
    href: '/admin/waiter/orders', 
    icon: Wallet,
    allowedRoles: ['admin', 'Priesedant', 'accountant', 'Limat', 'waiter'] 
  },
  { 
    name: 'My Orders', 
    href: '/admin/customer/my-orders',
    icon: Wallet,
    allowedRoles: ['admin', 'Priesedant', 'accountant', 'Limat', 'user', 'customer']
  },
  { 
    name: 'Feedback', 
    href: '/admin/feedback', 
    icon: MessageSquare,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'Secretary', 'Limat', 'manager', 'chef', 'waiter', 'customer'] 
  },
  { 
    name: 'QR Code', 
    href: '/admin/qrcode', 
    icon: QrCode,
    allowedRoles: ['admin', 'Priesedant', 'Vice-Priesedant', 'accountant', 'Secretary'] 
  },
  {
    name: 'Reports', 
    href: '/admin/reports', 
    icon: TrendingUp,
    allowedRoles: ['admin', 'Priesedant', 'accountant', 'Limat', 'Audite', 'manager'] 
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

  const handleLogout = () => {
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
                
                if (item.parent) return null;
                
                const isActive = pathname === '/admin' && item.href === '/admin' ? 
                  !searchParams.get('tab') : 
                  pathname === item.href || pathname.startsWith(item.href.split('?')[0] + '/');
                
                return (
                  <li key={item.name} className="relative">
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
                    
                    {!isCollapsed && isPortfolioParent && subItems.length > 0 && (
                      <ul className="ml-6 mt-1 space-y-1 border-l-2 border-[#00ffff]/20 pl-3">
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
                                      ? "bg-[#00ffff20] text-[#00ffff]" 
                                      : "bg-blue-100 text-blue-700"
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
        
        {/* User Footer */}
        <div className={cn(
          "absolute bottom-0 w-full p-4 border-t transition-colors duration-300",
          theme === 'dark' ? 'border-[#00ffff]/20' : 'border-gray-200',
          isCollapsed && 'px-2'
        )}>
          {!isCollapsed ? (
            <div className="flex items-center px-3 py-2">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center mr-3 transition-colors duration-300",
                theme === 'dark' ? 'bg-[#00ffff20]' : 'bg-blue-100'
              )}>
                <UsersIcon className={cn(
                  "h-4 w-4 transition-colors duration-300",
                  theme === 'dark' ? 'text-[#00ffff]' : 'text-blue-600'
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate transition-colors duration-300",
                  theme === 'dark' ? 'text-[#ccd6f6]' : 'text-gray-900'
                )}>
                  {userDisplayName}
                </p>
                <p className={`text-xs truncate px-2 py-0.5 rounded-full w-fit ${getRoleColor(userRole)}`}>
                  {userRoleDisplay}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className={cn(
                  "p-1.5 rounded-md transition-all duration-300 hover:scale-105 ml-2",
                  theme === 'dark' 
                    ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' 
                    : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                )}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300",
                theme === 'dark' ? 'bg-[#00ffff20]' : 'bg-blue-100'
              )}>
                <UsersIcon className={cn(
                  "h-4 w-4 transition-colors duration-300",
                  theme === 'dark' ? 'text-[#00ffff]' : 'text-blue-600'
                )} />
              </div>
              <button
                onClick={handleLogout}
                className={cn(
                  "p-1.5 rounded-md transition-all duration-300 hover:scale-105",
                  theme === 'dark' 
                    ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' 
                    : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                )}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Floating Toggle Toggle Button */}
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