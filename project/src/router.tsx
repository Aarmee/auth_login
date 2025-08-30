import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppContent from './App';
import Dashboard from './components/Dashboard';
import LandingPage from './LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import GoogleSuccess from './components/GoogleSuccess';


const Router: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AppContent />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/google-success" element={<GoogleSuccess />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
