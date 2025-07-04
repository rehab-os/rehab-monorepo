import { ApiMethods } from '@rehab/shared'
import { ENDPOINTS } from '@rehab/shared'
import { store } from '../store/store'
import {
    authSlice,
    organizationSlice,
    clinicSlice,
    userSlice
} from '../store/slices'
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
} from '@rehab/shared'

const BASE_URL = 'http://localhost:3002/api/v1/'

class ApiManager {
    // Auth
    static sendOtp = (data: SendOtpDto) => {
        const url = BASE_URL + ENDPOINTS.SEND_OTP()
        return ApiMethods.post(url, data)
    }

    static login = (data: LoginDto) => {
        const url = BASE_URL + ENDPOINTS.LOGIN()
        return ApiMethods.post(url, data).then((res) => {
            if (res.success && res.data) {
                store.dispatch(authSlice.actions.loginSuccess(res.data))
                if (res.data.user) {
                    store.dispatch(userSlice.actions.setUserData(res.data.user))
                }
            }
            return res
        })
    }

    static getMe = () => {
        const url = BASE_URL + ENDPOINTS.GET_ME()
        return ApiMethods.get(url).then((res) => {
            if (res.success && res.data) {
                store.dispatch(authSlice.actions.setUser(res.data))
                store.dispatch(userSlice.actions.setUserData(res.data))
            }
            return res
        })
    }

    // Organizations
    static getOrganizations = () => {
        const url = BASE_URL + ENDPOINTS.GET_ORGANIZATIONS()
        return ApiMethods.get(url).then((res) => {
            if (res.success && res.data) {
                store.dispatch(organizationSlice.actions.setOrganizations(res.data))
            }
            return res
        })
    }

    // Clinics
    static getClinics = (organizationId?: string) => {
        const url = BASE_URL + ENDPOINTS.GET_CLINICS()
        const headers = organizationId ? { 'x-organization-id': organizationId } : undefined
        return ApiMethods.get(url, headers).then((res) => {
            if (res.success && res.data) {
                store.dispatch(clinicSlice.actions.setClinics(res.data))
            }
            return res
        })
    }

    static createClinic = (organizationId: string, data: CreateClinicDto) => {
        const url = BASE_URL + ENDPOINTS.CREATE_CLINIC()
        const headers = { 'x-organization-id': organizationId }
        return ApiMethods.post(url, data, headers).then((res) => {
            if (res.success && res.data) {
                // Refresh clinics list
                ApiManager.getClinics(organizationId)
            }
            return res
        })
    }

    static updateClinic = (id: string, data: UpdateClinicDto) => {
        const url = BASE_URL + ENDPOINTS.UPDATE_CLINIC(id)
        return ApiMethods.patch(url, data).then((res) => {
            if (res.success && res.data) {
                // Could update clinic in store here
            }
            return res
        })
    }

    static deleteClinic = (id: string) => {
        const url = BASE_URL + ENDPOINTS.DELETE_CLINIC(id)
        return ApiMethods.delete(url)
    }

    // Team Management
    static getTeamMembers = (organizationId: string, clinicId?: string) => {
        const url = BASE_URL + ENDPOINTS.GET_TEAM_MEMBERS()
        const headers = { 'x-organization-id': organizationId }
        const params = clinicId ? { clinic_id: clinicId } : undefined
        return ApiMethods.get(url, headers, params)
    }

    static addTeamMember = (organizationId: string, data: AddTeamMemberDto) => {
        const url = BASE_URL + ENDPOINTS.ADD_TEAM_MEMBER()
        const headers = { 'x-organization-id': organizationId }
        return ApiMethods.post(url, data, headers)
    }

    static removeTeamMember = (organizationId: string, userId: string, clinicId?: string) => {
        const url = BASE_URL + ENDPOINTS.REMOVE_TEAM_MEMBER(userId)
        const headers = { 'x-organization-id': organizationId }
        const params = clinicId ? { clinic_id: clinicId } : undefined
        return ApiMethods.delete(url, headers, params)
    }

