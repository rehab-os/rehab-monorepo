import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import {
  Text,
  Surface,
  Divider,
  RadioButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setCurrentClinic } from '../../store/slices/userSlice';
import { colors, spacing } from '../../theme';
import HapticFeedback from '../../utils/haptics';

const ContextSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userData, currentClinic } = useAppSelector(state => state.user);
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!userData?.organization) {
    return null;
  }

  const handleClinicChange = (clinic: typeof currentClinic) => {
    HapticFeedback.trigger('impactLight');
    dispatch(setCurrentClinic(clinic));
    setIsModalVisible(false);
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

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return colors.primary[600];
      case 'physiotherapist':
        return colors.secondary[600];
      case 'receptionist':
        return colors.neutral[600];
      default:
        return colors.neutral[600];
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          <Icon name="office-building" size={18} color={colors.neutral[600]} />
          <View style={styles.textContainer}>
            <Text variant="labelMedium" style={styles.clinicName}>
              {currentClinic?.name || userData.organization.name}
            </Text>
            <View style={styles.roleContainer}>
              {userData.organization.is_owner && !currentClinic ? (
                <>
                  <Icon name="shield" size={12} color={colors.primary[600]} />
                  <Text variant="bodySmall" style={styles.roleText}>
                    Organization Admin
                  </Text>
                </>
              ) : currentClinic ? (
                <>
                  <Icon 
                    name={getRoleIcon(currentClinic.role)} 
                    size={12} 
                    color={getRoleColor(currentClinic.role)} 
                  />
                  <Text variant="bodySmall" style={styles.roleText}>
                    {currentClinic.role}
                  </Text>
                </>
              ) : (
                <Text variant="bodySmall" style={styles.roleText}>
                  Select a clinic
                </Text>
              )}
            </View>
          </View>
          <Icon 
            name="chevron-down" 
            size={20} 
            color={colors.neutral[400]} 
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <Surface style={styles.modalContent} elevation={5}>
            <Text variant="titleMedium" style={styles.modalTitle}>
              Select Context
            </Text>
            <Divider style={styles.divider} />
            
            <ScrollView style={styles.optionsList}>
              {userData.organization.is_owner && (
                <>
                  <Text variant="labelSmall" style={styles.sectionTitle}>
                    ORGANIZATION
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.option,
                      !currentClinic && styles.selectedOption,
                    ]}
                    onPress={() => handleClinicChange(null)}
                  >
                    <View style={styles.optionContent}>
                      <Icon 
                        name="office-building" 
                        size={20} 
                        color={colors.neutral[600]} 
                      />
                      <View style={styles.optionText}>
                        <Text variant="bodyMedium" style={styles.optionName}>
                          {userData.organization.name}
                        </Text>
                        <View style={styles.roleContainer}>
                          <Icon name="shield" size={12} color={colors.primary[600]} />
                          <Text variant="bodySmall" style={styles.roleText}>
                            Organization Admin
                          </Text>
                        </View>
                      </View>
                    </View>
                    <RadioButton
                      value=""
                      status={!currentClinic ? 'checked' : 'unchecked'}
                      onPress={() => handleClinicChange(null)}
                    />
                  </TouchableOpacity>
                  <Divider style={styles.sectionDivider} />
                </>
              )}

              <Text variant="labelSmall" style={styles.sectionTitle}>
                CLINICS
              </Text>
              {userData.organization.clinics.map((clinic) => (
                <TouchableOpacity
                  key={clinic.id}
                  style={[
                    styles.option,
                    currentClinic?.id === clinic.id && styles.selectedOption,
                  ]}
                  onPress={() => handleClinicChange(clinic)}
                >
                  <View style={styles.optionContent}>
                    <Icon 
                      name="office-building" 
                      size={20} 
                      color={colors.neutral[600]} 
                    />
                    <View style={styles.optionText}>
                      <Text variant="bodyMedium" style={styles.optionName}>
                        {clinic.name}
                      </Text>
                      <View style={styles.roleContainer}>
                        <Icon 
                          name={getRoleIcon(clinic.role)} 
                          size={12} 
                          color={getRoleColor(clinic.role)} 
                        />
                        <Text variant="bodySmall" style={styles.roleText}>
                          {clinic.role}
                          {clinic.is_admin && ' • Clinic Admin'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <RadioButton
                    value=""
                    status={currentClinic?.id === clinic.id ? 'checked' : 'unchecked'}
                    onPress={() => handleClinicChange(clinic)}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Surface>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    marginLeft: spacing.sm,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  textContainer: {
    marginLeft: spacing.sm,
    marginRight: spacing.xs,
  },
  clinicName: {
    color: colors.neutral[900],
    fontWeight: '500',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  roleText: {
    color: colors.neutral[600],
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.paper,
    borderTopLeftRadius: spacing.lg,
    borderTopRightRadius: spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    padding: spacing.lg,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  optionsList: {
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    color: colors.neutral[500],
    letterSpacing: 0.5,
  },
  sectionDivider: {
    marginVertical: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  selectedOption: {
    backgroundColor: colors.primary[50],
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  optionName: {
    color: colors.neutral[900],
    fontWeight: '500',
  },
});

export default ContextSwitcher;