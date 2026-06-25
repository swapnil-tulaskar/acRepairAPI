import React, { useState, useContext } from 'react';
import './App.css';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TechnicianRegister from './components/auth/TechnicianRegister';
import Header from './components/common/Header';
import TabBar from './components/TabBar';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminRepairs from './components/admin/AdminRepairs';
import AdminTechnicians from './components/admin/AdminTechnicians';
import AdminTechnicianApplications from './components/admin/AdminTechnicianApplications';
import UserRepairs from './components/user/UserRepairs';
import TechnicianJobs from './components/technician/TechnicianJobs';
import LoadingSpinner from './components/common/LoadingSpinner';

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authPage, setAuthPage] = useState('login');

  if (loading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  if (!user) {
    return (
      <div className="app">
        {authPage === 'login' && (
          <Login 
            onSwitchToRegister={() => setAuthPage('register')}
            onSwitchToTechnicianRegister={() => setAuthPage('technician-register')}
          />
        )}
        {authPage === 'register' && (
          <Register onSwitchToLogin={() => setAuthPage('login')} />
        )}
        {authPage === 'technician-register' && (
          <TechnicianRegister onSwitchToLogin={() => setAuthPage('login')} />
        )}
      </div>
    );
  }

  const renderContent = () => {
    if (user.role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'admin-users':
          return <AdminUsers />;
        case 'admin-repairs':
          return <AdminRepairs />;
        case 'admin-technicians':
          return <AdminTechnicians />;
        case 'admin-applications':
          return <AdminTechnicianApplications />;
        default:
          return <AdminDashboard />;
      }
    }

    if (user.role === 'technician') {
      switch (activeTab) {
        case 'jobs':
          return <TechnicianJobs />;
        case 'repairs':
          return <UserRepairs />;
        default:
          return <TechnicianJobs />;
      }
    }

    // User role
    switch (activeTab) {
      case 'repairs':
        return <UserRepairs />;
      default:
        return <UserRepairs />;
    }
  };

  return (
    <div className="app">
      <Header user={user} />  {/* ✅ FIXED: Passing user prop to Header */}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {renderContent()}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;