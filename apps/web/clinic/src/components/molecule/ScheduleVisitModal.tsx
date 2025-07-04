import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import ApiManager from '../../services/api';
import type { CreateVisitDto, PhysiotherapistAvailabilityDto } from '@rehab/shared';

interface Patient {
  id: string;
  full_name: string;
  patient_code: string;
}

interface Physiotherapist {
  id: string;
  name: string;
  is_admin: boolean;
}

interface ScheduleVisitModalProps {
  patient: Patient;
  onClose: () => void;
  onSuccess: () => void;
}

const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({ patient, onClose, onSuccess }) => {
  const { currentClinic } = useAppSelector(state => state.user);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [error, setError] = useState('');
  const [availablePhysiotherapists, setAvailablePhysiotherapists] = useState<Physiotherapist[]>([]);
  const [formData, setFormData] = useState({
    visit_type: 'INITIAL_CONSULTATION',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 30,
    physiotherapist_id: '',
    chief_complaint: '',
  });

  const visitTypes = [
    { value: 'INITIAL_CONSULTATION', label: 'Initial Consultation' },
    { value: 'FOLLOW_UP', label: 'Follow-up' },
    { value: 'REVIEW', label: 'Review' },
    { value: 'EMERGENCY', label: 'Emergency' },
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30'
  ];

  useEffect(() => {
    if (formData.scheduled_date && formData.scheduled_time && currentClinic?.id) {
      checkAvailability();
    }
  }, [formData.scheduled_date, formData.scheduled_time, formData.duration_minutes]);

  const checkAvailability = async () => {
    if (!currentClinic?.id || !formData.scheduled_date || !formData.scheduled_time) return;

    try {
      setCheckingAvailability(true);
      const availabilityData: PhysiotherapistAvailabilityDto = {
        clinic_id: currentClinic.id,
        date: formData.scheduled_date,
        time: formData.scheduled_time,
        duration_minutes: formData.duration_minutes,
      };

      const response = await ApiManager.getAvailablePhysiotherapists(availabilityData);
      if (response.success) {
        setAvailablePhysiotherapists(response.data || []);
        // Auto-select first available physiotherapist if only one available
        if (response.data && response.data.length === 1) {
          setFormData(prev => ({ ...prev, physiotherapist_id: response.data[0].id }));
        } else if (response.data && response.data.length === 0) {
          setFormData(prev => ({ ...prev, physiotherapist_id: '' }));
        }
      }
    } catch (err: any) {
      console.error('Failed to check availability:', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentClinic?.id) {
      setError('No clinic selected');
      return;
    }

    if (!formData.physiotherapist_id) {
      setError('Please select a physiotherapist');
      return;
    }

    try {
      setLoading(true);
      const visitData: CreateVisitDto = {
        patient_id: patient.id,
        clinic_id: currentClinic.id,
        physiotherapist_id: formData.physiotherapist_id,
        visit_type: formData.visit_type as any,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        duration_minutes: formData.duration_minutes,
        chief_complaint: formData.chief_complaint || undefined,
      };

      const response = await ApiManager.createVisit(visitData);
      
      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Failed to schedule visit');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Schedule Visit</h2>
            <p className="text-sm text-gray-500">for {patient.full_name} ({patient.patient_code})</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Visit Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visit Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.visit_type}
                onChange={(e) => setFormData({ ...formData, visit_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {visitTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={getMinDate()}
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>

            {/* Available Physiotherapists */}
            {formData.scheduled_date && formData.scheduled_time && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Physiotherapists <span className="text-red-500">*</span>
                </label>
                {checkingAvailability ? (
                  <div className="flex items-center justify-center p-4 border border-gray-300 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                    Checking availability...
                  </div>
                ) : availablePhysiotherapists.length === 0 ? (
                  <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      No physiotherapists available at this time
                    </div>
                    <p className="text-sm text-red-500 mt-1">
                      Please select a different date or time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availablePhysiotherapists.map((physio) => (
                      <label key={physio.id} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="physiotherapist"
                          value={physio.id}
                          checked={formData.physiotherapist_id === physio.id}
                          onChange={(e) => setFormData({ ...formData, physiotherapist_id: e.target.value })}
                          className="mr-3"
                        />
                        <div className="flex items-center flex-1">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium text-gray-900">{physio.name}</span>
                          {physio.is_admin && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Admin
                            </span>
                          )}
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chief Complaint */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chief Complaint
              </label>
              <textarea
                value={formData.chief_complaint}
                onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe the main reason for this visit..."
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || availablePhysiotherapists.length === 0 || !formData.physiotherapist_id}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
          >
            {loading ? 'Scheduling...' : 'Schedule Visit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleVisitModal;