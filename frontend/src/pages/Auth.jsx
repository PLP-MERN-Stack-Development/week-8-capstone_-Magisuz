import React, { useState, useEffect } from 'react';

const mainBg = {
  minHeight: '100vh',
  minWidth: '100vw',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#ecfccb', // lime background
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 0,
};

const cardStyle = {
  width: 400,
  maxWidth: '95vw',
  padding: 32,
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 4px 24px rgba(80, 112, 255, 0.10)',
  border: '1px solid #e0e7ff',
  margin: '0 auto',
  boxSizing: 'border-box',
};

const inputStyle = {
  width: '100%',
  padding: 12,
  marginTop: 8,
  borderRadius: 6,
  border: '1px solid #b6c2ff',
  fontSize: 18,
  fontWeight: 400,
  color: '#111',
  background: '#f8fafc',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontWeight: 400,
  fontSize: 18,
  color: '#14532d',
  marginBottom: 4,
  display: 'block',
  background: '#fff',
  padding: '2px 6px',
  borderRadius: 4,
  letterSpacing: 0.2,
};

const buttonStyle = {
  width: '100%',
  padding: 12,
  background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontWeight: 600,
  fontSize: 16,
  marginTop: 8,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(80, 112, 255, 0.10)',
  transition: 'background 0.2s',
};

const toggleStyle = {
  background: 'none',
  border: 'none',
  color: '#4f46e5',
  cursor: 'pointer',
  fontWeight: 500,
  marginTop: 8,
  fontSize: 15,
};

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
      style={{
        position: 'fixed',
        right: 32,
        bottom: 80,
        zIndex: 100,
        background: '#38a169',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: 48,
        height: 48,
        fontSize: 28,
        fontWeight: 700,
        boxShadow: '0 2px 8px #bbf7d0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.email || !form.password || (!isLogin && !form.confirmPassword)) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!isLogin && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (isLogin) {
      // Placeholder: handle login logic here
      setForm({ email: '', password: '', confirmPassword: '' });
      if (onAuthSuccess) onAuthSuccess();
    } else {
      // Signup logic: call backend
      try {
        const res = await fetch(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Signup failed.');
        } else {
          setSuccess('Signup successful! Please log in.');
          setForm({ email: '', password: '', confirmPassword: '' });
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
    <div style={mainBg}>
      <div style={{ width: '100vw', background: '#bef264', color: '#22543d', textAlign: 'center', fontWeight: 900, fontSize: 22, letterSpacing: 1, padding: '10px 0', boxShadow: '0 2px 8px #bbf7d0', zIndex: 20 }}>
        The Judiciary
      </div>
      <h1 style={{ fontWeight: 800, fontSize: 32, marginBottom: 32, color: '#312e81', letterSpacing: 1, textShadow: '0 2px 8px #e0e7ff', display: 'flex', alignItems: 'center', gap: 10 }}>
        Archives Management System
      </h1>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', color: '#4f46e5', fontWeight: 700, marginBottom: 24 }}>
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Email:</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Password:</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          {!isLogin && (
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Confirm Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          )}
          {error && <div style={{ color: '#dc2626', marginBottom: 14, fontWeight: 500 }}>{error}</div>}
          {success && <div style={{ color: '#059669', marginBottom: 14, fontWeight: 500 }}>{success}</div>}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
            <button type="submit" style={buttonStyle}>
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
            {isLogin && (
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                style={{ background: '#bbf7d0', color: '#22543d', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
              >
                Not registered? Sign Up
              </button>
            )}
            {!isLogin && (
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                style={{ background: '#bbf7d0', color: '#22543d', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
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