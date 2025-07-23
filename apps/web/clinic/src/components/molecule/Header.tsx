'use client';

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/auth.slice';
import { clearUserData } from '../../store/slices/userSlice';
import { useRouter } from 'next/navigation';
import ContextSwitcher from './ContextSwitcher';
import {
  User,
  Settings,
  LogOut,
  HelpCircle,
  ChevronDown,
  Menu,
  X,
  Heart
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

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearUserData());
    router.push('/login');
  };
  
  // Check if user is a physiotherapist
  const isPhysiotherapist = currentClinic?.role === 'physiotherapist';

  return (
    <header className="glass border-b border-border-color sticky top-0 z-40 shadow-sm">
      <div className="px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - Brand */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={onMenuToggle}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-healui-physio/10 transition-all duration-200 lg:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-text-gray" />
              ) : (
                <Menu className="h-5 w-5 text-text-gray" />
              )}
            </button>

            {/* Healui.ai Brand - Mobile First Design */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {/* Icon Logo */}
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-gradient-physio rounded-lg shadow-sm">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              
              {/* Text Logo - Responsive */}
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-display font-bold bg-gradient-physio bg-clip-text text-transparent tracking-tight leading-none">
                  Healui.ai
                </h1>
                {/* Optional tagline for larger screens */}
                <span className="hidden lg:block text-xs text-text-light font-medium">
                  Physiotherapy Management
                </span>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Context Switcher - Hidden on small mobile */}
            <div className="hidden sm:block">
              <ContextSwitcher />
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-healui-physio/10 transition-all duration-200"
              >
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-physio flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-physio">
                  {userData?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-text-light hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 glass rounded-xl shadow-2xl border border-border-color">
                  <div className="p-4 border-b border-border-color">
                    <p className="text-sm font-semibold text-text-dark">{userData?.name}</p>
                    <p className="text-xs text-text-light mt-1">
                      {userData?.organization?.name}
                    </p>
                  </div>
                  
                  {/* Context Switcher for Mobile - Only show on small screens */}
                  <div className="sm:hidden p-3 border-b border-border-color">
                    <ContextSwitcher />
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