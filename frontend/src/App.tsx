import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Trainers from "./pages/Trainers";
import MembershipPlans from "./pages/MembershipPlans";
import Attendance from "./pages/Attendance";
import Classes from "./pages/Classes";
import WorkoutPlans from "./pages/WorkoutPlans";
import DietPlans from "./pages/DietPlans";
import Payments from "./pages/Payments";
import Equipment from "./pages/Equipment";
import MemberProfile from "./pages/MemberProfile";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";
import Announcements from "./pages/Announcements";
import Settings from "./pages/Settings";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading...</div>;
  }

  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading...</div>;
  }

  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/:id" element={<MemberProfile />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/membership-plans" element={<MembershipPlans />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/workout-plans" element={<WorkoutPlans />} />
        <Route path="/diet-plans" element={<DietPlans />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
