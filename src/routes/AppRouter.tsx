import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Suspense, lazy, type ReactElement } from 'react'
import { Spin } from 'antd'
import AdminLayout from '../layouts/AdminLayout'

const Dashboard = lazy(() => import('../pages/Dashboard'))
const Login = lazy(() => import('../pages/Login'))
const ItemsList = lazy(() => import('../pages/ItemsList'))
const ItemRegister = lazy(() => import('../pages/ItemRegister'))
const ItemDetailPage = lazy(() => import('../pages/ItemDetail'))
const TagsPage = lazy(() => import('../pages/Tags'))
const PickupLogsPage = lazy(() => import('../pages/PickupLogs'))
import { useAuthStore } from '../store/auth'

function ProtectedRoute({ children }: { children: ReactElement }) {
  const isAuthed = useAuthStore((s) => s.isAuthed())
  return isAuthed ? children : <Navigate to="/login" replace />
}

export default function AppRouter() {
    const fallback = (
        <div style={{ width: '100%', padding: '80px 0', textAlign: 'center' }}>
            <Spin tip="로딩 중..." />
        </div>
    )

    const withSuspense = (element: ReactElement) => <Suspense fallback={fallback}>{element}</Suspense>

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={withSuspense(<Login />)} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={withSuspense(<Dashboard />)} />
                    <Route path="items" element={withSuspense(<ItemsList />)} />
                    <Route path="items/register" element={withSuspense(<ItemRegister />)} />
                    <Route path="items/:id" element={withSuspense(<ItemDetailPage />)} />
                    <Route path="tags" element={withSuspense(<TagsPage />)} />
                    <Route path="pickups/logs" element={withSuspense(<PickupLogsPage />)} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}


