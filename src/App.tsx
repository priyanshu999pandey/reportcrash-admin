import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './layouts/Layout'
import AccidentReportDetails from './pages/Accident-Report/AccidentReportDetails'
import AccidentReports from './pages/Accident-Report/AccidentReports'
import Dashboard from './pages/Dashboard'
import EmergencyHelplineDetails from './pages/EmergencyHelpline/EmergencyHelplineDetails'
import EmergencyHelplineForm from './pages/EmergencyHelpline/EmergencyHelplineForm'
import EmergencyHelplines from './pages/EmergencyHelpline/EmergencyHelplines'
import Login from './pages/Login'
import RolesPermissions from './pages/RolesPermissions/RolesPermissions'
import CreateSafetyTip from './pages/SafetyTips/CreateSafetyTip'
import SafetyTips from './pages/SafetyTips/SafetyTips'
import SosAlertDetails from './pages/SosAlert/SosAlertDetails'
import SosAlerts from './pages/SosAlert/SosAlerts'
import CreateUser from './pages/user/CreateUser'
import UserProfile from './pages/user/UserProfile'
import Users from './pages/user/Users'
import { useAppSelector } from './store/hooks'
import { getAuthHomeRoute, getLegacyAdminRole } from './utils/auth'

const App = () => {
  const { isAuthenticated, adminRole } = useAppSelector((state) => state.auth)
  const currentAdminRole = getLegacyAdminRole(adminRole)
  const homeRoute = isAuthenticated ? getAuthHomeRoute(adminRole) : '/login'

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={homeRoute} replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route element={<ProtectedRoute requiredPermission="dashboard:read" />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="reports:read" />}>
              <Route path="/accident-reports" element={<AccidentReports />} />
              <Route path="/accident-reports/view/:reportId" element={<AccidentReportDetails />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="sos-alerts:read" />}>
              <Route path="/sos-alerts" element={<SosAlerts />} />
              <Route path="/sos-alerts/view/:sosId" element={<SosAlertDetails />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="users:read" />}>
              <Route path="/users" element={<Users currentRole={currentAdminRole} />} />
              <Route path="/users/view/:userId" element={<UserProfile mode="view" currentRole={currentAdminRole} />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="users:create" />}>
              <Route path="/users/create" element={<CreateUser currentRole={currentAdminRole} />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="users:update" />}>
              <Route path="/users/edit/:userId" element={<UserProfile mode="edit" currentRole={currentAdminRole} />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="helplines:read" />}>
              <Route path="/emergency-helplines" element={<EmergencyHelplines />} />
              <Route path="/emergency-helplines/view/:helplineId" element={<EmergencyHelplineDetails />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="helplines:create" />}>
              <Route path="/emergency-helplines/create" element={<EmergencyHelplineForm mode="create" />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="helplines:update" />}>
              <Route path="/emergency-helplines/edit/:helplineId" element={<EmergencyHelplineForm mode="edit" />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="roles:read" />}>
              <Route path="/roles-permissions" element={<RolesPermissions />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="safety-tips:read" />}>
              <Route path="/safety-tips" element={<SafetyTips />} />
              <Route path="/safety-tips/view/:slug" element={<CreateSafetyTip mode="view" />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="safety-tips:create" />}>
              <Route path="/safety-tips/create" element={<CreateSafetyTip mode="create" />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="safety-tips:update" />}>
              <Route path="/safety-tips/edit/:slug" element={<CreateSafetyTip mode="edit" />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={homeRoute} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
