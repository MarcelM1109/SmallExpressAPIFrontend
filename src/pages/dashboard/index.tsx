import { useAuth } from '../../context/AuthContext'

export default function DashboardPage() {
    const { user } = useAuth()

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Willkommen, {user?.name}!
            </h1>
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Benutzerinformationen</h2>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                        <dd className="text-sm text-gray-900">{user?.name}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">E-Mail</dt>
                        <dd className="text-sm text-gray-900">{user?.email}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Rolle</dt>
                        <dd className="text-sm text-gray-900">{user?.role}</dd>
                    </div>
                </dl>
            </div>
        </div>
    )
}