    static updateTeamMemberRole = (organizationId: string, userId: string, data: any) => {
        const url = BASE_URL + ENDPOINTS.UPDATE_TEAM_MEMBER_ROLE(userId)
        const headers = { 'x-organization-id': organizationId }
        return ApiMethods.patch(url, data, headers)
    }

    // Patients
    static getPatients = (params?: any) => {
        const url = BASE_URL + ENDPOINTS.GET_PATIENTS()
        return ApiMethods.get(url, undefined, params)
    }

    static getPatient = (id: string) => {
        const url = BASE_URL + ENDPOINTS.GET_PATIENT(id)
        return ApiMethods.get(url)
    }

    static createPatient = (data: CreatePatientDto) => {
        const url = BASE_URL + ENDPOINTS.CREATE_PATIENT()
        return ApiMethods.post(url, data)
    }

    static updatePatient = (id: string, data: UpdatePatientDto) => {
        const url = BASE_URL + ENDPOINTS.UPDATE_PATIENT(id)
        return ApiMethods.patch(url, data)
    }

    static deletePatient = (id: string) => {
        const url = BASE_URL + ENDPOINTS.DELETE_PATIENT(id)
        return ApiMethods.delete(url)
    }

    // Visits
    static getVisits = (params?: any) => {
        const url = BASE_URL + ENDPOINTS.GET_VISITS()
        return ApiMethods.get(url, undefined, params)
    }

    static getVisit = (id: string) => {
        const url = BASE_URL + ENDPOINTS.GET_VISIT(id)
        return ApiMethods.get(url)
    }

    static createVisit = (data: CreateVisitDto) => {
        const url = BASE_URL + ENDPOINTS.CREATE_VISIT()
        return ApiMethods.post(url, data)
    }

    static updateVisit = (id: string, data: UpdateVisitDto) => {
        const url = BASE_URL + ENDPOINTS.UPDATE_VISIT(id)
        return ApiMethods.patch(url, data)
    }

    static checkInVisit = (id: string, data: CheckInVisitDto) => {
        const url = BASE_URL + ENDPOINTS.CHECK_IN_VISIT(id)
        return ApiMethods.post(url, data)
    }

    static startVisit = (id: string, data: StartVisitDto) => {
        const url = BASE_URL + ENDPOINTS.START_VISIT(id)
        return ApiMethods.post(url, data)
    }

    static completeVisit = (id: string) => {
        const url = BASE_URL + ENDPOINTS.COMPLETE_VISIT(id)
        return ApiMethods.post(url, {})
    }

    static cancelVisit = (id: string, data: CancelVisitDto) => {
        const url = BASE_URL + ENDPOINTS.CANCEL_VISIT(id)
        return ApiMethods.post(url, data)
    }

    static rescheduleVisit = (id: string, data: RescheduleVisitDto) => {
        const url = BASE_URL + ENDPOINTS.RESCHEDULE_VISIT(id)
        return ApiMethods.put(url, data)
    }

    static getAvailablePhysiotherapists = (data: PhysiotherapistAvailabilityDto) => {
        const url = BASE_URL + ENDPOINTS.GET_AVAILABLE_PHYSIOTHERAPISTS()
        return ApiMethods.post(url, data)
    }

    // Notes
    static createNote = (data: CreateNoteDto) => {
        const url = BASE_URL + ENDPOINTS.CREATE_NOTE()
        return ApiMethods.post(url, data)
    }

    static getNote = (id: string) => {
        const url = BASE_URL + ENDPOINTS.GET_NOTE(id)
        return ApiMethods.get(url)
    }

    static updateNote = (id: string, data: UpdateNoteDto) => {
        const url = BASE_URL + ENDPOINTS.UPDATE_NOTE(id)
        return ApiMethods.patch(url, data)
    }

    static signNote = (id: string, data: SignNoteDto) => {
        const url = BASE_URL + ENDPOINTS.SIGN_NOTE(id)
        return ApiMethods.post(url, data)
    }
}

export default ApiManager