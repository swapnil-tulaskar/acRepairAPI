// src/components/admin/AdminRepairs.js
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminRepairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [assigning, setAssigning] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentRepair, setCurrentRepair] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  useEffect(() => {
    fetchRepairs();
    fetchTechnicians();
  }, []);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/repairs');
      console.log('Repairs API response:', res.data);
      
      if (res.data.success) {
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        if (Array.isArray(res.data.data)) {
          setRepairs(res.data.data);
        } else {
          setRepairs([]);
        }
      } else {
        setRepairs([]);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching repairs:', err);
      setError('Failed to load repairs');
      setRepairs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/admin/technicians');
      console.log('Technicians API response:', res.data);
      
      let techs = [];
      if (res.data.success && Array.isArray(res.data.data)) {
        techs = res.data.data;
      } else if (Array.isArray(res.data)) {
        techs = res.data;
      }
      setTechnicians(techs);
      console.log('Technicians list:', techs);
    } catch (err) {
      console.error('Error fetching technicians:', err);
      setTechnicians([]);
    }
  };

  const handleStatusChange = async (repairId, newStatus) => {
    try {
      const res = await api.patch(`/admin/repairs/${repairId}/status`, { status: newStatus });
      if (res.data.success) {
        setRepairs(repairs.map(repair => 
          repair._id === repairId ? { ...repair, status: newStatus } : repair
        ));
        alert('✅ Status updated successfully!');
      } else {
        alert('❌ Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update repair status');
    }
  };

  // Helper function to get technician name
  const getTechnicianName = (repair) => {
    if (repair.technician?.name) {
      return repair.technician.name;
    }
    if (repair.technicianId?.name) {
      return repair.technicianId.name;
    }
    if (repair.technicianId) {
      const tech = technicians.find(t => t._id === repair.technicianId);
      if (tech) {
        return tech.name;
      }
      return 'Assigned';
    }
    return null;
  };

  const handleAssignTechnician = async (repairId, technicianId) => {
    if (!technicianId) {
      alert('Please select a technician');
      return;
    }

    setAssigning(repairId);
    try {
      console.log('Assigning technician:', { repairId, technicianId });
      
      const res = await api.post('/admin/assign-repair', { 
        repairId, 
        technicianId 
      });
      
      console.log('Assign response:', res.data);
      
      if (res.data.success) {
        const technician = technicians.find(t => t._id === technicianId);
        
        setRepairs(repairs.map(repair => {
          if (repair._id === repairId) {
            return { 
              ...repair, 
              technicianId: technicianId,
              technician: technician || { name: 'Assigned' },
              status: 'assigned'
            };
          }
          return repair;
        }));
        setShowAssignModal(false);
        setCurrentRepair(null);
        setSelectedTechnician('');
        alert('✅ Technician assigned successfully!');
        await fetchRepairs();
      } else {
        alert('❌ Failed to assign technician: ' + (res.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error assigning technician:', err);
      if (err.response) {
        alert('❌ Server error: ' + (err.response.data?.message || 'Please try again'));
      } else {
        alert('❌ Failed to assign technician. Please try again.');
      }
    } finally {
      setAssigning(null);
    }
  };

  const handleRemoveTechnician = async (repairId) => {
    if (!window.confirm('Remove technician from this repair?')) return;
    
    setAssigning(repairId);
    try {
      console.log('Removing technician from repair:', repairId);
      
      const res = await api.post('/admin/assign-repair', { 
        repairId, 
        technicianId: null 
      });
      
      console.log('Remove response:', res.data);
      
      if (res.data.success) {
        setRepairs(repairs.map(repair => {
          if (repair._id === repairId) {
            return { 
              ...repair, 
              technicianId: null, 
              technician: null,
              status: 'pending'
            };
          }
          return repair;
        }));
        alert('✅ Technician removed successfully!');
        await fetchRepairs();
      } else {
        alert('❌ Failed to remove technician: ' + (res.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error removing technician:', err);
      alert('❌ Failed to remove technician. Please try again.');
    } finally {
      setAssigning(null);
    }
  };

  const openAssignModal = (repair) => {
    setCurrentRepair(repair);
    setSelectedTechnician(repair.technicianId || '');
    setShowAssignModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: '#fff3cd', color: '#856404' },
      assigned: { bg: '#d1ecf1', color: '#0c5460' },
      'in-progress': { bg: '#cce5ff', color: '#004085' },
      completed: { bg: '#d4edda', color: '#155724' },
      cancelled: { bg: '#f8d7da', color: '#721c24' }
    };
    const style = badges[status] || badges.pending;
    return { ...style, text: status?.replace('-', ' ').toUpperCase() || 'PENDING' };
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading repairs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>❌ {error}</p>
        <button onClick={fetchRepairs} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Manage Repairs</h2>
        <span style={styles.count}>{repairs.length} repairs</span>
      </div>

      {stats.total > 0 && (
        <div style={styles.statsBar}>
          <span>Total: {stats.total}</span>
          <span>Pending: {stats.pending}</span>
          <span>Assigned: {stats.assigned}</span>
          <span>In Progress: {stats.inProgress}</span>
          <span>Completed: {stats.completed}</span>
        </div>
      )}
      
      <div style={styles.tableContainer}>
        {repairs.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No repairs found</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Customer</th>
                <th>Technician</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map((repair) => {
                const statusStyle = getStatusBadge(repair.status);
                const isAssigning = assigning === repair._id;
                const techName = getTechnicianName(repair);
                const hasTechnician = repair.technicianId || repair.technician;
                
                return (
                  <tr key={repair._id}>
                    <td>#{repair._id?.slice(-6) || 'N/A'}</td>
                    <td>{repair.title || 'N/A'}</td>
                    <td>{repair.userId?.name || repair.user?.name || 'N/A'}</td>
                    <td>
                      {hasTechnician ? (
                        <span style={styles.assignedTech}>
                          <i className="fas fa-user-cog" style={styles.techIcon}></i>
                          {techName || 'Assigned'}
                        </span>
                      ) : (
                        <span style={styles.unassigned}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        ...styles.badge,
                        background: statusStyle.bg,
                        color: statusStyle.color
                      }}>
                        {statusStyle.text}
                      </span>
                    </td>
                    <td>{new Date(repair.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={styles.actionButtons}>
                        <select 
                          value={repair.status} 
                          onChange={(e) => handleStatusChange(repair._id, e.target.value)}
                          style={styles.statusSelect}
                        >
                          <option value="pending">Pending</option>
                          <option value="assigned">Assigned</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        
                        <button
                          onClick={() => openAssignModal(repair)}
                          style={styles.assignBtn}
                          disabled={isAssigning}
                          title="Assign/Reassign Technician"
                        >
                          <i className="fas fa-user-plus"></i>
                        </button>

                        {hasTechnician && (
                          <button
                            onClick={() => handleRemoveTechnician(repair._id)}
                            style={styles.removeBtn}
                            disabled={isAssigning}
                            title="Remove Technician"
                          >
                            <i className="fas fa-user-times"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      <div style={styles.refreshSection}>
        <button onClick={fetchRepairs} style={styles.refreshBtn}>
          🔄 Refresh
        </button>
      </div>

      {/* Assign Technician Modal */}
      {showAssignModal && currentRepair && (
        <div style={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Assign Technician</h3>
            <p style={styles.modalSubtitle}>
              Repair: <strong>{currentRepair.title || 'N/A'}</strong>
            </p>
            <p style={styles.modalSubtitle}>
              Customer: <strong>{currentRepair.userId?.name || currentRepair.user?.name || 'N/A'}</strong>
            </p>
            
            <div style={styles.modalBody}>
              <label style={styles.modalLabel}>Select Technician:</label>
              <select
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                style={styles.modalSelect}
                disabled={assigning === currentRepair._id}
              >
                <option value="">-- Select Technician --</option>
                {technicians.map(tech => (
                  <option key={tech._id} value={tech._id}>
                    {tech.name} {!tech.isActive ? '(Inactive)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => handleAssignTechnician(currentRepair._id, selectedTechnician)}
                style={styles.modalAssignBtn}
                disabled={!selectedTechnician || assigning === currentRepair._id}
              >
                {assigning === currentRepair._id ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-check"></i>
                )}
                Assign Technician
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setCurrentRepair(null);
                  setSelectedTechnician('');
                }}
                style={styles.modalCancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
    background: '#0077be',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px'
  },
  statsBar: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    background: 'white',
    padding: '15px 20px',
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
    borderCollapse: 'collapse'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block'
  },
  statusSelect: {
    padding: '4px 8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  actionButtons: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  assignBtn: {
    padding: '5px 10px',
    background: '#0077be',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
    ':hover': {
      background: '#005f99'
    }
  },
  removeBtn: {
    padding: '5px 10px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
    ':hover': {
      background: '#c82333'
    }
  },
  assignedTech: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#28a745',
    fontWeight: '500'
  },
  techIcon: {
    fontSize: '14px'
  },
  unassigned: {
    color: '#6c757d',
    fontStyle: 'italic'
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
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    maxWidth: '450px',
    width: '90%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
  },
  modalTitle: {
    margin: '0 0 10px 0',
    color: '#333'
  },
  modalSubtitle: {
    margin: '5px 0',
    color: '#666',
    fontSize: '14px'
  },
  modalBody: {
    margin: '20px 0'
  },
  modalLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#555'
  },
  modalSelect: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '20px'
  },
  modalAssignBtn: {
    padding: '10px 20px',
    background: '#0077be',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  modalCancelBtn: {
    padding: '10px 20px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default AdminRepairs;