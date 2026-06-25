// src/components/auth/Login.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Login = ({ onSwitchToRegister, onSwitchToTechnicianRegister }) => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      console.log('✅ Login successful!');
      window.location.reload();
    } else {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoSection}>
          <i className="fas fa-snowflake" style={styles.logoIcon}></i>
          <span style={styles.logoText}>AC<span style={{ color: '#0077be' }}>Repair</span></span>
        </div>
        
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to your account to continue</p>
        
        {error && <div style={styles.error}>❌ {error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <i className="fas fa-envelope" style={styles.inputIcon}></i>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <i className="fas fa-lock" style={styles.inputIcon}></i>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Signing In...</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        {/* Registration Links */}
        <div style={styles.registerSection}>
          <p style={styles.registerText}>
            <i className="fas fa-user-plus" style={styles.registerIcon}></i>
            <span onClick={onSwitchToRegister} style={styles.registerLink}>
              Register as User
            </span>
          </p>
          <p style={styles.registerText}>
            <i className="fas fa-tools" style={styles.registerIcon}></i>
            <span onClick={onSwitchToTechnicianRegister} style={styles.registerLink}>
              Apply as Technician
            </span>
          </p>
        </div>
        
        <div style={styles.divider}>
          <span style={styles.dividerText}>New to AC Repair?</span>
        </div>
        
        <div style={styles.footer}>
          <p style={styles.terms}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    maxWidth: '450px',
    width: '100%',
    transition: 'all 0.3s ease'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '24px'
  },
  logoIcon: {
    fontSize: '28px',
    color: '#0077be',
    background: '#e8f4fd',
    padding: '12px',
    borderRadius: '12px'
  },
  logoText: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a2a3a'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a2a3a',
    textAlign: 'center',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6c7a8a',
    textAlign: 'center',
    marginBottom: '28px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '500',
    color: '#2a3a4a',
    fontSize: '14px'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#8a9aaa',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '2px solid #e9edf2',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    outline: 'none',
    background: '#f8fafc'
  },
  button: {
    width: '100%',
    padding: '14px',
    background: '#0077be',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.3s, transform 0.2s',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  registerSection: {
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center'
  },
  registerText: {
    fontSize: '14px',
    color: '#555',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  registerIcon: {
    color: '#0077be',
    fontSize: '14px'
  },
  registerLink: {
    color: '#0077be',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'color 0.3s',
    textDecoration: 'none'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
    position: 'relative'
  },
  dividerText: {
    background: 'white',
    padding: '0 16px',
    color: '#8a9aaa',
    fontSize: '13px',
    margin: '0 auto'
  },
  error: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '1px solid #f5c6cb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center'
  },
  terms: {
    fontSize: '12px',
    color: '#8a9aaa',
    lineHeight: '1.5'
  }
};

export default Login;