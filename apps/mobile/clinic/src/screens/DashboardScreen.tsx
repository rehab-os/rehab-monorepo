import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const DashboardScreen = () => {
  const todayStats = {
    appointments: 8,
    completed: 5,
    remaining: 3,
    newPatients: 2,
  };

  const upcomingAppointments = [
    { id: 1, name: 'Sarah Johnson', time: '2:00 PM', type: 'Initial Assessment' },
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
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-h3 font-bold text-charcoal">
              Good morning, Dr. Johnson
            </Text>
            <Text className="text-small text-neutral-500 mt-xs">
              Ready to make today count?
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
    </SafeAreaView>
  );
};