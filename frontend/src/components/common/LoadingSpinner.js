import React from 'react';

const LoadingSpinner = ({ message }) => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.message}>{message || 'Loading...'}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f4f7fc'
  },
  spinner: {
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #0077be',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite'
  },
  message: {
    marginTop: '20px',
    color: '#666',
    fontSize: '16px'
  }
};

export default LoadingSpinner;