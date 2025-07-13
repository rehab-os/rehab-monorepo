import React from 'react';
import { 
  Clock, User, Stethoscope, FileText, Activity, 
  Calendar, ChevronRight, Phone, Mail 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

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
  note?: {
    id: string;
    note_type: string;
    is_signed: boolean;
  };
}

interface AppointmentCardProps {
  visit: Visit;
  isAdmin: boolean;
  onViewPatient: (patient: any) => void;
  onStartVisit?: (visitId: string) => void;
  onAddNote?: (visitId: string) => void;
  onReschedule?: (visitId: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  visit,
  isAdmin,
  onViewPatient,
  onStartVisit,
  onAddNote,
  onReschedule
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVisitTypeColor = (type: string) => {
    switch (type) {
      case 'INITIAL_CONSULTATION':
        return 'bg-purple-100 text-purple-800';
      case 'FOLLOW_UP':
        return 'bg-blue-100 text-blue-800';
      case 'REVIEW':
        return 'bg-green-100 text-green-800';
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatVisitType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-blue-50 rounded-lg p-2 -m-2 transition-colors flex-1"
          onClick={(e) => {
            e.stopPropagation();
            onViewPatient(visit.patient);
          }}
          title="Click to view patient details"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
            {visit.patient?.full_name?.split(' ').map(n => n[0]).join('') || 'P'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate">
              {visit.patient?.full_name || 'Unknown Patient'}
            </h3>
            <p className="text-xs text-gray-500">{visit.patient?.patient_code}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(visit.status)}`}>
            {visit.status.replace('_', ' ')}
          </span>
          {visit.note && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <FileText className="h-3 w-3 mr-1" />
              Note
            </span>
          )}
        </div>
      </div>

      {/* Time and Type */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          <span className="font-medium">{visit.scheduled_time}</span>
          <span className="mx-2">•</span>
          <span>{format(parseISO(visit.scheduled_date), 'MMM dd')}</span>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getVisitTypeColor(visit.visit_type)}`}>
          {formatVisitType(visit.visit_type)}
        </span>
      </div>

      {/* Doctor (for admin view) */}
      {isAdmin && visit.physiotherapist && (
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Stethoscope className="h-4 w-4 mr-1" />
          <span>Dr. {visit.physiotherapist.full_name}</span>
        </div>
      )}

      {/* Chief Complaint */}
      {visit.chief_complaint && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 line-clamp-2">{visit.chief_complaint}</p>
        </div>
      )}

      {/* Contact Info */}
      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
        {visit.patient?.phone && (
          <div className="flex items-center">
            <Phone className="h-3 w-3 mr-1" />
            <span>{visit.patient.phone}</span>
          </div>
        )}
        {visit.patient?.email && (
          <div className="flex items-center">
            <Mail className="h-3 w-3 mr-1" />
            <span className="truncate">{visit.patient.email}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Click patient name to view details
        </div>
        
        <div className="flex items-center space-x-2">
          {visit.status === 'SCHEDULED' && onStartVisit && (
            <button
              onClick={() => onStartVisit(visit.id)}
              className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              title="Start Visit"
            >
              <Activity className="h-4 w-4" />
            </button>
          )}
          
          {visit.status === 'COMPLETED' && !visit.note && onAddNote && (
            <button
              onClick={() => onAddNote(visit.id)}
              className="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              title="Add Note"
            >
              <FileText className="h-4 w-4" />
            </button>
          )}
          
          {visit.status === 'SCHEDULED' && onReschedule && (
            <button
              onClick={() => onReschedule(visit.id)}
              className="p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
              title="Reschedule"
            >
              <Calendar className="h-4 w-4" />
            </button>
          )}
          
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;