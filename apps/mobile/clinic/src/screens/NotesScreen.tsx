import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import ApiManager from '../services/api/ApiManager';
import { 
  setNotes, 
  setNoteType, 
  updateFormData, 
  updateNoteData, 
  resetForm,
  setLoading,
  setError
} from '../store/slices/noteSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { AnimatedCard } from '../components/ui/AnimatedCard';

export default function NotesScreen({ route }: any) {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { visit } = route.params;
  const noteState = useAppSelector((state) => state.note || {});
  
  // Ensure notes is always an array and other values have defaults
  const notes = Array.isArray(noteState.notes) ? noteState.notes : [];
  const noteType = noteState.noteType || 'SOAP';
  const formData = noteState.formData || {};
  const loading = noteState.loading || false;
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);

  useEffect(() => {
    if (visit?.id) {
      fetchNotes();
      dispatch(updateFormData({ visit_id: visit.id }));
    }
  }, [visit]);

  const fetchNotes = async () => {
    if (!visit?.id) return;
    
    dispatch(setLoading(true));
    try {
      const response = await ApiManager.getNotesForVisit(visit.id);
      if (response.success) {
        dispatch(setNotes(response.data || []));
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      dispatch(setError('Failed to fetch notes'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSaveNote = async () => {
    if (!formData.note_data || Object.keys(formData.note_data).length === 0) {
      Alert.alert('Error', 'Please fill in at least one field');
      return;
    }

    dispatch(setLoading(true));
    try {
      const response = selectedNote
        ? await ApiManager.updateNote(selectedNote.id, formData)
        : await ApiManager.createNote(formData);
      
      if (response.success) {
        Alert.alert('Success', `Note ${selectedNote ? 'updated' : 'created'} successfully`);
        setIsEditing(false);
        setSelectedNote(null);
        dispatch(resetForm());
        fetchNotes();
      } else {
        Alert.alert('Error', response.message || 'Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleEditNote = (note: any) => {
    setSelectedNote(note);
    dispatch(setNoteType(note.note_type));
    dispatch(updateFormData({
      visit_id: note.visit_id,
      note_type: note.note_type,
      note_data: note.note_data,
      additional_notes: note.additional_notes || '',
      treatment_codes: note.treatment_codes || [],
      treatment_details: note.treatment_details || '',
      goals: note.goals || '',
      outcome_measures: note.outcome_measures || '',
    }));
    setIsEditing(true);
  };

  const handleSignNote = async (note: any) => {
    try {
      const response = await ApiManager.signNote(note.id, { is_signed: true });
      if (response.success) {
        Alert.alert('Success', 'Note signed successfully');
        fetchNotes();
      } else {
        Alert.alert('Error', response.message || 'Failed to sign note');
      }
    } catch (error) {
      console.error('Error signing note:', error);
      Alert.alert('Error', 'Failed to sign note');
    }
  };

  const renderSOAPForm = () => (
    <View className="space-y-4">
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Subjective</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base min-h-[80px]"
          placeholder="Patient's subjective complaints and symptoms"
          value={formData.note_data?.subjective || ''}
          onChangeText={(value) => dispatch(updateNoteData({ subjective: value }))}
          multiline
          textAlignVertical="top"
        />
      </View>
      
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Objective</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base min-h-[80px]"
          placeholder="Objective findings and observations"
          value={formData.note_data?.objective || ''}
          onChangeText={(value) => dispatch(updateNoteData({ objective: value }))}
          multiline
          textAlignVertical="top"
        />
      </View>
      
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Assessment</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base min-h-[80px]"
          placeholder="Clinical assessment and diagnosis"
          value={formData.note_data?.assessment || ''}
          onChangeText={(value) => dispatch(updateNoteData({ assessment: value }))}
          multiline
          textAlignVertical="top"
        />
      </View>
      
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Plan</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base min-h-[80px]"
          placeholder="Treatment plan and next steps"
          value={formData.note_data?.plan || ''}
          onChangeText={(value) => dispatch(updateNoteData({ plan: value }))}
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderDAPForm = () => (
    <View className="space-y-4">
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Data</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base min-h-[80px]"
          placeholder="Relevant data and observations"
          value={formData.note_data?.data || ''}
          onChangeText={(value) => dispatch(updateNoteData({ data: value }))}
          multiline
          textAlignVertical="top"
        />
      </View>
      
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Assessment</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base min-h-[80px]"
          placeholder="Clinical assessment"
          value={formData.note_data?.assessment || ''}
          onChangeText={(value) => dispatch(updateNoteData({ assessment: value }))}
          multiline
          textAlignVertical="top"
        />
      </View>
      
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Plan</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base min-h-[80px]"
          placeholder="Treatment plan"
          value={formData.note_data?.plan || ''}
          onChangeText={(value) => dispatch(updateNoteData({ plan: value }))}
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderProgressForm = () => (
    <View className="space-y-4">
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Progress</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base min-h-[80px]"
          placeholder="Patient progress since last visit"
          value={formData.note_data?.progress || ''}
          onChangeText={(value) => dispatch(updateNoteData({ progress: value }))}
          multiline
          textAlignVertical="top"
        />
      </View>
      
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Interventions</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base min-h-[80px]"
          placeholder="Interventions performed"
          value={formData.note_data?.interventions || ''}
          onChangeText={(value) => dispatch(updateNoteData({ interventions: value }))}
          multiline
          textAlignVertical="top"
        />
      </View>
      
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Response</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base min-h-[80px]"
          placeholder="Patient response to treatment"
          value={formData.note_data?.response || ''}
          onChangeText={(value) => dispatch(updateNoteData({ response: value }))}
          multiline
          textAlignVertical="top"
        />
      </View>
      
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Plan</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base min-h-[80px]"
          placeholder="Future treatment plan"
          value={formData.note_data?.plan || ''}
          onChangeText={(value) => dispatch(updateNoteData({ plan: value }))}
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderNoteForm = () => {
    switch (noteType) {
      case 'SOAP':
        return renderSOAPForm();
      case 'DAP':
        return renderDAPForm();
      case 'PROGRESS':
        return renderProgressForm();
      default:
        return renderSOAPForm();
    }
  };

  const NoteCard = ({ note }: { note: any }) => (
    <AnimatedCard className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {note.note_type} Note
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {new Date(note.created_at).toLocaleDateString()} at{' '}
            {new Date(note.created_at).toLocaleTimeString()}
          </Text>
          <Text className="text-sm text-gray-500">
            By {note.creator?.name || 'Unknown'}
          </Text>
        </View>
        <View className="flex-row items-center space-x-2">
          {note.is_signed && (
            <View className="bg-green-100 px-2 py-1 rounded-full">
              <Text className="text-xs text-green-700 font-medium">Signed</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => handleEditNote(note)}
            className="p-2"
          >
            <Icon name="pencil" size={20} color={colors?.gray?.[600] || '#4B5563'} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="space-y-2">
        {Object.entries(note.note_data || {}).map(([key, value]) => (
          value && (
            <View key={key}>
              <Text className="text-sm font-medium text-gray-700 capitalize">
                {key.replace('_', ' ')}:
              </Text>
              <Text className="text-sm text-gray-600 mt-1">{value as string}</Text>
            </View>
          )
        ))}
      </View>

      {note.additional_notes && (
        <View className="mt-3 pt-3 border-t border-gray-200">
          <Text className="text-sm font-medium text-gray-700">Additional Notes:</Text>
          <Text className="text-sm text-gray-600 mt-1">{note.additional_notes}</Text>
        </View>
      )}

      {!note.is_signed && (
        <TouchableOpacity
          onPress={() => handleSignNote(note)}
          className="mt-3 bg-sage-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium text-center">Sign Note</Text>
        </TouchableOpacity>
      )}
    </AnimatedCard>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color={colors?.gray?.[700] || '#374151'} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">Visit Notes</Text>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              className="bg-sage-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">
                {isEditing ? 'Cancel' : 'Add Note'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Visit Info */}
        <View className="bg-white border-b border-gray-200 px-4 py-3">
          <Text className="text-base font-medium text-gray-900">
            {visit.patient?.full_name} • {visit.visit_type?.replace('_', ' ')}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {new Date(visit.scheduled_date).toLocaleDateString()} at {visit.scheduled_time}
          </Text>
        </View>

        {isEditing ? (
          <ScrollView className="flex-1 px-4 py-6">
            {/* Note Type Selector */}
            <View className="bg-white rounded-2xl p-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">Note Type</Text>
              <View className="flex-row space-x-2">
                {['SOAP', 'DAP', 'PROGRESS'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => dispatch(setNoteType(type as any))}
                    className={`flex-1 py-3 px-4 rounded-xl border ${
                      noteType === type
                        ? 'border-sage-500 bg-sage-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <Text
                      className={`text-center font-medium ${
                        noteType === type ? 'text-sage-700' : 'text-gray-700'
                      }`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Note Form */}
            <View className="bg-white rounded-2xl p-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                {noteType} Note
              </Text>
              {renderNoteForm()}
            </View>

            {/* Additional Fields */}
            <View className="bg-white rounded-2xl p-6 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Additional Information
              </Text>
              
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base min-h-[80px]"
                  placeholder="Any additional notes or observations"
                  value={formData.additional_notes || ''}
                  onChangeText={(value) => dispatch(updateFormData({ additional_notes: value }))}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Treatment Details
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base min-h-[80px]"
                  placeholder="Details of treatment provided"
                  value={formData.treatment_details || ''}
                  onChangeText={(value) => dispatch(updateFormData({ treatment_details: value }))}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Goals</Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base min-h-[80px]"
                  placeholder="Treatment goals and objectives"
                  value={formData.goals || ''}
                  onChangeText={(value) => dispatch(updateFormData({ goals: value }))}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSaveNote}
              disabled={loading}
              className={`bg-sage-600 px-6 py-4 rounded-xl mb-6 ${
                loading ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-white font-semibold text-center">
                {loading ? 'Saving...' : selectedNote ? 'Update Note' : 'Save Note'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView className="flex-1 px-4 py-6">
            {notes.length > 0 ? (
              notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))
            ) : (
              <View className="flex-1 items-center justify-center py-12">
                <Icon name="note-text" size={64} color={colors?.gray?.[300] || '#D1D5DB'} />
                <Text className="text-xl font-semibold text-gray-900 mt-4">
                  No notes yet
                </Text>
                <Text className="text-gray-600 text-center mt-2">
                  Add your first note to document this visit
                </Text>
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  className="mt-6 bg-sage-600 px-6 py-3 rounded-xl"
                >
                  <Text className="text-white font-medium">Add First Note</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}