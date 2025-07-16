import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AnimatedCard } from './ui/AnimatedCard';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface PatientCardProps {
  patient: any;
  viewMode: 'grid' | 'list';
  onView: () => void;
  onSchedule: () => void;
  delay?: number;
}

export default function PatientCard({
  patient,
  viewMode,
  onView,
  onSchedule,
  delay = 0,
}: PatientCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { bg: 'bg-green-100', text: 'text-green-700' };
      case 'INACTIVE':
        return { bg: 'bg-gray-100', text: 'text-gray-700' };
      case 'DISCHARGED':
        return { bg: 'bg-blue-100', text: 'text-blue-700' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const statusColors = getStatusColor(patient.status);
  const initials = patient.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (viewMode === 'list') {
    return (
      <AnimatedCard
        delay={delay}
        className="bg-white rounded-2xl p-4 mx-4 mb-3 shadow-sm"
      >
        <View className="flex-row items-center">
          <View className="h-12 w-12 rounded-2xl bg-sage-600 items-center justify-center">
            <Text className="text-white font-bold text-base">{initials}</Text>
          </View>

          <View className="flex-1 ml-4">
            <View className="flex-row items-center mb-1">
              <Text className="text-base font-semibold text-gray-900 flex-1">
                {patient.full_name}
              </Text>
              <View className={`px-2 py-1 rounded-full ${statusColors.bg}`}>
                <Text className={`text-xs font-medium ${statusColors.text}`}>
                  {patient.status}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center space-x-4">
              <View className="flex-row items-center">
                <Icon name="phone" size={14} color={colors?.gray?.[400] || '#9CA3AF'} />
                <Text className="text-sm text-gray-600 ml-1">{patient.phone}</Text>
              </View>
              <View className="flex-row items-center">
                <Icon name="clock" size={14} color={colors?.gray?.[400] || '#9CA3AF'} />
                <Text className="text-sm text-gray-600 ml-1">
                  {calculateAge(patient.date_of_birth)} yrs, {patient.gender}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center ml-2">
            <TouchableOpacity
              onPress={onView}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="eye" size={20} color={colors?.gray?.[600] || '#4B5563'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSchedule}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="calendar-plus" size={20} color={colors?.sage?.[600] || '#16A34A'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowMenu(!showMenu)}
              className="p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="dots-vertical" size={20} color={colors?.gray?.[400] || '#9CA3AF'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Menu Modal */}
        <Modal
          visible={showMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
            className="flex-1 bg-black/20"
          >
            <View className="absolute right-4 top-20 bg-white rounded-2xl shadow-lg p-2 min-w-[180px]">
              <TouchableOpacity
                onPress={() => {
                  setShowMenu(false);
                  // Handle edit
                }}
                className="flex-row items-center p-3 rounded-xl"
              >
                <Icon name="pencil" size={18} color={colors?.gray?.[700] || '#374151'} />
                <Text className="ml-3 text-gray-700">Edit Patient</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowMenu(false);
                  // Handle history
                }}
                className="flex-row items-center p-3 rounded-xl"
              >
                <Icon name="file-document" size={18} color={colors?.gray?.[700] || '#374151'} />
                <Text className="ml-3 text-gray-700">View History</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </AnimatedCard>
    );
  }

  // Grid view
  const cardWidth = isTablet
    ? (width - 48 - 16) / 2
    : width - 32;

  return (
    <AnimatedCard
      delay={delay}
      className="bg-white rounded-2xl p-5 shadow-sm"
      style={{
        width: cardWidth,
        marginHorizontal: 8,
        marginBottom: 16,
      }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="h-12 w-12 rounded-2xl bg-sage-600 items-center justify-center">
          <Text className="text-white font-bold text-base">{initials}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${statusColors.bg}`}>
          <Text className={`text-xs font-medium ${statusColors.text}`}>
            {patient.status}
          </Text>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-1">
          {patient.full_name}
        </Text>
        <Text className="text-sm text-gray-500">{patient.patient_code}</Text>
      </View>

      <View className="space-y-2 mb-4">
        <View className="flex-row items-center">
          <Icon name="phone" size={16} color={colors?.gray?.[400] || '#9CA3AF'} />
          <Text className="text-sm text-gray-600 ml-2">{patient.phone}</Text>
        </View>
        
        {patient.email && (
          <View className="flex-row items-center">
            <Icon name="email" size={16} color={colors?.gray?.[400] || '#9CA3AF'} />
            <Text className="text-sm text-gray-600 ml-2" numberOfLines={1}>
              {patient.email}
            </Text>
          </View>
        )}
        
        <View className="flex-row items-center">
          <Icon name="clock" size={16} color={colors?.gray?.[400] || '#9CA3AF'} />
          <Text className="text-sm text-gray-600 ml-2">
            {calculateAge(patient.date_of_birth)} years, {patient.gender}
          </Text>
        </View>
        
        {patient.address && (
          <View className="flex-row items-center">
            <Icon name="map-marker" size={16} color={colors?.gray?.[400] || '#9CA3AF'} />
            <Text className="text-sm text-gray-600 ml-2" numberOfLines={1}>
              {patient.address}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between pt-4 border-t border-gray-100">
        <TouchableOpacity onPress={onView}>
          <Text className="text-sm text-sage-600 font-medium">View Details</Text>
        </TouchableOpacity>
        
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={onSchedule}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="calendar-plus" size={18} color={colors?.sage?.[600] || '#16A34A'} />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="dots-vertical" size={18} color={colors?.gray?.[400] || '#9CA3AF'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
          className="flex-1 bg-black/20"
        >
          <View
            className="absolute bg-white rounded-2xl shadow-lg p-2 min-w-[180px]"
            style={{
              right: 8,
              bottom: 80,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setShowMenu(false);
                // Handle edit
              }}
              className="flex-row items-center p-3 rounded-xl"
            >
              <Icon name="pencil" size={18} color={colors?.gray?.[700] || '#374151'} />
              <Text className="ml-3 text-gray-700">Edit Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowMenu(false);
                // Handle history
              }}
              className="flex-row items-center p-3 rounded-xl"
            >
              <Icon name="file-document" size={18} color={colors?.gray?.[700] || '#374151'} />
              <Text className="ml-3 text-gray-700">View History</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </AnimatedCard>
  );
}