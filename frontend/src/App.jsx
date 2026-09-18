import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";

const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const AdminDoctors = lazy(() => import("@/pages/admin/Doctors"));
const AdminPatients = lazy(() => import("@/pages/admin/Patients"));
const AdminAppointments = lazy(() => import("@/pages/admin/Appointments"));
const PatientDoctors = lazy(() => import("@/pages/patient/Doctors"));
const PatientAppointments = lazy(() => import("@/pages/patient/Appointments"));

const PageFallback = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-40 w-full" />
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin/doctors" element={<ProtectedRoute role="admin"><AdminDoctors /></ProtectedRoute>} />
        <Route path="/admin/patients" element={<ProtectedRoute role="admin"><AdminPatients /></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute role="admin"><AdminAppointments /></ProtectedRoute>} />

        <Route path="/patient/doctors" element={<ProtectedRoute role="patient"><PatientDoctors /></ProtectedRoute>} />
        <Route path="/patient/appointments" element={<ProtectedRoute role="patient"><PatientAppointments /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
