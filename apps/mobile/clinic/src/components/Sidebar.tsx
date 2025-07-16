import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '../store/hooks';

const { width, height } = Dimensions.get('window');

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  currentScreen?: string;
}

interface NavigationItem {
  name: string;
  screen: string;
  icon: string;
  show: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onNavigate, 
  currentScreen = 'Dashboard' 
}) => {
  const { userData, currentClinic } = useAppSelector(state => state.user);
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Animation effect
  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width * 0.8,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      screen: 'Dashboard',
      icon: 'view-dashboard',
      show: true,
    },
    {
      name: 'Patients',
      screen: 'Patients',
      icon: 'account-group',
      show: currentClinic !== null,
    },
    {
      name: 'Appointments',
      screen: 'Appointments',
      icon: 'calendar',
      show: currentClinic !== null,
    },
    {
      name: 'Treatments',
      screen: 'Treatments',
      icon: 'heart',
      show: currentClinic !== null,
    },
    {
      name: 'Documents',
      screen: 'Documents',
      icon: 'file-document',
      show: currentClinic !== null,
    },
    {
      name: 'Reports',
      screen: 'Reports',
      icon: 'chart-bar',
      show: currentClinic !== null,
    },
    {
      name: 'Team',
      screen: 'Team',
      icon: 'account-plus',
      show: userData?.organization?.is_owner === true || currentClinic?.is_admin === true,
    },
    {
      name: 'Clinics',
      screen: 'Clinics',
      icon: 'office-building',
      show: userData?.organization?.is_owner === true,
    },
    {
      name: 'Organization',
      screen: 'Organization',
      icon: 'domain',
      show: userData?.organization?.is_owner === true,
    },
    {
      name: 'Billing',
      screen: 'Billing',
      icon: 'credit-card',
      show: userData?.organization?.is_owner === true || currentClinic?.is_admin === true,
    },
    {
      name: 'Settings',
      screen: 'Settings',
      icon: 'cog',
      show: true,
    },
  ];

  const filteredNavItems = navigationItems.filter(item => item.show);

  const handleNavigate = (screen: string) => {
    onNavigate(screen);
    onClose();
  };

  const getCurrentContext = () => {
    if (currentClinic) {
      return {
        name: currentClinic.name,
        role: currentClinic.role + (currentClinic.is_admin ? ' • Admin' : ''),
        icon: 'office-building'
      };
    } else if (userData?.organization?.is_owner) {
      return {
        name: userData.organization.name,
        role: 'Organization Admin',
        icon: 'domain'
      };
    }
    return {
      name: 'Select a clinic',
      role: 'to continue',
      icon: 'alert-circle'
    };
  };

  const context = getCurrentContext();

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.sidebarContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Icon name="medical-bag" size={24} color="#16A34A" />
              </View>
              <Text style={styles.logoText}>RehabOS</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Navigation */}
          <ScrollView style={styles.navigation} showsVerticalScrollIndicator={false}>
            <View style={styles.navigationSection}>
              {filteredNavItems.map((item) => {
                const isActive = currentScreen === item.screen;
                return (
                  <TouchableOpacity
                    key={item.name}
                    style={[
                      styles.navItem,
                      isActive && styles.navItemActive,
                    ]}
                    onPress={() => handleNavigate(item.screen)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={item.icon}
                      size={20}
                      color={isActive ? '#16A34A' : '#6B7280'}
                      style={styles.navIcon}
                    />
                    <Text
                      style={[
                        styles.navText,
                        isActive && styles.navTextActive,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.divider} />
            <View style={styles.contextInfo}>
              <View style={styles.contextHeader}>
                <Icon name={context.icon} size={16} color="#6B7280" />
                <Text style={styles.contextTitle}>Current Context</Text>
              </View>
              <Text style={styles.contextName}>{context.name}</Text>
              <Text style={styles.contextRole}>{context.role}</Text>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouch: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.8,
    maxWidth: 300,
    backgroundColor: '#FFFFFF',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  sidebarContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  closeButton: {
    padding: 4,
  },
  navigation: {
    flex: 1,
    paddingTop: 16,
  },
  navigationSection: {
    paddingHorizontal: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: '#F0FDF4',
  },
  navIcon: {
    marginRight: 12,
  },
  navText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
  },
  navTextActive: {
    color: '#16A34A',
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  contextInfo: {
    paddingHorizontal: 24,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contextTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contextName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  contextRole: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default Sidebar;