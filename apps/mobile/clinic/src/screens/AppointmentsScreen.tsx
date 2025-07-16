import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  RefreshControl,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import ApiManager from '../services/api/ApiManager';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import ScheduleVisitModal from '../components/modals/ScheduleVisitModal';

const { width } = Dimensions.get('window');

interface Visit {
  id: string;
  patient_id: string;
  clinic_id: string;
  physiotherapist_id: string;
  visit_type: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  chief_complaint?: string;
  patient?: {
    id: string;
    full_name: string;
    phone: string;
    email?: string;
    date_of_birth: string;
    gender: string;
    patient_code: string;
  };
  physiotherapist?: {
    id: string;
    full_name: string;
  };
}

interface VisitsData {
  visits: Visit[];
  total: number;
}

type FilterType = 'today' | 'week' | 'all';

export default function AppointmentsScreen() {
  const navigation = useNavigation<any>();
  const { currentClinic, userData } = useAppSelector((state) => state.user || {});
  const [visitsData, setVisitsData] = useState<VisitsData>({
    visits: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('today');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const isAdmin = userData?.organization?.is_owner || currentClinic?.is_admin;

  console.log('AppointmentsScreen render:', {
    currentClinic,
    userData,
    visitsData,
    isAdmin
  });

  useEffect(() => {
    console.log('AppointmentsScreen useEffect triggered:', {
      currentClinic: currentClinic?.id,
      filterType,
      statusFilter,
      hasClinic: !!currentClinic?.id
    });
    if (currentClinic?.id) {
      fetchVisits();
    }
  }, [currentClinic, filterType, statusFilter, page]);

  const getDateRange = () => {
    const today = new Date();
    let dateFrom: string;
    let dateTo: string;

    switch (filterType) {
      case 'today':
        dateFrom = today.toISOString().split('T')[0];
        dateTo = today.toISOString().split('T')[0];
        break;
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        dateFrom = startOfWeek.toISOString().split('T')[0];
        dateTo = endOfWeek.toISOString().split('T')[0];
        break;
      case 'all':
      default:
        return {};
    }

    return { date_from: dateFrom, date_to: dateTo };
  };

  const fetchVisits = async () => {
    if (!currentClinic?.id) {
      console.log('No clinic selected');
      return;
    }

    console.log('Fetching visits for clinic:', currentClinic.id, 'filterType:', filterType);
    setLoading(true);
    try {
      const dateRange = getDateRange();
      const params: any = {
        clinic_id: currentClinic.id,
        ...dateRange,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
        page,
        limit,
      };

      console.log('API request params:', params);
      const response = await ApiManager.getVisits(params);
      console.log('API response:', response);
      
      if (response.success) {
        const responseData = response.data || { visits: [], total: 0 };
        console.log('Fetched visits:', responseData);
        setVisitsData(responseData);
      } else {
        console.error('API error:', response.message);
        setVisitsData({ visits: [], total: 0 });
      }
    } catch (error) {
      console.error('Error fetching visits:', error);
      setVisitsData({ visits: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVisits();
    setRefreshing(false);
  };

  const handleVisitAction = async (visit: any, action: string) => {
    try {
      let response;
      switch (action) {
        case 'checkin':
          response = await ApiManager.checkInVisit(visit.id, {
            vital_signs: {
              // Mock vital signs - in real app this would come from a form
              blood_pressure: '120/80',
              heart_rate: '72',
              temperature: '98.6',
              weight: '70',
            },
          });
          break;
        case 'start':
          response = await ApiManager.startVisit(visit.id, {
            vital_signs: visit.vital_signs,
          });
          break;
        case 'complete':
          response = await ApiManager.completeVisit(visit.id);
          break;
        case 'cancel':
          response = await ApiManager.cancelVisit(visit.id, {
            cancellation_reason: 'Patient requested cancellation',
          });
          break;
        default:
          return;
      }

      if (response.success) {
        Alert.alert('Success', `Visit ${action} successful`);
        fetchVisits();
      } else {
        Alert.alert('Error', response.message || `Failed to ${action} visit`);
      }
    } catch (error) {
      console.error(`Error ${action} visit:`, error);
      Alert.alert('Error', `Failed to ${action} visit`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'calendar-clock' };
      case 'CHECKED_IN':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'login' };
      case 'IN_PROGRESS':
        return { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'play' };
      case 'COMPLETED':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: 'check' };
      case 'CANCELLED':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: 'close' };
      case 'NO_SHOW':
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'account-remove' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'help' };
    }
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return { action: 'checkin', label: 'Check In', icon: 'login' };
      case 'CHECKED_IN':
        return { action: 'start', label: 'Start', icon: 'play' };
      case 'IN_PROGRESS':
        return { action: 'complete', label: 'Complete', icon: 'check' };
      default:
        return null;
    }
  };

  const AppointmentCard = ({ visit }: { visit: any }) => {
    const statusInfo = getStatusColor(visit.status);
    const nextAction = getNextAction(visit.status);

    return (
      <AnimatedCard className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {visit.patient?.full_name || 'Unknown Patient'}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              {visit.visit_type?.replace('_', ' ')} • {visit.scheduled_time}
            </Text>
            <Text className="text-sm text-gray-500">
              Dr. {visit.physiotherapist?.name || 'Unknown'}
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${statusInfo.bg}`}>
            <Text className={`text-xs font-medium ${statusInfo.text}`}>
              {visit.status}
            </Text>
          </View>
        </View>

        {visit.chief_complaint && (
          <Text className="text-sm text-gray-600 mb-3">
            <Text className="font-medium">Chief Complaint: </Text>
            {visit.chief_complaint}
          </Text>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity
              onPress={() => {
                console.log('View Patient pressed:', visit.patient?.full_name);
                if (visit.patient) {
                  navigation.navigate('PatientDetails', { patient: visit.patient });
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Icon name="account" size={16} color={colors?.sage?.[600] || '#16A34A'} />
              <Text style={{ fontSize: 14, color: colors?.sage?.[600] || '#16A34A', marginLeft: 4 }}>View Patient</Text>
            </TouchableOpacity>
            
            {visit.status === 'COMPLETED' && (
              <TouchableOpacity
                onPress={() => {
                  console.log('View Notes pressed for visit:', visit.id);
                  // TODO: Navigate to VisitNotes screen
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Icon name="note-text" size={16} color={colors?.sage?.[600] || '#16A34A'} />
                <Text style={{ fontSize: 14, color: colors?.sage?.[600] || '#16A34A', marginLeft: 4 }}>Notes</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row items-center space-x-2">
            {nextAction && (
              <TouchableOpacity
                onPress={() => handleVisitAction(visit, nextAction.action)}
                style={{
                  backgroundColor: '#16A34A',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Icon name={nextAction.icon} size={16} color="white" />
                <Text style={{ color: 'white', fontWeight: '500', marginLeft: 8 }}>{nextAction.label}</Text>
              </TouchableOpacity>
            )}
            
            {visit.status === 'SCHEDULED' && (
              <TouchableOpacity
                onPress={() => handleVisitAction(visit, 'cancel')}
                style={{
                  borderWidth: 1,
                  borderColor: '#EF4444',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#EF4444', fontWeight: '500' }}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </AnimatedCard>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Icon name="calendar-blank" size={64} color={colors?.gray?.[300] || '#D1D5DB'} />
      <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
        No appointments {filterType === 'today' ? 'today' : filterType === 'week' ? 'this week' : 'found'}
      </Text>
      <Text className="text-gray-600 text-center mt-2">
        {filterType === 'today' 
          ? 'No appointments scheduled for today' 
          : 'Try selecting a different time period'}
      </Text>
      <Text className="text-sm text-gray-500 text-center mt-4">
        Debug info: 
        {'\n'}Clinic: {currentClinic?.name || 'None'}
        {'\n'}Filter Type: {filterType}
        {'\n'}Loading: {loading ? 'Yes' : 'No'}
        {'\n'}Visits Count: {visitsData.visits.length}
      </Text>
    </View>
  );

  const todayAppointments = visitsData.visits.filter(v => 
    v.scheduled_date === new Date().toISOString().split('T')[0]
  );

  const upcomingAppointments = visitsData.visits.filter(v => 
    new Date(v.scheduled_date) > new Date()
  );

  if (!currentClinic) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-8">
          <Icon name="alert-circle" size={64} color={colors?.gray?.[300] || '#D1D5DB'} />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
            No Clinic Selected
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            Please select a clinic to view appointments
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Appointments</Text>
            <Text className="text-gray-600 mt-1">
              {currentClinic.name} • {new Date().toLocaleDateString()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              console.log('Schedule Appointment pressed');
              // For now, create a mock patient for testing
              const mockPatient = {
                id: 'mock-patient-1',
                full_name: 'John Doe',
                patient_code: 'P001',
                phone: '+1234567890'
              };
              setSelectedPatient(mockPatient);
              setShowScheduleModal(true);
            }}
            style={{
              backgroundColor: '#16A34A',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Icon name="calendar-plus" size={18} color="white" />
            <Text style={{ color: 'white', fontWeight: '500', marginLeft: 8 }}>Schedule Appointment</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters and Search */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        {/* Filter Tabs */}
        <View className="flex-row space-x-1 bg-gray-100 p-1 rounded-xl mb-3">
          {[
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'This Week' },
            { key: 'all', label: 'All' },
          ].map((mode) => (
            <TouchableOpacity
              key={mode.key}
              onPress={() => {
                console.log('Changing filter type to:', mode.key);
                setFilterType(mode.key as any);
              }}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: filterType === mode.key ? '#ffffff' : 'transparent',
                shadowColor: filterType === mode.key ? '#000' : 'transparent',
                shadowOffset: filterType === mode.key ? { width: 0, height: 1 } : { width: 0, height: 0 },
                shadowOpacity: filterType === mode.key ? 0.1 : 0,
                shadowRadius: filterType === mode.key ? 2 : 0,
                elevation: filterType === mode.key ? 2 : 0,
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: '500',
                  color: filterType === mode.key ? '#111827' : '#6B7280',
                }}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Search and Status Filter */}
        <View className="flex-row space-x-3">
          <View className="flex-1 relative">
            <TextInput
              placeholder="Search patient name or phone..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              onSubmitEditing={() => {
                setPage(1);
                fetchVisits();
              }}
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingLeft: 36,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                fontSize: 14,
              }}
            />
            <Icon
              name="magnify"
              size={18}
              color="#6B7280"
              style={{
                position: 'absolute',
                left: 12,
                top: 10,
              }}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              setPage(1);
              fetchVisits();
            }}
            style={{
              backgroundColor: '#16A34A',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '500' }}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row justify-between">
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-gray-900">
              {visitsData.total}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">Total</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-blue-600">
              {visitsData.visits.filter(v => v.status === 'SCHEDULED').length}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">Scheduled</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-purple-600">
              {visitsData.visits.filter(v => v.status === 'IN_PROGRESS').length}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">In Progress</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-green-600">
              {visitsData.visits.filter(v => v.status === 'COMPLETED').length}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">Completed</Text>
          </View>
        </View>
        
        {/* Status Filter */}
        <View className="mt-4">
          <View className="flex-row bg-gray-100 p-1 rounded-xl">
            {[
              { key: 'all', label: 'All Status' },
              { key: 'SCHEDULED', label: 'Scheduled' },
              { key: 'IN_PROGRESS', label: 'In Progress' },
              { key: 'COMPLETED', label: 'Completed' },
            ].map((status) => (
              <TouchableOpacity
                key={status.key}
                onPress={() => {
                  console.log('Changing status filter to:', status.key);
                  setStatusFilter(status.key);
                  setPage(1);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: statusFilter === status.key ? '#ffffff' : 'transparent',
                  shadowColor: statusFilter === status.key ? '#000' : 'transparent',
                  shadowOffset: statusFilter === status.key ? { width: 0, height: 1 } : { width: 0, height: 0 },
                  shadowOpacity: statusFilter === status.key ? 0.1 : 0,
                  shadowRadius: statusFilter === status.key ? 2 : 0,
                  elevation: statusFilter === status.key ? 2 : 0,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: '500',
                    fontSize: 12,
                    color: statusFilter === status.key ? '#111827' : '#6B7280',
                  }}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Appointments List */}
      <FlatList
        data={visitsData.visits}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={{ marginHorizontal: 16 }}>
            <AppointmentCard visit={item} />
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors?.sage?.[600] || '#16A34A']}
          />
        }
        contentContainerStyle={{
          paddingVertical: 16,
          ...(visitsData.visits.length === 0 && { flex: 1 }),
        }}
      />

      {/* Schedule Visit Modal */}
      {selectedPatient && (
        <ScheduleVisitModal
          visible={showScheduleModal}
          patient={selectedPatient}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedPatient(null);
          }}
          onSuccess={(visit) => {
            console.log('Visit scheduled successfully:', visit);
            fetchVisits(); // Refresh the visits
            setShowScheduleModal(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}