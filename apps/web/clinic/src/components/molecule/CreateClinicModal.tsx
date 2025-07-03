'use client';

import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import ApiManager from '../../services/api';
import {
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  Bed,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface CreateClinicModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  admin_phone: string;
  total_beds: string;
  latitude: string;
  longitude: string;
  facilities: string[];
  working_hours: {
    [key: string]: { open: string; close: string; is_open: boolean };
  };
}

const CreateClinicModal: React.FC<CreateClinicModalProps> = ({ onClose, onSuccess }) => {
  const { userData } = useAppSelector(state => state.user);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newFacility, setNewFacility] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    admin_phone: '',
    total_beds: '',
    latitude: '',
    longitude: '',
    facilities: [],
    working_hours: {
      monday: { open: '09:00', close: '18:00', is_open: true },
      tuesday: { open: '09:00', close: '18:00', is_open: true },
      wednesday: { open: '09:00', close: '18:00', is_open: true },
      thursday: { open: '09:00', close: '18:00', is_open: true },
      friday: { open: '09:00', close: '18:00', is_open: true },
      saturday: { open: '09:00', close: '14:00', is_open: true },
      sunday: { open: '10:00', close: '16:00', is_open: false },
    }
  });

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Clinic name and location' },
    { id: 2, title: 'Contact Details', description: 'Phone, email, and admin' },
    { id: 3, title: 'Additional Info', description: 'Facilities and working hours' }
  ];

  const formatPhoneNumber = (phone: string): string => {
    // If already properly formatted, return as is
    if (/^\+91[6-9]\d{9}$/.test(phone)) {
      return phone;
    }
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // If it starts with 91 and is 12 digits, add + prefix
    if (digits.startsWith('91') && digits.length === 12) {
      return '+' + digits;
    }
    
    // If it's a 10-digit number starting with 6-9, add +91
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      return '+91' + digits;
    }
    
    // If it's 11 digits starting with 9 (probably missing +)
    if (digits.length === 11 && digits.startsWith('9')) {
      return '+' + digits;
    }
    
    // Return the formatted version or original if can't format
    return digits.length >= 10 ? '+91' + digits.slice(-10) : phone;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Clinic name is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
      if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = 'Pincode must be 6 digits';
      }
    }

    if (step === 2) {
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.admin_phone.trim()) newErrors.admin_phone = 'Admin phone is required';
      
      // Validate phone format - should be +91XXXXXXXXXX
      const phoneRegex = /^\+91[6-9]\d{9}$/;
      if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Phone must be a valid Indian mobile number (+91XXXXXXXXXX)';
      }
      if (formData.admin_phone && !phoneRegex.test(formData.admin_phone.replace(/\s/g, ''))) {
        newErrors.admin_phone = 'Admin phone must be a valid Indian mobile number (+91XXXXXXXXXX)';
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Format phone numbers automatically
    if (field === 'phone' || field === 'admin_phone') {
      value = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addFacility = () => {
    if (newFacility.trim() && !formData.facilities.includes(newFacility.trim())) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, newFacility.trim()]
      }));
      setNewFacility('');
    }
  };

  const removeFacility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index)
    }));
  };

  const updateWorkingHours = (day: string, field: 'open' | 'close' | 'is_open', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: {
          ...prev.working_hours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep) || !userData?.organization?.id) return;

    setLoading(true);
    try {
      // Ensure phone numbers are properly formatted
      const submitData = {
        ...formData,
        phone: formatPhoneNumber(formData.phone),
        admin_phone: formatPhoneNumber(formData.admin_phone),
        total_beds: formData.total_beds ? parseInt(formData.total_beds) : undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        working_hours: formData.working_hours,
        facilities: formData.facilities.length > 0 ? formData.facilities : undefined
      };

      console.log('Submitting clinic data:', submitData);

      const response = await ApiManager.createClinic(userData.organization.id, submitData);
      
      if (response.success) {
        onSuccess();
      } else {
        setErrors({ submit: response.message || 'Failed to create clinic' });
      }
    } catch (error: any) {
      console.error('Create clinic error:', error);
      setErrors({ submit: error.response?.data?.message || error.message || 'Failed to create clinic' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Create New Clinic</h2>
                <p className="text-blue-100">Add a new clinic location to your organization</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                    ${currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-px mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter clinic name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter complete address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.state ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="State"
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.pincode ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 28.6139"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 77.2090"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinic Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="clinic@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic Admin Phone *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.admin_phone}
                    onChange={(e) => handleInputChange('admin_phone', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.admin_phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+91 98765 43210"
                  />
                </div>
                {errors.admin_phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.admin_phone}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Phone number of the person who will manage this clinic
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Beds (Optional)
                </label>
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    value={formData.total_beds}
                    onChange={(e) => handleInputChange('total_beds', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Number of beds available"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Info */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Facilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facilities (Optional)
                </label>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="text"
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a facility (e.g., X-Ray, MRI)"
                    onKeyPress={(e) => e.key === 'Enter' && addFacility()}
                  />
                  <button
                    type="button"
                    onClick={addFacility}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {formData.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {facility}
                        <button
                          type="button"
                          onClick={() => removeFacility(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Working Hours
                </label>
                <div className="space-y-3">
                  {Object.entries(formData.working_hours).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-20">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={hours.is_open}
                            onChange={(e) => updateWorkingHours(day, 'is_open', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium capitalize">{day}</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => updateWorkingHours(day, 'open', e.target.value)}
                          disabled={!hours.is_open}
                          className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => updateWorkingHours(day, 'close', e.target.value)}
                          disabled={!hours.is_open}
                          className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      {!hours.is_open && (
                        <span className="text-sm text-gray-500">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {errors.submit}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={currentStep === 1 ? onClose : handleBack}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            
            <div className="flex items-center space-x-3">
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Clinic'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClinicModal;