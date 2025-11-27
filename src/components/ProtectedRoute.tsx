import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Laden...</div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />
    }

    return <Outlet />
}
