import { getCookieValue } from '../utils/helpers'
// import { store } from '@/lib/redux/store'
// import { authSlice } from '@/lib/redux/slices'
import { notifications } from '@mantine/notifications'

const getHeaders = () => {
    const access_token = getCookieValue('access_token')
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
    }
}

const getFileHeaders = () => {
    const access_token = getCookieValue('access_token')
    return { Authorization: `Bearer ${access_token}` }
}

interface ApiResponse {
    success: boolean
    statusCode: number
    message: string
    data?: any
    error?: any
}

const responseMiddleware = async (response: Response): Promise<ApiResponse> => {
    const data = await response.json()

    if (response.status === 401) {
        // store.dispatch(authSlice.actions.logout())
        notifications.show({
            title: 'Session Expired',
            message: 'Please login again to continue',
            color: 'red',
        })
    } else if (response.status >= 500) {
        notifications.show({
            title: 'Server Error',
            message: 'Something went wrong. Please try again later.',
            color: 'red',
        })
    }

    return data
}

export class ApiMethods {
    static async apiRequest(method: string, url: string, body?: any, additionalHeaders?: Record<string, string>) {
        const headers = { ...getHeaders(), ...additionalHeaders }
        const config: RequestInit = {
            method,
            headers,
        }

        if (body && method !== 'GET') {
            config.body = JSON.stringify(body)
        }

        try {
            const response = await fetch(url, config)
            return await responseMiddleware(response)
        } catch (error) {
            console.error('API Request Error:', error)
            throw error
        }
    }

    static async apiFileRequest(method: string, url: string, file: File, fieldName: string = 'file') {
        const formData = new FormData()
        formData.append(fieldName, file)

        try {
            const response = await fetch(url, {
                method,
                body: formData,
                headers: getFileHeaders(),
            })
            return await responseMiddleware(response)
        } catch (error) {
            console.error('File Upload Error:', error)
            throw error
        }
    }

    static get(url: string, headers?: Record<string, string>) {
        return this.apiRequest('GET', url, undefined, headers)
    }

    static post(url: string, data: any, headers?: Record<string, string>) {
        return this.apiRequest('POST', url, data, headers)
    }

    static filePost(url: string, file: File, fieldName?: string) {
        return this.apiFileRequest('POST', url, file, fieldName)
    }

    static audioPost(url: string, file: File) {
        return this.apiFileRequest('POST', url, file, 'audio')
    }

    static put(url: string, data: any, headers?: Record<string, string>) {
        return this.apiRequest('PUT', url, data, headers)
    }

    static patch(url: string, data: any, headers?: Record<string, string>) {
        return this.apiRequest('PATCH', url, data, headers)
    }

    static delete(url: string, headers?: Record<string, string>) {
        return this.apiRequest('DELETE', url, undefined, headers)
    }
}

export default ApiMethods