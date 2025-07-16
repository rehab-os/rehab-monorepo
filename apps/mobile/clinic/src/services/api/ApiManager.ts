import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { store } from '../../store/store';
import { setAuthTokens } from './config';
import type {
  LoginDto,
  SendOtpDto,
  CreateClinicDto,
  UpdateClinicDto,
  AddTeamMemberDto,
  CreatePatientDto,
  UpdatePatientDto,
  CreateVisitDto,
  UpdateVisitDto,
  CheckInVisitDto,
  StartVisitDto,
  CancelVisitDto,
  RescheduleVisitDto,
  PhysiotherapistAvailabilityDto,
  CreateNoteDto,
  UpdateNoteDto,
  SignNoteDto,
} from '@rehab/shared';
import { loginSuccess, setUser, setOtpSent, setPhoneNumber } from '../../store/slices/authSlice';
import { setOrganizations } from '../../store/slices/organizationSlice';
import { setClinics } from '../../store/slices/clinicSlice';
import { setUserData } from '../../store/slices/userSlice';
import { setVisits, addVisit, updateVisit as updateVisitInStore } from '../../store/slices/visitSlice';
import { setNotes, addNote, updateNote as updateNoteInStore } from '../../store/slices/noteSlice';

class ApiManager {
  // Auth
  static sendOtp = async (data: SendOtpDto) => {
    const response = await apiClient.post(ENDPOINTS.SEND_OTP(), data);
    if (response.success && response.data) {
      store.dispatch(setOtpSent(true));
      store.dispatch(setPhoneNumber(data.phone));
    }
    return response;
  };

  static verifyOtp = async (data: { phone: string; otp: string }) => {
    const response = await apiClient.post(ENDPOINTS.LOGIN(), data);
    if (response.success && response.data) {
      await setAuthTokens(response.data.access_token, response.data.refresh_token);
      store.dispatch(loginSuccess(response.data));
      if (response.data.user) {
        store.dispatch(setUserData(response.data.user));
      }
    }
    return response;
  };

  static login = async (data: LoginDto) => {
    const response = await apiClient.post(ENDPOINTS.LOGIN(), data);
    if (response.success && response.data) {
      await setAuthTokens(response.data.access_token, response.data.refresh_token);
      store.dispatch(loginSuccess(response.data));
      if (response.data.user) {
        store.dispatch(setUserData(response.data.user));
      }
    }
    return response;
  };

  static getMe = async () => {
    const response = await apiClient.get(ENDPOINTS.GET_ME());
    if (response.success && response.data) {
      store.dispatch(setUser(response.data));
      store.dispatch(setUserData(response.data));
    }
    return response;
  };

  // Organizations
  static getOrganizations = async () => {
    const response = await apiClient.get(ENDPOINTS.GET_ORGANIZATIONS());
    if (response.success && response.data) {
      store.dispatch(setOrganizations(response.data));
    }
    return response;
  };

  // Clinics
  static getClinics = async (organizationId?: string) => {
    const headers = organizationId ? { 'x-organization-id': organizationId } : undefined;
    const response = await apiClient.get(ENDPOINTS.GET_CLINICS(), { headers });
    if (response.success && response.data) {
      store.dispatch(setClinics(response.data));
    }
    return response;
  };

  static createClinic = async (organizationId: string, data: CreateClinicDto) => {
    const headers = { 'x-organization-id': organizationId };
    const response = await apiClient.post(ENDPOINTS.CREATE_CLINIC(), data, { headers });
    if (response.success && response.data) {
      // Refresh clinics list
      await ApiManager.getClinics(organizationId);
    }
    return response;
  };

  static updateClinic = (id: string, data: UpdateClinicDto) => {
    return apiClient.patch(ENDPOINTS.UPDATE_CLINIC(id), data);
  };

  static deleteClinic = (id: string) => {
    return apiClient.delete(ENDPOINTS.DELETE_CLINIC(id));
  };

