// src/components/admin/AdminTechnicians.js
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminTechnicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTechnician, setNewTechnician] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: ''
  });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/technicians');
      console.log('Technicians API response:', res.data);
      
      let techData = [];
      if (Array.isArray(res.data)) {
        techData = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        techData = res.data.data;
      } else if (res.data.success && Array.isArray(res.data.data)) {
        techData = res.data.data;
      }
      
      setTechnicians(techData);
      setError('');
    } catch (err) {
      console.error('Error fetching technicians:', err);
      setError('Failed to load technicians');
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTechnician = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newTechnician.name) {
      alert('Name is required');
      return;
    }
    if (!newTechnician.email) {
      alert('Email is required');
      return;
    }
    if (!newTechnician.password) {
      alert('Password is required');
      return;
    }
    if (!newTechnician.phone) {
      alert('Phone number is required');
      return;
    }
    
    // Validate phone number format (optional)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(newTechnician.phone.replace(/\D/g, ''))) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      const res = await api.post('/admin/technicians', {
        ...newTechnician,
        phone: newTechnician.phone.replace(/\D/g, '') // Remove non-digits
      });
      console.log('Add technician response:', res.data);
      
      if (res.data.success) {
        setTechnicians([...technicians, res.data.data]);
        setShowAddForm(false);
        setNewTechnician({ 
          name: '', 
          email: '', 
          password: '',
          phone: '', 
          specialization: '' 
        });
        alert(res.data.message || 'Technician added successfully!');
      } else {
        alert(res.data.message || 'Failed to add technician');
      }
    } catch (err) {
      console.error('Error adding technician:', err);
      const errorMsg = err.response?.data?.message || 'Failed to add technician';
      alert(errorMsg);
    }
  };

  const handleDeleteTechnician = async (id) => {
    if (!id) {
      alert('Invalid technician ID');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this technician?')) return;
    
    try {
      const res = await api.delete(`/admin/technicians/${id}`);
      if (res.data.success) {
        setTechnicians(technicians.filter(t => {
          const techId = t._id || t.id;
          return techId && techId !== id;
        }));
        alert(res.data.message || 'Technician deleted successfully');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete technician');
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    if (!id) {
      alert('Invalid technician ID');
      return;
    }
    
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const res = await api.patch(`/admin/technicians/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setTechnicians(technicians.map(t => {
          const techId = t._id || t.id;
          if (techId && techId === id) {
            return { ...t, isActive: newStatus === 'active' };
          }
          return t;
        }));
        alert(res.data.message || 'Status updated successfully');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update technician status');
    }
  };

  const getTechnicianId = (tech) => {
    return tech?._id || tech?.id || null;
  };

  const displayId = (tech) => {
    const id = getTechnicianId(tech);
    if (!id) return 'N/A';
    const idStr = String(id);
    return idStr.length > 6 ? `#${idStr.slice(-6)}` : `#${idStr}`;
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading technicians...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>❌ {error}</p>
        <button onClick={fetchTechnicians} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Manage Technicians</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          style={styles.addBtn}
        >
          {showAddForm ? 'Cancel' : '+ Add Technician'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddTechnician} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name *</label>
              <input
                type="text"
                placeholder="e.g., John Doe"
                value={newTechnician.name}
                onChange={(e) => setNewTechnician({...newTechnician, name: e.target.value})}
                style={styles.formInput}
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address *</label>
              <input
                type="email"
                placeholder="technician@example.com"
                value={newTechnician.email}
                onChange={(e) => setNewTechnician({...newTechnician, email: e.target.value})}
                style={styles.formInput}
                required
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={newTechnician.password}
                onChange={(e) => setNewTechnician({...newTechnician, password: e.target.value})}
                style={styles.formInput}
                required
                minLength="6"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number *</label>
              <input
                type="tel"
                placeholder="e.g., 9876543210"
                value={newTechnician.phone}
                onChange={(e) => setNewTechnician({...newTechnician, phone: e.target.value})}
                style={styles.formInput}
                required
              />
              <small style={styles.hint}>Enter 10-digit phone number</small>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Specialization</label>
            <input
              type="text"
              placeholder="e.g., AC Repair, HVAC, Refrigeration"
              value={newTechnician.specialization}
              onChange={(e) => setNewTechnician({...newTechnician, specialization: e.target.value})}
              style={styles.formInput}
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            <i className="fas fa-user-plus"></i> Add Technician
          </button>
        </form>
      )}
      
      <div style={styles.tableContainer}>
        {technicians.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No technicians found. Click "Add Technician" to create one.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Specialization</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {technicians.map((tech) => {
                const techId = getTechnicianId(tech);
                const isActive = tech?.isActive !== false;
                
                return (
                  <tr key={techId || Math.random().toString()}>
                    <td>{displayId(tech)}</td>
                    <td>{tech?.name || 'N/A'}</td>
                    <td>{tech?.email || 'N/A'}</td>
                    <td>{tech?.phone || 'N/A'}</td>
                    <td>{tech?.specialization || 'General'}</td>
                    <td>
                      <span style={{
                        ...styles.badge,
                        background: isActive ? '#d4edda' : '#f8d7da',
                        color: isActive ? '#155724' : '#721c24'
                      }}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleStatusToggle(techId, isActive ? 'active' : 'inactive')}
                        style={{
                          ...styles.statusBtn,
                          background: isActive ? '#ffc107' : '#28a745',
                          color: 'white'
                        }}
                        disabled={!techId}
                      >
                        {isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => handleDeleteTechnician(techId)}
                        style={styles.deleteBtn}
                        disabled={!techId}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      <div style={styles.refreshSection}>
        <button onClick={fetchTechnicians} style={styles.refreshBtn}>
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
  addBtn: {
    padding: '8px 16px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  form: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    marginBottom: '20px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555'
  },
  formInput: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  hint: {
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic'
  },
  submitBtn: {
    padding: '10px',
    background: '#0077be',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    width: '100%',
    marginTop: '10px'
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
  statusBtn: {
    padding: '4px 10px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '5px'
  },
  deleteBtn: {
    padding: '4px 12px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
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

export default AdminTechnicians;