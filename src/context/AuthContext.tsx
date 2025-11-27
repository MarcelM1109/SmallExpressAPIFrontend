import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AuthContextType, AuthTokens, User } from '../types/auth'

const STORAGE_KEYS = {
    USER: 'auth_user',
    TOKENS: 'auth_tokens',
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [tokens, setTokens] = useState<AuthTokens | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
        const storedTokens = localStorage.getItem(STORAGE_KEYS.TOKENS)

        if (storedUser && storedTokens) {
            try {
                setUser(JSON.parse(storedUser))
                setTokens(JSON.parse(storedTokens))
            } catch {
                localStorage.removeItem(STORAGE_KEYS.USER)
                localStorage.removeItem(STORAGE_KEYS.TOKENS)
            }
        }
        setIsLoading(false)
    }, [])

    const login = (newUser: User, newTokens: AuthTokens) => {
        setUser(newUser)
        setTokens(newTokens)
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser))
        localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(newTokens))
    }

    const logout = () => {
        setUser(null)
        setTokens(null)
        localStorage.removeItem(STORAGE_KEYS.USER)
        localStorage.removeItem(STORAGE_KEYS.TOKENS)
    }

    const updateTokens = (newTokens: AuthTokens) => {
        setTokens(newTokens)
        localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(newTokens))
    }

    const value: AuthContextType = {
        user,
        tokens,
        isAuthenticated: !!user && !!tokens,
        isLoading,
        login,
        logout,
        updateTokens,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
