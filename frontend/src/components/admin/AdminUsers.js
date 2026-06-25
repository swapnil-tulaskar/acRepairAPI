// src/components/admin/AdminUsers.js
import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const AdminUsers = () => {
  const { user: currentUser } = useContext(AuthContext); // Get logged-in user
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [updatingRole, setUpdatingRole] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      console.log('Users API response:', res.data);
      
      let usersData = [];
      if (res.data.success && Array.isArray(res.data.data)) {
        usersData = res.data.data;
      } else if (Array.isArray(res.data)) {
        usersData = res.data;
      }
      setUsers(usersData);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Prevent deleting yourself
    if (userId === (currentUser._id || currentUser.id)) {
      alert('❌ You cannot delete your own account!');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone!')) return;
    
    setDeletingUser(userId);
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      console.log('Delete response:', res.data);
      
      if (res.data.success) {
        setUsers(users.filter(user => (user._id || user.id) !== userId));
        alert('✅ User deleted successfully!');
      } else {
        alert('❌ Failed to delete user: ' + (res.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      if (err.response) {
        alert('❌ Server error: ' + (err.response.data?.message || 'Please try again'));
      } else {
        alert('❌ Failed to delete user. Please try again.');
      }
    } finally {
      setDeletingUser(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const roleNames = {
      user: 'User',
      technician: 'Technician',
      admin: 'Admin'
    };
    
    // 🔒 SECURITY: Prevent changing your own role
    if (userId === (currentUser._id || currentUser.id)) {
      alert('❌ You cannot change your own role!');
      return;
    }

    // 🔒 SECURITY: Only allow admin role changes by existing admins
    // This is already enforced by the API, but adding client-side check too
    if (newRole === 'admin' && currentUser.role !== 'admin') {
      alert('❌ Only existing admins can make someone an admin!');
      return;
    }

    const userToUpdate = users.find(u => (u._id || u.id) === userId);
    if (!userToUpdate) return;

    if (userToUpdate.role === newRole) {
      alert(`User is already a ${roleNames[newRole]}`);
      return;
    }

    // 🔒 SECURITY: Special check for making someone admin
    if (newRole === 'admin') {
      if (!window.confirm(
        `⚠️ WARNING: You are about to make ${userToUpdate.name || 'this user'} an ADMIN.\n\n` +
        `Admins have full access to all features including:\n` +
        `• User management\n` +
        `• Repair management\n` +
        `• Technician management\n` +
        `• System settings\n\n` +
        `Are you sure you want to proceed?`
      )) return;
    } else {
      if (!window.confirm(
        `Change ${userToUpdate.name || 'this user'}'s role from ${roleNames[userToUpdate.role]} to ${roleNames[newRole]}?`
      )) return;
    }
    
    setUpdatingRole(userId);
    try {
      console.log('Updating role:', { userId, role: newRole });
      
      const res = await api.patch('/admin/update-role', { 
        userId, 
        role: newRole 
      });
      
      console.log('Update role response:', res.data);
      
      if (res.data.success) {
        setUsers(users.map(user => {
          const userIdField = user._id || user.id;
          if (userIdField === userId) {
            return { ...user, role: newRole };
          }
          return user;
        }));
        alert(`✅ User role updated to ${roleNames[newRole]} successfully!`);
      } else {
        alert('❌ Failed to update role: ' + (res.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error updating role:', err);
      if (err.response) {
        alert('❌ Server error: ' + (err.response.data?.message || 'Please try again'));
      } else {
        alert('❌ Failed to update role. Please try again.');
      }
    } finally {
      setUpdatingRole(null);
    }
  };

  // Get role badge style
  const getRoleBadgeStyle = (role) => {
    const styles = {
      admin: { 
        background: '#dbeafe', 
        color: '#1e4a7a',
        icon: '🛡️'
      },
      technician: { 
        background: '#d1fae5', 
        color: '#065f46',
        icon: '🔧'
      },
      user: { 
        background: '#f3e8ff', 
        color: '#5b21b6',
        icon: '👤'
      }
    };
    return styles[role] || styles.user;
  };

  // Filter users by search
  const filteredUsers = users.filter(user => {
    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const searchLower = search.toLowerCase();
    return name.includes(searchLower) || email.includes(searchLower);
  });

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>❌ {error}</p>
        <button onClick={fetchUsers} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Manage Users</h2>
        <span style={styles.count}>{users.length} users</span>
      </div>

      {/* Security Info */}
      <div style={styles.securityInfo}>
        <i className="fas fa-shield-alt" style={styles.securityIcon}></i>
        <span>Only Admins can promote users to Admin role. You cannot modify your own role.</span>
      </div>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBox}>
          <i className="fas fa-search" style={styles.searchIcon}></i>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              style={styles.clearSearch}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <span>Total: {users.length}</span>
        <span>👤 Users: {users.filter(u => u.role === 'user').length}</span>
        <span>🔧 Technicians: {users.filter(u => u.role === 'technician').length}</span>
        <span>🛡️ Admins: {users.filter(u => u.role === 'admin').length}</span>
      </div>
      
      <div style={styles.tableContainer}>
        {filteredUsers.length === 0 ? (
          <div style={styles.emptyState}>
            <p>{search ? 'No users found matching your search' : 'No users found'}</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => {
                const userId = user._id || user.id;
                const isUpdating = updatingRole === userId;
                const isDeleting = deletingUser === userId;
                const roleStyle = getRoleBadgeStyle(user.role);
                const isCurrentUser = userId === (currentUser._id || currentUser.id);
                const isAdmin = currentUser.role === 'admin';
                
                return (
                  <tr key={userId} style={isCurrentUser ? styles.currentUserRow : {}}>
                    <td>{index + 1}</td>
                    <td>
                      <div style={styles.userName}>
                        <div style={styles.avatar}>
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {user.name || 'Unknown'}
                        {isCurrentUser && (
                          <span style={styles.youBadge}>(You)</span>
                        )}
                      </div>
                    </td>
                    <td>{user.email || 'N/A'}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>
                      <span style={{
                        ...styles.roleBadge,
                        background: roleStyle.background,
                        color: roleStyle.color
                      }}>
                        {roleStyle.icon} {user.role?.toUpperCase() || 'USER'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        ...styles.statusBadge,
                        background: user.isActive ? '#d4edda' : '#f8d7da',
                        color: user.isActive ? '#155724' : '#721c24'
                      }}>
                        {user.isActive ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={styles.actionButtons}>
                        <select 
                          value={user.role || 'user'} 
                          onChange={(e) => handleRoleChange(userId, e.target.value)}
                          style={{
                            ...styles.roleSelect,
                            opacity: isCurrentUser ? 0.5 : 1,
                            cursor: isCurrentUser ? 'not-allowed' : 'pointer'
                          }}
                          disabled={isUpdating || isDeleting || isCurrentUser}
                        >
                          <option value="user">👤 User</option>
                          <option value="technician">🔧 Technician</option>
                          <option value="admin">🛡️ Admin</option>
                        </select>
                        
                        <button 
                          onClick={() => handleDeleteUser(userId)}
                          style={{
                            ...styles.deleteBtn,
                            opacity: isCurrentUser ? 0.5 : 1,
                            cursor: isCurrentUser ? 'not-allowed' : 'pointer'
                          }}
                          disabled={isUpdating || isDeleting || isCurrentUser}
                          title={isCurrentUser ? 'Cannot delete your own account' : 'Delete user'}
                        >
                          {isDeleting ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-trash"></i>
                          )}
                        </button>

                        {isUpdating && (
                          <span style={styles.updatingText}>
                            <i className="fas fa-spinner fa-spin"></i>
                          </span>
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
        <button onClick={fetchUsers} style={styles.refreshBtn}>
          🔄 Refresh Users
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
    background: '#0077be',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px'
  },
  securityInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '10px 15px',
    marginBottom: '16px',
    color: '#856404',
    fontSize: '13px'
  },
  securityIcon: {
    fontSize: '18px'
  },
  searchContainer: {
    marginBottom: '16px'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '8px 12px',
    maxWidth: '400px'
  },
  searchIcon: {
    color: '#999',
    marginRight: '10px'
  },
  searchInput: {
    border: 'none',
    flex: 1,
    outline: 'none',
    fontSize: '14px'
  },
  clearSearch: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
    fontSize: '16px'
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
  currentUserRow: {
    background: '#f0f7ff'
  },
  userName: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#0077be',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  youBadge: {
    fontSize: '11px',
    color: '#0077be',
    fontWeight: '600'
  },
  roleBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block'
  },
  roleSelect: {
    padding: '4px 8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    background: 'white'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  deleteBtn: {
    padding: '4px 10px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s'
  },
  updatingText: {
    fontSize: '14px',
    color: '#0077be',
    marginLeft: '5px'
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

export default AdminUsers;