import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store/hooks';
import ApiManager from '../../services/api/ApiManager';
import { addVisit } from '../../store/slices/visitSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import type { CreateVisitDto, PhysiotherapistAvailabilityDto } from '@rehab/shared';

interface Patient {
  id: string;
  full_name: string;
  patient_code: string;
  phone?: string;
}

interface Physiotherapist {
  id: string;
  name: string;
  is_admin: boolean;
}

interface ScheduleVisitModalProps {
  visible: boolean;
  onClose: () => void;
  patient: Patient;
  onSuccess?: (visit: any) => void;
}

export default function ScheduleVisitModal({ 
  visible, 
  onClose, 
  patient, 
  onSuccess 
}: ScheduleVisitModalProps) {
  const dispatch = useDispatch();
  const { currentClinic } = useAppSelector((state) => state.user || {});
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availablePhysiotherapists, setAvailablePhysiotherapists] = useState<Physiotherapist[]>([]);
  const [formData, setFormData] = useState({
    visit_type: 'INITIAL_CONSULTATION',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 30,
    chief_complaint: '',
    physiotherapist_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible && patient) {
      resetForm();
    }
  }, [visible, patient]);

  useEffect(() => {
    if (formData.scheduled_date && formData.scheduled_time && currentClinic?.id) {
      checkAvailability();
    }
  }, [formData.scheduled_date, formData.scheduled_time, formData.duration_minutes]);

  const resetForm = () => {
    setFormData({
      visit_type: 'INITIAL_CONSULTATION',
      scheduled_date: '',
      scheduled_time: '',
      duration_minutes: 30,
      chief_complaint: '',
      physiotherapist_id: '',
    });
    setErrors({});
    setAvailablePhysiotherapists([]);
  };

  const checkAvailability = async () => {
    if (!currentClinic?.id || !formData.scheduled_date || !formData.scheduled_time) return;

    try {
      setCheckingAvailability(true);
      const availabilityData: PhysiotherapistAvailabilityDto = {
        clinic_id: currentClinic.id,
        date: formData.scheduled_date,
        time: formData.scheduled_time,
        duration_minutes: formData.duration_minutes,
      };

      const response = await ApiManager.getAvailablePhysiotherapists(availabilityData);
      if (response.success) {
        setAvailablePhysiotherapists(response.data || []);
        // Auto-select first available physiotherapist if only one available
        if (response.data && response.data.length === 1) {
          setFormData(prev => ({ ...prev, physiotherapist_id: response.data[0].id }));
        } else if (response.data && response.data.length === 0) {
          setFormData(prev => ({ ...prev, physiotherapist_id: '' }));
        }
      }
    } catch (err: any) {
      console.error('Failed to check availability:', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.scheduled_date) {
      newErrors.scheduled_date = 'Date is required';
    }

    if (!formData.scheduled_time) {
      newErrors.scheduled_time = 'Time is required';
    }

    if (!formData.physiotherapist_id) {
      newErrors.physiotherapist_id = 'Physiotherapist is required';
    }

    if (!formData.chief_complaint.trim()) {
      newErrors.chief_complaint = 'Chief complaint is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!currentClinic?.id || !patient?.id) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    if (!formData.physiotherapist_id) {
      Alert.alert('Error', 'Please select a physiotherapist');
      return;
    }

    setLoading(true);
    try {
      const visitData: CreateVisitDto = {
        patient_id: patient.id,
        clinic_id: currentClinic.id,
        physiotherapist_id: formData.physiotherapist_id,
        visit_type: formData.visit_type as any,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        duration_minutes: formData.duration_minutes,
        chief_complaint: formData.chief_complaint || undefined,
      };

      const response = await ApiManager.createVisit(visitData);
      
      if (response.success) {
        Alert.alert('Success', 'Visit scheduled successfully');
        onSuccess?.(response.data);
        handleClose();
      } else {
        Alert.alert('Error', response.message || 'Failed to schedule visit');
      }
    } catch (error) {
      console.error('Error scheduling visit:', error);
      Alert.alert('Error', 'Failed to schedule visit');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const updateFormData = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const visitTypes = [
    { value: 'INITIAL_CONSULTATION', label: 'Initial Consultation' },
    { value: 'FOLLOW_UP', label: 'Follow-up' },
    { value: 'REVIEW', label: 'Review' },
    { value: 'EMERGENCY', label: 'Emergency' },
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30'
  ];

  const durations = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '60 minutes' },
    { value: 90, label: '90 minutes' },
    { value: 120, label: '120 minutes' },
  ];

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
              <Text className="text-lg font-semibold text-gray-900">Schedule Visit</Text>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className={`px-4 py-2 rounded-lg ${
                  loading ? 'bg-gray-300' : 'bg-sage-600'
                }`}
              >
                <Text className="text-white font-medium">
                  {loading ? 'Scheduling...' : 'Schedule'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Patient Info */}
          <View className="bg-white border-b border-gray-200 px-4 py-3">
            <View className="flex-row items-center">
              <View className="h-10 w-10 rounded-full bg-sage-600 items-center justify-center">
                <Text className="text-white font-medium">
                  {patient?.full_name?.charAt(0)}
                </Text>
              </View>
              <View className="ml-3">
                <Text className="text-base font-medium text-gray-900">
                  {patient?.full_name}
                </Text>
                <Text className="text-sm text-gray-500">
                  {patient?.patient_code} • {patient?.phone}
                </Text>
              </View>
            </View>
          </View>

          {/* Form */}
          <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
            {/* Visit Type */}
            <View className="bg-white rounded-2xl p-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Visit Type
              </Text>
              <View className="space-y-2">
                {visitTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => updateFormData('visit_type', type.value)}
                    className={`p-4 rounded-xl border ${
                      formData.visit_type === type.value
                        ? 'border-sage-500 bg-sage-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        formData.visit_type === type.value
                          ? 'text-sage-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date & Time */}
            <View className="bg-white rounded-2xl p-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Date & Time
              </Text>
              
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Date <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className={`border rounded-xl px-4 py-3 text-base ${
                    errors.scheduled_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="YYYY-MM-DD"
                  value={formData.scheduled_date}
                  onChangeText={(value) => updateFormData('scheduled_date', value)}
                />
                {errors.scheduled_date && (
                  <Text className="text-red-500 text-sm mt-1">{errors.scheduled_date}</Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Time <Text className="text-red-500">*</Text>
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {timeSlots.map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => updateFormData('scheduled_time', time)}
                      className={`px-3 py-2 rounded-lg border ${
                        formData.scheduled_time === time
                          ? 'border-sage-500 bg-sage-50'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          formData.scheduled_time === time
                            ? 'text-sage-700'
                            : 'text-gray-700'
                        }`}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.scheduled_time && (
                  <Text className="text-red-500 text-sm mt-1">{errors.scheduled_time}</Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Duration</Text>
                <View className="flex-row space-x-2">
                  {durations.map((duration) => (
                    <TouchableOpacity
                      key={duration.value}
                      onPress={() => updateFormData('duration_minutes', duration.value)}
                      className={`flex-1 py-3 px-4 rounded-xl border ${
                        formData.duration_minutes === duration.value
                          ? 'border-sage-500 bg-sage-50'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      <Text
                        className={`text-center font-medium ${
                          formData.duration_minutes === duration.value
                            ? 'text-sage-700'
                            : 'text-gray-700'
                        }`}
                      >
                        {duration.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Available Physiotherapists */}
            {formData.scheduled_date && formData.scheduled_time && (
              <View className="bg-white rounded-2xl p-6 mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  Available Physiotherapists <Text className="text-red-500">*</Text>
                </Text>
                {checkingAvailability ? (
                  <View className="flex-row items-center justify-center p-4 border border-gray-300 rounded-xl">
                    <ActivityIndicator size="small" color={colors?.sage?.[600] || '#16a34a'} />
                    <Text className="text-gray-600 ml-2">
                      Checking availability...
                    </Text>
                  </View>
                ) : availablePhysiotherapists.length === 0 ? (
                  <View className="p-4 border border-red-300 rounded-xl bg-red-50">
                    <View className="flex-row items-center">
                      <Icon name="alert-circle" size={20} color="#dc2626" />
                      <Text className="text-red-600 font-medium ml-2">
                        No physiotherapists available
                      </Text>
                    </View>
                    <Text className="text-red-500 text-sm mt-1">
                      Please select a different date or time.
                    </Text>
                  </View>
                ) : (
                  <View className="space-y-2">
                    {availablePhysiotherapists.map((physio) => (
                      <TouchableOpacity
                        key={physio.id}
                        onPress={() => updateFormData('physiotherapist_id', physio.id)}
                        className={`p-4 rounded-xl border ${
                          formData.physiotherapist_id === physio.id
                            ? 'border-sage-500 bg-sage-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <View className="flex-row items-center">
                          <Icon name="account" size={20} color="#6b7280" />
                          <Text
                            className={`font-medium ml-2 flex-1 ${
                              formData.physiotherapist_id === physio.id
                                ? 'text-sage-700'
                                : 'text-gray-700'
                            }`}
                          >
                            {physio.name}
                          </Text>
                          {physio.is_admin && (
                            <View className="bg-blue-100 px-2 py-1 rounded-full">
                              <Text className="text-blue-800 text-xs font-medium">
                                Admin
                              </Text>
                            </View>
                          )}
                          {formData.physiotherapist_id === physio.id && (
                            <Icon name="check-circle" size={20} color={colors?.sage?.[600] || '#16a34a'} />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {errors.physiotherapist_id && (
                  <Text className="text-red-500 text-sm mt-2">{errors.physiotherapist_id}</Text>
                )}
              </View>
            )}

            {/* Chief Complaint */}
            <View className="bg-white rounded-2xl p-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Chief Complaint <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className={`border rounded-xl px-4 py-3 text-base min-h-[100px] ${
                  errors.chief_complaint ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the patient's main complaint or reason for visit"
                value={formData.chief_complaint}
                onChangeText={(value) => updateFormData('chief_complaint', value)}
                multiline
                textAlignVertical="top"
                style={{ textAlignVertical: 'top' }}
              />
              {errors.chief_complaint && (
                <Text className="text-red-500 text-sm mt-1">{errors.chief_complaint}</Text>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}