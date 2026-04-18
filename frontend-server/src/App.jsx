import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './components/admin/AdminDashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />; // Wrong role? Go to Login
  }

  return children;
};

function App() {
  return (

    <AuthProvider>
      <BrowserRouter>
        <Routes>


          {/* Public Route */}
          <Route path="/" element={<LoginPage />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Teacher Only Route */}
          <Route 
            path="/teacherDashboard" 
            element={
              <ProtectedRoute allowedRole="TEACHER">
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Student Only Route */}
          <Route 
            path="/studentDashboard" 
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin Only Route */}
          <Route 
            path="/adminDashboard" 
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
               </ProtectedRoute>
            } 
          />


        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;






