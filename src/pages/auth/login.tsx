import { useState } from 'react'
import { isAxiosError } from 'axios'
import api from '../../lib/axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { LoginResponse } from '../../types/auth'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await api.post<LoginResponse>('/auth/login', {
                email,
                password
            })

            const { user, accessToken, refreshToken } = response.data
            login(user, { accessToken, refreshToken })
            navigate('/')
        } catch (err) {
            if (isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Login fehlgeschlagen')
            } else {
                setError('Ein Fehler ist aufgetreten')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            E-Mail
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="email@beispiel.de"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Passwort
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Wird geladen...' : 'Anmelden'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Noch kein Konto?{' '}
                    <a href="/auth/register" className="text-blue-600 hover:underline">
                        Registrieren
                    </a>
                </p>
            </div>
        </div>
    )
}