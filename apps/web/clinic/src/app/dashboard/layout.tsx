'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import Header from '../../components/molecule/Header';
import ApiManager from '../../services/api';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Activity,
  Settings,
  Building2,
  CreditCard,
  BarChart3,
  Heart,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const { userData, currentClinic } = useAppSelector(state => state.user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && !userData) {
        try {
          await ApiManager.getMe();
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [isAuthenticated, userData]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: 'Patients',
      href: '/dashboard/patients',
      icon: Users,
      show: currentClinic !== null,
    },
    {
      name: 'Appointments',
      href: '/dashboard/appointments',
      icon: Calendar,
      show: currentClinic !== null,
    },
    {
      name: 'Treatments',
      href: '/dashboard/treatments',
      icon: Heart,
      show: currentClinic !== null,
    },
    {
      name: 'Documents',
      href: '/dashboard/documents',
      icon: FileText,
      show: currentClinic !== null,
    },
    {
      name: 'Reports',
      href: '/dashboard/reports',
      icon: BarChart3,
      show: currentClinic !== null,
    },
    {
      name: 'Team',
      href: '/dashboard/team',
      icon: UserPlus,
      show: userData?.organization?.is_owner === true || currentClinic?.is_admin === true,
    },
    {
      name: 'Clinics',
      href: '/dashboard/clinics',
      icon: Building2,
      show: userData?.organization?.is_owner === true,
    },
    {
      name: 'Organization',
      href: '/dashboard/organization',
      icon: Building2,
      show: userData?.organization?.is_owner === true,
    },
    {
      name: 'Billing',
      href: '/dashboard/billing',
      icon: CreditCard,
      show: userData?.organization?.is_owner === true || currentClinic?.is_admin === true,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      show: true,
    },
  ];

  const filteredNavItems = navigationItems.filter(item => item.show);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        isMenuOpen={isSidebarOpen}
      />
      
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="flex-1 px-3 space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className={`
                      mr-3 h-5 w-5 transition-colors
                      ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}
                    `} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="px-3 py-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                {currentClinic ? (
                  <div>
                    <p className="font-medium text-gray-700">{currentClinic.name}</p>
                    <p>{currentClinic.role}</p>
                  </div>
                ) : userData?.organization?.is_owner ? (
                  <div>
                    <p className="font-medium text-gray-700">{userData.organization.name}</p>
                    <p>Organization Admin</p>
                  </div>
                ) : (
                  <p>Select a clinic to continue</p>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;