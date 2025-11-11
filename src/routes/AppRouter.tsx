import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import { useAuthStore } from '../store/auth'

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthed = useAuthStore((s) => s.isAuthed())
  return isAuthed ? children : <Navigate to="/login" replace />
}

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}


