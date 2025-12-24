import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home/Home';
import DayPage from './pages/DayPage/DayPage';
import PatternOverview from './pages/PatternOverview/PatternOverview';
import FinalDirection from './pages/FinalDirection/FinalDirection';
import AuthPage from './pages/Auth/AuthPage';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <div className="app-wrapper">
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/day/:id" element={<ProtectedRoute><DayPage /></ProtectedRoute>} />
        <Route path="/patterns" element={<ProtectedRoute><PatternOverview /></ProtectedRoute>} />
        <Route path="/direction" element={<ProtectedRoute><FinalDirection /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
