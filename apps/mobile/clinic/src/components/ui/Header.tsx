import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import {
  Surface,
  Text,
  IconButton,
  Menu,
  Divider,
  Avatar,
  Badge,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { clearUserData } from '../../store/slices/userSlice';
import { colors, spacing } from '../../theme';
import HapticFeedback from '../../utils/haptics';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  showMenu?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  rightAction,
  showMenu = true,
}) => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  
  // Get all Redux state
  const authState = useAppSelector(state => state.auth);
  const userState = useAppSelector(state => state.user);
  const organizationState = useAppSelector(state => state.organization);
  const clinicState = useAppSelector(state => state.clinic);
  
  // For backward compatibility
  const { userData } = userState;
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Console log organized Redux state
  React.useEffect(() => {
    console.log('🔥 HEADER COMPONENT MOUNTED/UPDATED 🔥');
    console.log('\n🔥 === REDUX STATE DEBUG === 🔥');
    console.log('📅 Timestamp:', new Date().toLocaleTimeString());
    
    console.log('\n🔐 AUTH STATE:');
    console.log('├── isAuthenticated:', authState.isAuthenticated);
    console.log('├── loading:', authState.loading);
    console.log('├── otpSent:', authState.otpSent);
    console.log('├── otpVerifying:', authState.otpVerifying);
    console.log('├── phoneNumber:', authState.phoneNumber);
    console.log('└── user:', authState.user);
    
    console.log('\n👤 USER STATE:');
    console.log('├── userData:', userState.userData);
    console.log('├── currentClinic:', userState.currentClinic);
    console.log('├── loading:', userState.loading);
    console.log('└── error:', userState.error);
    
    console.log('\n🏢 ORGANIZATION STATE:');
    console.log('└── organizations:', organizationState.organizations);
    
    console.log('\n🏥 CLINIC STATE:');
    console.log('└── clinics:', clinicState.clinics);
    
    if (userState.userData?.organization) {
      console.log('\n🎯 CURRENT USER CONTEXT:');
      console.log('├── Organization:', userState.userData.organization.name);
      console.log('├── Is Owner:', userState.userData.organization.is_owner);
      console.log('├── Available Clinics:', userState.userData.organization.clinics?.length || 0);
      
      if (userState.currentClinic) {
        console.log('├── Current Clinic:', userState.currentClinic.name);
        console.log('├── Current Role:', userState.currentClinic.role);
        console.log('└── Is Clinic Admin:', userState.currentClinic.is_admin);
      } else {
        console.log('└── Current Clinic: None (Organization Level)');
      }
      
      console.log('\n📋 ALL USER CLINICS:');
      userState.userData.organization.clinics?.forEach((clinic, index) => {
        console.log(`├── ${index + 1}. ${clinic.name}`);
        console.log(`│   ├── Role: ${clinic.role}`);
        console.log(`│   └── Admin: ${clinic.is_admin}`);
      });
    }
    
    console.log('\n🔥 === END REDUX STATE === 🔥\n');
  }, [authState, userState, organizationState, clinicState]);

  const handleLogout = () => {
    HapticFeedback.trigger('impactLight');
    dispatch(logout());
    dispatch(clearUserData());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const handleMenuPress = () => {
    HapticFeedback.trigger('impactLight');
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const unreadNotifications = 2; // This should come from Redux or API

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background.paper}
      />
      <Surface
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.sm,
            height: 56 + insets.top + spacing.sm,
          },
        ]}
        elevation={2}
      >
        <View style={styles.content}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {showBack ? (
              <IconButton
                icon="arrow-left"
                size={24}
                onPress={() => navigation.goBack()}
                iconColor={colors.neutral[700]}
              />
            ) : showMenu ? (
              <IconButton
                icon="menu"
                size={24}
                onPress={handleMenuPress}
                iconColor={colors.neutral[700]}
              />
            ) : null}
            
            {/* Title for detail screens */}
            {title && (
              <View style={styles.titleContainer}>
                <Text variant="titleMedium" style={styles.title}>
                  {title}
                </Text>
                {subtitle && (
                  <Text variant="bodySmall" style={styles.subtitle}>
                    {subtitle}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {rightAction && (
              <IconButton
                icon={rightAction.icon}
                size={24}
                onPress={rightAction.onPress}
                iconColor={colors.primary[500]}
              />
            )}

            {/* Search */}
            <IconButton
              icon="magnify"
              size={24}
              onPress={() => {}}
              iconColor={colors.neutral[700]}
            />

            {/* Notifications */}
            <View>
              <IconButton
                icon="bell-outline"
                size={24}
                onPress={() => setShowNotifications(!showNotifications)}
                iconColor={colors.neutral[700]}
              />
              {unreadNotifications > 0 && (
                <Badge style={styles.badge}>{unreadNotifications}</Badge>
              )}
            </View>

            {/* User Menu */}
            <Menu
              visible={showUserMenu}
              onDismiss={() => setShowUserMenu(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setShowUserMenu(true)}
                  style={styles.avatarButton}
                >
                  <Avatar.Text 
                    size={32} 
                    label={userData?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    style={styles.avatar}
                  />
                </TouchableOpacity>
              }
            >
              <Menu.Item
                leadingIcon="account"
                onPress={() => {
                  setShowUserMenu(false);
                  navigation.navigate('Profile');
                }}
                title="Profile"
              />
              <Menu.Item
                leadingIcon="cog"
                onPress={() => {
                  setShowUserMenu(false);
                }}
                title="Settings"
              />
              <Menu.Item
                leadingIcon="help-circle"
                onPress={() => {
                  setShowUserMenu(false);
                }}
                title="Help & Support"
              />
              <Divider />
              <Menu.Item
                leadingIcon="logout"
                onPress={() => {
                  setShowUserMenu(false);
                  handleLogout();
                }}
                title="Logout"
                titleStyle={{ color: colors.error }}
              />
            </Menu>
          </View>
        </View>
      </Surface>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    marginLeft: spacing.sm,
  },
  title: {
    color: colors.neutral[900],
    fontWeight: '600',
  },
  subtitle: {
    color: colors.neutral[600],
    marginTop: 2,
  },
  avatarButton: {
    marginLeft: spacing.xs,
  },
  avatar: {
    backgroundColor: colors.primary[500],
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
  },
});