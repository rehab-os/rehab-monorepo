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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl border border-border-color">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-text-dark">Schedule Visit 📅</h2>
            <p className="text-sm text-text-light font-medium">for {patient.full_name} ({patient.patient_code})</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-healui-physio/10 rounded-lg transition-all duration-200"
          >
            <X className="h-5 w-5 text-text-light" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center border border-red-200">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Visit Type */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Visit Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.visit_type}
                onChange={(e) => setFormData({ ...formData, visit_type: e.target.value })}
                className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-healui-physio/20 focus:border-healui-physio transition-all duration-200 bg-white"
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
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={getMinDate()}
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-healui-physio/20 focus:border-healui-physio transition-all duration-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-healui-physio/20 focus:border-healui-physio transition-all duration-200 bg-white"
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
              <label className="block text-sm font-medium text-text-dark mb-2">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-healui-physio/20 focus:border-healui-physio transition-all duration-200 bg-white"
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
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Available Physiotherapists <span className="text-red-500">*</span>
                </label>
                {checkingAvailability ? (
                  <div className="flex items-center justify-center p-4 border border-border-color rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-healui-physio mr-2"></div>
                    <span className="text-text-gray font-medium">Checking availability...</span>
                  </div>
                ) : availablePhysiotherapists.length === 0 ? (
                  <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">No physiotherapists available at this time</span>
                    </div>
                    <p className="text-sm text-red-500 mt-1 font-medium">
                      Please select a different date or time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availablePhysiotherapists.map((physio) => (
                      <label key={physio.id} className="flex items-center p-3 border border-border-color rounded-lg hover:bg-healui-physio/5 cursor-pointer transition-all duration-200">
                        <input
                          type="radio"
                          name="physiotherapist"
                          value={physio.id}
                          checked={formData.physiotherapist_id === physio.id}
                          onChange={(e) => setFormData({ ...formData, physiotherapist_id: e.target.value })}
                          className="mr-3 text-healui-physio focus:ring-healui-physio/20"
                        />
                        <div className="flex items-center flex-1">
                          <User className="h-4 w-4 mr-2 text-text-light" />
                          <span className="font-medium text-text-dark">{physio.name}</span>
                          {physio.is_admin && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-healui-primary/20 text-healui-primary border border-healui-primary/30">
                              Admin
                            </span>
                          )}
                        </div>
                        <CheckCircle className="h-5 w-5 text-healui-physio" />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chief Complaint */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Chief Complaint
              </label>
              <textarea
                value={formData.chief_complaint}
                onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                className="w-full px-3 py-2.5 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-healui-physio/20 focus:border-healui-physio transition-all duration-200 bg-white"
                rows={3}
                placeholder="Describe the main reason for this visit..."
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-color flex items-center justify-end space-x-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-6 py-2.5"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || availablePhysiotherapists.length === 0 || !formData.physiotherapist_id}
            className="btn-primary px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Scheduling...' : 'Schedule Visit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleVisitModal;