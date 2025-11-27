import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { AuthTokens } from '../types/auth'

const STORAGE_KEYS = {
    TOKENS: 'auth_tokens',
}

let csrfToken: string | null = null
let csrfTokenPromise: Promise<void> | null = null
let isRefreshing = false
let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: Error) => void
}> = []

const api = axios.create({
    baseURL: 'https://test.ipremay.de/api',
    withCredentials: true,
})

const mutatingMethods = ['post', 'put', 'patch', 'delete']

const getStoredTokens = (): AuthTokens | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.TOKENS)
    if (stored) {
        try {
            return JSON.parse(stored)
        } catch {
            return null
        }
    }
    return null
}

const setStoredTokens = (tokens: AuthTokens) => {
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens))
}

const clearAuth = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKENS)
    localStorage.removeItem('auth_user')
}

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else if (token) {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

// Request interceptor - add CSRF token and Authorization header
api.interceptors.request.use(async (config) => {
    // Handle CSRF token for mutating requests
    if (config.method && mutatingMethods.includes(config.method.toLowerCase())) {
        if (!csrfToken) {
            if (!csrfTokenPromise) {
                csrfTokenPromise = axios.get('https://test.ipremay.de/api/csrf-token', { withCredentials: true })
                    .then((response) => {
                        csrfToken = response.data.csrfToken
                    })
                    .finally(() => {
                        csrfTokenPromise = null
                    })
            }
            await csrfTokenPromise
        }
    }
    if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken
    }

    // Add Authorization header if we have tokens
    const tokens = getStoredTokens()
    if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`
    }

    return config
})

// Response interceptor - handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // If error is 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            const tokens = getStoredTokens()

            // If no refresh token, logout and reject
            if (!tokens?.refreshToken) {
                clearAuth()
                return Promise.reject(error)
            }

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return api(originalRequest)
                    })
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const response = await axios.post(
                    'https://test.ipremay.de/api/auth/refresh',
                    { refreshToken: tokens.refreshToken },
                    { withCredentials: true }
                )

                const newTokens: AuthTokens = {
                    accessToken: response.data.accessToken,
                    refreshToken: response.data.refreshToken,
                }

                setStoredTokens(newTokens)
                processQueue(null, newTokens.accessToken)

                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
                return api(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError as Error, null)
                clearAuth()
                window.location.href = '/auth/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default api
