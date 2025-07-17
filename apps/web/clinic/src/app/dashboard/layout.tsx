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
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healui-physio mx-auto"></div>
          <p className="mt-4 text-text-gray font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        isMenuOpen={isSidebarOpen}
      />
      
      <div className="flex h-[calc(100vh-60px)]">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-border-color transform transition-all duration-300 ease-smooth lg:translate-x-0 lg:static lg:inset-0 shadow-sm
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col pt-6 pb-4 overflow-y-auto custom-scrollbar">
            {/* Brand Logo */}
            <div className="px-6 mb-8">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-physio p-2 rounded-lg">
                  <span className="text-white text-lg">🏃</span>
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold text-healui-primary">Healui.ai</h1>
                  <p className="text-xs text-text-light">Clinical Platform</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-healui-physio/10 to-healui-primary/10 text-healui-primary border-r-2 border-healui-physio' 
                        : 'text-text-gray hover:text-text-dark hover:bg-gray-50'
                      }
                    `}
                  >
                    <item.icon className={`
                      mr-3 h-5 w-5 transition-colors
                      ${isActive ? 'text-healui-physio' : 'text-text-light group-hover:text-text-gray'}
                    `} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="px-4 py-4 border-t border-border-color">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-text-light">
                  {currentClinic ? (
                    <div>
                      <p className="font-semibold text-text-dark text-sm">{currentClinic.name}</p>
                      <p className="text-healui-physio font-medium">{currentClinic.role}</p>
                    </div>
                  ) : userData?.organization?.is_owner ? (
                    <div>
                      <p className="font-semibold text-text-dark text-sm">{userData.organization.name}</p>
                      <p className="text-healui-physio font-medium">Organization Admin</p>
                    </div>
                  ) : (
                    <p className="text-text-gray">Select a clinic to continue</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="py-2">
            <div className="max-w-full mx-auto px-3">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;