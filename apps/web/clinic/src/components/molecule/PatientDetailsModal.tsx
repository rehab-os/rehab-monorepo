import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Calendar, MapPin, Heart, Shield, CalendarPlus, FileText, Clock, Activity } from 'lucide-react';
import ApiManager from '../../services/api';

interface Patient {
  id: string;
  patient_code: string;
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth: Date;
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
  scheduled_date: Date;
  scheduled_time: string;
  status: string;
  physiotherapist: {
    full_name: string;
  };
  note?: {
    id: string;
    note_type: string;
    is_signed: boolean;
  };
}

interface PatientDetailsModalProps {
  patient: Patient;
  onClose: () => void;
  onScheduleVisit: () => void;
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({ patient, onClose, onScheduleVisit }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'visits' | 'notes'>('details');

  useEffect(() => {
    fetchVisits();
  }, [patient.id]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await ApiManager.getVisits({ patient_id: patient.id });
      if (response.success && response.data) {
        setVisits(response.data.visits || []);
      }
    } catch (error) {
      console.error('Failed to fetch visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: Date) => {
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
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'DISCHARGED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
              {patient.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{patient.full_name}</h2>
              <p className="text-sm text-gray-500">{patient.patient_code}</p>
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
              {patient.status}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onScheduleVisit}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              Schedule Visit
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Patient Details
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'visits'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Visits ({visits.length})
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Clinical Notes
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-400" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{patient.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient Code</label>
                    <p className="mt-1 text-sm text-gray-900">{patient.patient_code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{patient.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{patient.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age & Gender</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {calculateAge(patient.date_of_birth)} years, {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(patient.date_of_birth).toLocaleDateString()}
                    </p>
                  </div>
                  {patient.address && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="mt-1 text-sm text-gray-900">{patient.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-gray-400" />
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                      <p className="mt-1 text-sm text-gray-900">{patient.emergency_contact_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{patient.emergency_contact_phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-gray-400" />
                  Medical Information
                </h3>
                <div className="space-y-4">
                  {patient.medical_history && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Medical History</label>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{patient.medical_history}</p>
                    </div>
                  )}
                  {patient.allergies && patient.allergies.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Allergies</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {patient.current_medications && patient.current_medications.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Medications</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {patient.current_medications.map((medication, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {medication}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Insurance Information */}
              {(patient.insurance_provider || patient.insurance_policy_number) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-gray-400" />
                    Insurance Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
                      <p className="mt-1 text-sm text-gray-900">{patient.insurance_provider || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Policy Number</label>
                      <p className="mt-1 text-sm text-gray-900">{patient.insurance_policy_number || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'visits' && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : visits.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No visits yet</h3>
                  <p className="text-gray-600 mb-4">Schedule the first visit for this patient</p>
                  <button
                    onClick={onScheduleVisit}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Schedule Visit
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {visits.map((visit) => (
                    <div key={visit.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{visit.visit_type.replace('_', ' ')}</h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getVisitStatusColor(visit.status)}`}>
                            {visit.status}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(visit.scheduled_date).toLocaleDateString()} at {visit.scheduled_time}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Physiotherapist: {visit.physiotherapist.full_name}</span>
                        {visit.note && (
                          <span className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {visit.note.note_type} Note {visit.note.is_signed ? '(Signed)' : '(Unsigned)'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Clinical Notes</h3>
                <p className="text-gray-600">Notes will appear here after visits are completed</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal;