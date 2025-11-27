import { Routes, Route } from 'react-router-dom'
import AuthLayout from './layouts/authLayout'
import LoginPage from './pages/auth/login'
import RegisterPage from './pages/auth/register'

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>Home Page</h1>} />

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
    </Routes>
  )
}

export default App