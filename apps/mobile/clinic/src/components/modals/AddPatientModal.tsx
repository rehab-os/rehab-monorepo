import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store/hooks';
import ApiManager from '../../services/api/ApiManager';
import { addPatient } from '../../store/slices/patientSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';

interface AddPatientModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (patient: any) => void;
}

export default function AddPatientModal({ visible, onClose, onSuccess }: AddPatientModalProps) {
  const dispatch = useDispatch();
  const { currentClinic } = useAppSelector((state) => state.user || {});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    gender: 'MALE',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_history: '',
    allergies: '',
    current_medications: '',
    referred_by: '',
    insurance_provider: '',
    insurance_policy_number: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!currentClinic?.id) {
      Alert.alert('Error', 'Please select a clinic first');
      return;
    }

    setLoading(true);
    try {
      const patientData = {
        ...formData,
        clinic_id: currentClinic.id,
        phone: formData.phone.replace(/\D/g, ''),
      };

      const response = await ApiManager.createPatient(patientData);
      
      if (response.success) {
        Alert.alert('Success', 'Patient created successfully');
        onSuccess?.(response.data);
        handleClose();
      } else {
        Alert.alert('Error', response.message || 'Failed to create patient');
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      Alert.alert('Error', 'Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      date_of_birth: '',
      gender: 'MALE',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      medical_history: '',
      allergies: '',
      current_medications: '',
      referred_by: '',
      insurance_provider: '',
      insurance_policy_number: '',
    });
    setErrors({});
    onClose();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const InputField = ({ 
    label, 
    field, 
    placeholder, 
    multiline = false, 
    keyboardType = 'default',
    required = false 
  }: {
    label: string;
    field: string;
    placeholder?: string;
    multiline?: boolean;
    keyboardType?: any;
    required?: boolean;
  }) => (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <Text className="text-red-500 ml-1">*</Text>}
      </Text>
      <TextInput
        className={`border rounded-xl px-4 py-3 text-base ${
          errors[field] ? 'border-red-500' : 'border-gray-300'
        } ${multiline ? 'min-h-[100px]' : ''}`}
        placeholder={placeholder}
        value={formData[field as keyof typeof formData]}
        onChangeText={(value) => updateFormData(field, value)}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
        style={{ textAlignVertical: multiline ? 'top' : 'center' }}
      />
      {errors[field] && (
        <Text className="text-red-500 text-sm mt-1">{errors[field]}</Text>
      )}
    </View>
  );

  const GenderSelector = () => (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-2">
        Gender <Text className="text-red-500 ml-1">*</Text>
      </Text>
      <View className="flex-row space-x-4">
        {['MALE', 'FEMALE', 'OTHER'].map((gender) => (
          <TouchableOpacity
            key={gender}
            onPress={() => updateFormData('gender', gender)}
            className={`flex-1 py-3 px-4 rounded-xl border ${
              formData.gender === gender
                ? 'border-sage-500 bg-sage-50'
                : 'border-gray-300 bg-white'
            }`}
          >
            <Text
              className={`text-center font-medium ${
                formData.gender === gender ? 'text-sage-700' : 'text-gray-700'
              }`}
            >
              {gender.charAt(0) + gender.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.gender && (
        <Text className="text-red-500 text-sm mt-1">{errors.gender}</Text>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header */}
          <View className="bg-white border-b border-gray-200 px-4 py-4">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={handleClose}>
                <Icon name="close" size={24} color={colors?.gray?.[700] || '#374151'} />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-gray-900">Add Patient</Text>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className={`px-4 py-2 rounded-lg ${
                  loading ? 'bg-gray-300' : 'bg-sage-600'
                }`}
              >
                <Text className="text-white font-medium">
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
            <View className="bg-white rounded-2xl p-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-6">
                Personal Information
              </Text>
              
              <InputField
                label="Full Name"
                field="full_name"
                placeholder="Enter patient's full name"
                required
              />
              
              <InputField
                label="Phone Number"
                field="phone"
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                required
              />
              
              <InputField
                label="Email"
                field="email"
                placeholder="Enter email address"
                keyboardType="email-address"
              />
              
              <InputField
                label="Date of Birth"
                field="date_of_birth"
                placeholder="YYYY-MM-DD"
                required
              />
              
              <GenderSelector />
              
              <InputField
                label="Address"
                field="address"
                placeholder="Enter full address"
                multiline
              />
            </View>

            <View className="bg-white rounded-2xl p-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-6">
                Emergency Contact
              </Text>
              
              <InputField
                label="Emergency Contact Name"
                field="emergency_contact_name"
                placeholder="Enter contact person name"
              />
              
              <InputField
                label="Emergency Contact Phone"
                field="emergency_contact_phone"
                placeholder="Enter emergency contact number"
                keyboardType="phone-pad"
              />
            </View>

            <View className="bg-white rounded-2xl p-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-6">
                Medical Information
              </Text>
              
              <InputField
                label="Medical History"
                field="medical_history"
                placeholder="Enter relevant medical history"
                multiline
              />
              
              <InputField
                label="Allergies"
                field="allergies"
                placeholder="Enter any known allergies"
                multiline
              />
              
              <InputField
                label="Current Medications"
                field="current_medications"
                placeholder="List current medications"
                multiline
              />
            </View>

            <View className="bg-white rounded-2xl p-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-6">
                Additional Information
              </Text>
              
              <InputField
                label="Referred By"
                field="referred_by"
                placeholder="Doctor or clinic name"
              />
              
              <InputField
                label="Insurance Provider"
                field="insurance_provider"
                placeholder="Insurance company name"
              />
              
              <InputField
                label="Insurance Policy Number"
                field="insurance_policy_number"
                placeholder="Policy number"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}