  // Team Management
  static getTeamMembers = (organizationId: string, clinicId?: string) => {
    const headers = { 'x-organization-id': organizationId };
    const params = clinicId ? { clinic_id: clinicId } : undefined;
    return apiClient.get(ENDPOINTS.GET_TEAM_MEMBERS(), { headers, params });
  };

  static addTeamMember = (organizationId: string, data: AddTeamMemberDto) => {
    const headers = { 'x-organization-id': organizationId };
    return apiClient.post(ENDPOINTS.ADD_TEAM_MEMBER(), data, { headers });
  };

  static removeTeamMember = (organizationId: string, userId: string, clinicId?: string) => {
    const headers = { 'x-organization-id': organizationId };
    const params = clinicId ? { clinic_id: clinicId } : undefined;
    return apiClient.delete(ENDPOINTS.REMOVE_TEAM_MEMBER(userId), { headers, params });
  };

  static updateTeamMemberRole = (organizationId: string, userId: string, data: any) => {
    const headers = { 'x-organization-id': organizationId };
    return apiClient.patch(ENDPOINTS.UPDATE_TEAM_MEMBER_ROLE(userId), data, { headers });
  };

  // Patients
  static getPatients = (params?: any) => {
    return apiClient.get(ENDPOINTS.GET_PATIENTS(), { params });
  };

  static getPatient = (id: string) => {
    return apiClient.get(ENDPOINTS.GET_PATIENT(id));
  };

  static getPatientVisits = (id: string, params?: any) => {
    return apiClient.get(ENDPOINTS.GET_PATIENT_VISITS(id), { params });
  };

  static getPatientVisitHistory = (id: string) => {
    return apiClient.get(ENDPOINTS.GET_PATIENT_VISIT_HISTORY(id));
  };

  static createPatient = (data: CreatePatientDto) => {
    return apiClient.post(ENDPOINTS.CREATE_PATIENT(), data);
  };

  static updatePatient = (id: string, data: UpdatePatientDto) => {
    return apiClient.patch(ENDPOINTS.UPDATE_PATIENT(id), data);
  };

  static deletePatient = (id: string) => {
    return apiClient.delete(ENDPOINTS.DELETE_PATIENT(id));
  };

  // Visits
  static getVisits = async (params?: any) => {
    const response = await apiClient.get(ENDPOINTS.GET_VISITS(), { params });
    if (response.success && response.data) {
      // Handle both array and object responses
      const visitsData = Array.isArray(response.data) 
        ? { visits: response.data, total: response.data.length }
        : response.data;
      
      store.dispatch(setVisits({
        visits: Array.isArray(visitsData.visits) ? visitsData.visits : [],
        total: visitsData.total || 0
      }));
    }
    return response;
  };

  static getVisit = (id: string) => {
    return apiClient.get(ENDPOINTS.GET_VISIT(id));
  };

  static createVisit = async (data: CreateVisitDto) => {
    const response = await apiClient.post(ENDPOINTS.CREATE_VISIT(), data);
    if (response.success && response.data) {
      store.dispatch(addVisit(response.data));
    }
    return response;
  };

  static updateVisit = async (id: string, data: UpdateVisitDto) => {
    const response = await apiClient.patch(ENDPOINTS.UPDATE_VISIT(id), data);
    if (response.success && response.data) {
      store.dispatch(updateVisitInStore(response.data));
    }
    return response;
  };

  static checkInVisit = async (id: string, data: CheckInVisitDto) => {
    const response = await apiClient.post(ENDPOINTS.CHECK_IN_VISIT(id), data);
    if (response.success && response.data) {
      store.dispatch(updateVisitInStore(response.data));
    }
    return response;
  };

  static startVisit = async (id: string, data: StartVisitDto) => {
    const response = await apiClient.post(ENDPOINTS.START_VISIT(id), data);
    if (response.success && response.data) {
      store.dispatch(updateVisitInStore(response.data));
    }
    return response;
  };

