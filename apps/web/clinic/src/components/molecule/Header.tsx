'use client';

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/auth.slice';
import { clearUserData } from '../../store/slices/userSlice';
import { useRouter } from 'next/navigation';
import ContextSwitcher from './ContextSwitcher';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  HelpCircle,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen = false }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { userData, currentClinic } = useAppSelector(state => state.user);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearUserData());
    router.push('/login');
  };

  const notifications = [
    {
      id: 1,
      title: 'New appointment request',
      message: 'John Doe requested an appointment for tomorrow',
      time: '5 minutes ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Staff meeting reminder',
      message: 'Weekly team meeting starts in 30 minutes',
      time: '30 minutes ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Patient feedback',
      message: 'Sarah Johnson left a 5-star review',
      time: '1 hour ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;
  
  // Check if user is a physiotherapist
  const isPhysiotherapist = currentClinic?.role === 'physiotherapist';

  return (
    <header className="glass border-b border-border-color sticky top-0 z-40 shadow-sm">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg hover:bg-healui-physio/10 transition-all duration-200 lg:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-text-gray" />
              ) : (
                <Menu className="h-5 w-5 text-text-gray" />
              )}
            </button>

            {/* Context Switcher */}
            <ContextSwitcher />

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-light" />
                <input
                  type="text"
                  placeholder="Search patients, appointments..."
                  className="w-64 lg:w-80 pl-10 pr-3 py-2.5 border border-border-color rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-healui-physio focus:border-healui-physio 
                           transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Search Icon - Mobile Only */}
            <button className="p-2 rounded-lg hover:bg-healui-physio/10 transition-all duration-200 md:hidden">
              <Search className="h-5 w-5 text-text-gray" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-healui-physio/10 transition-all duration-200 relative"
              >
                <Bell className="h-5 w-5 text-text-gray" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 bg-gradient-physio text-white text-xs rounded-full flex items-center justify-center font-medium shadow-physio">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-border-color">
                  <div className="p-4 border-b border-border-color">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-text-dark">Notifications</h3>
                      <button className="text-sm text-healui-physio hover:text-healui-primary font-medium">
                        Mark all as read
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-border-color hover:bg-healui-physio/5 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-healui-physio/10' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-text-dark">
                              {notification.title}
                            </p>
                            <p className="text-sm text-text-gray mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-text-light mt-2">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <span className="h-2 w-2 bg-healui-physio rounded-full mt-1.5"></span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-border-color">
                    <button className="text-sm text-healui-physio hover:text-healui-primary font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-healui-physio/10 transition-all duration-200"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-physio flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {userData?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <ChevronDown className="h-4 w-4 text-text-light" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-border-color">
                  <div className="p-4 border-b border-border-color">
                    <p className="text-sm font-semibold text-text-dark">{userData?.name}</p>
                    <p className="text-xs text-text-light mt-1">
                      {userData?.organization?.name}
                    </p>
                  </div>
                  <div className="p-2">
                    {isPhysiotherapist ? (
                      <button 
                        onClick={() => {
                          setShowUserMenu(false);
                          router.push('/dashboard/profile');
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-healui-physio/10 transition-all duration-200 text-left"
                      >
                        <User className="h-4 w-4 text-text-light" />
                        <span className="text-sm text-text-gray">Profile</span>
                      </button>
                    ) : (
                      <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-healui-physio/10 transition-all duration-200 text-left">
                        <User className="h-4 w-4 text-text-light" />
                        <span className="text-sm text-text-gray">Profile</span>
                      </button>
                    )}
                    <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-healui-physio/10 transition-all duration-200 text-left">
                      <Settings className="h-4 w-4 text-text-light" />
                      <span className="text-sm text-text-gray">Settings</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-healui-physio/10 transition-all duration-200 text-left">
                      <HelpCircle className="h-4 w-4 text-text-light" />
                      <span className="text-sm text-text-gray">Help & Support</span>
                    </button>
                    <div className="my-2 border-t border-border-color"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 text-left text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;