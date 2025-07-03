'use client';

import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Activity,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const { userData, currentClinic } = useAppSelector((state) => state.user);

  const statsCards = [
    {
      title: 'Total Patients',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Appointments Today',
      value: '18',
      change: '-5%',
      trend: 'down',
      icon: Calendar,
      color: 'purple',
    },
    {
      title: 'Revenue (Month)',
      value: '$45,678',
      change: '+23%',
      trend: 'up',
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'Active Treatments',
      value: '89',
      change: '+8%',
      trend: 'up',
      icon: Activity,
      color: 'orange',
    },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      patient: 'John Smith',
      time: '09:00 AM',
      type: 'Initial Assessment',
      status: 'confirmed',
      duration: '60 min',
    },
    {
      id: 2,
      patient: 'Sarah Johnson',
      time: '10:30 AM',
      type: 'Follow-up',
      status: 'pending',
      duration: '30 min',
    },
    {
      id: 3,
      patient: 'Michael Brown',
      time: '11:30 AM',
      type: 'Treatment Session',
      status: 'confirmed',
      duration: '45 min',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'New patient registered',
      description: 'Emma Wilson joined the clinic',
      time: '15 minutes ago',
      icon: Users,
    },
    {
      id: 2,
      action: 'Treatment plan updated',
      description: 'ACL Recovery Program for John Smith',
      time: '1 hour ago',
      icon: Activity,
    },
    {
      id: 3,
      action: 'Appointment completed',
      description: 'Sarah Johnson - Follow-up session',
      time: '2 hours ago',
      icon: CheckCircle,
    },
  ];

  const getColorClasses = (color: string, type: 'bg' | 'text' = 'bg') => {
    const colors = {
      blue: type === 'bg' ? 'bg-blue-100' : 'text-blue-600',
      purple: type === 'bg' ? 'bg-purple-100' : 'text-purple-600',
      green: type === 'bg' ? 'bg-green-100' : 'text-green-600',
      orange: type === 'bg' ? 'bg-orange-100' : 'text-orange-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (!currentClinic && !userData?.organization?.is_owner) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Clinic Selected</h2>
          <p className="text-gray-600 mb-6">
            Please select a clinic from the context switcher in the header to view the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {userData?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-gray-600 mt-1">
          {currentClinic ? `${currentClinic.name} Dashboard` : 'Organization Overview'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 ${getColorClasses(stat.color)} rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${getColorClasses(stat.color, 'text')}`} />
              </div>
              <span className={`text-sm flex items-center ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? (
                  <ArrowUp className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1" />
                )}
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Today's Appointments</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                      {appointment.patient.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{appointment.patient}</p>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                    <div className="flex items-center justify-end space-x-2 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{appointment.duration}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <activity.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
            <p className="text-blue-100">
              {currentClinic 
                ? 'Manage your clinic operations efficiently' 
                : 'Manage your organization and clinics'
              }
            </p>
          </div>
          <div className="flex space-x-3">
            {currentClinic ? (
              <>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                  New Patient
                </button>
                <button className="bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors">
                  Schedule Appointment
                </button>
              </>
            ) : (
              <>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                  Add Clinic
                </button>
                <button className="bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors">
                  Invite Staff
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}