export interface User {
    id: string
    email: string
    name: string
    role: string
}

export interface AuthTokens {
    accessToken: string
    refreshToken: string
}

export interface AuthState {
    user: User | null
    tokens: AuthTokens | null
    isAuthenticated: boolean
    isLoading: boolean
}

export interface AuthContextType extends AuthState {
    login: (user: User, tokens: AuthTokens) => void
    logout: () => void
    updateTokens: (tokens: AuthTokens) => void
}

export interface LoginResponse {
    user: User
    accessToken: string
    refreshToken: string
}
