import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const TabBar = ({ activeTab, setActiveTab, user }) => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPendingApplications();
    }
  }, [user]);

  const fetchPendingApplications = async () => {
    try {
      const res = await api.get('/admin/technician-applications');
      console.log('Applications response:', res.data);
      
      let apps = [];
      if (res.data.success && Array.isArray(res.data.data)) {
        apps = res.data.data;
      }
      const pending = apps.filter(app => app.status === 'pending').length;
      setPendingCount(pending);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  return (
    <nav style={styles.tabBar}>
      <div style={styles.container}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{ ...styles.tab, ...(activeTab === 'dashboard' ? styles.active : {}) }}
        >
          📊 Dashboard
        </button>
        
        {user?.role === 'admin' && (
          <>
            <button
              onClick={() => setActiveTab('admin-users')}
              style={{ ...styles.tab, ...(activeTab === 'admin-users' ? styles.active : {}) }}
            >
              👥 Users
            </button>
            <button
              onClick={() => setActiveTab('admin-repairs')}
              style={{ ...styles.tab, ...(activeTab === 'admin-repairs' ? styles.active : {}) }}
            >
              🔧 Repairs
            </button>
            <button
              onClick={() => setActiveTab('admin-technicians')}
              style={{ ...styles.tab, ...(activeTab === 'admin-technicians' ? styles.active : {}) }}
            >
              🛠️ Technicians
            </button>
            {/* ✅ APPLICATIONS TAB WITH DYNAMIC BADGE */}
            <button
              onClick={() => setActiveTab('admin-applications')}
              style={{ 
                ...styles.tab, 
                ...(activeTab === 'admin-applications' ? styles.active : {}),
                ...styles.applicationsTab
              }}
            >
              📝 Applications
              {pendingCount > 0 && (
                <span style={styles.badge}>{pendingCount}</span>
              )}
            </button>
          </>
        )}
        
        {user?.role === 'user' && (
          <button
            onClick={() => setActiveTab('repairs')}
            style={{ ...styles.tab, ...(activeTab === 'repairs' ? styles.active : {}) }}
          >
            📋 My Repairs
          </button>
        )}
        
        {user?.role === 'technician' && (
          <>
            <button
              onClick={() => setActiveTab('jobs')}
              style={{ ...styles.tab, ...(activeTab === 'jobs' ? styles.active : {}) }}
            >
              📋 My Jobs
            </button>
            <button
              onClick={() => setActiveTab('repairs')}
              style={{ ...styles.tab, ...(activeTab === 'repairs' ? styles.active : {}) }}
            >
              🔧 My Repairs
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  tabBar: {
    background: 'white',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    gap: '5px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },
  tab: {
    padding: '12px 20px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    borderBottom: '3px solid transparent',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  active: {
    color: '#0077be',
    borderBottomColor: '#0077be',
    background: '#f0f7ff'
  },
  applicationsTab: {
    background: 'linear-gradient(135deg, #fff8e1, #fff3cd)',
    borderRadius: '8px 8px 0 0',
    fontWeight: '600'
  },
  badge: {
    background: '#dc3545',
    color: 'white',
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: '700',
    animation: 'pulse 2s infinite',
    minWidth: '18px',
    textAlign: 'center'
  }
};

// Add animation for the badge
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(styleSheet);

export default TabBar;