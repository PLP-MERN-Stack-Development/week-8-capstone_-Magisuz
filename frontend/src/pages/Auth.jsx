import React, { useState, useEffect } from 'react';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="scroll-to-top-button"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!isLogin && !form.name) {
      setError('Please enter your name.');
      return;
    }
    if (!form.email || !form.password || (!isLogin && !form.confirmPassword)) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!isLogin && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (isLogin) {
      // Login logic: call backend
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Login failed.');
        } else {
          // Store user role in localStorage
          localStorage.setItem('userRole', data.user.role);
          localStorage.setItem('userEmail', data.user.email);
          setForm({ email: '', password: '', confirmPassword: '' });
          if (onAuthSuccess) onAuthSuccess(data.user);
        }
      } catch (err) {
        setError('Network error. Please try again.');
      }
    } else {
      // Signup logic: call backend
      try {
        const res = await fetch(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Signup failed.');
        } else {
          setSuccess('Signup successful! Please log in.');
          setForm({ name: '', email: '', password: '', confirmPassword: '' });
          setTimeout(() => {
            setIsLogin(true);
            setSuccess('');
          }, 1200);
        }
      } catch (err) {
        setError('Network error. Please try again.');
      }
    }
  };

  return (
    <div className="auth-main-bg">
      <div className="login-welcome-section">
        <h1 className="login-title">Welcome to the Archives Management System</h1>
        <p className="login-desc">
          Securely manage, track, and search all archived files and their movements. Designed for efficiency, transparency, and ease of use for the Judiciary and its staff.
        </p>
      </div>
      <div className="auth-card">
        <h2 className="auth-card-title">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-form-group">
              <label className="auth-label">Name:</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>
          )}
          <div className="auth-form-group">
            <label className="auth-label">Email:</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">Password:</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </div>
          {!isLogin && (
            <div className="auth-form-group">
              <label className="auth-label">Confirm Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>
          )}
          {error && <div className="auth-error-message">{error}</div>}
          {success && <div className="auth-success-message">{success}</div>}
          <div className="auth-actions">
            <button type="submit" className="auth-btn auth-btn-primary">
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
            {isLogin && (
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                className="auth-btn auth-btn-secondary"
              >
                Not registered? Sign Up
              </button>
            )}
            {!isLogin && (
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                className="auth-btn auth-btn-secondary"
              >
                Back to Login
              </button>
            )}
          </div>
        </form>
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default Auth; 