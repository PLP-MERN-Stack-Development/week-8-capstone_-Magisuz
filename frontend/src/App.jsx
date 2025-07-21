import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Auth from './pages/Auth';

// Footer component
function Footer() {
  return (
    <footer className="footer">
      &copy; {new Date().getFullYear()} Archives Management System
    </footer>
  );
}

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

// Layout wrapper for all pages
function Layout({ children, showNav, onLogout }) {
  return (
    <div className="app-layout">
      <header className="app-header">
        The Judiciary
      </header>
      {showNav && <NavBar onLogout={onLogout} />}
      <main className="app-main">
        {children}
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

function NavBar({ onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-title">Archives</span>
        <Link to="/dashboard" className="navbar-link">Dashboard</Link>
        <Link to="/files" className="navbar-link">Files</Link>
        <Link to="/movements" className="navbar-link">Movements</Link>
        <Link to="/search" className="navbar-link">Search</Link>
      </div>
      <button onClick={onLogout} className="navbar-logout-button">Logout</button>
    </nav>
  );
}

function Search() {
  return (
    <section className="search-section">
      <h2 className="search-title">Search Archives</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by file name, description, or keyword..."
          className="search-input"
        />
        <div className="search-results-message">
          Search results will appear here.
        </div>
      </div>
    </section>
  );
}

function Dashboard({ files }) {
  const stats = {
    totalFiles: files.length,
    totalMovements: 0,
    recent: [
      { action: 'registered', file: 'File A', time: '2 mins ago' },
      { action: 'retrieved', file: 'File B', time: '10 mins ago' },
      { action: 'destroyed', file: 'File C', time: '1 hour ago' },
    ],
  };
  return (
    <section className="dashboard-section">
      <h2 className="dashboard-title">Dashboard</h2>
      <p className="dashboard-welcome-message">
        Welcome to the Archives Management System. Here you can manage, track, and search all archived files and their movements efficiently.
      </p>
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <div className="stat-title">Total Files</div>
          <div className="stat-value">{stats.totalFiles}</div>
        </div>
        <div className="dashboard-stat-card">
          <div className="stat-title">Total Movements</div>
          <div className="stat-value">{stats.totalMovements}</div>
        </div>
      </div>
      <div className="recent-activity-section">
        <h3 className="recent-activity-title">Recent Activity</h3>
        <ul className="recent-activity-list">
          {stats.recent.map((item, idx) => (
            <li key={idx} className="recent-activity-item">
              <b>{item.action.charAt(0).toUpperCase() + item.action.slice(1)}</b> - {item.file} <span className="activity-time">({item.time})</span>
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

  useEffect(() => {
    if (!file) return;
    setLoading(true);
    fetch(`${API_URL}/movements/file/${file._id}`)
      .then(res => res.json())
      .then(data => { setMovements(data); setLoading(false); })
      .catch(() => { setMovements([]); setLoading(false); });
  }, [file]);

  if (!file) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Movement History</h3>
        {loading ? <div>Loading...</div> : (
          <ul className="movement-history-list">
            {movements.length === 0 && <li>No movements found.</li>}
            {movements.map((m, idx) => (
              <li key={m._id || idx} className="movement-history-item">
                <b>{m.action}</b> - {m.details} <span className="activity-time">({new Date(m.timestamp).toLocaleString()})</span>
              </li>
            ))}
          </ul>
        )}
        <button onClick={onClose} className="modal-close-button">Close</button>
      </div>
    </div>
  );
}

function MovementForm({ files, setFiles, refreshFiles }) {
  const [form, setForm] = useState({
    date: '',
    requester: '',
    caseNumber: '',
    caseYear: '',
    partyName: '',
    comingFrom: 'Archives',
    destination: '',
    reason: '',
  });
  const [formError, setFormError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Auto-populate partyName when caseNumber and caseYear are entered
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };
    if ((name === 'caseNumber' || name === 'caseYear') && updatedForm.caseNumber && updatedForm.caseYear) {
      // Find file by caseNumber and caseYear
      const match = files.find(f => f.caseNumber === updatedForm.caseNumber && f.caseYear === updatedForm.caseYear);
      updatedForm.partyName = match ? match.partyName : '';
    }
    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.date || !form.requester || !form.caseNumber || !form.caseYear || !form.partyName || !form.comingFrom || !form.destination || !form.reason) {
      setFormError('Please fill in all fields.');
      return;
    }
    // Find the file by caseNumber and caseYear
    const match = files.find(f => f.caseNumber === form.caseNumber && f.caseYear === form.caseYear);
    if (!match) {
      setFormError('No file found for the given Case Number and Case Year.');
      return;
    }
    if (!match._id || typeof match._id !== 'string' || match._id.length < 10) {
      setFormError('This file is not valid for movement. Please use a file registered in the system.');
      return;
    }
    try {
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
      // Fetch updated files from backend
      if (refreshFiles) await refreshFiles();
      alert('Movement saved!');
      setForm({ date: '', requester: '', caseNumber: '', caseYear: '', partyName: '', comingFrom: 'Archives', destination: '', reason: '' });
    } catch (err) {
      setFormError('Network error.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="movement-form">
      <h3 className="movement-form-title">Log File Movement</h3>
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
            <option value="Archives">Archives</option>
          </select>
        </div>
        <div>
          <label className="form-label">Destination</label>
          <select name="destination" value={form.destination} onChange={handleChange} className="form-input">
            <option value="">Select destination</option>
            <option value="Registry">Registry</option>
            <option value="Executive office">Executive office</option>
            <option value="Typing pool">Typing pool</option>
            <option value="Court">Court</option>
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

  // Delete handler
  const handleDelete = async (file) => {
    if (userRole !== 'admin') return;
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      const res = await fetch(`${API_URL}/files/${file._id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': userRole },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to delete file.');
        return;
      }
      await refreshFiles();
    } catch (err) {
      alert('Network error.');
    }
  };

  return (
    <section className="files-section">
      <div className="files-header">
        <h2 className="files-title">Files</h2>
        {userRole === 'admin' && (
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ date: '', partyName: '', caseCode: '', caseNumber: '', caseYear: '', lastActivity: '', status: '', comingFrom: '', destination: '', reason: '', storageLocation: '' }); }} className="primary-button">
            Register New File
          </button>
        )}
      </div>
      {userRole !== 'admin' && (
        <div className="view-only-message">
          You have view-only access. Please contact an admin for file changes.
        </div>
      )}
      {showForm && userRole === 'admin' && (
        <div className="form-modal">
          <h3 className="form-modal-title">{editId ? 'Edit File' : 'Register File'}</h3>
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
            {files.map(file => (
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
                  <button onClick={() => setViewFile(file)} className="secondary-button">View</button>
                  <button onClick={() => setShowHistory(file)} className="secondary-button">History</button>
                  {userRole === 'admin' && (
                    <>
                      <button onClick={() => handleEdit(file)} className="primary-button">Edit</button>
                      <button onClick={() => handleDelete(file)} className="secondary-button">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showHistory && <MovementHistoryModal file={showHistory} onClose={() => setShowHistory(null)} />}
      </div>
    </section>
  );
}

function Movements({ files, setFiles, refreshFiles }) {
  return <section className="movements-section"><h2>Movements</h2><MovementForm files={files} setFiles={setFiles} refreshFiles={refreshFiles} /></section>;
}

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState([]); // Start with empty array
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'user');
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

  // Auto-logout after 10 minutes of inactivity
  useEffect(() => {
    if (!isAuthenticated) return;
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsAuthenticated(false);
        setUserRole('user');
        localStorage.removeItem('userRole');
        navigate('/');
        alert('You have been logged out due to inactivity.');
      }, 600000); // 10 minutes
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated, navigate]);

  const handleAuthSuccess = (user) => {
    setIsAuthenticated(true);
    setUserRole(user.role);
    navigate('/dashboard');
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('user');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Layout showNav={false}><Auth onAuthSuccess={handleAuthSuccess} /></Layout>} />
        <Route path="/dashboard" element={isAuthenticated ? <Layout showNav={true} onLogout={handleLogout}><Dashboard files={files} /></Layout> : <Navigate to="/" />} />
        <Route path="/files" element={isAuthenticated ? <Layout showNav={true} onLogout={handleLogout}><Files files={files} setFiles={setFiles} userRole={userRole} /></Layout> : <Navigate to="/" />} />
        <Route path="/movements" element={isAuthenticated ? <Layout showNav={true} onLogout={handleLogout}><Movements files={files} setFiles={setFiles} refreshFiles={refreshFiles} /></Layout> : <Navigate to="/" />} />
        <Route path="/search" element={isAuthenticated ? <Layout showNav={true} onLogout={handleLogout}><Search /></Layout> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
