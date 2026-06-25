// src/components/auth/TechnicianRegister.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

const TechnicianRegister = ({ onSwitchToLogin }) => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    specialization: '',
    experience: '',
    certifications: '',
    address: '',
    availability: 'available',
    about: ''
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
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email');
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

    if (!formData.phone) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    // Phone number validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    const cleanedPhone = formData.phone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    if (!formData.specialization) {
      setError('Please enter your specialization');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/technician/apply', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: cleanedPhone,
        specialization: formData.specialization,
        experience: formData.experience || '',
        certifications: formData.certifications || '',
        address: formData.address || '',
        availability: formData.availability,
        about: formData.about || '',
        status: 'pending'
      });

      console.log('Technician application response:', res.data);

      if (res.data.success) {
        setSuccess(true);
        setSuccessMessage('✅ Application submitted successfully! You will be notified once your application is approved.');
        setError('');
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          specialization: '',
          experience: '',
          certifications: '',
          address: '',
          availability: 'available',
          about: ''
        });
        setTimeout(() => {
          onSwitchToLogin();
        }, 4000);
      } else {
        setError(res.data.message || 'Application failed. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting technician application:', err);
      setError(err.response?.data?.message || 'Application failed. Please try again.');
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
        
        <h2 style={styles.title}>Apply as Technician</h2>
        <p style={styles.subtitle}>Join our team of professional AC repair experts</p>
        
        {/* Info Banner */}
        <div style={styles.infoBanner}>
          <i className="fas fa-info-circle" style={styles.infoIcon}></i>
          <span>Your application will be reviewed by an admin. You'll be notified once approved.</span>
        </div>
        
        {success && (
          <div style={styles.success}>
            <i className="fas fa-check-circle"></i> {successMessage}
          </div>
        )}
        
        {error && <div style={styles.error}>❌ {error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formRow}>
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
          </div>

          <div style={styles.formRow}>
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
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Specialization <span style={styles.required}>*</span></label>
              <div style={styles.inputWrapper}>
                <i className="fas fa-tools" style={styles.inputIcon}></i>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g., AC Repair, HVAC"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>
          </div>

          <div style={styles.formRow}>
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
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Years of Experience</label>
            <div style={styles.inputWrapper}>
              <i className="fas fa-clock" style={styles.inputIcon}></i>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g., 5 years, 2+ years"
                disabled={loading || success}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Certifications</label>
            <div style={styles.inputWrapper}>
              <i className="fas fa-certificate" style={styles.inputIcon}></i>
              <input
                type="text"
                name="certifications"
                value={formData.certifications}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g., EPA Certified, HVAC Certification"
                disabled={loading || success}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Address</label>
            <div style={styles.inputWrapper}>
              <i className="fas fa-map-marker-alt" style={styles.inputIcon}></i>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter your address"
                disabled={loading || success}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Availability</label>
            <div style={styles.inputWrapper}>
              <i className="fas fa-calendar-check" style={styles.inputIcon}></i>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                style={styles.select}
                disabled={loading || success}
              >
                <option value="available">Available</option>
                <option value="part-time">Part Time</option>
                <option value="full-time">Full Time</option>
                <option value="on-call">On Call</option>
                <option value="not-available">Not Available</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>About Yourself</label>
            <div style={styles.textareaWrapper}>
              <i className="fas fa-user-edit" style={styles.textareaIcon}></i>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                style={styles.textarea}
                placeholder="Tell us about your experience and skills..."
                rows="4"
                disabled={loading || success}
              />
            </div>
          </div>
          
          <div style={styles.roleInfo}>
            <span style={styles.roleBadge}>🔧 Technician Application</span>
            <p style={styles.roleText}>Your application will be reviewed by an admin before approval.</p>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || success} 
            style={styles.button}
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
            ) : (
              <><i className="fas fa-paper-plane"></i> Submit Application</>
            )}
          </button>
        </form>
        
        <div style={styles.divider}>
          <span style={styles.dividerText}>Already have an account?</span>
        </div>
        
        <button 
          onClick={onSwitchToLogin} 
          style={styles.loginButton}
          disabled={loading || success}
        >
          Sign In Instead
        </button>
        
        <div style={styles.footer}>
          <p style={styles.terms}>
            By submitting this application, you agree to our Terms of Service and Privacy Policy
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
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
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
    marginBottom: '24px'
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#856404'
  },
  infoIcon: {
    fontSize: '16px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  formGroup: {
    marginBottom: '15px'
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
  select: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '2px solid #e9edf2',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    outline: 'none',
    background: '#f8fafc',
    appearance: 'none'
  },
  textareaWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start'
  },
  textareaIcon: {
    position: 'absolute',
    left: '12px',
    top: '12px',
    color: '#8a9aaa',
    fontSize: '14px'
  },
  textarea: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '2px solid #e9edf2',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    outline: 'none',
    background: '#f8fafc',
    minHeight: '80px'
  },
  roleInfo: {
    background: '#f8f9fa',
    padding: '14px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '2px dashed #0077be'
  },
  roleBadge: {
    display: 'inline-block',
    background: '#0077be',
    color: 'white',
    padding: '4px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  roleText: {
    fontSize: '13px',
    color: '#555',
    margin: '5px 0 0 0'
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
  loginButton: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    color: '#0077be',
    border: '2px solid #0077be',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '0'
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
    gap: '8px',
    flexDirection: 'column'
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

export default TechnicianRegister;