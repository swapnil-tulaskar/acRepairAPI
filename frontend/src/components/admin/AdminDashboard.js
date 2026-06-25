// src/components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0 },
    technicians: { total: 0 },
    repairs: {
      total: 0,
      completed: 0,
      pending: 0,
      completionRate: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard/stats');
      console.log('Dashboard stats response:', res.data);
      
      if (res.data.success && res.data.data) {
        setStats(res.data.data);
      } else {
        setStats({
          users: { total: 0 },
          technicians: { total: 0 },
          repairs: { total: 0, completed: 0, pending: 0, completionRate: 0 }
        });
      }
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>❌ {error}</p>
        <button onClick={fetchDashboardData} style={styles.retryBtn}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Admin Dashboard</h2>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>Total Users</h3>
          <div style={styles.number}>{stats.users?.total || 0}</div>
        </div>
        <div style={styles.statCard}>
          <h3>Total Repairs</h3>
          <div style={styles.number}>{stats.repairs?.total || 0}</div>
        </div>
        <div style={styles.statCard}>
          <h3>Active Technicians</h3>
          <div style={styles.number}>{stats.technicians?.total || 0}</div>
        </div>
        <div style={styles.statCard}>
          <h3>Pending Repairs</h3>
          <div style={{ ...styles.number, color: '#ffc107' }}>{stats.repairs?.pending || 0}</div>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3>Completed Repairs</h3>
          <div style={{ ...styles.number, color: '#28a745' }}>{stats.repairs?.completed || 0}</div>
        </div>
        <div style={styles.statCard}>
          <h3>Completion Rate</h3>
          <div style={{ ...styles.number, color: '#0077be' }}>{stats.repairs?.completionRate || 0}%</div>
        </div>
      </div>

      <div style={styles.refreshSection}>
        <button onClick={fetchDashboardData} style={styles.refreshBtn}>
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px'
  },
  title: {
    color: '#333',
    marginBottom: '25px',
    fontSize: '24px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    textAlign: 'center'
  },
  number: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#0077be'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px',
    color: '#666'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0077be',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite'
  },
  error: {
    textAlign: 'center',
    padding: '50px',
    color: '#dc3545'
  },
  retryBtn: {
    marginTop: '10px',
    padding: '8px 20px',
    background: '#0077be',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  refreshSection: {
    textAlign: 'center',
    marginTop: '20px'
  },
  refreshBtn: {
    padding: '10px 20px',
    background: '#0077be',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default AdminDashboard;