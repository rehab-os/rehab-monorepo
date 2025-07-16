import { ApiMethods } from '@rehab/shared'
import { ENDPOINTS } from '@rehab/shared'
import { store } from '../store/store'
import {
    authSlice,
    organizationSlice,
    clinicSlice,
    userSlice,
    roleSlice
} from '../store/slices'
import type {
    LoginDto,
    SendOtpDto,
    CreateOrganizationDto,
    UpdateOrganizationDto,
    CreateClinicDto,
    UpdateClinicDto,
    CreateUserDto,
    UpdateUserDto,
    CreateRoleDto,
    UpdateRoleDto,
    AssignPermissionsDto,
    UserListQueryDto,
    AssignRoleDto,
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
        console.log("data passed:", data)
        return ApiMethods.post(url, data).then((res) => {
            if (res.success && res.data) {
                store.dispatch(authSlice.actions.loginSuccess(res.data))
            }
            return res
        })
    }

    static getMe = () => {
        const url = BASE_URL + ENDPOINTS.GET_ME()
        return ApiMethods.get(url).then((res) => {
            if (res.success && res.data) {
                store.dispatch(authSlice.actions.setUser(res.data))
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

    static getOrganization = (id: string) => {
        const url = BASE_URL + ENDPOINTS.GET_ORGANIZATION(id)
        return ApiMethods.get(url)
    }

    static createOrganization = (data: CreateOrganizationDto) => {
        const url = BASE_URL + ENDPOINTS.CREATE_ORGANIZATION()
        return ApiMethods.post(url, data)
    }

    static updateOrganization = (id: string, data: UpdateOrganizationDto) => {
        const url = BASE_URL + ENDPOINTS.UPDATE_ORGANIZATION(id)
        return ApiMethods.patch(url, data)
    }

    static deleteOrganization = (id: string) => {
        const url = BASE_URL + ENDPOINTS.DELETE_ORGANIZATION(id)
        return ApiMethods.delete(url)
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

    static getClinic = (id: string) => {
        const url = BASE_URL + ENDPOINTS.GET_CLINIC(id)
        return ApiMethods.get(url)
    }

    static createClinic = (organizationId: string, data: CreateClinicDto) => {
        const url = BASE_URL + ENDPOINTS.CREATE_CLINIC()
        return ApiMethods.post(url, data, { 'x-organization-id': organizationId })
    }

    static updateClinic = (id: string, data: UpdateClinicDto) => {
        const url = BASE_URL + ENDPOINTS.UPDATE_CLINIC(id)
        return ApiMethods.patch(url, data)
    }

    static deleteClinic = (id: string) => {
        const url = BASE_URL + ENDPOINTS.DELETE_CLINIC(id)
        return ApiMethods.delete(url)
    }

    // Users
    static getUsers = (query?: UserListQueryDto) => {
        const url = BASE_URL + ENDPOINTS.GET_USERS()
        const queryString = query ? '?' + new URLSearchParams(query as any).toString() : ''
        return ApiMethods.get(url + queryString).then((res) => {
            if (res.success && res.data) {
                store.dispatch(userSlice.actions.setUsers(res.data))
            }
            return res
        })
    }

    static getUser = (id: string) => {
        const url = BASE_URL + ENDPOINTS.GET_USER(id)
        return ApiMethods.get(url)
    }

    static createUser = (data: CreateUserDto) => {
        const url = BASE_URL + ENDPOINTS.CREATE_USER()
        return ApiMethods.post(url, data)
    }

    static updateUser = (id: string, data: UpdateUserDto) => {
        const url = BASE_URL + ENDPOINTS.UPDATE_USER(id)
        return ApiMethods.patch(url, data)
    }

    static deleteUser = (id: string) => {
        const url = BASE_URL + ENDPOINTS.DELETE_USER(id)
        return ApiMethods.delete(url)
    }

    static assignRole = (userId: string, data: AssignRoleDto) => {
        const url = BASE_URL + ENDPOINTS.ASSIGN_ROLE(userId)
        return ApiMethods.post(url, data)
    }

    static removeRole = (userId: string, roleId: string) => {
        const url = BASE_URL + ENDPOINTS.REMOVE_ROLE(userId, roleId)
        return ApiMethods.delete(url)
    }

    // Roles
    static getRoles = () => {
        const url = BASE_URL + ENDPOINTS.GET_ROLES()
        return ApiMethods.get(url).then((res) => {
            if (res.success && res.data) {
                store.dispatch(roleSlice.actions.setRoles(res.data))
            }
            return res
        })
    }

    static getRole = (id: string) => {
        const url = BASE_URL + ENDPOINTS.GET_ROLE(id)
        return ApiMethods.get(url)
    }

    static createRole = (data: CreateRoleDto) => {
        const url = BASE_URL + ENDPOINTS.CREATE_ROLE()
        return ApiMethods.post(url, data)
    }

    static updateRole = (id: string, data: UpdateRoleDto) => {
        const url = BASE_URL + ENDPOINTS.UPDATE_ROLE(id)
        return ApiMethods.patch(url, data)
    }

    static deleteRole = (id: string) => {
        const url = BASE_URL + ENDPOINTS.DELETE_ROLE(id)
        return ApiMethods.delete(url)
    }

    static assignPermissions = (roleId: string, data: AssignPermissionsDto) => {
        const url = BASE_URL + ENDPOINTS.ASSIGN_PERMISSIONS(roleId)
        return ApiMethods.put(url, data)
    }

    // Permissions
    static getPermissions = () => {
        const url = BASE_URL + ENDPOINTS.GET_PERMISSIONS()
        return ApiMethods.get(url)
    }

    // Audio
    static transcribeAudio = (file: File) => {
        const url = BASE_URL + ENDPOINTS.TRANSCRIBE_AUDIO()
        return ApiMethods.audioPost(url, file)
    }

    // Notes Generation
    static generateNote = (data: { transcription: string; noteType: 'SOAP' | 'BAP' | 'Progress' }) => {
        const url = BASE_URL + ENDPOINTS.GENERATE_NOTE()
        return ApiMethods.post(url, data)
    }
}

export default ApiManager