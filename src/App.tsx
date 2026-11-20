import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import AccidentReportDetails from "./pages/Accident-Report/AccidentReportDetails";
import AccidentReports from "./pages/Accident-Report/AccidentReports";
import Dashboard from "./pages/Dashboard";
import Hospitals from "./pages/Hospitals/Hospitals";
import HospitalDetails from "./pages/Hospitals/HospitalDetails";
import Login from "./pages/Login";
import SafetyTips from "./pages/SafetyTips/SafetyTips";
import SosAlerts from "./pages/SosAlert/SosAlerts";
import SosAlertDetails from "./pages/SosAlert/SosAlertDetails";
import Users from "./pages/user/Users";
import UserProfile from "./pages/user/UserProfile";
import CreateUser from "./pages/user/CreateUser";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import type { AdminRole } from "./types";
import { allAdminRoles, fullAccessRoles, superAdminRoles } from "./utils/permissions";
import CreateSafetyTip from "./pages/SafetyTips/CreateSafetyTip";
import EmergencyHelplines from "./pages/EmergencyHelpline/EmergencyHelplines";
import EmergencyHelplineForm from "./pages/EmergencyHelpline/EmergencyHelplineForm";
import EmergencyHelplineDetails from "./pages/EmergencyHelpline/EmergencyHelplineDetails";
import RolesPermissions from "./pages/RolesPermissions/RolesPermissions";

const currentAdminRole: AdminRole = 'Super Admin';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<Layout currentRole={currentAdminRole} />}>
        <Route
          element={
            <ProtectedRoute
              currentRole={currentAdminRole}
              allowedRoles={fullAccessRoles}
            />
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accident-reports" element={<AccidentReports />} />
          <Route
            path="/accident-reports/view/:reportId"
            element={<AccidentReportDetails />}
          />
          <Route path="/sos-alerts" element={<SosAlerts />} />
          <Route path="/sos-alerts/view/:sosId" element={<SosAlertDetails />} />
          <Route path="/users" element={<Users currentRole={currentAdminRole} />} />
          <Route path="/users/create" element={<CreateUser currentRole={currentAdminRole} />} />
          <Route path="/users/view/:userId" element={<UserProfile mode="view" currentRole={currentAdminRole} />} />
          <Route path="/users/edit/:userId" element={<UserProfile mode="edit" currentRole={currentAdminRole} />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/hospitals/view/:hospitalId" element={<HospitalDetails />} />
          <Route path="/emergency-helplines" element={<EmergencyHelplines />} />
          <Route path="/emergency-helplines/create" element={<EmergencyHelplineForm mode="create" />} />
          <Route path="/emergency-helplines/view/:helplineId" element={<EmergencyHelplineDetails />} />
          <Route path="/emergency-helplines/edit/:helplineId" element={<EmergencyHelplineForm mode="edit" />} />
        </Route>
        <Route
          element={
            <ProtectedRoute
              currentRole={currentAdminRole}
              allowedRoles={superAdminRoles}
            />
          }
        >
          <Route path="/roles-permissions" element={<RolesPermissions />} />
        </Route>
        <Route
          element={
            <ProtectedRoute
              currentRole={currentAdminRole}
              allowedRoles={allAdminRoles}
            />
          }
        >
          <Route path="/safety-tips" element={<SafetyTips />} />
          <Route path="/safety-tips/create" element={<CreateSafetyTip mode="create" />} />
          <Route path="/safety-tips/view/:slug" element={<CreateSafetyTip mode="view" />} />
          <Route path="/safety-tips/edit/:slug" element={<CreateSafetyTip mode="edit" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
