import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import ContextSwitcher from '../components/ContextSwitcher';
import Sidebar from '../components/Sidebar';
import { useNavigation } from '@react-navigation/native';

export const DashboardScreen = () => {
  console.log('🚀 DASHBOARD SCREEN RENDERED 🚀');

  // Navigation
  const navigation = useNavigation<any>();

  // Local state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('Dashboard');

  // Get all Redux state
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const userState = useAppSelector((state) => state.user);
  const organizationState = useAppSelector((state) => state.organization);
  const clinicState = useAppSelector((state) => state.clinic);

  // Console log organized Redux state
  React.useEffect(() => {
    console.log('🔥 DASHBOARD COMPONENT MOUNTED/UPDATED 🔥');
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
      console.log(
        '├── Available Clinics:',
        userState.userData.organization.clinics?.length || 0
      );

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

  const todayStats = {
    appointments: 8,
    completed: 5,
    remaining: 3,
    newPatients: 2,
  };

  const upcomingAppointments = [
    {
      id: 1,
      name: 'Sarah Johnson',
      time: '2:00 PM',
      type: 'Initial Assessment',
    },
    { id: 2, name: 'Michael Chen', time: '3:00 PM', type: 'Follow-up' },
    { id: 3, name: 'Emma Davis', time: '4:30 PM', type: 'Treatment Session' },
  ];

  const quickActions = [
    { icon: 'account-plus', label: 'New Patient', color: 'bg-sage-500' },
    { icon: 'calendar-plus', label: 'Schedule', color: 'bg-purple-500' },
    { icon: 'file-document-edit', label: 'Notes', color: 'bg-info' },
    { icon: 'chart-line', label: 'Reports', color: 'bg-success' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View className="bg-white px-lg py-md shadow-sm">
        {/* Context Switcher */}
        {userState.userData?.organization && (
          <View className="mb-md">
            <ContextSwitcher />
          </View>
        )}
        
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            className="p-sm mr-md"
            onPress={() => setIsSidebarOpen(true)}
          >
            <Icon name="menu" size={24} color="#374151" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-h3 font-bold text-charcoal">
              Good morning, {userState.userData?.name || 'User'}
            </Text>
            <Text className="text-small text-neutral-500 mt-xs">
              {userState.currentClinic 
                ? `Working at ${userState.currentClinic.name}` 
                : userState.userData?.organization?.is_owner 
                  ? `Managing ${userState.userData.organization.name}`
                  : 'Ready to make today count?'
              }
            </Text>
          </View>
          <TouchableOpacity className="p-sm">
            <Icon name="bell-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Today's Overview Card */}
        <View className="mx-lg mt-lg">
          <View className="bg-white rounded-card p-xl shadow-card">
            <Text className="text-h4 font-bold text-charcoal mb-lg">
              Today's Overview
            </Text>

            <View className="flex-row justify-between">
              <View className="flex-1">
                <View className="bg-sage-50 rounded-button p-md mr-sm">
                  <Text className="text-display font-bold text-sage-600 text-center">
                    {todayStats.appointments}
                  </Text>
                  <Text className="text-small text-sage-700 text-center mt-xs">
                    Total Appointments
                  </Text>
                </View>
              </View>

              <View className="flex-1">
                <View className="bg-purple-50 rounded-button p-md ml-sm">
                  <Text className="text-display font-bold text-purple-600 text-center">
                    {todayStats.newPatients}
                  </Text>
                  <Text className="text-small text-purple-700 text-center mt-xs">
                    New Patients
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row mt-lg pt-lg border-t border-neutral-200">
              <View className="flex-row items-center flex-1">
                <View className="w-3 h-3 bg-success rounded-full mr-sm" />
                <Text className="text-small text-neutral-600">
                  {todayStats.completed} Completed
                </Text>
              </View>
              <View className="flex-row items-center flex-1">
                <View className="w-3 h-3 bg-warning rounded-full mr-sm" />
                <Text className="text-small text-neutral-600">
                  {todayStats.remaining} Remaining
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-lg mt-xl">
          <Text className="text-h4 font-bold text-charcoal mb-md">
            Quick Actions
          </Text>

          <View className="flex-row flex-wrap -mx-sm">
            {quickActions.map((action, index) => (
              <View key={index} className="w-1/2 px-sm mb-md">
                <TouchableOpacity
                  className={`${action.color} rounded-button p-lg items-center shadow-button`}
                  activeOpacity={0.8}
                >
                  <Icon name={action.icon} size={28} color="white" />
                  <Text className="text-small font-medium text-white mt-sm">
                    {action.label}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View className="mx-lg mt-xl mb-3xl">
          <View className="flex-row items-center justify-between mb-md">
            <Text className="text-h4 font-bold text-charcoal">
              Upcoming Appointments
            </Text>
            <TouchableOpacity>
              <Text className="text-small font-medium text-sage-600">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {upcomingAppointments.map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              className="bg-white rounded-card p-lg mb-md shadow-sm"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <View className="bg-sage-100 rounded-button p-md mr-md">
                  <Icon name="account" size={24} color="#16A34A" />
                </View>

                <View className="flex-1">
                  <Text className="text-body font-semibold text-charcoal">
                    {appointment.name}
                  </Text>
                  <Text className="text-small text-neutral-500 mt-2xs">
                    {appointment.type}
                  </Text>
                </View>

                <View className="items-end">
                  <Text className="text-body font-medium text-sage-600">
                    {appointment.time}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-lg right-lg bg-sage-500 w-14 h-14 rounded-full items-center justify-center shadow-hover"
        activeOpacity={0.8}
      >
        <Icon name="plus" size={28} color="white" />
      </TouchableOpacity>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          setIsSidebarOpen(false);
          
          // Navigate to the appropriate screen
          switch (screen) {
            case 'Patients':
              navigation.navigate('Patients');
              break;
            case 'Appointments':
              navigation.navigate('Appointments');
              break;
            case 'Dashboard':
              // Already on dashboard
              break;
            default:
              console.log(`Navigation to ${screen} not implemented yet`);
          }
        }}
        currentScreen={currentScreen}
      />
    </SafeAreaView>
  );
};
