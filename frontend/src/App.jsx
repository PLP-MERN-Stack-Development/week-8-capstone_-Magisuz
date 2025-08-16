import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import Auth from './pages/Auth';

// Theme Context
const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Footer component
function Footer() {
  const currentYear = new Date().getFullYear();
  const { isDarkMode } = useTheme();
  
  return (
    <footer className={`footer ${isDarkMode ? 'dark' : ''}`}>
      <div className="footer-content">
        <div className="footer-section">
          <h4 className="footer-title">Archives Management System</h4>
          <p className="footer-description">
            Efficiently manage, track, and search all archived files and their movements.
          </p>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/dashboard" className="footer-link">Dashboard</Link></li>
            <li><Link to="/files" className="footer-link">Files</Link></li>
            <li><Link to="/movements" className="footer-link">Movements</Link></li>
            <li><Link to="/search" className="footer-link">Search</Link></li>
            <li><Link to="/help" className="footer-link">Help</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-title">Contact</h4>
          <ul className="footer-links">
            <li><span className="footer-info">Email: ictsupport@court.go.ke</span></li>
            <li><span className="footer-info">Phone: 0730181040</span></li>
            <li><span className="footer-info">Hours: Mon-Fri 8AM-5PM</span></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <span>&copy; {currentYear} Archives Management System. All rights reserved.</span>
          <div className="footer-bottom-links">
            <Link to="/privacy-policy" className="footer-bottom-link">Privacy Policy</Link>
            <Link to="/terms-of-service" className="footer-bottom-link">Terms of Service</Link>
            <Link to="/help" className="footer-bottom-link">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const { isDarkMode } = useTheme();
  
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
      className={`scroll-to-top-button ${isDarkMode ? 'dark' : ''}`}
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}

// Layout wrapper for all pages
function Layout({ children, showNav, onLogout, userRole }) {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`app-layout ${isDarkMode ? 'dark' : ''}`}>
      <header className={`app-header ${isDarkMode ? 'dark' : ''}`}>
        The Judiciary - Archives Management System
      </header>
      {showNav && <NavBar onLogout={onLogout} userRole={userRole} />}
      <main className={`app-main ${isDarkMode ? 'dark' : ''}`}>
        {children}
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

function NavBar({ onLogout, userRole }) {
  const [showProfile, setShowProfile] = useState(false);
  const [userName, setUserName] = useState('');
  const { isDarkMode, toggleTheme } = useTheme();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const email = localStorage.getItem('userEmail');

  useEffect(() => {
    if (email) {
      fetch(`${API_URL}/auth/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
        .then(res => res.json())
        .then(data => {
          if (!data.error && data.name) {
            setUserName(data.name);
          }
        })
        .catch(() => {
          // Silently fail, user name will just be empty
        });
    }
  }, [email, API_URL]);

  return (
    <nav className={`navbar ${isDarkMode ? 'dark' : ''}`}>
      <div className="navbar-left">
        <span className="navbar-title">Archives</span>
        <Link to="/dashboard" className="navbar-link">Dashboard</Link>
        <Link to="/files" className="navbar-link">Files</Link>
        <Link to="/movements" className="navbar-link">Movements</Link>
        <Link to="/search" className="navbar-link">Search</Link>
      </div>
      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
        {userName && (
          <span className="navbar-user-name" style={{ color: '#a3e635', fontWeight: '500' }}>
            Welcome, {userName} ({userRole})
          </span>
        )}
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-button" 
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <button onClick={() => setShowProfile(true)} className="navbar-profile-button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5em' }} title="Profile">
          <span role="img" aria-label="Profile">👤</span>
        </button>
        <button onClick={onLogout} className="navbar-logout-button">Logout</button>
      </div>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} userRole={userRole} />}
    </nav>
  );
}

function ProfileModal({ onClose, userRole }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changeMsg, setChangeMsg] = useState('');
  const [changing, setChanging] = useState(false); // loading state for password change
  
  // User management states
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [addingUser, setAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  
  const { isDarkMode } = useTheme();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const email = localStorage.getItem('userEmail');
  


  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/auth/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setProfile(data);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load profile.'); setLoading(false); });
  }, [email]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangeMsg('');
    setError('');
    setChanging(true);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setChangeMsg('Password changed successfully.');
        setOldPassword('');
        setNewPassword('');
      } else {
        setError(data.error || 'Failed to change password.');
      }
    } catch {
      setError('Failed to change password.');
    }
    setChanging(false);
  };

  const isChangeDisabled = changing || !oldPassword || !newPassword || newPassword.length < 6;

  // User management functions
  const fetchUsers = async () => {
    if (userRole !== 'admin') {
      setUserError('User is not admin');
      return;
    }
    setLoadingUsers(true);
    setUserError('');
    try {
      const url = `${API_URL}/auth/users`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        const errorMsg = data.error || 'Failed to fetch users';
        setUserError(errorMsg);
      }
    } catch (err) {
      const errorMsg = `Network error while fetching users: ${err.message}`;
      setUserError(errorMsg);
    }
    setLoadingUsers(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    setUserError('');
    setUserSuccess('');
    
    if (!newUser.name || !newUser.email || !newUser.password) {
      setUserError('Please fill in all fields');
      setAddingUser(false);
      return;
    }
    
    if (newUser.password.length < 6) {
      setUserError('Password must be at least 6 characters');
      setAddingUser(false);
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (res.ok) {
        setUserSuccess('User added successfully');
        setNewUser({ name: '', email: '', password: '', role: 'user' });
        fetchUsers(); // Refresh user list
      } else {
        setUserError(data.error || 'Failed to add user');
      }
    } catch (err) {
      setUserError('Network error while adding user');
    }
    setAddingUser(false);
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    setUserError('');
    setUserSuccess('');
    try {
      const res = await fetch(`${API_URL}/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserSuccess('User role updated successfully');
        fetchUsers(); // Refresh user list
      } else {
        setUserError(data.error || 'Failed to update user role');
      }
    } catch (err) {
      setUserError('Network error while updating user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    setUserError('');
    setUserSuccess('');
    try {
      const res = await fetch(`${API_URL}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': email // Pass current user's email to prevent self-deletion
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUserSuccess('User deleted successfully');
        fetchUsers(); // Refresh user list
      } else {
        setUserError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setUserError('Network error while deleting user');
    }
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${isDarkMode ? 'dark' : ''}`} style={{ 
        minWidth: 400, 
        maxWidth: '90vw', 
        maxHeight: '90vh', 
        overflowY: 'auto'
      }}>
        <h3 className="modal-title">User Profile</h3>
        <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px' }}>
          <strong>Debug Info:</strong> Current user role: {userRole} | Is Admin: {userRole === 'admin' ? 'Yes' : 'No'}
        </div>
        {loading ? <div>Loading...</div> : error && !profile ? <div style={{ color: 'red', marginBottom: 8 }}>{error}</div> : profile && (
          <>
            <div className="profile-section">
              <div className="profile-section-title">Personal Information</div>
              <div className="profile-item"><b>Name:</b> {profile.name}</div>
              <div className="profile-item"><b>Email:</b> {profile.email}</div>
              <div className="profile-item"><b>Account Created:</b> {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}</div>
            </div>
            
            <div className="profile-section">
              <div className="profile-section-title">Access & Permissions</div>
              <div className="profile-item"><b>Current Role:</b> {userRole}</div>
              <div className="profile-item"><b>Permissions:</b> {userRole === 'admin' ? 'Full Access (Admin)' : 'View Access (User)'}</div>
              <div className="profile-item"><b>Session Status:</b> <span style={{ color: '#38a169' }}>Active</span></div>
            </div>
            
            <div className="profile-section">
              <div className="profile-section-title">Activity Information</div>
              <div className="profile-item">
                <b>Last Login:</b> {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never'}
              </div>
              <div className="profile-item">
                <b>Total Logins:</b> {profile.loginCount || 0}
              </div>
            </div>
            
            <form onSubmit={handleChangePassword} style={{ marginTop: '1em' }}>
              <div><b>Change Password</b></div>
              <div style={{ marginBottom: '0.5em' }}>
                <input type="password" placeholder="Old password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} style={{ width: '100%' }} disabled={changing} className="form-input" />
              </div>
              <div style={{ marginBottom: '0.5em' }}>
                <input type="password" placeholder="New password (min 6 chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%' }} disabled={changing} className="form-input" />
              </div>
              <button type="submit" className="primary-button" disabled={isChangeDisabled} style={{ width: '100%', opacity: isChangeDisabled ? 0.7 : 1 }}>
                {changing ? 'Changing...' : 'Change Password'}
              </button>
              {changeMsg && <div style={{ color: 'green', marginTop: '0.5em', textAlign: 'center' }}>{changeMsg}</div>}
              {error && profile && <div style={{ color: 'red', marginTop: '0.5em', textAlign: 'center' }}>{error}</div>}
              {!error && !changeMsg && newPassword && newPassword.length > 0 && newPassword.length < 6 && (
                <div style={{ color: 'orange', marginTop: '0.5em', textAlign: 'center' }}>Password must be at least 6 characters.</div>
              )}
            </form>
            
                          {/* User Management Section for Admins */}
              <div style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#e0f0ff', borderRadius: '4px', fontSize: '12px' }}>
                <strong>User Management Debug:</strong> userRole={userRole}, showUserManagement={showUserManagement.toString()}, users.length={users.length}
              </div>
              {userRole === 'admin' && (
              <div className="profile-section user-management-section">
                <div className="profile-section-title user-management-toggle">
                  <span>User Management</span>
                                    <button
                    type="button" 
                    onClick={() => {
                      setShowUserManagement(!showUserManagement);
                      if (!showUserManagement) {
                        fetchUsers();
                      }
                    }}
                    className="secondary-button"
                  >
                    {showUserManagement ? 'Hide' : 'Show'} User Management
                  </button>
                </div>
                
                {showUserManagement && (
                  <div>
                    {/* Add New User Form */}
                    <div className="add-user-form">
                      <h4>Add New User</h4>
                      <form onSubmit={handleAddUser}>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={newUser.name}
                          onChange={e => setNewUser({...newUser, name: e.target.value})}
                          className="form-input"
                        />
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={newUser.email}
                          onChange={e => setNewUser({...newUser, email: e.target.value})}
                          className="form-input"
                        />
                        <input
                          type="password"
                          placeholder="Password (min 6 chars)"
                          value={newUser.password}
                          onChange={e => setNewUser({...newUser, password: e.target.value})}
                          className="form-input"
                        />
                        <select
                          value={newUser.role}
                          onChange={e => setNewUser({...newUser, role: e.target.value})}
                          className="form-input"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button 
                          type="submit" 
                          className="primary-button" 
                          disabled={addingUser}
                        >
                          {addingUser ? 'Adding...' : 'Add User'}
                        </button>
                      </form>
                    </div>
                    
                    {/* User List */}
                    <div>
                      <h4>Manage Users</h4>
                      {loadingUsers ? (
                        <div style={{ textAlign: 'center', padding: '1em' }}>Loading users...</div>
                      ) : (
                        <div className="user-list">
                          {users.map(user => (
                            <div key={user._id} className="user-item">
                              <div className="user-info">
                                <div className="user-name">{user.name}</div>
                                <div className="user-email">{user.email}</div>
                                <div className={`user-role ${user.role}`}>
                                  Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </div>
                              </div>
                              <div className="user-actions">
                                <select
                                  value={user.role}
                                  onChange={e => handleUpdateUserRole(user._id, e.target.value)}
                                  className="role-select"
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="delete-user-btn"
                                  title="Delete User"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* User Management Messages */}
                    {userError && (
                      <div className="user-message error">
                        {userError}
                      </div>
                    )}
                    {userSuccess && (
                      <div className="user-message success">
                        {userSuccess}
                      </div>
                    )}
                    {/* Debug Messages */}
                    <div style={{ padding: '10px', marginTop: '10px', backgroundColor: '#fff0e0', borderRadius: '4px', fontSize: '12px' }}>
                      <strong>Debug Messages:</strong><br/>
                      userError: {userError || 'None'}<br/>
                      userSuccess: {userSuccess || 'None'}<br/>
                      loadingUsers: {loadingUsers.toString()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        <button onClick={onClose} className="primary-button" style={{ marginTop: '1em' }} disabled={changing}>Close</button>
      </div>
    </div>
  );
}

function Search({ files }) {
  const [searchType, setSearchType] = useState('case');
  const [form, setForm] = useState({
    partyName: '',
    caseCode: '',
    caseNumber: '',
    caseYear: '',
    status: '',
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewFile, setViewFile] = useState(null);
  const [showHistory, setShowHistory] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const [error, setError] = useState('');
  const { isDarkMode } = useTheme();

  const caseCodes = ['CR', 'TR', 'SO', 'CC', 'MCCHCC'];
  const caseYears = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

  const handleTypeChange = (e) => {
    setSearchType(e.target.value);
    setForm({ partyName: '', caseCode: '', caseNumber: '', caseYear: '', status: '' });
    setResults([]);
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    let params = new URLSearchParams();
    if (searchType === 'case') {
      if (form.caseCode) params.append('caseCode', form.caseCode);
      if (form.caseNumber) params.append('caseNumber', form.caseNumber);
      if (form.caseYear) params.append('caseYear', form.caseYear);
    } else if (searchType === 'party') {
      if (form.partyName) params.append('partyName', form.partyName);
    } else if (searchType === 'status') {
      if (form.status) params.append('status', form.status);
    }
    const url = `${API_URL}/files/search?${params.toString()}`;
    try {
      console.log('Fetching:', url);
      const res = await fetch(url);
      if (!res.ok) {
        setError('Server error: ' + res.status);
        setResults([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      console.log('Response:', data);
      setResults(data);
      if (Array.isArray(data) && data.length === 0) {
        setError('No results found.');
      }
    } catch (err) {
      setError('Network or server error: ' + err.message);
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <section className={`search-section ${isDarkMode ? 'dark' : ''}`}>
      <h2 className={`search-title ${isDarkMode ? 'dark' : ''}`}>Search Archives</h2>
      <form className={`search-form ${isDarkMode ? 'dark' : ''}`} onSubmit={handleSearch} style={{ marginBottom: '2em' }}>
        <div className={`search-type-radios ${isDarkMode ? 'dark' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '900px', margin: '0 auto 1.5em auto' }}>
          <label className={isDarkMode ? 'dark' : ''} style={{ flex: 1, textAlign: 'center', fontWeight: 600, padding: '0.5em 0' }}><input type="radio" name="searchType" value="case" checked={searchType === 'case'} onChange={handleTypeChange} /> Search by Case Details</label>
          <label className={isDarkMode ? 'dark' : ''} style={{ flex: 1, textAlign: 'center', fontWeight: 600, padding: '0.5em 0' }}><input type="radio" name="searchType" value="party" checked={searchType === 'party'} onChange={handleTypeChange} /> Search by Name of Party</label>
          <label className={isDarkMode ? 'dark' : ''} style={{ flex: 1, textAlign: 'center', fontWeight: 600, padding: '0.5em 0' }}><input type="radio" name="searchType" value="status" checked={searchType === 'status'} onChange={handleTypeChange} /> Search by Status</label>
        </div>
        {searchType === 'case' && (
          <div className={`search-fields search-fields-case ${isDarkMode ? 'dark' : ''}`} style={{ display: 'flex', gap: '1em', alignItems: 'center', justifyContent: 'center', marginBottom: '1em' }}>
            <select
              name="caseCode"
              value={form.caseCode}
              onChange={handleInputChange}
              className={`search-input search-input-large ${isDarkMode ? 'dark' : ''}`}
              style={{ width: '140px' }}
            >
              <option value="">Case Code</option>
              {caseCodes.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
            <input
              type="text"
              name="caseNumber"
              placeholder="Case Number"
              value={form.caseNumber}
              onChange={handleInputChange}
              className={`search-input search-input-large ${isDarkMode ? 'dark' : ''}`}
              style={{ width: '180px' }}
            />
            <select
              name="caseYear"
              value={form.caseYear}
              onChange={handleInputChange}
              className={`search-input search-input-large ${isDarkMode ? 'dark' : ''}`}
              style={{ width: '140px' }}
            >
              <option value="">Case Year</option>
              {caseYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}
        {searchType === 'party' && (
          <div className={`search-fields search-fields-party ${isDarkMode ? 'dark' : ''}`} style={{ display: 'flex', gap: '1em', alignItems: 'center', justifyContent: 'center', marginBottom: '1em' }}>
            <input
              type="text"
              name="partyName"
              placeholder="Name of Party"
              value={form.partyName}
              onChange={handleInputChange}
              className={`search-input search-input-large ${isDarkMode ? 'dark' : ''}`}
              style={{ width: '400px', fontSize: '1.2em', height: '2.5em' }}
            />
          </div>
        )}
        {searchType === 'status' && (
          <div className={`search-fields search-fields-status ${isDarkMode ? 'dark' : ''}`} style={{ display: 'flex', gap: '1em', alignItems: 'center', justifyContent: 'center', marginBottom: '1em' }}>
            <select
              name="status"
              value={form.status}
              onChange={handleInputChange}
              className={`search-input search-input-large ${isDarkMode ? 'dark' : ''}`}
              style={{ width: '220px', fontSize: '1.1em', height: '2.5em' }}
            >
              <option value="">Select status</option>
              <option value="archived">Archived</option>
              <option value="retrieved">Retrieved</option>
              <option value="destroyed">Destroyed</option>
            </select>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="submit" className="primary-button" style={{ marginTop: '0.5em', fontSize: '1.1em', padding: '0.7em 2em' }}>Search</button>
        </div>
      </form>
      {error && (
        <div style={{ color: 'red', textAlign: 'center', marginBottom: '1em' }}>{error}</div>
      )}
      <div className={`search-results-container ${isDarkMode ? 'dark' : ''}`}>
        {loading ? (
          <div className={`search-results-message ${isDarkMode ? 'dark' : ''}`}>Loading...</div>
        ) : results.length > 0 ? (
          <div className="files-table-container">
            <table className="files-table">
              <thead>
                <tr className="table-header">
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Name of Party</th>
                  <th className="table-header-cell">Case Code</th>
                  <th className="table-header-cell">Case Number</th>
                  <th className="table-header-cell">Case Year</th>
                  <th className="table-header-cell">Date of Last Activity</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Coming From</th>
                  <th className="table-header-cell">Destination</th>
                  <th className="table-header-cell">Reason for Movement</th>
                  <th className="table-header-cell">Storage Location</th>
                  <th className="table-header-cell">Current Location</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map(file => (
                  <tr key={file._id} className="table-row">
                    <td className="table-cell">{file.date}</td>
                    <td className="table-cell">{file.partyName}</td>
                    <td className="table-cell">{file.caseCode}</td>
                    <td className="table-cell">{file.caseNumber}</td>
                    <td className="table-cell">{file.caseYear}</td>
                    <td className="table-cell">{file.lastActivity}</td>
                    <td className="table-cell" style={{ color: file.status === 'archived' ? '#166534' : file.status === 'retrieved' ? '#b45309' : '#dc2626', fontWeight: 600 }}>{file.status.charAt(0).toUpperCase() + file.status.slice(1)}</td>
                    <td className="table-cell">{file.comingFrom}</td>
                    <td className="table-cell">{file.destination}</td>
                    <td className="table-cell">{file.reason}</td>
                    <td className="table-cell">{file.storageLocation}</td>
                    <td className="table-cell">{file.currentLocation || ''}</td>
                    <td className="table-cell">
                      <button type="button" onClick={() => setViewFile(file)} className="secondary-button button-tooltip" tabIndex="0">
                        <span role="img" aria-label="View">👁️</span>
                        <span className="tooltip-text">View file details</span>
                      </button>
                      <button type="button" onClick={() => {
                        console.log('View movement history button clicked for file:', file);
                        setShowHistory(file);
                      }} className="secondary-button button-tooltip" tabIndex="0">
                        <span role="img" aria-label="History">📜</span>
                        <span className="tooltip-text">View movement history</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {showHistory && <MovementHistoryModal file={showHistory} onClose={() => setShowHistory(null)} />}
          </div>
        ) : (
          <div className={`search-results-message ${isDarkMode ? 'dark' : ''}`}>{results.length === 0 ? 'No results found.' : 'Search results will appear here.'}</div>
        )}
        {viewFile && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">File Details</h3>
              <div className="file-detail-item"><b>Date:</b> {viewFile.date}</div>
              <div className="file-detail-item"><b>Name of Party:</b> {viewFile.partyName}</div>
              <div className="file-detail-item"><b>Case Code:</b> {viewFile.caseCode}</div>
              <div className="file-detail-item"><b>Case Number:</b> {viewFile.caseNumber}</div>
              <div className="file-detail-item"><b>Case Year:</b> {viewFile.caseYear}</div>
              <div className="file-detail-item"><b>Date of Last Activity:</b> {viewFile.lastActivity}</div>
              <div className="file-detail-item"><b>Status:</b> {viewFile.status.charAt(0).toUpperCase() + viewFile.status.slice(1)}</div>
              <div className="file-detail-item"><b>Coming From:</b> {viewFile.comingFrom}</div>
              <div className="file-detail-item"><b>Destination:</b> {viewFile.destination}</div>
              <div className="file-detail-item"><b>Reason for Movement:</b> {viewFile.reason}</div>
              <div className="file-detail-item"><b>Storage Location:</b> {viewFile.storageLocation}</div>
              <button onClick={() => setViewFile(null)} className="primary-button">Close</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Dashboard({ files }) {
  // Deduplicate files by caseCode, caseNumber, and caseYear
  const uniqueFiles = Array.from(
    new Map(
      files.map(f => [`${f.caseCode}|${f.caseNumber}|${f.caseYear}`, f])
    ).values()
  );
  const stats = {
    totalFiles: uniqueFiles.length,
    totalMovements: 0,
    recent: [
      { action: 'registered', file: 'File A', time: '2 mins ago' },
      { action: 'retrieved', file: 'File B', time: '10 mins ago' },
      { action: 'destroyed', file: 'File C', time: '1 hour ago' },
    ],
  };
  const { isDarkMode } = useTheme();
  
  return (
    <section className={`dashboard-section ${isDarkMode ? 'dark' : ''}`}>
      <h2 className={`dashboard-title ${isDarkMode ? 'dark' : ''}`}>Dashboard</h2>
      <p className={`dashboard-welcome-message ${isDarkMode ? 'dark' : ''}`}>
        Welcome to the Archives Management System. Here you can manage, track, and search all archived files and their movements efficiently.
      </p>
      <div className={`dashboard-stats-grid ${isDarkMode ? 'dark' : ''}`}>
        <div className={`dashboard-stat-card ${isDarkMode ? 'dark' : ''}`}>
          <div className={`stat-title ${isDarkMode ? 'dark' : ''}`}>Total Files</div>
          <div className={`stat-value ${isDarkMode ? 'dark' : ''}`}>{stats.totalFiles}</div>
        </div>
        <div className={`dashboard-stat-card ${isDarkMode ? 'dark' : ''}`}>
          <div className={`stat-title ${isDarkMode ? 'dark' : ''}`}>Total Movements</div>
          <div className={`stat-value ${isDarkMode ? 'dark' : ''}`}>{stats.totalMovements}</div>
        </div>
      </div>
      <div className={`recent-activity-section ${isDarkMode ? 'dark' : ''}`}>
        <h3 className={`recent-activity-title ${isDarkMode ? 'dark' : ''}`}>Recent Activity</h3>
        <ul className={`recent-activity-list ${isDarkMode ? 'dark' : ''}`}>
          {stats.recent.map((item, idx) => (
            <li key={idx} className={`recent-activity-item ${isDarkMode ? 'dark' : ''}`}>
              <b>{item.action.charAt(0).toUpperCase() + item.action.slice(1)}</b> - {item.file} <span className={`activity-time ${isDarkMode ? 'dark' : ''}`}>({item.time})</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function MovementHistoryModal({ file, onClose }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!file) return;
    console.log('MovementHistoryModal: Fetching movements for file:', file._id);
    setLoading(true);
    fetch(`${API_URL}/movements/file/${file._id}`)
      .then(res => {
        console.log('MovementHistoryModal: Response status:', res.status);
        return res.json();
      })
      .then(data => { 
        console.log('MovementHistoryModal: Received data:', data);
        setMovements(data); 
        setLoading(false); 
      })
      .catch((error) => { 
        console.error('MovementHistoryModal: Error fetching movements:', error);
        setMovements([]); 
        setLoading(false); 
      });
  }, [file]);

  if (!file) {
    console.log('MovementHistoryModal: No file provided, returning null');
    return null;
  }
  
  console.log('MovementHistoryModal: Rendering modal for file:', file._id, 'movements:', movements, 'loading:', loading);
  
  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className={`modal-content ${isDarkMode ? 'dark' : ''}`} onClick={(e) => e.stopPropagation()} style={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', color: isDarkMode ? '#f1f5f9' : '#1e293b', padding: '32px', borderRadius: '16px', minWidth: '320px', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', position: 'relative' }}>
        <h3 className={`modal-title ${isDarkMode ? 'dark' : ''}`} style={{ color: isDarkMode ? '#ffffff' : '#1e293b', marginBottom: '20px', borderBottom: `2px solid ${isDarkMode ? '#2563eb' : '#38a169'}`, paddingBottom: '10px' }}>Movement History</h3>
        {loading ? (
          <div className={isDarkMode ? 'dark' : ''} style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', textAlign: 'center', padding: '1rem' }}>Loading...</div>
        ) : (
          <ul className={`movement-history-list ${isDarkMode ? 'dark' : ''}`} style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '400px', overflowY: 'auto' }}>
            {movements.length === 0 && <li className={isDarkMode ? 'dark' : ''} style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', padding: '0.75rem 0' }}>No movements found.</li>}
            {movements.map((m, idx) => (
              <li key={m._id || idx} className={`movement-history-item ${isDarkMode ? 'dark' : ''}`} style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', padding: '0.75rem 0', borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, fontSize: '0.9rem', lineHeight: '1.4' }}>
                <b style={{ color: isDarkMode ? '#ffffff' : '#1e293b', fontWeight: '600' }}>{m.action}</b> - {m.details} <span className="activity-time" style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>({new Date(m.timestamp).toLocaleString()})</span>
              </li>
            ))}
          </ul>
        )}
        <button onClick={onClose} className="primary-button" style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: isDarkMode ? '#2563eb' : '#38a169', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>Close</button>
      </div>
    </div>
  );
}

function MovementForm({ files, setFiles, refreshFiles, refreshMovements }) {
  const caseCodes = ['CR', 'TR', 'SO', 'CC', 'MCCHCC'];
  const [form, setForm] = useState({
    date: '',
    requester: '',
    caseCode: '',
    caseNumber: '',
    caseYear: '',
    partyName: '',
    comingFrom: 'Archives',
    destination: '',
    reason: '',
  });
  const [formError, setFormError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const { isDarkMode } = useTheme();

  // Auto-populate partyName when caseNumber and caseYear are entered
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };
    if ((name === 'caseNumber' || name === 'caseYear' || name === 'caseCode') && updatedForm.caseNumber && updatedForm.caseYear && updatedForm.caseCode) {
      // Find file by caseCode, caseNumber and caseYear
      const match = files.find(f => f.caseCode === updatedForm.caseCode && f.caseNumber === updatedForm.caseNumber && f.caseYear === updatedForm.caseYear);
      updatedForm.partyName = match ? match.partyName : '';
    }
    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.date || !form.requester || !form.caseCode || !form.caseNumber || !form.caseYear || !form.partyName || !form.comingFrom || !form.destination || !form.reason) {
      setFormError('Please fill in all fields.');
      return;
    }
    // Find the file by caseCode, caseNumber, and caseYear
    const match = files.find(f => f.caseCode === form.caseCode && f.caseNumber === form.caseNumber && f.caseYear === form.caseYear);
    if (!match) {
      setFormError('No file found for the given Case Code, Case Number, and Case Year.');
      return;
    }
    if (!match._id || typeof match._id !== 'string' || match._id.length < 10) {
      setFormError('This file is not valid for movement. Please use a file registered in the system.');
      return;
    }
    try {
      // Log movement
      const res = await fetch(`${API_URL}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: match._id,
          action: 'moved',
          details: `Requested by: ${form.requester}. Reason: ${form.reason}`,
          destination: form.destination,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || 'Failed to save movement.');
        return;
      }
      // If movement is to Archives, update file status to 'archived'. If to Registry, update to 'retrieved'.
      let newStatus = match.status;
      let updateFields = { ...match };
      if (form.destination === 'Archives') {
        newStatus = 'archived';
        updateFields.lastActivity = form.date; // Update lastActivity to movement date
      } else if (form.destination === 'Registry') {
        newStatus = 'retrieved';
      }
      updateFields.currentLocation = form.destination; // Always update currentLocation to destination
      // Update file status if changed or lastActivity/currentLocation updated
      if (newStatus !== match.status || updateFields.lastActivity !== match.lastActivity || updateFields.currentLocation !== match.currentLocation) {
        await fetch(`${API_URL}/files/${match._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-user-role': 'admin' },
          body: JSON.stringify({ ...updateFields, status: newStatus }),
        });
      }
      // Fetch updated files from backend
      if (refreshFiles) await refreshFiles();
      if (refreshMovements) await refreshMovements();
      alert('Movement saved!');
      setForm({ date: '', requester: '', caseCode: '', caseNumber: '', caseYear: '', partyName: '', comingFrom: 'Archives', destination: '', reason: '' });
    } catch (err) {
      setFormError('Network error.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`movement-form ${isDarkMode ? 'dark' : ''}`}>
      <h3 className={`movement-form-title ${isDarkMode ? 'dark' : ''}`}>Log File Movement</h3>
      <div className="form-grid">
        <div>
          <label className="form-label">Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} className="form-input" />
        </div>
        <div>
          <label className="form-label">Name of Requester</label>
          <input type="text" name="requester" value={form.requester} onChange={handleChange} className="form-input" />
        </div>
        <div>
          <label className="form-label">Case Code</label>
          <select name="caseCode" value={form.caseCode} onChange={handleChange} className="form-input">
            <option value="">Select code</option>
            {caseCodes.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Case Number</label>
          <input type="text" name="caseNumber" value={form.caseNumber} onChange={handleChange} className="form-input" />
        </div>
        <div>
          <label className="form-label">Case Year</label>
          <select name="caseYear" value={form.caseYear} onChange={handleChange} className="form-input">
            <option value="">Select year</option>
            {[2019,2020,2021,2022,2023,2024,2025].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Name of Party</label>
          <input type="text" name="partyName" value={form.partyName} readOnly className="form-input form-input-readonly" />
        </div>
        <div>
          <label className="form-label">Coming From</label>
          <select name="comingFrom" value={form.comingFrom} onChange={handleChange} className="form-input">
            <option value="">Select source</option>
            <option value="Registry">Registry</option>
            <option value="Archives">Archives</option>
          </select>
        </div>
        <div>
          <label className="form-label">Destination</label>
          <select name="destination" value={form.destination} onChange={handleChange} className="form-input">
            <option value="">Select destination</option>
            <option value="Archives">Archives</option>
            <option value="Registry">Registry</option>
            <option value="Executive Office">Executive Office</option>
            <option value="Typing pool">Typing pool</option>
            <option value="Civil Registry">Civil Registry</option>
            <option value="Traffic Registry">Traffic Registry</option>
            <option value="Criminal Registry">Criminal Registry</option>
            <option value="Accounts Office">Accounts Office</option>
            <option value="Chambers">Chambers</option>
          </select>
        </div>
        <div className="form-grid-span-2">
          <label className="form-label">Reason for Movement</label>
          <input type="text" name="reason" value={form.reason} onChange={handleChange} className="form-input" />
        </div>
      </div>
      {formError && <div className="form-error-message">{formError}</div>}
      <div className="form-actions">
        <button type="submit" className="primary-button">Save</button>
      </div>
    </form>
  );
}

function Files({ files, setFiles, userRole }) {
  // Deduplicate files by caseCode, caseNumber, and caseYear
  const uniqueFiles = Array.from(
    new Map(
      files.map(f => [`${f.caseCode}|${f.caseNumber}|${f.caseYear}`, f])
    ).values()
  );
  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(uniqueFiles.length / pageSize);
  const paginatedFiles = uniqueFiles.slice((page - 1) * pageSize, page * pageSize);
  // Local state for files and form modal
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: '',
    partyName: '',
    caseCode: '',
    caseNumber: '',
    caseYear: '',
    lastActivity: '',
    status: '',
    comingFrom: '',
    destination: '',
    reason: '',
    storageLocation: '',
  });
  const [formError, setFormError] = useState('');
  const [viewFile, setViewFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showHistory, setShowHistory] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const { isDarkMode } = useTheme();

  // Helper to refresh files from backend
  const refreshFiles = async () => {
    const res = await fetch(`${API_URL}/files`);
    const data = await res.json();
    setFiles(data);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Register or Edit file
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    // Check for duplicate caseCode, caseNumber, and caseYear
    const duplicate = files.find(f =>
      f.caseCode === form.caseCode &&
      f.caseNumber === form.caseNumber &&
      f.caseYear === form.caseYear &&
      (!editId || f._id !== editId)
    );
    if (duplicate) {
      setFormError('A file with the same Case Code, Case Number, and Case Year already exists.');
      return;
    }
    if (!form.date || !form.partyName || !form.caseCode || !form.caseNumber || !form.caseYear || !form.lastActivity || !form.status || !form.comingFrom || !form.destination || !form.reason || !form.storageLocation) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (editId) {
      // Edit file (admin only)
      if (userRole !== 'admin') return;
      try {
        const res = await fetch(`${API_URL}/files/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': userRole,
          },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const data = await res.json();
          setFormError(data.error || 'Failed to update file.');
          return;
        }
        await refreshFiles();
        setEditId(null);
        setShowForm(false);
        setForm({ date: '', partyName: '', caseCode: '', caseNumber: '', caseYear: '', lastActivity: '', status: '', comingFrom: '', destination: '', reason: '', storageLocation: '' });
      } catch (err) {
        setFormError('Network error.');
      }
    } else {
      // Register new file (admin only)
      if (userRole !== 'admin') return;
      try {
        const res = await fetch(`${API_URL}/files`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': userRole,
          },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const data = await res.json();
          setFormError(data.error || 'Failed to register file.');
          return;
        }
        await refreshFiles();
        setShowForm(false);
        setForm({ date: '', partyName: '', caseCode: '', caseNumber: '', caseYear: '', lastActivity: '', status: '', comingFrom: '', destination: '', reason: '', storageLocation: '' });
      } catch (err) {
        setFormError('Network error.');
      }
    }
  };

  // Edit handler
  const handleEdit = (file) => {
    setForm({ ...file });
    setEditId(file._id); // Use _id
    setShowForm(true);
  };

  // Delete handler (now 'destroy' handler)
  const handleDestroy = async (file) => {
    if (userRole !== 'admin') return;
    if (!window.confirm('Are you sure you want to mark this file as destroyed?')) return;
    try {
      // Update file status to 'destroyed'
      const res = await fetch(`${API_URL}/files/${file._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
        },
        body: JSON.stringify({ ...file, status: 'destroyed' }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to update file status.');
        return;
      }
      // Log movement as 'destroyed'
      await fetch(`${API_URL}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: file._id,
          action: 'destroyed',
          details: `File marked as destroyed by admin`,
        }),
      });
      await refreshFiles();
    } catch (err) {
      alert('Network error.');
    }
  };

  return (
    <section className={`files-section ${isDarkMode ? 'dark' : ''}`}>
      <div className={`files-header ${isDarkMode ? 'dark' : ''}`}>
        <h2 className={`files-title ${isDarkMode ? 'dark' : ''}`}>Files</h2>
        {userRole === 'admin' && (
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ date: '', partyName: '', caseCode: '', caseNumber: '', caseYear: '', lastActivity: '', status: '', comingFrom: '', destination: '', reason: '', storageLocation: '' }); }} className="primary-button">
            Register New File
          </button>
        )}
      </div>
      {userRole !== 'admin' && (
        <div className={`view-only-message ${isDarkMode ? 'dark' : ''}`}>
          You have view-only access. Please contact an admin for file changes.
        </div>
      )}
      {showForm && userRole === 'admin' && (
        <div className={`form-modal ${isDarkMode ? 'dark' : ''}`}>
          <h3 className={`form-modal-title ${isDarkMode ? 'dark' : ''}`}>{editId ? 'Edit File' : 'Register File'}</h3>
          <form onSubmit={handleFormSubmit}>
            <div className="form-grid">
              <div>
                <label className="form-label">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleFormChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Name of Party</label>
                <input type="text" name="partyName" value={form.partyName} onChange={handleFormChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Case Code</label>
                <select name="caseCode" value={form.caseCode} onChange={handleFormChange} className="form-input">
                  <option value="">Select code</option>
                  <option value="CR">CR</option>
                  <option value="TR">TR</option>
                  <option value="SO">SO</option>
                  <option value="CC">CC</option>
                  <option value="MCCHCC">MCCHCC</option>
                </select>
              </div>
              <div>
                <label className="form-label">Case Number</label>
                <input type="text" name="caseNumber" value={form.caseNumber} onChange={handleFormChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Case Year</label>
                <select name="caseYear" value={form.caseYear} onChange={handleFormChange} className="form-input">
                  <option value="">Select year</option>
                  {[2019,2020,2021,2022,2023,2024,2025].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Date of Last Activity</label>
                <input type="date" name="lastActivity" value={form.lastActivity} onChange={handleFormChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select name="status" value={form.status} onChange={handleFormChange} className="form-input">
                  <option value="">Select status</option>
                  <option value="archived">Archived</option>
                  <option value="retrieved">Retrieved</option>
                  <option value="destroyed">Destroyed</option>
                </select>
              </div>
              <div>
                <label className="form-label">Coming From</label>
                <select name="comingFrom" value={form.comingFrom} onChange={handleFormChange} className="form-input">
                  <option value="">Select source</option>
                  <option value="Registry">Registry</option>
                  <option value="Dept A">Dept A</option>
                  <option value="Dept B">Dept B</option>
                  <option value="Dept C">Dept C</option>
                </select>
              </div>
              <div>
                <label className="form-label">Destination</label>
                <select name="destination" value={form.destination} onChange={handleFormChange} className="form-input">
                  <option value="">Select destination</option>
                  <option value="Archives">Archives</option>
                  <option value="Dept A">Dept A</option>
                  <option value="Dept B">Dept B</option>
                  <option value="Dept C">Dept C</option>
                </select>
              </div>
              <div className="form-grid-span-2">
                <label className="form-label">Reason for Movement</label>
                <select name="reason" value={form.reason} onChange={handleFormChange} className="form-input">
                  <option value="">Select reason</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Review">Review</option>
                  <option value="Concluded">Concluded</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-grid-span-2">
                <label className="form-label">Storage Location</label>
                <select name="storageLocation" value={form.storageLocation} onChange={handleFormChange} className="form-input">
                  <option value="">Select shelf</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={i+1} value={`Shelf ${i+1}`}>{`Shelf ${i+1}`}</option>
                  ))}
                </select>
              </div>
            </div>
            {formError && <div className="form-error-message">{formError}</div>}
            <div className="form-actions">
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm({ date: '', partyName: '', caseCode: '', caseNumber: '', caseYear: '', lastActivity: '', status: '', comingFrom: '', destination: '', reason: '', storageLocation: '' }); }} className="secondary-button">Cancel</button>
              <button type="submit" className="primary-button">{editId ? 'Update' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
      {/* View File Modal */}
      {viewFile && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">File Details</h3>
            <div className="file-detail-item"><b>Date:</b> {viewFile.date}</div>
            <div className="file-detail-item"><b>Name of Party:</b> {viewFile.partyName}</div>
            <div className="file-detail-item"><b>Case Code:</b> {viewFile.caseCode}</div>
            <div className="file-detail-item"><b>Case Number:</b> {viewFile.caseNumber}</div>
            <div className="file-detail-item"><b>Case Year:</b> {viewFile.caseYear}</div>
            <div className="file-detail-item"><b>Date of Last Activity:</b> {viewFile.lastActivity}</div>
            <div className="file-detail-item"><b>Status:</b> {viewFile.status.charAt(0).toUpperCase() + viewFile.status.slice(1)}</div>
            <div className="file-detail-item"><b>Coming From:</b> {viewFile.comingFrom}</div>
            <div className="file-detail-item"><b>Destination:</b> {viewFile.destination}</div>
            <div className="file-detail-item"><b>Reason for Movement:</b> {viewFile.reason}</div>
            <div className="file-detail-item"><b>Storage Location:</b> {viewFile.storageLocation}</div>
            <button onClick={() => setViewFile(null)} className="primary-button">Close</button>
          </div>
        </div>
      )}
      <div className="files-table-container">
        <table className="files-table">
          <thead>
            <tr className="table-header">
              <th className="table-header-cell">Date</th>
              <th className="table-header-cell">Name of Party</th>
              <th className="table-header-cell">Case Code</th>
              <th className="table-header-cell">Case Number</th>
              <th className="table-header-cell">Case Year</th>
              <th className="table-header-cell">Date of Last Activity</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Coming From</th>
              <th className="table-header-cell">Destination</th>
              <th className="table-header-cell">Reason for Movement</th>
              <th className="table-header-cell">Storage Location</th>
              <th className="table-header-cell">Current Location</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFiles.map(file => (
              <tr key={file._id} className="table-row">
                <td className="table-cell">{file.date}</td>
                <td className="table-cell">{file.partyName}</td>
                <td className="table-cell">{file.caseCode}</td>
                <td className="table-cell">{file.caseNumber}</td>
                <td className="table-cell">{file.caseYear}</td>
                <td className="table-cell">{file.lastActivity}</td>
                <td className="table-cell" style={{ color: file.status === 'archived' ? '#166534' : file.status === 'retrieved' ? '#b45309' : '#dc2626', fontWeight: 600 }}>{file.status.charAt(0).toUpperCase() + file.status.slice(1)}</td>
                <td className="table-cell">{file.comingFrom}</td>
                <td className="table-cell">{file.destination}</td>
                <td className="table-cell">{file.reason}</td>
                <td className="table-cell">{file.storageLocation}</td>
                <td className="table-cell">{file.currentLocation || ''}</td>
                <td className="table-cell">
                  <button type="button" onClick={() => setViewFile(file)} className="secondary-button button-tooltip" tabIndex="0">
                    <span role="img" aria-label="View">👁️</span>
                    <span className="tooltip-text">View file details</span>
                  </button>
                  <button type="button" onClick={() => {
                    console.log('View movement history button clicked for file:', file);
                    setShowHistory(file);
                  }} className="secondary-button button-tooltip" tabIndex="0">
                    <span role="img" aria-label="History">📜</span>
                    <span className="tooltip-text">View movement history</span>
                  </button>
                  {userRole === 'admin' && (
                    <>
                      {file.status !== 'destroyed' && (
                        <button type="button" onClick={() => handleEdit(file)} className="primary-button button-tooltip" tabIndex="0">
                          <span role="img" aria-label="Edit">✏️</span>
                          <span className="tooltip-text">Edit file</span>
                        </button>
                      )}
                      <button type="button" onClick={() => handleDestroy(file)} className="danger-button button-tooltip" tabIndex="0">
                        <span role="img" aria-label="Destroy">🗑️</span>
                        <span className="tooltip-text">Mark as destroyed</span>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1em', marginTop: '1em' }}>
            <button
              className="secondary-button"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              className="secondary-button"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
        {showHistory && <MovementHistoryModal file={showHistory} onClose={() => setShowHistory(null)} />}
      </div>
    </section>
  );
}

function Movements({ files, setFiles, refreshFiles }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const { isDarkMode } = useTheme();

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/movements`);
      const data = await res.json();
      setMovements(data);
    } catch {
      setMovements([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const totalPages = Math.ceil(movements.length / pageSize);
  const paginatedMovements = movements.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className={`movements-section ${isDarkMode ? 'dark' : ''}`}>
      <h2 className={isDarkMode ? 'dark' : ''}>Movements</h2>
      <MovementForm files={files} setFiles={setFiles} refreshFiles={refreshFiles} refreshMovements={fetchMovements} />
      <h3 className={isDarkMode ? 'dark' : ''} style={{ marginTop: '2em' }}>File Movement Records</h3>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="files-table-container">
          <table className="files-table">
            <thead>
              <tr className="table-header">
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell">Party Name</th>
                <th className="table-header-cell">Case Code</th>
                <th className="table-header-cell">Case Number</th>
                <th className="table-header-cell">Case Year</th>
                <th className="table-header-cell">Action</th>
                <th className="table-header-cell">Details</th>
                <th className="table-header-cell">Destination</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMovements.map(mv => (
                <tr key={mv._id} className="table-row">
                  <td className="table-cell">{mv.timestamp ? new Date(mv.timestamp).toLocaleString() : ''}</td>
                  <td className="table-cell">{mv.file?.partyName || ''}</td>
                  <td className="table-cell">{mv.file?.caseCode || ''}</td>
                  <td className="table-cell">{mv.file?.caseNumber || ''}</td>
                  <td className="table-cell">{mv.file?.caseYear || ''}</td>
                  <td className="table-cell">{mv.action}</td>
                  <td className="table-cell">{mv.details}</td>
                  <td className="table-cell">{mv.destination || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1em', marginTop: '1em' }}>
              <button
                className="secondary-button"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                className="secondary-button"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Help() {
  const { isDarkMode } = useTheme();
  
  return (
    <section className={`help-section ${isDarkMode ? 'dark' : ''}`}>
      <div className={`help-container ${isDarkMode ? 'dark' : ''}`}>
        <h2 className={`help-title ${isDarkMode ? 'dark' : ''}`}>Help & Contact Information</h2>
        
        <div className={`help-content ${isDarkMode ? 'dark' : ''}`}>
          <div className={`help-section-card ${isDarkMode ? 'dark' : ''}`}>
            <h3 className={`help-section-title ${isDarkMode ? 'dark' : ''}`}>Contact Us</h3>
            <div className={`contact-info ${isDarkMode ? 'dark' : ''}`}>
              <div className={`contact-item ${isDarkMode ? 'dark' : ''}`}>
                <strong className={isDarkMode ? 'dark' : ''}>Email:</strong>
                <span className={isDarkMode ? 'dark' : ''}>ictsupport@court.go.ke</span>
              </div>
              <div className={`contact-item ${isDarkMode ? 'dark' : ''}`}>
                <strong className={isDarkMode ? 'dark' : ''}>Phone:</strong>
                <span className={isDarkMode ? 'dark' : ''}>0730181040</span>
              </div>
              <div className={`contact-item ${isDarkMode ? 'dark' : ''}`}>
                <strong className={isDarkMode ? 'dark' : ''}>Business Hours:</strong>
                <span className={isDarkMode ? 'dark' : ''}>Monday - Friday, 8:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>

          <div className={`help-section-card ${isDarkMode ? 'dark' : ''}`}>
            <h3 className={`help-section-title ${isDarkMode ? 'dark' : ''}`}>System Features</h3>
            <div className={`features-list ${isDarkMode ? 'dark' : ''}`}>
              <div className={`feature-item ${isDarkMode ? 'dark' : ''}`}>
                <strong className={isDarkMode ? 'dark' : ''}>Dashboard:</strong>
                <span className={isDarkMode ? 'dark' : ''}>View system overview and recent activities</span>
              </div>
              <div className={`feature-item ${isDarkMode ? 'dark' : ''}`}>
                <strong className={isDarkMode ? 'dark' : ''}>Files:</strong>
                <span className={isDarkMode ? 'dark' : ''}>Register, view, and manage archived files</span>
              </div>
              <div className={`feature-item ${isDarkMode ? 'dark' : ''}`}>
                <strong className={isDarkMode ? 'dark' : ''}>Movements:</strong>
                <span className={isDarkMode ? 'dark' : ''}>Track file movements and transfers</span>
              </div>
              <div className={`feature-item ${isDarkMode ? 'dark' : ''}`}>
                <strong className={isDarkMode ? 'dark' : ''}>Search:</strong>
                <span className={isDarkMode ? 'dark' : ''}>Search files by case details, party names, or status</span>
              </div>
            </div>
          </div>

          <div className={`help-section-card ${isDarkMode ? 'dark' : ''}`}>
            <h3 className={`help-section-title ${isDarkMode ? 'dark' : ''}`}>Getting Started</h3>
            <div className={`getting-started ${isDarkMode ? 'dark' : ''}`}>
              <p>Welcome to the Archives Management System. This system helps you efficiently manage, track, and search all archived files and their movements.</p>
              <p>Use the navigation menu above to access different sections of the system. If you need assistance, please contact our support team using the information provided.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacyPolicy() {
  return (
    <section className="help-section">
      <div className="help-container">
        <h2 className="help-title">Privacy Policy</h2>
        
        <div className="help-content">
          <div className="help-section-card">
            <h3 className="help-section-title">Information We Collect</h3>
            <div className="policy-content">
              <p>We collect information that you provide directly to us, such as when you create an account, register files, or contact our support team. This may include:</p>
              <ul>
                <li>Personal identification information (name, email address, phone number)</li>
                <li>Professional information (role, department, access permissions)</li>
                <li>System usage data and activity logs</li>
                <li>File and document information that you upload or manage</li>
              </ul>
            </div>
          </div>

          <div className="help-section-card">
            <h3 className="help-section-title">How We Use Your Information</h3>
            <div className="policy-content">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process and manage file registrations and movements</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Ensure system security and prevent fraud</li>
              </ul>
            </div>
          </div>

          <div className="help-section-card">
            <h3 className="help-section-title">Information Sharing</h3>
            <div className="policy-content">
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:</p>
              <ul>
                <li>To comply with legal obligations or court orders</li>
                <li>To protect the rights, property, or safety of our organization</li>
                <li>With your explicit consent for specific purposes</li>
                <li>To authorized government agencies as required by law</li>
              </ul>
            </div>
          </div>

          <div className="help-section-card">
            <h3 className="help-section-title">Data Security</h3>
            <div className="policy-content">
              <p>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection practices</li>
              </ul>
            </div>
          </div>

          <div className="help-section-card">
            <h3 className="help-section-title">Your Rights</h3>
            <div className="policy-content">
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information that we hold</li>
                <li>Request correction of inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to processing of your personal information</li>
                <li>Request restriction of processing</li>
                <li>Data portability (receive your data in a structured format)</li>
              </ul>
            </div>
          </div>

          <div className="help-section-card">
            <h3 className="help-section-title">Contact Us</h3>
            <div className="policy-content">
              <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
              <div className="contact-info">
                <div className="contact-item">
                  <strong>Email:</strong>
                  <span>ictsupport@court.go.ke</span>
                </div>
                <div className="contact-item">
                  <strong>Phone:</strong>
                  <span>0730181040</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TermsOfService() {
  return (
    <section className="help-section">
      <div className="help-container">
        <h2 className="help-title">Terms of Service</h2>
        
        <div className="help-content">
          <div className="help-section-card">
            <h3 className="help-section-title">Acceptance of Terms</h3>
            <div className="policy-content">
              <p>By accessing and using the Archives Management System, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </div>
          </div>

          <div className="help-section-card">
            <h3 className="help-section-title">Use License</h3>
            <div className="policy-content">
              <p>Permission is granted to temporarily access the Archives Management System for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul>
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained in the system</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </div>
          </div>

          <div className="help-section-card">
            <h3 className="help-section-title">User Responsibilities</h3>
            <div className="policy-content">
              <p>As a user of the Archives Management System, you are responsible for:</p>
              <ul>
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring the accuracy and completeness of information you provide</li>
                <li>Complying with all applicable laws and regulations</li>
                <li>Not using the system for any unlawful or unauthorized purpose</li>
                <li>Reporting any security concerns or suspicious activities</li>
              </ul>
            </div>
          </div>

          <div className="help-section-card">
            <h3 className="help-section-title">System Availability</h3>
            <div className="policy-content">
              <p>We strive to maintain high system availability, but we do not guarantee that the service will be uninterrupted or error-free. We may:</p>
              <ul>
                <li>Perform scheduled maintenance that may temporarily affect service availability</li>
                <li>Update or modify the system features and functionality</li>
                <li>Suspend or terminate service in case of security threats or violations</li>
                <li>Implement changes to improve system performance and security</li>
              </ul>
            </div>
          </div>

          <div className="help-section-card">
            <h3 className="help-section-title">Limitation of Liability</h3>
            <div className="policy-content">
              <p>In no event shall the Archives Management System or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the system, even if we have been notified orally or in writing of the possibility of such damage.</p>
            </div>
          </div>

          <div className="help-section-card">
            <h3 className="help-section-title">Governing Law</h3>
            <div className="policy-content">
              <p>These terms and conditions are governed by and construed in accordance with the laws of Kenya and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
            </div>
          </div>

          <div className="help-section-card">
            <h3 className="help-section-title">Changes to Terms</h3>
            <div className="policy-content">
              <p>We reserve the right to modify these terms of service at any time. We will notify users of any material changes by posting the new terms on this page. Your continued use of the service after such modifications constitutes acceptance of the updated terms.</p>
            </div>
          </div>

          <div className="help-section-card">
            <h3 className="help-section-title">Contact Information</h3>
            <div className="policy-content">
              <p>For questions about these Terms of Service, please contact us:</p>
              <div className="contact-info">
                <div className="contact-item">
                  <strong>Email:</strong>
                  <span>ictsupport@court.go.ke</span>
                </div>
                <div className="contact-item">
                  <strong>Phone:</strong>
                  <span>0730181040</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('userRole'));
  const [files, setFiles] = useState([]); // Start with empty array
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'user');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch files from backend on load or refresh
  const refreshFiles = async () => {
    const res = await fetch(`${API_URL}/files`);
    const data = await res.json();
    setFiles(data);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshFiles();
  }, [isAuthenticated]);

  // Synchronized inactivity logout across tabs
  useEffect(() => {
    if (!isAuthenticated) return;
    const INACTIVITY_LIMIT = 600000; // 10 minutes
    let timer;
    // Update lastActivity in localStorage on any activity
    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };
    // Listen for activity in this tab
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, updateActivity));
    // Listen for activity in other tabs
    const checkActivity = () => {
      const last = parseInt(localStorage.getItem('lastActivity'), 10);
      if (isNaN(last)) return;
      const now = Date.now();
      if (now - last > INACTIVITY_LIMIT) {
        setIsAuthenticated(false);
        setUserRole('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        navigate('/');
        alert('You have been logged out due to inactivity.');
      } else {
        clearTimeout(timer);
        timer = setTimeout(checkActivity, INACTIVITY_LIMIT - (now - last));
      }
    };
    // Listen for storage changes (activity in other tabs)
    const onStorage = (e) => {
      if (e.key === 'lastActivity') checkActivity();
    };
    window.addEventListener('storage', onStorage);
    // Start timer
    updateActivity();
    checkActivity();
    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, updateActivity));
      window.removeEventListener('storage', onStorage);
    };
  }, [isAuthenticated, navigate]);

  const handleAuthSuccess = (user) => {
    setIsAuthenticated(true);
    setUserRole(user.role);
    setUserEmail(user.email);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userEmail', user.email);
    navigate('/dashboard');
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('user');
    setUserEmail('');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('lastActivity');
    navigate('/');
  };

  return (
    <>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Layout showNav={false} userRole={userRole}><Auth onAuthSuccess={handleAuthSuccess} /></Layout>} />
        <Route path="/dashboard" element={isAuthenticated ? <Layout showNav={true} onLogout={handleLogout} userRole={userRole}><Dashboard files={files} /></Layout> : <Navigate to="/" />} />
        <Route path="/files" element={isAuthenticated ? <Layout showNav={true} onLogout={handleLogout} userRole={userRole}><Files files={files} setFiles={setFiles} userRole={userRole} /></Layout> : <Navigate to="/" />} />
        <Route path="/movements" element={isAuthenticated ? <Layout showNav={true} onLogout={handleLogout} userRole={userRole}><Movements files={files} setFiles={setFiles} refreshFiles={refreshFiles} /></Layout> : <Navigate to="/" />} />
        <Route path="/search" element={isAuthenticated ? <Layout showNav={true} onLogout={handleLogout} userRole={userRole}><Search files={files} /></Layout> : <Navigate to="/" />} />
        <Route path="/help" element={isAuthenticated ? <Layout showNav={true} onLogout={handleLogout} userRole={userRole}><Help /></Layout> : <Navigate to="/" />} />
        <Route path="/privacy-policy" element={isAuthenticated ? <Layout showNav={true} onLogout={handleLogout} userRole={userRole}><PrivacyPolicy /></Layout> : <Navigate to="/" />} />
        <Route path="/terms-of-service" element={isAuthenticated ? <Layout showNav={true} onLogout={handleLogout} userRole={userRole}><TermsOfService /></Layout> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
