// src/components/auth/Register.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Register = ({ onSwitchToLogin }) => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    // ✅ Phone validation - REQUIRED
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    // Phone number format validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    const cleanedPhone = formData.phone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await register(
        formData.name.trim(),
        formData.email.trim().toLowerCase(),
        formData.password,
        cleanedPhone // Send cleaned phone number
      );

      console.log('Registration result:', result);

      if (result.success) {
        setSuccess(true);
        setSuccessMessage(result.message || '✅ Registration successful! Redirecting to login...');
        setError('');
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
        });
        
        setTimeout(() => {
          onSwitchToLogin();
        }, 3000);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
        setSuccess(false);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
      setSuccess(false);
    } finally {
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
        
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join us and get your AC repair needs sorted</p>
        
        {/* ✅ SUCCESS MESSAGE - GREEN */}
        {success && (
          <div style={styles.success}>
            <i className="fas fa-check-circle"></i> {successMessage}
          </div>
        )}
        
        {/* ❌ ERROR MESSAGE - RED */}
        {error && <div style={styles.error}>❌ {error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name <span style={styles.required}>*</span></label>
            <div style={styles.inputWrapper}>
              <i className="fas fa-user" style={styles.inputIcon}></i>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter your full name"
                required
                disabled={loading || success}
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address <span style={styles.required}>*</span></label>
            <div style={styles.inputWrapper}>
              <i className="fas fa-envelope" style={styles.inputIcon}></i>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter your email"
                required
                disabled={loading || success}
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number <span style={styles.required}>*</span></label>
            <div style={styles.inputWrapper}>
              <i className="fas fa-phone" style={styles.inputIcon}></i>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter 10-digit phone number"
                required
                disabled={loading || success}
                maxLength="10"
              />
            </div>
            <p style={styles.hint}>Enter a valid 10-digit phone number</p>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Password <span style={styles.required}>*</span></label>
            <div style={styles.inputWrapper}>
              <i className="fas fa-lock" style={styles.inputIcon}></i>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                placeholder="Min 6 characters"
                required
                disabled={loading || success}
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password <span style={styles.required}>*</span></label>
            <div style={styles.inputWrapper}>
              <i className="fas fa-lock" style={styles.inputIcon}></i>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={styles.input}
                placeholder="Re-enter your password"
                required
                disabled={loading || success}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || success} 
            style={styles.button}
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Creating Account...</>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div style={styles.footer}>
          <p>
            Already have an account?{' '}
            <span onClick={onSwitchToLogin} style={styles.loginLink}>
              Sign In
            </span>
          </p>
          <p style={styles.terms}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
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
    marginBottom: '18px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '500',
    color: '#2a3a4a',
    fontSize: '14px'
  },
  required: {
    color: '#dc3545'
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
  hint: {
    fontSize: '12px',
    color: '#8a9aaa',
    marginTop: '4px',
    marginLeft: '4px'
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
  footer: {
    marginTop: '24px',
    textAlign: 'center'
  },
  loginLink: {
    color: '#0077be',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'color 0.3s'
  },
  terms: {
    fontSize: '12px',
    color: '#8a9aaa',
    marginTop: '12px',
    lineHeight: '1.5'
  },
  success: {
    background: '#d4edda',
    color: '#155724',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '14px',
    textAlign: 'center',
    border: '1px solid #c3e6cb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
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
  }
};

export default Register;