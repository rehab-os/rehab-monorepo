import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import ApiManager from '../services/api/ApiManager';
import {
  setPatients,
  setLoading,
  setError,
  setSearchTerm,
  setStatusFilter,
  setPage,
  setViewMode,
  setSelectedPatient,
} from '../store/slices/patientSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import { colors } from '../theme/colors';
import PatientCard from '../components/PatientCard';
import AddPatientModal from '../components/modals/AddPatientModal';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function PatientsScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { currentClinic } = useAppSelector((state) => state.user || {});
  const {
    patients = [],
    total = 0,
    loading = false,
    searchTerm = '',
    statusFilter = 'all',
    page = 1,
    viewMode = 'grid',
  } = useAppSelector((state) => state.patient || {});

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const limit = 12;

  useEffect(() => {
    if (currentClinic?.id) {
      fetchPatients();
    }
  }, [currentClinic, page, statusFilter]);

  const fetchPatients = async () => {
    if (!currentClinic?.id) return;

    try {
      dispatch(setLoading(true));
      const params = {
        clinic_id: currentClinic.id,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
        page,
        limit,
      };

      const response = await ApiManager.getPatients(params);
      if (response?.success && response.data) {
        dispatch(setPatients(response.data || { patients: [], total: 0 }));
      } else {
        dispatch(setPatients({ patients: [], total: 0 }));
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      dispatch(setError('Failed to fetch patients'));
      dispatch(setPatients({ patients: [], total: 0 }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearch = () => {
    dispatch(setSearchTerm(localSearchTerm));
    dispatch(setPage(1));
    fetchPatients();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  };

  const handleAddPatient = () => {
    setShowAddModal(true);
  };

  const handleViewPatient = (patient: any) => {
    dispatch(setSelectedPatient(patient));
    navigation.navigate('PatientDetails', { patient });
  };

  const handleScheduleVisit = (patient: any) => {
    dispatch(setSelectedPatient(patient));
    // TODO: Implement schedule visit modal
    console.log('Schedule visit for patient:', patient.full_name);
  };

  const activePatientCount = patients?.filter((p) => p?.status === 'ACTIVE').length || 0;

  const renderHeader = () => (
    <View className="px-4 pb-4">
      {/* Stats Cards */}
      <View className="flex-row flex-wrap justify-between mb-6">
        <AnimatedCard
          delay={0}
          className="bg-white rounded-2xl p-4 shadow-sm"
          style={{ width: (width - 48) / 2 }}
        >
          <View className="flex-row items-center">
            <View className="p-2 bg-purple-100 rounded-xl">
              <Icon name="account-group" size={24} color={colors?.purple?.[600] || '#9333EA'} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-600">Total Patients</Text>
              <Text className="text-xl font-bold text-gray-900">{total}</Text>
            </View>
          </View>
        </AnimatedCard>

        <AnimatedCard
          delay={100}
          className="bg-white rounded-2xl p-4 shadow-sm"
          style={{ width: (width - 48) / 2 }}
        >
          <View className="flex-row items-center">
            <View className="p-2 bg-green-100 rounded-xl">
              <Icon name="account-check" size={24} color={colors?.sage?.[600] || '#16A34A'} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-600">Active</Text>
              <Text className="text-xl font-bold text-gray-900">{activePatientCount}</Text>
            </View>
          </View>
        </AnimatedCard>
      </View>

      {/* Search Bar */}
      <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <View className="flex-row items-center space-x-2">
          <View className="flex-1 flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
            <Icon name="magnify" size={20} color={colors?.gray?.[400] || '#9CA3AF'} />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="Search patients..."
              value={localSearchTerm}
              onChangeText={setLocalSearchTerm}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            onPress={handleSearch}
            className="bg-sage-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-medium">Search</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View className="flex-row items-center justify-between mt-4">
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            className="flex-row items-center px-4 py-2 bg-gray-50 rounded-xl"
          >
            <Icon name="filter" size={16} color={colors?.gray?.[600] || '#4B5563'} />
            <Text className="ml-2 text-gray-700">
              {statusFilter === 'all' ? 'All Status' : statusFilter}
            </Text>
          </TouchableOpacity>

          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => dispatch(setViewMode('grid'))}
              className={`p-2 rounded-xl ${
                viewMode === 'grid' ? 'bg-sage-100' : 'bg-gray-50'
              }`}
            >
              <Icon
                name="view-grid"
                size={20}
                color={viewMode === 'grid' ? colors?.sage?.[600] || '#16A34A' : colors?.gray?.[400] || '#9CA3AF'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => dispatch(setViewMode('list'))}
              className={`p-2 rounded-xl ${
                viewMode === 'list' ? 'bg-sage-100' : 'bg-gray-50'
              }`}
            >
              <Icon
                name="view-list"
                size={20}
                color={viewMode === 'list' ? colors?.sage?.[600] || '#16A34A' : colors?.gray?.[400] || '#9CA3AF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Icon name="account-plus" size={64} color={colors?.gray?.[300] || '#D1D5DB'} />
      <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
        {searchTerm || statusFilter !== 'all' ? 'No patients found' : 'No patients yet'}
      </Text>
      <Text className="text-gray-600 text-center mt-2">
        {searchTerm || statusFilter !== 'all'
          ? 'Try adjusting your search or filters'
          : 'Add your first patient to get started'}
      </Text>
      {!searchTerm && statusFilter === 'all' && (
        <TouchableOpacity
          onPress={handleAddPatient}
          className="mt-6 bg-sage-600 px-6 py-3 rounded-xl flex-row items-center"
        >
          <Icon name="account-plus" size={20} color="white" />
          <Text className="text-white font-medium ml-2">Add First Patient</Text>
        </TouchableOpacity>
      )}
    </View>
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
            Please select a clinic from the context switcher to manage patients
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-gray-900">Patients</Text>
              <Text className="text-gray-600 mt-1">Manage patient records</Text>
            </View>
            <TouchableOpacity
              onPress={handleAddPatient}
              className="bg-sage-600 px-4 py-2 rounded-xl flex-row items-center"
            >
              <Icon name="account-plus" size={18} color="white" />
              <Text className="text-white font-medium ml-2">Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {loading && patients.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors?.sage?.[600] || '#16A34A'} />
          </View>
        ) : (
          <FlatList
            data={patients}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmptyState}
            numColumns={viewMode === 'grid' && !isTablet ? 1 : viewMode === 'grid' ? 2 : 1}
            key={viewMode}
            renderItem={({ item, index }) => (
              <PatientCard
                patient={item}
                viewMode={viewMode}
                onView={() => handleViewPatient(item)}
                onSchedule={() => handleScheduleVisit(item)}
                delay={index * 50}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors?.sage?.[600] || '#16A34A']}
              />
            }
            contentContainerStyle={{
              paddingBottom: 20,
              ...(patients.length === 0 && { flex: 1 }),
            }}
          />
        )}

        {/* Pagination */}
        {total > limit && (
          <View className="px-4 py-3 bg-white border-t border-gray-100 flex-row justify-center items-center space-x-4">
            <TouchableOpacity
              onPress={() => dispatch(setPage(Math.max(1, page - 1)))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-xl ${
                page === 1 ? 'bg-gray-100' : 'bg-sage-100'
              }`}
            >
              <Text className={page === 1 ? 'text-gray-400' : 'text-sage-700'}>
                Previous
              </Text>
            </TouchableOpacity>
            <Text className="text-gray-600">
              Page {page} of {Math.ceil(total / limit)}
            </Text>
            <TouchableOpacity
              onPress={() => dispatch(setPage(page + 1))}
              disabled={page >= Math.ceil(total / limit)}
              className={`px-4 py-2 rounded-xl ${
                page >= Math.ceil(total / limit) ? 'bg-gray-100' : 'bg-sage-100'
              }`}
            >
              <Text
                className={
                  page >= Math.ceil(total / limit) ? 'text-gray-400' : 'text-sage-700'
                }
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
          className="flex-1 bg-black/50 justify-end"
        >
          <TouchableOpacity activeOpacity={1} className="bg-white rounded-t-3xl p-6">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
            <Text className="text-xl font-bold mb-4">Filter by Status</Text>
            {['all', 'ACTIVE', 'INACTIVE', 'DISCHARGED'].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => {
                  dispatch(setStatusFilter(status as any));
                  setShowFilterModal(false);
                }}
                className={`p-4 rounded-xl mb-2 ${
                  statusFilter === status ? 'bg-sage-100' : 'bg-gray-50'
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    statusFilter === status ? 'text-sage-700' : 'text-gray-700'
                  }`}
                >
                  {status === 'all' ? 'All Patients' : status}
                </Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Add Patient Modal */}
      <AddPatientModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchPatients();
        }}
      />
    </SafeAreaView>
  );
}