  static completeVisit = async (id: string) => {
    const response = await apiClient.post(ENDPOINTS.COMPLETE_VISIT(id), {});
    if (response.success && response.data) {
      store.dispatch(updateVisitInStore(response.data));
    }
    return response;
  };

  static cancelVisit = async (id: string, data: CancelVisitDto) => {
    const response = await apiClient.post(ENDPOINTS.CANCEL_VISIT(id), data);
    if (response.success && response.data) {
      store.dispatch(updateVisitInStore(response.data));
    }
    return response;
  };

  static rescheduleVisit = async (id: string, data: RescheduleVisitDto) => {
    const response = await apiClient.put(ENDPOINTS.RESCHEDULE_VISIT(id), data);
    if (response.success && response.data) {
      store.dispatch(updateVisitInStore(response.data));
    }
    return response;
  };

  static getAvailablePhysiotherapists = (data: PhysiotherapistAvailabilityDto) => {
    return apiClient.post(ENDPOINTS.GET_AVAILABLE_PHYSIOTHERAPISTS(), data);
  };

  // Notes
  static createNote = async (data: CreateNoteDto) => {
    const response = await apiClient.post(ENDPOINTS.CREATE_NOTE(), data);
    if (response.success && response.data) {
      store.dispatch(addNote(response.data));
    }
    return response;
  };

  static getNote = (id: string) => {
    return apiClient.get(ENDPOINTS.GET_NOTE(id));
  };

  static updateNote = async (id: string, data: UpdateNoteDto) => {
    const response = await apiClient.patch(ENDPOINTS.UPDATE_NOTE(id), data);
    if (response.success && response.data) {
      store.dispatch(updateNoteInStore(response.data));
    }
    return response;
  };

  static signNote = async (id: string, data: SignNoteDto) => {
    const response = await apiClient.post(ENDPOINTS.SIGN_NOTE(id), data);
    if (response.success && response.data) {
      store.dispatch(updateNoteInStore(response.data));
    }
    return response;
  };

  static getNotesForVisit = async (visitId: string) => {
    const response = await apiClient.get(`patients/visits/${visitId}/notes`);
    if (response.success && response.data) {
      store.dispatch(setNotes(response.data));
    }
    return response;
  };

  // Physiotherapist Profile
  static getPhysiotherapistProfile = () => {
    return apiClient.get(ENDPOINTS.GET_PHYSIOTHERAPIST_PROFILE());
  };

  static createPhysiotherapistProfile = (data: any) => {
    return apiClient.post(ENDPOINTS.CREATE_PHYSIOTHERAPIST_PROFILE(), data);
  };

  static updatePhysiotherapistProfile = (data: any) => {
    return apiClient.put(ENDPOINTS.UPDATE_PHYSIOTHERAPIST_PROFILE(), data);
  };

  static createCompleteProfile = (data: any) => {
    return apiClient.post(ENDPOINTS.CREATE_COMPLETE_PROFILE(), data);
  };

  static addEducation = (data: any) => {
    return apiClient.post(ENDPOINTS.ADD_EDUCATION(), data);
  };

  static addTechnique = (data: any) => {
    return apiClient.post(ENDPOINTS.ADD_TECHNIQUE(), data);
  };

  static addMachine = (data: any) => {
    return apiClient.post(ENDPOINTS.ADD_MACHINE(), data);
  };

  static addWorkshop = (data: any) => {
    return apiClient.post(ENDPOINTS.ADD_WORKSHOP(), data);
  };

  static deleteEducation = (id: string) => {
    return apiClient.delete(ENDPOINTS.DELETE_EDUCATION(id));
  };

  static deleteTechnique = (id: string) => {
    return apiClient.delete(ENDPOINTS.DELETE_TECHNIQUE(id));
  };

  static deleteMachine = (id: string) => {
    return apiClient.delete(ENDPOINTS.DELETE_MACHINE(id));
  };

  static deleteWorkshop = (id: string) => {
    return apiClient.delete(ENDPOINTS.DELETE_WORKSHOP(id));
  };
}

export default ApiManager;