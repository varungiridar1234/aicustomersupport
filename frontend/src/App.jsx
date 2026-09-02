import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import AgentDashboard from './pages/AgentDashboard';
import TicketDetail from './pages/TicketDetail';
import TicketIngestion from './pages/TicketIngestion';
import AdminDashboard from './pages/AdminDashboard';
import KnowledgeBaseView from './pages/KnowledgeBaseView';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('resolvai_token');
  const user = localStorage.getItem('resolvai_user');
  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<AgentDashboard />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/ingest" element={<TicketIngestion />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/knowledge" element={<KnowledgeBaseView />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
