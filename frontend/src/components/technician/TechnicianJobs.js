// src/components/technician/TechnicianJobs.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

const TechnicianJobs = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/technician/jobs');
      console.log('Technician Jobs response:', res.data);
      
      let jobsData = [];
      if (res.data.success && Array.isArray(res.data.data)) {
        jobsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        jobsData = res.data;
      } else if (res.data.jobs) {
        jobsData = res.data.jobs;
      }
      setJobs(jobsData);
      setError('');
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load your jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    if (!window.confirm(`Change job status to ${newStatus.toUpperCase()}?`)) return;
    
    setUpdatingStatus(jobId);
    try {
      const res = await api.patch(`/technician/jobs/${jobId}/status`, { status: newStatus });
      console.log('Status update response:', res.data);
      
      if (res.data.success) {
        setJobs(jobs.map(job => 
          job._id === jobId ? { ...job, status: newStatus } : job
        ));
        alert(`✅ Job status updated to ${newStatus.toUpperCase()}!`);
      } else {
        alert('❌ Failed to update status: ' + (res.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('❌ Failed to update job status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      alert('Please enter a note');
      return;
    }

    try {
      const res = await api.post(`/technician/jobs/${selectedJob._id}/notes`, { 
        note: noteText.trim() 
      });
      
      console.log('Add note response:', res.data);
      
      if (res.data.success) {
        // Update the job with new note
        setJobs(jobs.map(job => {
          if (job._id === selectedJob._id) {
            const updatedNotes = [...(job.notes || []), {
              text: noteText.trim(),
              addedBy: user._id || user.id,
              addedAt: new Date()
            }];
            return { ...job, notes: updatedNotes };
          }
          return job;
        }));
        setNoteText('');
        setShowNoteModal(false);
        alert('✅ Note added successfully!');
      } else {
        alert('❌ Failed to add note: ' + (res.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error adding note:', err);
      alert('❌ Failed to add note. Please try again.');
    }
  };

  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
    setShowNoteModal(true);
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

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter === 'all' || job.status === filter;
    const matchesSearch = job.title?.toLowerCase().includes(search.toLowerCase()) ||
                          job.description?.toLowerCase().includes(search.toLowerCase()) ||
                          job.userId?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Stats
  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'pending').length,
    assigned: jobs.filter(j => j.status === 'assigned').length,
    inProgress: jobs.filter(j => j.status === 'in-progress').length,
    completed: jobs.filter(j => j.status === 'completed').length
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading your jobs...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📋 My Jobs</h2>
          <p style={styles.subtitle}>Manage your assigned repair jobs</p>
        </div>
        <button onClick={fetchJobs} style={styles.refreshBtn}>
          <i className="fas fa-sync"></i> Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{stats.total}</span>
          <span style={styles.statLabel}>Total Jobs</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{stats.pending}</span>
          <span style={styles.statLabel}>⏳ Pending</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{stats.assigned}</span>
          <span style={styles.statLabel}>📋 Assigned</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{stats.inProgress}</span>
          <span style={styles.statLabel}>🔧 In Progress</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{stats.completed}</span>
          <span style={styles.statLabel}>✅ Completed</span>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterContainer}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filter by Status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Jobs</option>
            <option value="pending">⏳ Pending</option>
            <option value="assigned">📋 Assigned</option>
            <option value="in-progress">🔧 In Progress</option>
            <option value="completed">✅ Completed</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>
        </div>
        
        <div style={styles.searchGroup}>
          <i className="fas fa-search" style={styles.searchIcon}></i>
          <input
            type="text"
            placeholder="Search by title, description, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.errorBox}>
          <p>❌ {error}</p>
          <button onClick={fetchJobs} style={styles.retryBtn}>Retry</button>
        </div>
      )}

      {/* Jobs List */}
      {filteredJobs.length === 0 && !error ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔧</div>
          <h3>No Jobs Found</h3>
          <p>You don't have any assigned jobs at the moment.</p>
        </div>
      ) : (
        <div style={styles.jobsGrid}>
          {filteredJobs.map((job) => {
            const statusBadge = getStatusBadge(job.status);
            const priorityBadge = getPriorityBadge(job.priority);
            const isUpdating = updatingStatus === job._id;
            
            return (
              <div key={job._id} style={styles.jobCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitleSection}>
                    <h3 style={styles.cardTitle}>{job.title || 'AC Repair'}</h3>
                    <span style={{
                      ...styles.priorityBadge,
                      background: priorityBadge.bg,
                      color: priorityBadge.color
                    }}>
                      {priorityBadge.label} Priority
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
                  {job.description || 'No description provided'}
                </p>
                
                <div style={styles.cardDetails}>
                  <div style={styles.detailItem}>
                    <i className="fas fa-user"></i>
                    <span>Customer: {job.userId?.name || 'N/A'}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <i className="fas fa-envelope"></i>
                    <span>{job.userId?.email || 'N/A'}</span>
                  </div>
                  {job.userId?.phone && (
                    <div style={styles.detailItem}>
                      <i className="fas fa-phone"></i>
                      <span>{job.userId.phone}</span>
                    </div>
                  )}
                  <div style={styles.detailItem}>
                    <i className="fas fa-calendar-alt"></i>
                    <span>Created: {formatDate(job.createdAt)}</span>
                  </div>
                  {job.assignedAt && (
                    <div style={styles.detailItem}>
                      <i className="fas fa-clock"></i>
                      <span>Assigned: {formatDate(job.assignedAt)}</span>
                    </div>
                  )}
                  {job.completedAt && (
                    <div style={styles.detailItem}>
                      <i className="fas fa-check-circle"></i>
                      <span>Completed: {formatDate(job.completedAt)}</span>
                    </div>
                  )}
                  {job.notes && job.notes.length > 0 && (
                    <div style={styles.detailItem}>
                      <i className="fas fa-comment"></i>
                      <span>{job.notes.length} note(s)</span>
                    </div>
                  )}
                </div>
                
                <div style={styles.cardActions}>
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(job._id, e.target.value)}
                    style={styles.statusSelect}
                    disabled={isUpdating || job.status === 'completed' || job.status === 'cancelled'}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="assigned">📋 Assigned</option>
                    <option value="in-progress">🔧 In Progress</option>
                    <option value="completed">✅ Completed</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                  
                  <button
                    onClick={() => handleViewJobDetails(job)}
                    style={styles.noteBtn}
                  >
                    <i className="fas fa-comment"></i> Add Note
                  </button>
                  
                  {isUpdating && (
                    <span style={styles.updatingText}>
                      <i className="fas fa-spinner fa-spin"></i>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && selectedJob && (
        <div style={styles.modalOverlay} onClick={() => setShowNoteModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Add Note</h3>
              <button 
                style={styles.modalCloseBtn}
                onClick={() => setShowNoteModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.modalJobInfo}>
                <p><strong>Job:</strong> {selectedJob.title || 'AC Repair'}</p>
                <p><strong>Customer:</strong> {selectedJob.userId?.name || 'N/A'}</p>
                <p><strong>Status:</strong> {selectedJob.status?.toUpperCase() || 'N/A'}</p>
              </div>
              
              {/* Existing Notes */}
              {selectedJob.notes && selectedJob.notes.length > 0 && (
                <div style={styles.existingNotes}>
                  <h4 style={styles.notesTitle}>Previous Notes:</h4>
                  {selectedJob.notes.map((note, index) => (
                    <div key={index} style={styles.noteItem}>
                      <div style={styles.noteText}>{note.text}</div>
                      <div style={styles.noteMeta}>
                        <span>By: {note.addedBy?.name || 'Technician'}</span>
                        <span>{formatDate(note.addedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <form onSubmit={handleAddNote} style={styles.noteForm}>
                <textarea
                  placeholder="Enter your note here..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  style={styles.noteTextarea}
                  rows="4"
                  required
                />
                <div style={styles.modalActions}>
                  <button type="submit" style={styles.submitNoteBtn}>
                    <i className="fas fa-save"></i> Save Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(false)}
                    style={styles.cancelNoteBtn}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
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
  refreshBtn: {
    padding: '8px 16px',
    background: '#0077be',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  },
  statsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
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
  filterContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
    padding: '16px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555'
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    background: 'white'
  },
  searchGroup: {
    display: 'flex',
    alignItems: 'center',
    flex: '1',
    minWidth: '200px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '0 12px',
    background: 'white'
  },
  searchIcon: {
    color: '#999',
    marginRight: '8px'
  },
  searchInput: {
    padding: '8px 0',
    border: 'none',
    outline: 'none',
    flex: '1',
    fontSize: '14px'
  },
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '20px'
  },
  jobCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #f0f0f0',
    transition: 'all 0.2s'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '12px'
  },
  cardTitleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    color: '#333'
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
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  statusSelect: {
    padding: '6px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    background: 'white',
    flex: '1',
    minWidth: '140px'
  },
  noteBtn: {
    padding: '6px 14px',
    background: '#28a745',
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
  updatingText: {
    fontSize: '14px',
    color: '#0077be'
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
    borderRadius: '8px',
    marginBottom: '24px'
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
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #f0f0f0'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
    color: '#333'
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999'
  },
  modalBody: {
    padding: '24px'
  },
  modalJobInfo: {
    background: '#f8f9fa',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px'
  },
  existingNotes: {
    marginBottom: '16px',
    maxHeight: '200px',
    overflowY: 'auto'
  },
  notesTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#555'
  },
  noteItem: {
    background: '#f8f9fa',
    padding: '10px 12px',
    borderRadius: '6px',
    marginBottom: '8px'
  },
  noteText: {
    fontSize: '14px',
    color: '#333',
    marginBottom: '4px'
  },
  noteMeta: {
    fontSize: '12px',
    color: '#999',
    display: 'flex',
    gap: '12px'
  },
  noteForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  noteTextarea: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit',
    outline: 'none'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  submitNoteBtn: {
    padding: '8px 20px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  cancelNoteBtn: {
    padding: '8px 20px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  }
};

export default TechnicianJobs;