// src/components/common/Header.js
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Header = ({ user }) => {
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      window.location.reload();
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.logoSection}>
          <i className="fas fa-snowflake" style={styles.logoIcon}></i>
          <h1 style={styles.logo}>AC<span style={{ color: '#ffd700' }}>Repair</span></h1>
        </div>
        
        {user && (
          <div style={styles.userInfo}>
            <div style={styles.userDetails}>
              <span style={styles.userName}>
                <i className="fas fa-user-circle"></i> {user.name}
              </span>
              <span style={styles.role}>{user.role}</span>
            </div>
            {/* ✅ LOGOUT BUTTON */}
            <button onClick={handleLogout} style={styles.logoutBtn}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

const styles = {
  header: {
    background: '#0077be',
    color: 'white',
    padding: '12px 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoIcon: {
    fontSize: '24px',
    color: '#ffd700'
  },
  logo: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: 'white'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap'
  },
  userDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255,255,255,0.15)',
    padding: '6px 14px',
    borderRadius: '20px'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500'
  },
  role: {
    background: 'rgba(255,255,255,0.25)',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  logoutBtn: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background 0.3s ease'
  }
};

export default Header;