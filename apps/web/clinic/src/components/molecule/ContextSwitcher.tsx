'use client';

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setCurrentClinic } from '../../store/slices/userSlice';
import { 
  ChevronDown, 
  Check, 
  Building2, 
  Shield, 
  Stethoscope,
  User
} from 'lucide-react';

const ContextSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userData, currentClinic } = useAppSelector(state => state.user);
  const [isOpen, setIsOpen] = useState(false);

  if (!userData?.organization) {
    return null;
  }

  const handleClinicChange = (clinic: typeof currentClinic) => {
    if (clinic) {
      dispatch(setCurrentClinic(clinic));
      setIsOpen(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'physiotherapist':
        return <Stethoscope className="h-3 w-3" />;
      case 'receptionist':
        return <User className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-gray-600" />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">
              {currentClinic?.name || userData.organization.name}
            </p>
            <p className="text-xs text-gray-500">
              {userData.organization.is_owner ? (
                <span className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Organization Admin</span>
                </span>
              ) : currentClinic ? (
                <span className="flex items-center space-x-1">
                  {getRoleIcon(currentClinic.role)}
                  <span>{currentClinic.role}</span>
                </span>
              ) : (
                'Select a clinic'
              )}
            </p>
          </div>
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            {userData.organization.is_owner && (
              <>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </div>
                <button
                  onClick={() => {
                    dispatch(setCurrentClinic(null));
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    !currentClinic ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-4 w-4 text-gray-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {userData.organization.name}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center space-x-1">
                        <Shield className="h-3 w-3" />
                        <span>Organization Admin</span>
                      </p>
                    </div>
                  </div>
                  {!currentClinic && <Check className="h-4 w-4 text-blue-600" />}
                </button>
                <div className="my-2 border-t border-gray-100"></div>
              </>
            )}

            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Clinics
            </div>
            {userData.organization.clinics.map((clinic) => (
              <button
                key={clinic.id}
                onClick={() => handleClinicChange(clinic)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                  currentClinic?.id === clinic.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {clinic.name}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center space-x-1">
                      {getRoleIcon(clinic.role)}
                      <span>{clinic.role}</span>
                      {clinic.is_admin && (
                        <>
                          <span className="text-gray-400">&quot;</span>
                          <span className="text-blue-600">Clinic Admin</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                {currentClinic?.id === clinic.id && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextSwitcher;