import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { AnimatedCard } from '../ui/AnimatedCard';
import AudioRecorder from './AudioRecorder';
import ApiManager from '../../services/api/ApiManager';

interface SmartNoteInputProps {
  visitId: string;
  onNoteCreated?: () => void;
  onCancel?: () => void;
  defaultNoteType?: 'SOAP' | 'BAP' | 'Progress';
}

type InputMode = 'audio' | 'text' | 'review';
type NoteType = 'SOAP' | 'BAP' | 'Progress';

interface NoteData {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  behavior?: string;
  progressNote?: string;
}

export default function SmartNoteInput({ 
  visitId, 
  onNoteCreated, 
  onCancel,
  defaultNoteType = 'SOAP' 
}: SmartNoteInputProps) {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [noteType, setNoteType] = useState<NoteType>(defaultNoteType);
  const [roughText, setRoughText] = useState('');
  const [generatedNote, setGeneratedNote] = useState<NoteData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleAudioRecordingComplete = async (audioUri: string) => {
    setError(null);
    
    try {
      setIsTranscribing(true);
      
      // Create a blob from the audio file
      const audioBlob = await fetch(audioUri).then(r => r.blob());
      
      const response = await ApiManager.transcribeAudio(audioBlob);
      
      if (response.success && response.data?.transcription) {
        setRoughText(response.data.transcription);
        setInputMode('text');
        
        // Automatically generate note from transcription
        await generateSmartNote(response.data.transcription);
      } else {
        setError('Failed to transcribe audio. Please try again.');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const generateSmartNote = async (text?: string) => {
    const inputText = text || roughText;
    
    if (!inputText.trim()) {
      setError('Please provide some text or record audio first.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const response = await ApiManager.generateNote({
        transcription: inputText,
        noteType: noteType
      });

      if (response.success && response.data) {
        setGeneratedNote(response.data.note);
        setInputMode('review');
      } else {
        setError('Failed to generate note. Please try again.');
      }
    } catch (err) {
      console.error('Note generation error:', err);
      setError('Failed to generate note. Please check your connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveNote = async () => {
    if (!generatedNote) {
      setError('No note to save.');
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const notePayload = {
        visit_id: visitId,
        note_type: noteType,
        note_data: generatedNote,
        additional_notes: additionalNotes,
        treatment_codes: [],
        treatment_details: {},
        goals: {},
        outcome_measures: {}
      };

      const response = await ApiManager.createNote(notePayload);

      if (response.success) {
        Alert.alert('Success', 'Note saved successfully!', [
          { text: 'OK', onPress: onNoteCreated }
        ]);
      } else {
        setError('Failed to save note. Please try again.');
      }
    } catch (err) {
      console.error('Save note error:', err);
      setError('Failed to save note. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setInputMode('text');
    setRoughText('');
    setGeneratedNote(null);
    setAdditionalNotes('');
    setError(null);
  };

  const renderNoteFields = () => {
    if (!generatedNote) return null;

    const fields = noteType === 'SOAP' 
      ? [
          { key: 'subjective', label: 'Subjective' },
          { key: 'objective', label: 'Objective' },
          { key: 'assessment', label: 'Assessment' },
          { key: 'plan', label: 'Plan' }
        ]
      : noteType === 'BAP' 
      ? [
          { key: 'behavior', label: 'Behavior' },
          { key: 'assessment', label: 'Assessment' },
          { key: 'plan', label: 'Plan' }
        ]
      : [{ key: 'progressNote', label: 'Progress Note' }];

    return (
      <View className="space-y-4">
        {fields.map((field) => (
          <View key={field.key} className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">{field.label}</Text>
            <TextInput
              value={generatedNote[field.key as keyof NoteData] || ''}
              onChangeText={(value) => setGeneratedNote({
                ...generatedNote,
                [field.key]: value
              })}
              multiline
              numberOfLines={4}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              textAlignVertical="top"
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1">
        <AnimatedCard className="bg-white rounded-2xl p-6 m-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-lg font-semibold text-gray-900">Smart Note</Text>
            <TouchableOpacity onPress={onCancel}>
              <Icon name="close" size={24} color={colors?.gray?.[400] || '#9CA3AF'} />
            </TouchableOpacity>
          </View>

          {error && (
            <View className="mb-4 flex-row items-center space-x-2 bg-red-50 p-3 rounded-xl">
              <Icon name="alert-circle" size={20} color={colors?.red?.[600] || '#DC2626'} />
              <Text className="text-red-800 text-sm flex-1">{error}</Text>
            </View>
          )}

          {inputMode !== 'review' && (
            <>
              {/* Note Type Selection */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-3">Note Type</Text>
                <View className="flex-row space-x-2">
                  {(['SOAP', 'BAP', 'Progress'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setNoteType(type)}
                      className={`flex-1 p-3 rounded-xl border ${
                        noteType === type
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      <Text className={`text-center font-medium ${
                        noteType === type ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {type === 'Progress' ? 'Progress' : type}
                      </Text>
                      <Text className={`text-xs text-center mt-1 ${
                        noteType === type ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {type === 'SOAP' && 'S.O.A.P'}
                        {type === 'BAP' && 'B.A.P'}
                        {type === 'Progress' && 'Progress'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Input Mode Tabs */}
              <View className="flex-row mb-6 bg-gray-100 rounded-xl p-1">
                <TouchableOpacity
                  onPress={() => setInputMode('text')}
                  className={`flex-1 flex-row items-center justify-center space-x-2 px-4 py-3 rounded-lg ${
                    inputMode === 'text'
                      ? 'bg-white shadow-sm'
                      : ''
                  }`}
                >
                  <Icon name="text" size={16} color={inputMode === 'text' ? colors?.blue?.[600] : colors?.gray?.[600]} />
                  <Text className={`font-medium ${
                    inputMode === 'text' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    Type
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setInputMode('audio')}
                  className={`flex-1 flex-row items-center justify-center space-x-2 px-4 py-3 rounded-lg ${
                    inputMode === 'audio'
                      ? 'bg-white shadow-sm'
                      : ''
                  }`}
                >
                  <Icon name="microphone" size={16} color={inputMode === 'audio' ? colors?.blue?.[600] : colors?.gray?.[600]} />
                  <Text className={`font-medium ${
                    inputMode === 'audio' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    Record
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Input Area */}
              {inputMode === 'text' ? (
                <View className="space-y-4">
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Describe the visit (any format)
                    </Text>
                    <TextInput
                      value={roughText}
                      onChangeText={setRoughText}
                      multiline
                      numberOfLines={8}
                      className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                      placeholder="Type or paste your notes here in any format. Include patient complaints, observations, treatments, and plans. AI will structure it."
                      textAlignVertical="top"
                    />
                    <Text className="mt-2 text-xs text-gray-500">
                      Write naturally - include symptoms, findings, and treatment plans in any order.
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => generateSmartNote()}
                    disabled={!roughText.trim() || isProcessing}
                    className={`flex-row items-center justify-center space-x-2 px-4 py-4 rounded-xl ${
                      !roughText.trim() || isProcessing
                        ? 'bg-gray-300'
                        : 'bg-blue-600'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <Text className="text-white font-medium">Generating {noteType}...</Text>
                      </>
                    ) : (
                      <>
                        <Icon name="sparkles" size={20} color="#FFFFFF" />
                        <Text className="text-white font-medium">Generate {noteType} Note</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="py-4">
                  <AudioRecorder
                    onRecordingComplete={handleAudioRecordingComplete}
                    isTranscribing={isTranscribing}
                    disabled={isProcessing}
                  />
                </View>
              )}
            </>
          )}

          {inputMode === 'review' && generatedNote && (
            <View className="space-y-6">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-medium text-gray-900">Review Note</Text>
                <TouchableOpacity
                  onPress={resetForm}
                  className="flex-row items-center space-x-1"
                >
                  <Icon name="refresh" size={16} color={colors?.gray?.[600] || '#4B5563'} />
                  <Text className="text-sm text-gray-600">Start Over</Text>
                </TouchableOpacity>
              </View>

              <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <View className="flex-row items-start space-x-2">
                  <Icon name="check-circle" size={20} color={colors?.blue?.[600] || '#2563EB'} />
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-blue-900">
                      AI-Generated {noteType} Note
                    </Text>
                    <Text className="text-xs text-blue-700 mt-1">
                      Review and edit before saving. You are responsible for accuracy.
                    </Text>
                  </View>
                </View>
              </View>

              {renderNoteFields()}

              {/* Additional Notes */}
              <View className="space-y-2">
                <Text className="text-sm font-medium text-gray-700">Additional Notes</Text>
                <TextInput
                  value={additionalNotes}
                  onChangeText={setAdditionalNotes}
                  multiline
                  numberOfLines={3}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                  placeholder="Any additional observations or notes..."
                  textAlignVertical="top"
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setInputMode('text')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl"
                >
                  <Text className="text-gray-700 font-medium text-center">Back to Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveNote}
                  disabled={isSaving}
                  className={`flex-1 flex-row items-center justify-center space-x-2 px-4 py-3 rounded-xl ${
                    isSaving ? 'bg-gray-300' : 'bg-green-600'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <Text className="text-white font-medium">Saving...</Text>
                    </>
                  ) : (
                    <>
                      <Icon name="content-save" size={16} color="#FFFFFF" />
                      <Text className="text-white font-medium">Save Note</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </AnimatedCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}