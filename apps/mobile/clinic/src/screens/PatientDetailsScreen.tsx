import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import ApiManager from '../services/api/ApiManager';
import { setSelectedPatient } from '../store/slices/patientSlice';
import { setVisits } from '../store/slices/visitSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import ScheduleVisitModal from '../components/modals/ScheduleVisitModal';

export default function PatientDetailsScreen({ route }: any) {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { patient } = route.params;
  const { selectedPatient } = useAppSelector((state) => state.patient || {});
  const visitState = useAppSelector((state) => state.visit || {});
  
  // Ensure visits is always an array
  const visits = Array.isArray(visitState.visits) ? visitState.visits : [];
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'visits' | 'notes'>('visits');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [visitHistory, setVisitHistory] = useState<any>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteType, setNoteType] = useState<'SOAP' | 'DAP' | 'PROGRESS'>('SOAP');
  const [noteData, setNoteData] = useState({
    soap: { subjective: '', objective: '', assessment: '', plan: '' },
    dap: { data: '', assessment: '', plan: '' },
    progress: { progress: '', interventions: '', response: '', plan: '' }
  });
  const [additionalNotes, setAdditionalNotes] = useState('');

  useEffect(() => {
    if (patient) {
      dispatch(setSelectedPatient(patient));
      fetchPatientData();
      fetchVisitHistory();
    }
  }, [patient]);

  const fetchPatientData = async () => {
    if (!patient?.id) return;
    
    setLoading(true);
    try {
      // Fetch patient visits
      const visitsResponse = await ApiManager.getPatientVisits(patient.id, { limit: 100 });
      if (visitsResponse.success) {
        const visitsData = visitsResponse.data.visits || visitsResponse.data;
        dispatch(setVisits({ visits: visitsData, total: visitsData.length }));
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitHistory = async () => {
    if (!patient?.id) return;
    
    try {
      const response = await ApiManager.getPatientVisitHistory(patient.id);
      if (response.success && response.data) {
        setVisitHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching visit history:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPatientData();
    await fetchVisitHistory();
    setRefreshing(false);
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleScheduleVisit = () => {
    setShowScheduleModal(true);
  };

  const handleAddNote = (visit?: any) => {
    if (visit) {
      setSelectedVisit(visit);
    }
    setShowNoteModal(true);
  };

  const handleCreateNote = async () => {
    if (!selectedVisit) {
      Alert.alert('Error', 'Please select a visit first');
      return;
    }

    const currentNoteData = noteType === 'SOAP' ? noteData.soap : 
                           noteType === 'DAP' ? noteData.dap : 
                           noteData.progress;
    
    const hasContent = Object.values(currentNoteData).some(value => value.trim() !== '');
    
    if (!hasContent && !additionalNotes.trim()) {
      Alert.alert('Error', 'Please provide some note content before saving');
      return;
    }

    try {
      setIsCreatingNote(true);
      const notePayload = {
        visit_id: selectedVisit.id,
        note_type: noteType,
        note_data: currentNoteData,
        additional_notes: additionalNotes,
        treatment_codes: [],
        treatment_details: {
          modalities: [],
          exercises: [],
          manual_therapy: [],
          education: []
        },
        goals: {
          short_term: [],
          long_term: []
        }
      };

      const response = await ApiManager.createNote(notePayload);
      
      if (response.success) {
        Alert.alert('Success', 'Note saved successfully!');
        await fetchPatientData();
        resetNoteForm();
        setShowNoteModal(false);
        setSelectedVisit(null);
      } else {
        Alert.alert('Error', response.message || 'Failed to save note');
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      Alert.alert('Error', 'Failed to save note. Please try again.');
    } finally {
      setIsCreatingNote(false);
    }
  };

  const resetNoteForm = () => {
    setNoteData({
      soap: { subjective: '', objective: '', assessment: '', plan: '' },
      dap: { data: '', assessment: '', plan: '' },
      progress: { progress: '', interventions: '', response: '', plan: '' }
    });
    setAdditionalNotes('');
    setNoteType('SOAP');
  };

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
        return 'bg-green-100 text-green-700';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-700';
      case 'DISCHARGED':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getVisitStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-700';
      case 'CHECKED_IN':
        return 'bg-yellow-100 text-yellow-700';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-700';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatVisitType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const renderNoteContent = (note: any) => {
    if (note.note_type === 'SOAP') {
      const data = note.note_data;
      return (
        <View style={{ marginTop: 8 }}>
          {data.subjective && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>SUBJECTIVE</Text>
              <View style={{ backgroundColor: '#f9fafb', padding: 8, borderRadius: 6, marginTop: 4 }}>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>{data.subjective}</Text>
              </View>
            </View>
          )}
          {data.objective && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>OBJECTIVE</Text>
              <View style={{ backgroundColor: '#f9fafb', padding: 8, borderRadius: 6, marginTop: 4 }}>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>{data.objective}</Text>
              </View>
            </View>
          )}
          {data.assessment && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>ASSESSMENT</Text>
              <View style={{ backgroundColor: '#f9fafb', padding: 8, borderRadius: 6, marginTop: 4 }}>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>{data.assessment}</Text>
              </View>
            </View>
          )}
          {data.plan && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>PLAN</Text>
              <View style={{ backgroundColor: '#f9fafb', padding: 8, borderRadius: 6, marginTop: 4 }}>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>{data.plan}</Text>
              </View>
            </View>
          )}
        </View>
      );
    }
    return <Text style={{ fontSize: 12, color: '#6b7280' }}>Note content available</Text>;
  };

  const InfoRow = ({ icon, label, value, onPress }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: onPress ? '#f9fafb' : 'transparent',
        borderRadius: 8,
        paddingHorizontal: onPress ? 8 : 0
      }}
    >
      <Icon name={icon} size={16} color={colors?.gray?.[500] || '#6B7280'} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontSize: 12, color: '#6b7280' }}>{label}</Text>
        <Text style={{ fontSize: 14, color: '#111827', marginTop: 2 }}>{value || 'Not provided'}</Text>
      </View>
      {onPress && (
        <Icon name="chevron-right" size={16} color={colors?.gray?.[400] || '#9CA3AF'} />
      )}
    </TouchableOpacity>
  );

  const VisitCard = ({ visit }: { visit: any }) => (
    <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb', position: 'relative' }}>
      {/* Floating Note Icon */}
      {!visit.note && (visit.status === 'COMPLETED' || visit.status === 'SCHEDULED') && (
        <TouchableOpacity
          onPress={() => {
            setSelectedVisit(visit);
            setShowNoteModal(true);
          }}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: '#3b82f6',
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Icon name="note-plus" size={16} color="white" />
        </TouchableOpacity>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, paddingRight: visit.note ? 0 : 40 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
              {formatVisitType(visit.visit_type)}
            </Text>
            <View style={{ marginLeft: 8 }}>
              <View className={`px-2 py-1 rounded-full ${getVisitStatusColor(visit.status)}`}>
                <Text style={{ fontSize: 10, fontWeight: '600' }}>{visit.status.replace('_', ' ')}</Text>
              </View>
            </View>
            {visit.note && (
              <View style={{ marginLeft: 8, backgroundColor: '#f3e8ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="note-text" size={12} color="#7c3aed" />
                <Text style={{ fontSize: 10, color: '#7c3aed', marginLeft: 4, fontWeight: '600' }}>{visit.note.note_type}</Text>
              </View>
            )}
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Icon name="clock" size={12} color="#6b7280" />
            <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
              {new Date(visit.scheduled_date).toLocaleDateString()} at {visit.scheduled_time}
            </Text>
          </View>
          
          {visit.physiotherapist && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="stethoscope" size={12} color="#6b7280" />
              <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
                Dr. {visit.physiotherapist.full_name}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {visit.chief_complaint && (
        <View style={{ backgroundColor: '#f9fafb', padding: 8, borderRadius: 6, marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: '#374151', fontWeight: '600' }}>Chief Complaint: </Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>{visit.chief_complaint}</Text>
        </View>
      )}
      
      {visit.note && (
        <View style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4 }}>Clinical Note</Text>
          {renderNoteContent(visit.note)}
          {visit.note.additional_notes && (
            <View style={{ backgroundColor: '#fef3c7', padding: 8, borderRadius: 6, marginTop: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>Additional Notes</Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{visit.note.additional_notes}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderOverview = () => (
    <View className="px-4">
      <AnimatedCard className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Personal Information
        </Text>
        
        <InfoRow icon="phone" label="Phone" value={selectedPatient?.phone} onPress={() => handleCall(selectedPatient?.phone)} />
        <InfoRow icon="email" label="Email" value={selectedPatient?.email} />
        <InfoRow icon="calendar" label="Date of Birth" value={selectedPatient?.date_of_birth} />
        <InfoRow icon="human-male-female" label="Gender" value={selectedPatient?.gender} />
        <InfoRow icon="map-marker" label="Address" value={selectedPatient?.address} />
      </AnimatedCard>

      <AnimatedCard className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Emergency Contact
        </Text>
        
        <InfoRow
          icon="account"
          label="Contact Name"
          value={selectedPatient?.emergency_contact_name}
        />
        <InfoRow
          icon="phone"
          label="Contact Phone"
          value={selectedPatient?.emergency_contact_phone}
          onPress={() => selectedPatient?.emergency_contact_phone && handleCall(selectedPatient.emergency_contact_phone)}
        />
      </AnimatedCard>

      <AnimatedCard className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Medical Information
        </Text>
        
        <InfoRow icon="medical-bag" label="Medical History" value={selectedPatient?.medical_history} />
        <InfoRow icon="alert-circle" label="Allergies" value={selectedPatient?.allergies} />
        <InfoRow icon="pill" label="Current Medications" value={selectedPatient?.current_medications} />
      </AnimatedCard>

      <AnimatedCard className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Insurance Information
        </Text>
        
        <InfoRow icon="shield-account" label="Insurance Provider" value={selectedPatient?.insurance_provider} />
        <InfoRow icon="card-account-details" label="Policy Number" value={selectedPatient?.insurance_policy_number} />
        <InfoRow icon="doctor" label="Referred By" value={selectedPatient?.referred_by} />
      </AnimatedCard>
    </View>
  );

  const renderVisits = () => {
    const completedVisits = visits.filter(v => v.status === 'COMPLETED');
    const upcomingVisits = visits.filter(v => v.status === 'SCHEDULED');
    const notesCount = visits.filter(v => v.note).length;
    // For testing: Allow notes on both COMPLETED and SCHEDULED visits
    const visitsWithoutNotes = visits.filter(v => !v.note && (v.status === 'COMPLETED' || v.status === 'SCHEDULED'));
    
    // Debug logs
    console.log('All visits:', visits);
    console.log('Completed visits:', completedVisits);
    console.log('Visits without notes (including scheduled):', visitsWithoutNotes);
    
    return (
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Stats Row */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, marginRight: 8, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
              {visitHistory?.statistics?.totalVisits || visits.length}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Total Visits</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, marginHorizontal: 4, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#059669' }}>
              {visitHistory?.statistics?.completedVisits || completedVisits.length}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Completed</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, marginHorizontal: 4, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3b82f6' }}>
              {visitHistory?.statistics?.upcomingVisits || upcomingVisits.length}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Upcoming</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16, marginLeft: 8, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#8b5cf6' }}>
              {visitHistory?.statistics?.notesCount || notesCount}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Notes</Text>
          </View>
        </View>
        
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>Timeline</Text>
        </View>
        
        {/* Visits List */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {visits.length > 0 ? (
            visits.map((visit, index) => (
              <VisitCard key={visit.id} visit={visit} />
            ))
          ) : (
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 32, alignItems: 'center' }}>
              <Icon name="calendar-plus" size={48} color={colors?.gray?.[300] || '#D1D5DB'} />
              <Text style={{ color: '#6b7280', marginTop: 16, textAlign: 'center' }}>No visits scheduled</Text>
              <TouchableOpacity
                onPress={handleScheduleVisit}
                style={{ backgroundColor: '#16a34a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16 }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Schedule First Visit</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderNotes = () => {
    const notesVisits = visits.filter(v => v.note);
    // For testing: Allow notes on both COMPLETED and SCHEDULED visits
    const completedVisitsWithoutNotes = visits.filter(v => !v.note && (v.status === 'COMPLETED' || v.status === 'SCHEDULED'));
    
    return (
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Instructions */}
        {completedVisitsWithoutNotes.length > 0 && (
          <View style={{ backgroundColor: '#dbeafe', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ color: '#1e40af', fontSize: 14, textAlign: 'center' }}>
              Click the note icon on any visit in the Timeline to add a clinical note
            </Text>
          </View>
        )}

        {/* Note Type Filter */}
        {notesVisits.length > 0 && (
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['ALL', 'SOAP', 'DAP', 'PROGRESS'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: type === 'ALL' ? '#3b82f6' : '#e5e7eb',
                    borderRadius: 20,
                    marginRight: 8
                  }}
                >
                  <Text style={{
                    color: type === 'ALL' ? 'white' : '#6b7280',
                    fontSize: 14,
                    fontWeight: '600'
                  }}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Notes List */}
        {notesVisits.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {notesVisits.map((visit) => (
              <View key={visit.id} style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                      {formatVisitType(visit.visit_type)}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      {new Date(visit.scheduled_date).toLocaleDateString()} at {visit.scheduled_time}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: '#f3e8ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                    <Text style={{ fontSize: 12, color: '#7c3aed', fontWeight: '600' }}>{visit.note.note_type}</Text>
                  </View>
                </View>
                
                {renderNoteContent(visit.note)}
                
                {visit.note.additional_notes && (
                  <View style={{ backgroundColor: '#fef3c7', padding: 12, borderRadius: 8, marginTop: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#92400e' }}>Additional Notes</Text>
                    <Text style={{ fontSize: 12, color: '#92400e', marginTop: 4 }}>{visit.note.additional_notes}</Text>
                  </View>
                )}
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
                  <Icon name="stethoscope" size={12} color="#6b7280" />
                  <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
                    Dr. {visit.physiotherapist.full_name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>
                    • {new Date(visit.note.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 32, alignItems: 'center' }}>
              <Icon name="note-text" size={48} color={colors?.gray?.[300] || '#D1D5DB'} />
              <Text style={{ color: '#6b7280', marginTop: 16, textAlign: 'center', fontSize: 16 }}>No clinical notes yet</Text>
              <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
                Complete a visit to add clinical notes
              </Text>
              {completedVisitsWithoutNotes.length > 0 && (
                <Text style={{ color: '#6b7280', fontSize: 14, marginTop: 16, textAlign: 'center' }}>
                  Go to the Timeline tab and click the note icon on any visit to add your first clinical note
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (!selectedPatient) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Patient not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200">
        <View className="px-4 py-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
              <Icon name="arrow-left" size={24} color={colors?.gray?.[700] || '#374151'} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {selectedPatient.full_name}
              </Text>
              <Text className="text-sm text-gray-500">
                {selectedPatient.patient_code} • {calculateAge(selectedPatient.date_of_birth)} years old
              </Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${getStatusColor(selectedPatient.status)}`}>
              <Text className="text-xs font-medium">{selectedPatient.status}</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row border-t border-gray-200">
          {[
            { key: 'overview', label: 'Overview', icon: 'account' },
            { key: 'visits', label: 'Visits', icon: 'calendar' },
            { key: 'notes', label: 'Notes', icon: 'note-text' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-3 ${
                activeTab === tab.key ? 'border-b-2 border-sage-600' : ''
              }`}
            >
              <View className="items-center">
                <Icon
                  name={tab.icon}
                  size={20}
                  color={
                    activeTab === tab.key
                      ? colors?.sage?.[600] || '#16A34A'
                      : colors?.gray?.[500] || '#6B7280'
                  }
                />
                <Text
                  className={`text-sm mt-1 ${
                    activeTab === tab.key ? 'text-sage-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors?.sage?.[600] || '#16A34A']}
          />
        }
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'visits' && renderVisits()}
        {activeTab === 'notes' && renderNotes()}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleScheduleVisit}
        className="absolute bottom-6 right-6 bg-sage-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8,
        }}
      >
        <Icon name="calendar-plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Schedule Visit Modal */}
      {selectedPatient && (
        <ScheduleVisitModal
          visible={showScheduleModal}
          patient={selectedPatient}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={(visit) => {
            console.log('Visit scheduled successfully:', visit);
            fetchPatientData(); // Refresh the patient data
            setShowScheduleModal(false);
          }}
        />
      )}

      {/* Add Note Modal */}
      <AddNoteModal
        visible={showNoteModal}
        visits={visits.filter(v => v.status === 'COMPLETED' && !v.note)}
        selectedVisit={selectedVisit}
        onClose={() => {
          setShowNoteModal(false);
          setSelectedVisit(null);
          resetNoteForm();
        }}
        onSave={handleCreateNote}
        isCreating={isCreatingNote}
        noteType={noteType}
        onNoteTypeChange={setNoteType}
        noteData={noteData}
        onNoteDataChange={setNoteData}
        additionalNotes={additionalNotes}
        onAdditionalNotesChange={setAdditionalNotes}
        onVisitSelect={setSelectedVisit}
      />
    </SafeAreaView>
  );
}

// Add Note Modal Component
const AddNoteModal = ({ 
  visible, 
  visits, 
  selectedVisit, 
  onClose, 
  onSave, 
  isCreating,
  noteType,
  onNoteTypeChange,
  noteData,
  onNoteDataChange,
  additionalNotes,
  onAdditionalNotesChange,
  onVisitSelect
}: any) => {
  const formatVisitType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={{ backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color="#374151" />
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>Add Clinical Note</Text>
              <TouchableOpacity
                onPress={onSave}
                disabled={!selectedVisit || isCreating}
                style={{
                  backgroundColor: selectedVisit && !isCreating ? '#3b82f6' : '#9ca3af',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Icon name="content-save" size={16} color="white" />
                )}
                <Text style={{ color: 'white', marginLeft: 8, fontWeight: '600' }}>
                  {isCreating ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
            {/* Selected Visit - Always show since we have selectedVisit */}
            {selectedVisit && (
              <>
                <View style={{ backgroundColor: '#dbeafe', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e40af' }}>
                    Adding note for: {formatVisitType(selectedVisit.visit_type)}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>
                    {new Date(selectedVisit.scheduled_date).toLocaleDateString()} at {selectedVisit.scheduled_time}
                  </Text>
                </View>

                {/* Note Type Selection */}
                <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>Note Type</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {(['SOAP', 'DAP', 'PROGRESS'] as const).map((type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => onNoteTypeChange(type)}
                        style={{
                          flex: 1,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderWidth: 1,
                          borderColor: noteType === type ? '#3b82f6' : '#e5e7eb',
                          backgroundColor: noteType === type ? '#eff6ff' : 'white',
                          borderRadius: 8,
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: noteType === type ? '#1e40af' : '#6b7280'
                        }}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Note Content */}
                <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>Note Content</Text>
                  
                  {noteType === 'SOAP' && (
                    <View style={{ gap: 16 }}>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 }}>Subjective</Text>
                        <TextInput
                          value={noteData.soap.subjective}
                          onChangeText={(text) => onNoteDataChange({
                            ...noteData,
                            soap: { ...noteData.soap, subjective: text }
                          })}
                          multiline
                          numberOfLines={3}
                          style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 14,
                            textAlignVertical: 'top',
                            backgroundColor: '#f9fafb'
                          }}
                          placeholder="Patient's symptoms, pain levels..."
                        />
                      </View>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 }}>Objective</Text>
                        <TextInput
                          value={noteData.soap.objective}
                          onChangeText={(text) => onNoteDataChange({
                            ...noteData,
                            soap: { ...noteData.soap, objective: text }
                          })}
                          multiline
                          numberOfLines={3}
                          style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 14,
                            textAlignVertical: 'top',
                            backgroundColor: '#f9fafb'
                          }}
                          placeholder="Clinical findings, measurements..."
                        />
                      </View>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 }}>Assessment</Text>
                        <TextInput
                          value={noteData.soap.assessment}
                          onChangeText={(text) => onNoteDataChange({
                            ...noteData,
                            soap: { ...noteData.soap, assessment: text }
                          })}
                          multiline
                          numberOfLines={3}
                          style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 14,
                            textAlignVertical: 'top',
                            backgroundColor: '#f9fafb'
                          }}
                          placeholder="Clinical judgment, diagnosis..."
                        />
                      </View>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 }}>Plan</Text>
                        <TextInput
                          value={noteData.soap.plan}
                          onChangeText={(text) => onNoteDataChange({
                            ...noteData,
                            soap: { ...noteData.soap, plan: text }
                          })}
                          multiline
                          numberOfLines={3}
                          style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 14,
                            textAlignVertical: 'top',
                            backgroundColor: '#f9fafb'
                          }}
                          placeholder="Treatment plan, next steps..."
                        />
                      </View>
                    </View>
                  )}
                  
                  {noteType === 'DAP' && (
                    <View style={{ gap: 16 }}>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 }}>Data</Text>
                        <TextInput
                          value={noteData.dap.data}
                          onChangeText={(text) => onNoteDataChange({
                            ...noteData,
                            dap: { ...noteData.dap, data: text }
                          })}
                          multiline
                          numberOfLines={4}
                          style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 14,
                            textAlignVertical: 'top',
                            backgroundColor: '#f9fafb'
                          }}
                          placeholder="Objective data, measurements..."
                        />
                      </View>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 }}>Assessment</Text>
                        <TextInput
                          value={noteData.dap.assessment}
                          onChangeText={(text) => onNoteDataChange({
                            ...noteData,
                            dap: { ...noteData.dap, assessment: text }
                          })}
                          multiline
                          numberOfLines={4}
                          style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 14,
                            textAlignVertical: 'top',
                            backgroundColor: '#f9fafb'
                          }}
                          placeholder="Clinical assessment..."
                        />
                      </View>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 }}>Plan</Text>
                        <TextInput
                          value={noteData.dap.plan}
                          onChangeText={(text) => onNoteDataChange({
                            ...noteData,
                            dap: { ...noteData.dap, plan: text }
                          })}
                          multiline
                          numberOfLines={4}
                          style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 14,
                            textAlignVertical: 'top',
                            backgroundColor: '#f9fafb'
                          }}
                          placeholder="Treatment plan..."
                        />
                      </View>
                    </View>
                  )}
                  
                  {noteType === 'PROGRESS' && (
                    <View style={{ gap: 16 }}>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 }}>Progress</Text>
                        <TextInput
                          value={noteData.progress.progress}
                          onChangeText={(text) => onNoteDataChange({
                            ...noteData,
                            progress: { ...noteData.progress, progress: text }
                          })}
                          multiline
                          numberOfLines={3}
                          style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 14,
                            textAlignVertical: 'top',
                            backgroundColor: '#f9fafb'
                          }}
                          placeholder="Patient's progress..."
                        />
                      </View>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 }}>Interventions</Text>
                        <TextInput
                          value={noteData.progress.interventions}
                          onChangeText={(text) => onNoteDataChange({
                            ...noteData,
                            progress: { ...noteData.progress, interventions: text }
                          })}
                          multiline
                          numberOfLines={3}
                          style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 14,
                            textAlignVertical: 'top',
                            backgroundColor: '#f9fafb'
                          }}
                          placeholder="Treatments provided..."
                        />
                      </View>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 }}>Response</Text>
                        <TextInput
                          value={noteData.progress.response}
                          onChangeText={(text) => onNoteDataChange({
                            ...noteData,
                            progress: { ...noteData.progress, response: text }
                          })}
                          multiline
                          numberOfLines={3}
                          style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 14,
                            textAlignVertical: 'top',
                            backgroundColor: '#f9fafb'
                          }}
                          placeholder="Patient's response..."
                        />
                      </View>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 4 }}>Plan</Text>
                        <TextInput
                          value={noteData.progress.plan}
                          onChangeText={(text) => onNoteDataChange({
                            ...noteData,
                            progress: { ...noteData.progress, plan: text }
                          })}
                          multiline
                          numberOfLines={3}
                          style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 14,
                            textAlignVertical: 'top',
                            backgroundColor: '#f9fafb'
                          }}
                          placeholder="Future treatment plan..."
                        />
                      </View>
                    </View>
                  )}
                </View>

                {/* Additional Notes */}
                <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>Additional Notes</Text>
                  <TextInput
                    value={additionalNotes}
                    onChangeText={onAdditionalNotesChange}
                    multiline
                    numberOfLines={3}
                    style={{
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 14,
                      textAlignVertical: 'top',
                      backgroundColor: '#f9fafb'
                    }}
                    placeholder="Any additional observations, recommendations, or notes..."
                  />
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};