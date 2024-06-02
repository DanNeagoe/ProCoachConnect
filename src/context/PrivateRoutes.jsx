import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'

export function PrivateRoutes() {
    const token = useAuth()
    return token ? <Outlet /> : <Navigate to='/' />
}
