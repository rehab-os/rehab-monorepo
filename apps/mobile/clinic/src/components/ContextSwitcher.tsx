import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setCurrentClinic } from '../store/slices/userSlice';

const { width } = Dimensions.get('window');

const ContextSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userData, currentClinic } = useAppSelector(state => state.user);
  const [isOpen, setIsOpen] = useState(false);

  if (!userData?.organization) {
    return null;
  }

  const handleClinicChange = (clinic: typeof currentClinic) => {
    dispatch(setCurrentClinic(clinic));
    setIsOpen(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'shield';
      case 'physiotherapist':
        return 'stethoscope';
      case 'receptionist':
        return 'account';
      default:
        return 'account';
    }
  };

  const getCurrentDisplayName = () => {
    return currentClinic?.name || userData.organization?.name || 'Select Context';
  };

  const getCurrentRole = () => {
    if (userData.organization?.is_owner && !currentClinic) {
      return 'Organization Admin';
    }
    if (currentClinic) {
      return currentClinic.role + (currentClinic.is_admin ? ' • Clinic Admin' : '');
    }
    return 'Select a clinic';
  };

  const getCurrentIcon = () => {
    if (userData.organization?.is_owner && !currentClinic) {
      return 'shield';
    }
    if (currentClinic) {
      return getRoleIcon(currentClinic.role);
    }
    return 'office-building';
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="flex-row items-center bg-white border border-neutral-200 rounded-lg px-3 py-2"
        activeOpacity={0.7}
      >
        <Icon name="office-building" size={16} color="#6B7280" />
        <View className="ml-2 flex-1">
          <Text className="text-sm font-medium text-charcoal">
            {getCurrentDisplayName()}
          </Text>
          <View className="flex-row items-center mt-0.5">
            <Icon name={getCurrentIcon()} size={12} color="#6B7280" />
            <Text className="text-xs text-neutral-500 ml-1">
              {getCurrentRole()}
            </Text>
          </View>
        </View>
        <Icon 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={16} 
          color="#9CA3AF" 
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <Text className="text-lg font-semibold text-charcoal mb-4 px-4 pt-4">
              Select Context
            </Text>

            {/* Organization Section */}
            {userData.organization?.is_owner && (
              <>
                <View className="px-4">
                  <Text className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                    ORGANIZATION
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleClinicChange(null)}
                    className={`flex-row items-center justify-between p-3 rounded-lg ${
                      !currentClinic ? 'bg-sage-50' : 'bg-white'
                    }`}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center flex-1">
                      <Icon name="office-building" size={20} color="#6B7280" />
                      <View className="ml-3 flex-1">
                        <Text className="text-sm font-medium text-charcoal">
                          {userData.organization.name}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Icon name="shield" size={12} color="#16A34A" />
                          <Text className="text-xs text-neutral-500 ml-1">
                            Organization Admin
                          </Text>
                        </View>
                      </View>
                    </View>
                    {!currentClinic && (
                      <Icon name="check" size={16} color="#16A34A" />
                    )}
                  </TouchableOpacity>
                </View>
                <View className="h-px bg-neutral-100 my-3 mx-4" />
              </>
            )}

            {/* Clinics Section */}
            <View className="px-4 pb-4">
              <Text className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                CLINICS
              </Text>
              {userData.organization?.clinics?.map((clinic) => (
                <TouchableOpacity
                  key={clinic.id}
                  onPress={() => handleClinicChange(clinic)}
                  className={`flex-row items-center justify-between p-3 rounded-lg mb-2 ${
                    currentClinic?.id === clinic.id ? 'bg-sage-50' : 'bg-white'
                  }`}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center flex-1">
                    <Icon name="office-building" size={20} color="#6B7280" />
                    <View className="ml-3 flex-1">
                      <Text className="text-sm font-medium text-charcoal">
                        {clinic.name}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Icon name={getRoleIcon(clinic.role)} size={12} color="#6B7280" />
                        <Text className="text-xs text-neutral-500 ml-1">
                          {clinic.role}
                          {clinic.is_admin && (
                            <Text className="text-sage-600"> • Clinic Admin</Text>
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {currentClinic?.id === clinic.id && (
                    <Icon name="check" size={16} color="#16A34A" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: width - 48,
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
});

export default ContextSwitcher;