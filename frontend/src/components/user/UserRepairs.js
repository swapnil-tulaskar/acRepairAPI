// src/components/user/UserRepairs.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

const UserRepairs = () => {
  const { user } = useContext(AuthContext);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/repair/my');
      console.log('My Repairs response:', res.data);
      
      // Handle different response structures
      let repairsData = [];
      if (res.data.success && Array.isArray(res.data.data)) {
        repairsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        repairsData = res.data;
      } else if (res.data.repairs) {
        repairsData = res.data.repairs;
      }
      setRepairs(repairsData);
      setError('');
    } catch (err) {
      console.error('Error fetching repairs:', err);
      setError('Failed to load your repairs');
      setRepairs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRepair = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/repair', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority
      });
      
      console.log('Create repair response:', res.data);
      
      if (res.data.success) {
        setFormData({ title: '', description: '', priority: 'medium' });
        setShowForm(false);
        alert('✅ Repair request created successfully!');
        await fetchRepairs();
      } else {
        alert('❌ Failed to create repair: ' + (res.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error creating repair:', err);
      alert('❌ Failed to create repair. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRepair = async (repairId) => {
    if (!window.confirm('Are you sure you want to cancel this repair?')) return;
    
    try {
      const res = await api.patch(`/repair/${repairId}/status`, { status: 'cancelled' });
      
      if (res.data.success) {
        setRepairs(repairs.map(r => 
          r._id === repairId ? { ...r, status: 'cancelled' } : r
        ));
        alert('✅ Repair cancelled successfully!');
      } else {
        alert('❌ Failed to cancel repair');
      }
    } catch (err) {
      console.error('Error cancelling repair:', err);
      alert('❌ Failed to cancel repair. Please try again.');
    }
  };

  const handleDeleteRepair = async (repairId) => {
    if (!window.confirm('Are you sure you want to delete this repair? This cannot be undone!')) return;
    
    try {
      const res = await api.delete(`/repair/${repairId}`);
      
      if (res.data.success) {
        setRepairs(repairs.filter(r => r._id !== repairId));
        alert('✅ Repair deleted successfully!');
      } else {
        alert('❌ Failed to delete repair');
      }
    } catch (err) {
      console.error('Error deleting repair:', err);
      alert('❌ Failed to delete repair. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: '#fff3cd', color: '#856404', icon: '⏳', label: 'Pending' },
      assigned: { bg: '#d1ecf1', color: '#0c5460', icon: '📋', label: 'Assigned' },
      'in-progress': { bg: '#cce5ff', color: '#004085', icon: '🔧', label: 'In Progress' },
      completed: { bg: '#d4edda', color: '#155724', icon: '✅', label: 'Completed' },
      cancelled: { bg: '#f8d7da', color: '#721c24', icon: '❌', label: 'Cancelled' }
    };
    return badges[status] || badges.pending;
  };

  const getPriorityBadge = (priority) => {
    const priorities = {
      low: { bg: '#d4edda', color: '#155724', label: 'Low' },
      medium: { bg: '#fff3cd', color: '#856404', label: 'Medium' },
      high: { bg: '#f8d7da', color: '#721c24', label: 'High' }
    };
    return priorities[priority] || priorities.medium;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading your repairs...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🔧 My Repairs</h2>
          <p style={styles.subtitle}>Manage your AC repair requests</p>
        </div>
        {!showForm && (
          <button 
            style={styles.createBtn}
            onClick={() => setShowForm(true)}
          >
            <i className="fas fa-plus"></i> New Repair
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{repairs.length}</span>
          <span style={styles.statLabel}>Total</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{repairs.filter(r => r.status === 'pending').length}</span>
          <span style={styles.statLabel}>Pending</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{repairs.filter(r => r.status === 'assigned' || r.status === 'in-progress').length}</span>
          <span style={styles.statLabel}>In Progress</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{repairs.filter(r => r.status === 'completed').length}</span>
          <span style={styles.statLabel}>Completed</span>
        </div>
      </div>

      {/* Create Repair Form */}
      {showForm && (
        <div style={styles.formContainer}>
          <h3 style={styles.formTitle}>Create New Repair Request</h3>
          <form onSubmit={handleCreateRepair} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title *</label>
              <input
                type="text"
                placeholder="e.g., AC not cooling"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Description *</label>
              <textarea
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={styles.textarea}
                rows="4"
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={styles.select}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div style={styles.formActions}>
              <button 
                type="submit" 
                style={styles.submitBtn}
                disabled={submitting}
              >
                {submitting ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-check"></i>
                )}
                {submitting ? 'Submitting...' : 'Submit Repair'}
              </button>
              <button 
                type="button" 
                style={styles.cancelBtn}
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: '', description: '', priority: 'medium' });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Repairs List */}
      {error && (
        <div style={styles.errorBox}>
          <p>❌ {error}</p>
          <button onClick={fetchRepairs} style={styles.retryBtn}>Retry</button>
        </div>
      )}

      {repairs.length === 0 && !error ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔧</div>
          <h3>No Repairs Found</h3>
          <p>You haven't created any repair requests yet.</p>
          <button 
            style={styles.emptyBtn}
            onClick={() => setShowForm(true)}
          >
            Create Your First Repair
          </button>
        </div>
      ) : (
        <div style={styles.repairsGrid}>
          {repairs.map((repair) => {
            const statusBadge = getStatusBadge(repair.status);
            const priorityBadge = getPriorityBadge(repair.priority);
            
            return (
              <div key={repair._id} style={styles.repairCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>
                    <h3>{repair.title || 'AC Repair'}</h3>
                    <span style={{
                      ...styles.priorityBadge,
                      background: priorityBadge.bg,
                      color: priorityBadge.color
                    }}>
                      {priorityBadge.label}
                    </span>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    background: statusBadge.bg,
                    color: statusBadge.color
                  }}>
                    {statusBadge.icon} {statusBadge.label}
                  </span>
                </div>
                
                <p style={styles.cardDescription}>
                  {repair.description || 'No description provided'}
                </p>
                
                <div style={styles.cardDetails}>
                  <div style={styles.detailItem}>
                    <i className="fas fa-calendar-alt"></i>
                    <span>Created: {formatDate(repair.createdAt)}</span>
                  </div>
                  {repair.technicianId && (
                    <div style={styles.detailItem}>
                      <i className="fas fa-user-cog"></i>
                      <span>Technician: {repair.technicianId?.name || 'Assigned'}</span>
                    </div>
                  )}
                  {repair.assignedAt && (
                    <div style={styles.detailItem}>
                      <i className="fas fa-clock"></i>
                      <span>Assigned: {formatDate(repair.assignedAt)}</span>
                    </div>
                  )}
                  {repair.completedAt && (
                    <div style={styles.detailItem}>
                      <i className="fas fa-check-circle"></i>
                      <span>Completed: {formatDate(repair.completedAt)}</span>
                    </div>
                  )}
                  {repair.notes && repair.notes.length > 0 && (
                    <div style={styles.detailItem}>
                      <i className="fas fa-comment"></i>
                      <span>{repair.notes.length} note(s)</span>
                    </div>
                  )}
                </div>
                
                <div style={styles.cardActions}>
                  {repair.status !== 'completed' && repair.status !== 'cancelled' && (
                    <>
                      <button
                        onClick={() => handleCancelRepair(repair._id)}
                        style={styles.cancelRepairBtn}
                      >
                        <i className="fas fa-times"></i> Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteRepair(repair._id)}
                        style={styles.deleteRepairBtn}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </>
                  )}
                  {repair.status === 'completed' && (
                    <button
                      onClick={() => handleDeleteRepair(repair._id)}
                      style={styles.deleteRepairBtn}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#333',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '4px'
  },
  createBtn: {
    padding: '10px 24px',
    background: '#0077be',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  statsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
    background: 'white',
    padding: '16px 20px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    marginBottom: '24px'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666'
  },
  formContainer: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    marginBottom: '24px'
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#333'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s'
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    background: 'white'
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  submitBtn: {
    padding: '10px 24px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  cancelBtn: {
    padding: '10px 24px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  repairsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  repairCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    transition: 'all 0.2s',
    border: '1px solid #f0f0f0'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '12px'
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  priorityBadge: {
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  cardDescription: {
    color: '#555',
    fontSize: '14px',
    marginBottom: '12px',
    lineHeight: '1.5'
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px 0',
    borderTop: '1px solid #f0f0f0',
    borderBottom: '1px solid #f0f0f0',
    marginBottom: '12px'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#666'
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  cancelRepairBtn: {
    padding: '6px 16px',
    background: '#ffc107',
    color: '#333',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  },
  deleteRepairBtn: {
    padding: '6px 16px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    color: '#666'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0077be',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorBox: {
    textAlign: 'center',
    padding: '40px',
    color: '#dc3545',
    background: '#f8d7da',
    borderRadius: '8px'
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
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  emptyBtn: {
    marginTop: '16px',
    padding: '10px 24px',
    background: '#0077be',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    cursor: 'pointer'
  }
};

export default UserRepairs;