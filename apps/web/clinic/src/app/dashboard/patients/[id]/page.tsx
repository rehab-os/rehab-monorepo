'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppSelector } from '../../../../store/hooks';
import ApiManager from '../../../../services/api';
import { 
  ArrowLeft, User, Phone, Mail, Calendar, MapPin, Heart, Shield, 
  FileText, Clock, Activity, AlertCircle, Plus, Save, Edit3, 
  CheckCircle, Stethoscope, Pill, Brain, Target, ClipboardList,
  CalendarPlus, Eye, Edit, Trash2, Sparkles
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import SmartNoteInput from '../../../../components/notes/SmartNoteInput';

interface Patient {
  id: string;
  patient_code: string;
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth: string;
  gender: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_history?: string;
  allergies?: string[];
  current_medications?: string[];
  insurance_provider?: string;
  insurance_policy_number?: string;
  status: string;
  created_at: string;
}

interface Visit {
  id: string;
  visit_type: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  chief_complaint?: string;
  duration_minutes: number;
  physiotherapist: {
    id: string;
    full_name: string;
  };
  note?: Note;
}

interface Note {
  id: string;
  note_type: 'SOAP' | 'DAP' | 'PROGRESS';
  note_data: any;
  additional_notes?: string;
  treatment_codes?: string[];
  treatment_details?: {
    modalities?: string[];
    exercises?: string[];
    manual_therapy?: string[];
    education?: string[];
  };
  goals?: {
    short_term?: string[];
    long_term?: string[];
  };
  is_signed: boolean;
  signed_by?: string;
  signed_at?: string;
  created_at: string;
}

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { currentClinic, userData } = useAppSelector(state => state.user);
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [visitHistory, setVisitHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNewNote, setShowNewNote] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteType, setNoteType] = useState<'SOAP' | 'DAP' | 'PROGRESS'>('SOAP');
  const [noteData, setNoteData] = useState({
    soap: { subjective: '', objective: '', assessment: '', plan: '' },
    dap: { data: '', assessment: '', plan: '' },
    progress: { progress: '', interventions: '', response: '', plan: '' }
  });
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [useSmartNotes, setUseSmartNotes] = useState(true);

  useEffect(() => {
    if (params.id && currentClinic?.id) {
      fetchPatientData();
      fetchVisits();
      fetchVisitHistory();
    }
  }, [params.id, currentClinic?.id]);

  const fetchPatientData = async () => {
    try {
      const response = await ApiManager.getPatient(params.id as string);
      if (response.success && response.data) {
        setPatient(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch patient:', error);
    }
  };

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await ApiManager.getPatientVisits(params.id as string, { 
        limit: 100 
      });
      if (response.success && response.data) {
        setVisits(response.data.visits || []);
      }
    } catch (error) {
      console.error('Failed to fetch visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitHistory = async () => {
    try {
      const response = await ApiManager.getPatientVisitHistory(params.id as string);
      if (response.success && response.data) {
        setVisitHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch visit history:', error);
    }
  };

  const handleCreateNote = async () => {
    if (!selectedVisit) {
      alert('Please select a visit first');
      return;
    }

    const currentNoteData = noteType === 'SOAP' ? noteData.soap : 
                           noteType === 'DAP' ? noteData.dap : 
                           noteData.progress;
    
    const hasContent = Object.values(currentNoteData).some(value => value.trim() !== '');
    
    if (!hasContent && !additionalNotes.trim()) {
      alert('Please provide some note content before saving');
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

      console.log('Creating note with payload:', notePayload);
      const response = await ApiManager.createNote(notePayload);
      
      if (response.success) {
        alert('Note saved successfully!');
        await fetchVisits();
        resetNoteForm();
        setShowNewNote(false);
        setSelectedVisit(null);
      } else {
        console.error('Failed to create note:', response);
        alert('Failed to save note. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create note:', error);
      alert('Failed to save note. Please check your connection and try again.');
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
    setUseSmartNotes(true);
  };

  const handleSmartNoteCreated = () => {
    setShowNewNote(false);
    setSelectedVisit(null);
    fetchVisits();
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'DISCHARGED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVisitStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatVisitType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const renderNoteContent = (note: Note) => {
    if (note.note_type === 'SOAP') {
      const data = note.note_data as any;
      return (
        <div className="space-y-3">
          {data.subjective && (
            <div>
              <h6 className="font-medium text-gray-700 text-xs">SUBJECTIVE</h6>
              <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">{data.subjective}</p>
            </div>
          )}
          {data.objective && (
            <div>
              <h6 className="font-medium text-gray-700 text-xs">OBJECTIVE</h6>
              <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">{data.objective}</p>
            </div>
          )}
          {data.assessment && (
            <div>
              <h6 className="font-medium text-gray-700 text-xs">ASSESSMENT</h6>
              <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">{data.assessment}</p>
            </div>
          )}
          {data.plan && (
            <div>
              <h6 className="font-medium text-gray-700 text-xs">PLAN</h6>
              <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">{data.plan}</p>
            </div>
          )}
        </div>
      );
    }
    // Similar rendering for DAP and PROGRESS
    return <p className="text-sm text-gray-600">Note content available</p>;
  };

  if (loading || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient details...</p>
        </div>
      </div>
    );
  }

  const completedVisits = visits.filter(v => v.status === 'COMPLETED');
  const upcomingVisits = visits.filter(v => v.status === 'SCHEDULED');
  const notesCount = visits.filter(v => v.note).length;
  const visitsWithoutNotes = completedVisits.filter(v => !v.note);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {patient.full_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{patient.full_name}</h1>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{patient.patient_code}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Single Page Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Patient Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Patient Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{patient.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{format(new Date(patient.date_of_birth), 'MMM dd, yyyy')} ({calculateAge(patient.date_of_birth)} years)</span>
                </div>
                <div>
                  <span className="font-medium">Gender: </span>
                  <span>{patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}</span>
                </div>
                {patient.address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{patient.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-600" />
                Medical Information
              </h3>
              
              {/* Medical History */}
              {patient.medical_history && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 text-sm mb-2">Medical History</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{patient.medical_history}</p>
                </div>
              )}

              {/* Allergies */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 text-sm mb-2">Allergies</h4>
                {patient.allergies && patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies.map((allergy, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No known allergies</p>
                )}
              </div>

              {/* Medications */}
              <div>
                <h4 className="font-medium text-gray-700 text-sm mb-2">Current Medications</h4>
                {patient.current_medications && patient.current_medications.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {patient.current_medications.map((medication, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {medication}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No current medications</p>
                )}
              </div>
            </div>

            {/* Stats - Enhanced with History Data */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Visit Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {visitHistory?.statistics?.totalVisits || visits.length}
                  </p>
                  <p className="text-xs text-gray-600">Total Visits</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {visitHistory?.statistics?.completedVisits || completedVisits.length}
                  </p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {visitHistory?.statistics?.upcomingVisits || upcomingVisits.length}
                  </p>
                  <p className="text-xs text-gray-600">Upcoming</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {visitHistory?.statistics?.notesCount || notesCount}
                  </p>
                  <p className="text-xs text-gray-600">Notes</p>
                </div>
              </div>
              {visitHistory?.statistics?.attendanceRate > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Attendance Rate</span>
                    <span className="text-lg font-semibold text-green-600">
                      {visitHistory.statistics.attendanceRate}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Visits & Notes */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Visit History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Visit History
                </h3>
                {visits.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setUseSmartNotes(true);
                        setShowNewNote(true);
                      }}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Smart Note
                    </button>
                    <button
                      onClick={() => {
                        setUseSmartNotes(false);
                        setShowNewNote(true);
                      }}
                      className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Manual Note
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {visits.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No visits recorded</p>
                ) : (
                  visits.map((visit) => (
                    <div key={visit.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 text-sm">{formatVisitType(visit.visit_type)}</h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getVisitStatusColor(visit.status)}`}>
                            {visit.status.replace('_', ' ')}
                          </span>
                          {visit.note && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <FileText className="h-3 w-3 mr-1" />
                              {visit.note.note_type}
                            </span>
                          )}
                        </div>
                        {!visit.note && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setSelectedVisit(visit);
                                setUseSmartNotes(true);
                                setShowNewNote(true);
                              }}
                              className="text-blue-600 hover:text-blue-700 text-xs"
                            >
                              Smart Note
                            </button>
                            <span className="text-gray-400 text-xs">|</span>
                            <button
                              onClick={() => {
                                setSelectedVisit(visit);
                                setUseSmartNotes(false);
                                setShowNewNote(true);
                              }}
                              className="text-gray-600 hover:text-gray-700 text-xs"
                            >
                              Manual
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(parseISO(visit.scheduled_date), 'MMM dd, yyyy')} at {visit.scheduled_time}
                        </div>
                        <div className="flex items-center">
                          <Stethoscope className="h-3 w-3 mr-1" />
                          Dr. {visit.physiotherapist.full_name}
                        </div>
                      </div>
                      
                      {visit.chief_complaint && (
                        <div className="mt-2 bg-gray-50 p-2 rounded text-xs">
                          <span className="font-medium text-gray-700">Chief Complaint: </span>
                          <span className="text-gray-600">{visit.chief_complaint}</span>
                        </div>
                      )}
                      
                      {visit.note && (
                        <div className="mt-3 border-t border-gray-100 pt-2">
                          <h5 className="font-medium text-gray-700 text-xs mb-2">Clinical Note</h5>
                          {renderNoteContent(visit.note)}
                          {visit.note.additional_notes && (
                            <div className="mt-2 bg-yellow-50 p-2 rounded">
                              <h6 className="font-medium text-gray-700 text-xs">Additional Notes</h6>
                              <p className="text-xs text-gray-600 mt-1">{visit.note.additional_notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Note Taking Section */}
            {showNewNote && (
              <>
                {/* Visit Selection */}
                {!selectedVisit && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Select Visit</h3>
                      <button
                        onClick={() => {
                          setShowNewNote(false);
                          setSelectedVisit(null);
                          resetNoteForm();
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {visits.filter(v => !v.note).map((visit) => (
                        <button
                          key={visit.id}
                          onClick={() => setSelectedVisit(visit)}
                          className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{formatVisitType(visit.visit_type)}</p>
                              <p className="text-xs text-gray-500">
                                {format(parseISO(visit.scheduled_date), 'MMM dd, yyyy')} at {visit.scheduled_time}
                              </p>
                            </div>
                            <Plus className="h-4 w-4 text-gray-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedVisit && (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="font-medium text-blue-900 text-sm">
                        Selected Visit: {formatVisitType(selectedVisit.visit_type)}
                      </p>
                      <p className="text-blue-700 text-xs">
                        {format(parseISO(selectedVisit.scheduled_date), 'MMM dd, yyyy')} at {selectedVisit.scheduled_time}
                      </p>
                    </div>

                    {useSmartNotes ? (
                      <SmartNoteInput
                        visitId={selectedVisit.id}
                        onNoteCreated={handleSmartNoteCreated}
                        onCancel={() => {
                          setShowNewNote(false);
                          setSelectedVisit(null);
                          resetNoteForm();
                        }}
                      />
                    ) : (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Manual Note Entry</h3>
                          <button
                            onClick={() => {
                              setShowNewNote(false);
                              setSelectedVisit(null);
                              resetNoteForm();
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                        </div>

                        {/* Note Type Selection */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Note Type</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['SOAP', 'DAP', 'PROGRESS'] as const).map((type) => (
                              <button
                                key={type}
                                onClick={() => setNoteType(type)}
                                className={`p-2 border rounded-lg text-xs transition-colors ${
                                  noteType === type
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="font-medium">{type}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Note Content */}
                        <div className="space-y-4">
                          {noteType === 'SOAP' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subjective</label>
                                <textarea
                                  value={noteData.soap.subjective}
                                  onChange={(e) => setNoteData({
                                    ...noteData,
                                    soap: { ...noteData.soap, subjective: e.target.value }
                                  })}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Patient's symptoms, pain levels..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Objective</label>
                                <textarea
                                  value={noteData.soap.objective}
                                  onChange={(e) => setNoteData({
                                    ...noteData,
                                    soap: { ...noteData.soap, objective: e.target.value }
                                  })}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Clinical findings, measurements..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assessment</label>
                                <textarea
                                  value={noteData.soap.assessment}
                                  onChange={(e) => setNoteData({
                                    ...noteData,
                                    soap: { ...noteData.soap, assessment: e.target.value }
                                  })}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Clinical judgment, diagnosis..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                                <textarea
                                  value={noteData.soap.plan}
                                  onChange={(e) => setNoteData({
                                    ...noteData,
                                    soap: { ...noteData.soap, plan: e.target.value }
                                  })}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Treatment plan, next steps..."
                                />
                              </div>
                            </div>
                          )}

                          {noteType === 'DAP' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                <textarea
                                  value={noteData.dap.data}
                                  onChange={(e) => setNoteData({
                                    ...noteData,
                                    dap: { ...noteData.dap, data: e.target.value }
                                  })}
                                  rows={4}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Objective data, measurements..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assessment</label>
                                <textarea
                                  value={noteData.dap.assessment}
                                  onChange={(e) => setNoteData({
                                    ...noteData,
                                    dap: { ...noteData.dap, assessment: e.target.value }
                                  })}
                                  rows={4}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Clinical assessment..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                                <textarea
                                  value={noteData.dap.plan}
                                  onChange={(e) => setNoteData({
                                    ...noteData,
                                    dap: { ...noteData.dap, plan: e.target.value }
                                  })}
                                  rows={4}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Treatment plan..."
                                />
                              </div>
                            </div>
                          )}

                          {noteType === 'PROGRESS' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Progress</label>
                                <textarea
                                  value={noteData.progress.progress}
                                  onChange={(e) => setNoteData({
                                    ...noteData,
                                    progress: { ...noteData.progress, progress: e.target.value }
                                  })}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Patient's progress..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interventions</label>
                                <textarea
                                  value={noteData.progress.interventions}
                                  onChange={(e) => setNoteData({
                                    ...noteData,
                                    progress: { ...noteData.progress, interventions: e.target.value }
                                  })}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Treatments provided..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Response</label>
                                <textarea
                                  value={noteData.progress.response}
                                  onChange={(e) => setNoteData({
                                    ...noteData,
                                    progress: { ...noteData.progress, response: e.target.value }
                                  })}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Patient's response..."
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                                <textarea
                                  value={noteData.progress.plan}
                                  onChange={(e) => setNoteData({
                                    ...noteData,
                                    progress: { ...noteData.progress, plan: e.target.value }
                                  })}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  placeholder="Future treatment plan..."
                                />
                              </div>
                            </div>
                          )}

                          {/* Additional Notes - Separate Section */}
                          <div className="border-t border-gray-200 pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                            <textarea
                              value={additionalNotes}
                              onChange={(e) => setAdditionalNotes(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Any additional observations, recommendations, or notes..."
                            />
                          </div>

                          {/* Save Button */}
                          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => {
                                setShowNewNote(false);
                                setSelectedVisit(null);
                                resetNoteForm();
                              }}
                              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleCreateNote}
                              disabled={!selectedVisit || isCreatingNote}
                              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCreatingNote ? (
                                <>
                                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Note
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}