import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SubmissionSuccess from "./pages/SubmissionSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admindashboard from "./pages/Admindashboard";
import Builder from "./pages/Builder";
import MyForms from "./pages/MyForms";
import PublicForm from "./pages/PublicForm";
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
    return <Navigate to="/myforms" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Admindashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/builder"
          element={
            <PrivateRoute>
              <Builder />
            </PrivateRoute>
          }
        />

        <Route
          path="/myforms"
          element={
            <PrivateRoute>
              <MyForms />
            </PrivateRoute>
          }
        />

        <Route
          path="/form/:token"
          element={<PublicForm />}
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route
          path="/submission-success"
          element={<SubmissionSuccess />}
        />
      </Routes>

    </BrowserRouter>
  );
}