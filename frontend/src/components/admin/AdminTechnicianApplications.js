// src/components/admin/AdminTechnicianApplications.js
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminTechnicianApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/technician-applications');
      console.log('Applications response:', res.data);
      
      let apps = [];
      if (res.data.success && Array.isArray(res.data.data)) {
        apps = res.data.data;
      }
      setApplications(apps);
      setError('');
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId) => {
    if (!window.confirm('Approve this technician application?')) return;
    
    setProcessing(applicationId);
    try {
      const res = await api.patch(`/admin/technician-applications/${applicationId}/approve`);
      
      if (res.data.success) {
        setApplications(applications.map(app => 
          app._id === applicationId ? { ...app, status: 'approved' } : app
        ));
        alert('✅ Technician approved successfully!');
      } else {
        alert('❌ Failed to approve: ' + (res.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error approving technician:', err);
      alert('❌ Failed to approve technician');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (applicationId) => {
    if (!window.confirm('Reject this technician application?')) return;
    
    setProcessing(applicationId);
    try {
      const res = await api.patch(`/admin/technician-applications/${applicationId}/reject`);
      
      if (res.data.success) {
        setApplications(applications.map(app => 
          app._id === applicationId ? { ...app, status: 'rejected' } : app
        ));
        alert('✅ Application rejected.');
      } else {
        alert('❌ Failed to reject: ' + (res.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error rejecting technician:', err);
      alert('❌ Failed to reject application');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: '#fff3cd', color: '#856404', icon: '⏳', label: 'Pending' },
      approved: { bg: '#d4edda', color: '#155724', icon: '✅', label: 'Approved' },
      rejected: { bg: '#f8d7da', color: '#721c24', icon: '❌', label: 'Rejected' }
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>❌ {error}</p>
        <button onClick={fetchApplications} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  const pendingApplications = applications.filter(a => a.status === 'pending');
  const approvedApplications = applications.filter(a => a.status === 'approved');
  const rejectedApplications = applications.filter(a => a.status === 'rejected');

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🔧 Technician Applications</h2>
        <span style={styles.count}>
          {pendingApplications.length} pending
        </span>
      </div>

      {/* Stats */}
      <div style={styles.statsBar}>
        <span>⏳ Pending: {pendingApplications.length}</span>
        <span>✅ Approved: {approvedApplications.length}</span>
        <span>❌ Rejected: {rejectedApplications.length}</span>
        <span>Total: {applications.length}</span>
      </div>

      {applications.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No technician applications found.</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const statusBadge = getStatusBadge(app.status);
                const isPending = app.status === 'pending';
                const isProcessing = processing === app._id;
                
                return (
                  <tr key={app._id} style={isPending ? styles.pendingRow : {}}>
                    <td><strong>{app.name}</strong></td>
                    <td>{app.email}</td>
                    <td>{app.phone}</td>
                    <td>{app.specialization}</td>
                    <td>{app.experience || 'N/A'}</td>
                    <td>
                      <span style={{
                        ...styles.badge,
                        background: statusBadge.bg,
                        color: statusBadge.color
                      }}>
                        {statusBadge.icon} {statusBadge.label}
                      </span>
                    </td>
                    <td>
                      {isPending ? (
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => handleApprove(app._id)}
                            style={styles.approveBtn}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-check"></i>
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(app._id)}
                            style={styles.rejectBtn}
                            disabled={isProcessing}
                          >
                            <i className="fas fa-times"></i> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={styles.noAction}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.refreshSection}>
        <button onClick={fetchApplications} style={styles.refreshBtn}>
          🔄 Refresh
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    color: '#333',
    fontSize: '24px',
    margin: 0
  },
  count: {
    background: '#ffc107',
    color: '#333',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px'
  },
  statsBar: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    background: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    marginBottom: '20px',
    color: '#555'
  },
  tableContainer: {
    overflowX: 'auto',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
  },
  pendingRow: {
    background: '#fffef5'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  approveBtn: {
    padding: '4px 12px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  rejectBtn: {
    padding: '4px 12px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  noAction: {
    color: '#999'
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
    padding: '8px 20px',
    background: '#0077be',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: '#666'
  }
};

export default AdminTechnicianApplications;