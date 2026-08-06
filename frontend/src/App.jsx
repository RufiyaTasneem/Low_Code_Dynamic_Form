import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Builder from "./pages/Builder";
import PublicForm from "./pages/PublicForm";
import Dashboard from "./pages/Dashboard";
import Forms from "./pages/Forms";
import Analytics from "./pages/Analytics";
import Responses from "./pages/Responses";
import SubmissionSuccess from "./pages/SubmissionSuccess";
import AuditLogs from "./pages/AuditLogs";

import { isAuthenticated, getRole } from "./services/authService";

function PrivateRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (getRole()?.toLowerCase() !== "admin") {
    return <Navigate to="/builder" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing Page */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Forms */}
        <Route
          path="/forms"
          element={
            <PrivateRoute>
              <Forms />
            </PrivateRoute>
          }
        />

        {/* Builder */}
        <Route
          path="/builder"
          element={
            <PrivateRoute>
              <Builder />
            </PrivateRoute>
          }
        />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          }
        />

        {/* Responses */}
        <Route
          path="/responses"
          element={
            <PrivateRoute>
              <Responses />
            </PrivateRoute>
          }
        />

        {/* Audit Logs */}
        <Route
          path="/audit-logs"
          element={
            <PrivateRoute>
              <AuditLogs />
            </PrivateRoute>
          }
        />

        {/* Public Form */}
        <Route
          path="/form/:token"
          element={<PublicForm />}
        />

        {/* Submission Success */}
        <Route
          path="/submission-success"
          element={<SubmissionSuccess />}
        />

        {/* 404 - KEEP THIS LAST */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}