'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { getTokenCookie } from '@rehab/shared';
import ApiManager from '../../services/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      const token = getTokenCookie('access_token');
      
      if (token) {
        try {
          // Verify token by fetching user data
          await ApiManager.getMe();
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // Token is invalid, auth state will remain false
        }
      }
    };

    initAuth();
  }, [dispatch]);

  return <>{children}</>;
}