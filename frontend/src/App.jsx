import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Auth from './pages/Auth';

// Footer component
function Footer() {
  return (
    <footer style={{
      width: '100%',
      background: '#f1f5f9',
      color: '#64748b',
      textAlign: 'center',
      padding: '18px 0 12px 0',
      fontWeight: 500,
      fontSize: 15,
      position: 'fixed',
      left: 0,
      bottom: 0,
      zIndex: 10,
    }}>
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

// Layout wrapper for all pages
function Layout({ children, showNav, onLogout }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100vw', boxSizing: 'border-box', background: '#ecfccb' }}>
      <div style={{ width: '100vw', background: '#bef264', color: '#22543d', textAlign: 'center', fontWeight: 900, fontSize: 22, letterSpacing: 1, padding: '10px 0', boxShadow: '0 2px 8px #bbf7d0', zIndex: 20 }}>
        The Judiciary
      </div>
      {showNav && <NavBar onLogout={onLogout} />}
      <main style={{ flex: 1, width: '100%', margin: 0, padding: '32px 40px 60px 40px', boxSizing: 'border-box' }}>{children}</main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

function NavBar({ onLogout }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', background: '#22543d', color: '#fff', padding: '16px 40px', fontWeight: 600, fontSize: 17, width: '100vw', justifyContent: 'space-between', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: 1 }}>Archives</span>
        <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/files" style={{ color: '#fff', textDecoration: 'none' }}>Files</Link>
        <Link to="/movements" style={{ color: '#fff', textDecoration: 'none' }}>Movements</Link>
        <Link to="/search" style={{ color: '#fff', textDecoration: 'none' }}>Search</Link>
      </div>
      <button onClick={onLogout} style={{ background: '#38a169', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
    </nav>
  );
}

function Search() {
  return (
    <div style={{ padding: 0, width: '100%' }}>
      <h2 style={{ color: '#22543d', fontWeight: 700, margin: '32px 0 24px 0', paddingLeft: 0 }}>Search Archives</h2>
      <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 24, maxWidth: 600, margin: '0 auto' }}>
        <input
          type="text"
          placeholder="Search by file name, description, or keyword..."
          style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #a7f3d0', fontSize: 17, marginBottom: 20, background: '#fff', color: '#22543d' }}
        />
        <div style={{ color: '#64748b', fontWeight: 500, textAlign: 'center' }}>
          Search results will appear here.
        </div>
      </div>
    </div>
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
    <div style={{ padding: 0, width: '100%' }}>
      <h2 style={{ color: '#22543d', fontWeight: 700, margin: '32px 0 8px 0', paddingLeft: 0 }}>Dashboard</h2>
      <div style={{ color: '#4d7c0f', fontWeight: 500, marginBottom: 24, fontSize: 17 }}>
        Welcome to the Archives Management System. Here you can manage, track, and search all archived files and their movements efficiently.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, margin: '0 0 32px 0', width: '100%' }}>
        <div style={{ background: '#d9f99d', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 18, color: '#22543d', fontWeight: 600 }}>Total Files</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#38a169' }}>{stats.totalFiles}</div>
        </div>
        <div style={{ background: '#bbf7d0', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 18, color: '#166534', fontWeight: 600 }}>Total Movements</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#22543d' }}>{stats.totalMovements}</div>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <h3 style={{ color: '#4d7c0f', fontWeight: 600, marginBottom: 12 }}>Recent Activity</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {stats.recent.map((item, idx) => (
            <li key={idx} style={{ marginBottom: 10, background: '#f0fdf4', borderRadius: 8, padding: '10px 16px', color: '#22543d' }}>
              <b>{item.action.charAt(0).toUpperCase() + item.action.slice(1)}</b> - {item.file} <span style={{ color: '#a3e635', fontSize: 13 }}>({item.time})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
function Files({ files, setFiles }) {
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
  });
  const [formError, setFormError] = useState('');
  const [viewFile, setViewFile] = useState(null);
  const [editId, setEditId] = useState(null);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.date || !form.partyName || !form.caseCode || !form.caseNumber || !form.caseYear || !form.lastActivity || !form.status || !form.comingFrom || !form.destination || !form.reason) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (editId) {
      setFiles(files.map(f => f.id === editId ? { ...f, ...form } : f));
      setEditId(null);
    } else {
      setFiles([
        ...files,
        {
          id: Date.now(),
          ...form,
        },
      ]);
    }
    setShowForm(false);
    setForm({ date: '', partyName: '', caseCode: '', caseNumber: '', caseYear: '', lastActivity: '', status: '', comingFrom: '', destination: '', reason: '' });
  };

  const handleEdit = (file) => {
    setForm({ ...file });
    setEditId(file.id);
    setShowForm(true);
  };

  return (
    <div style={{ padding: 0, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '32px 0 24px 0' }}>
        <h2 style={{ color: '#22543d', fontWeight: 700, margin: 0 }}>Files</h2>
        <button onClick={() => setShowForm(true)} style={{ background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #bbf7d0' }}>
          Register New File
        </button>
      </div>
      {showForm && (
        <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 32, maxWidth: 600, margin: '0 auto 32px auto', boxShadow: '0 2px 12px #bbf7d0', position: 'relative' }}>
          <h3 style={{ color: '#22543d', fontWeight: 700, marginBottom: 18 }}>Register File</h3>
          <form onSubmit={handleFormSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div>
                <label style={{ color: '#22543d', fontWeight: 600 }}>Date</label>
                <input type="date" name="date" value={form.date} onChange={handleFormChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #a7f3d0', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ color: '#22543d', fontWeight: 600 }}>Name of Party</label>
                <input type="text" name="partyName" value={form.partyName} onChange={handleFormChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #a7f3d0', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ color: '#22543d', fontWeight: 600 }}>Case Code</label>
                <select name="caseCode" value={form.caseCode} onChange={handleFormChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #a7f3d0', marginTop: 4 }}>
                  <option value="">Select code</option>
                  <option value="CR">CR</option>
                  <option value="TR">TR</option>
                  <option value="SO">SO</option>
                  <option value="CC">CC</option>
                  <option value="MCCHCC">MCCHCC</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#22543d', fontWeight: 600 }}>Case Number</label>
                <input type="text" name="caseNumber" value={form.caseNumber} onChange={handleFormChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #a7f3d0', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ color: '#22543d', fontWeight: 600 }}>Case Year</label>
                <input type="text" name="caseYear" value={form.caseYear} onChange={handleFormChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #a7f3d0', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ color: '#22543d', fontWeight: 600 }}>Date of Last Activity</label>
                <input type="date" name="lastActivity" value={form.lastActivity} onChange={handleFormChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #a7f3d0', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ color: '#22543d', fontWeight: 600 }}>Status</label>
                <select name="status" value={form.status} onChange={handleFormChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #a7f3d0', marginTop: 4 }}>
                  <option value="">Select status</option>
                  <option value="archived">Archived</option>
                  <option value="retrieved">Retrieved</option>
                  <option value="destroyed">Destroyed</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#22543d', fontWeight: 600 }}>Coming From</label>
                <select name="comingFrom" value={form.comingFrom} onChange={handleFormChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #a7f3d0', marginTop: 4 }}>
                  <option value="">Select source</option>
                  <option value="Registry">Registry</option>
                  <option value="Dept A">Dept A</option>
                  <option value="Dept B">Dept B</option>
                  <option value="Dept C">Dept C</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#22543d', fontWeight: 600 }}>Destination</label>
                <select name="destination" value={form.destination} onChange={handleFormChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #a7f3d0', marginTop: 4 }}>
                  <option value="">Select destination</option>
                  <option value="Archives">Archives</option>
                  <option value="Dept A">Dept A</option>
                  <option value="Dept B">Dept B</option>
                  <option value="Dept C">Dept C</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / span 2' }}>
                <label style={{ color: '#22543d', fontWeight: 600 }}>Reason for Movement</label>
                <select name="reason" value={form.reason} onChange={handleFormChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #a7f3d0', marginTop: 4 }}>
                  <option value="">Select reason</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Review">Review</option>
                  <option value="Concluded">Concluded</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            {formError && <div style={{ color: '#dc2626', marginTop: 14, fontWeight: 500 }}>{formError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 12 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: '#fef9c3', color: '#b45309', border: 'none', borderRadius: 4, padding: '10px 22px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Save</button>
            </div>
          </form>
        </div>
      )}
      {/* View File Modal */}
      {viewFile && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(34, 84, 61, 0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 24px #bbf7d0', position: 'relative' }}>
            <h3 style={{ color: '#22543d', fontWeight: 700, marginBottom: 18 }}>File Details</h3>
            <div style={{ marginBottom: 10 }}><b>Date:</b> {viewFile.date}</div>
            <div style={{ marginBottom: 10 }}><b>Name of Party:</b> {viewFile.partyName}</div>
            <div style={{ marginBottom: 10 }}><b>Case Code:</b> {viewFile.caseCode}</div>
            <div style={{ marginBottom: 10 }}><b>Case Number:</b> {viewFile.caseNumber}</div>
            <div style={{ marginBottom: 10 }}><b>Case Year:</b> {viewFile.caseYear}</div>
            <div style={{ marginBottom: 10 }}><b>Date of Last Activity:</b> {viewFile.lastActivity}</div>
            <div style={{ marginBottom: 10 }}><b>Status:</b> {viewFile.status.charAt(0).toUpperCase() + viewFile.status.slice(1)}</div>
            <div style={{ marginBottom: 10 }}><b>Coming From:</b> {viewFile.comingFrom}</div>
            <div style={{ marginBottom: 10 }}><b>Destination:</b> {viewFile.destination}</div>
            <div style={{ marginBottom: 10 }}><b>Reason for Movement:</b> {viewFile.reason}</div>
            <button onClick={() => setViewFile(null)} style={{ background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginTop: 18, width: '100%' }}>Close</button>
          </div>
        </div>
      )}
      <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 24, width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
          <thead>
            <tr style={{ background: '#bbf7d0', color: '#22543d' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #a7f3d0' }}>Date</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #a7f3d0' }}>Name of Party</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #a7f3d0' }}>Case Code</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #a7f3d0' }}>Case Number</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #a7f3d0' }}>Case Year</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #a7f3d0' }}>Date of Last Activity</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #a7f3d0' }}>Status</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #a7f3d0' }}>Coming From</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #a7f3d0' }}>Destination</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #a7f3d0' }}>Reason for Movement</th>
              <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #a7f3d0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id} style={{ borderBottom: '1px solid #bbf7d0' }}>
                <td style={{ padding: '10px 8px' }}>{file.date}</td>
                <td style={{ padding: '10px 8px' }}>{file.partyName}</td>
                <td style={{ padding: '10px 8px' }}>{file.caseCode}</td>
                <td style={{ padding: '10px 8px' }}>{file.caseNumber}</td>
                <td style={{ padding: '10px 8px' }}>{file.caseYear}</td>
                <td style={{ padding: '10px 8px' }}>{file.lastActivity}</td>
                <td style={{ padding: '10px 8px', color: file.status === 'archived' ? '#166534' : file.status === 'retrieved' ? '#b45309' : '#dc2626', fontWeight: 600 }}>{file.status.charAt(0).toUpperCase() + file.status.slice(1)}</td>
                <td style={{ padding: '10px 8px' }}>{file.comingFrom}</td>
                <td style={{ padding: '10px 8px' }}>{file.destination}</td>
                <td style={{ padding: '10px 8px' }}>{file.reason}</td>
                <td style={{ padding: '10px 8px' }}>
                  <button onClick={() => setViewFile(file)} style={{ background: '#bbf7d0', color: '#22543d', border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', marginRight: 8 }}>View</button>
                  <button onClick={() => handleEdit(file)} style={{ background: '#f0fdfa', color: '#166534', border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', marginRight: 8 }}>Edit</button>
                  <button style={{ background: '#fef9c3', color: '#b45309', border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function Movements() {
  return <div style={{ padding: 32, width: '100%' }}><h2>Movements</h2><p>View file movement history here.</p></div>;
}

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState([
    { id: 1, date: '2024-07-01', partyName: 'John Doe', caseCode: 'CR', caseNumber: '123', caseYear: '2024', lastActivity: '2024-07-10', status: 'archived', comingFrom: 'Dept A', destination: 'Dept B', reason: 'Transfer' },
    { id: 2, date: '2024-07-05', partyName: 'Jane Smith', caseCode: 'TR', caseNumber: '456', caseYear: '2023', lastActivity: '2024-07-12', status: 'retrieved', comingFrom: 'Dept B', destination: 'Dept C', reason: 'Review' },
  ]);
  const navigate = useNavigate();

  // Auto-logout after 5 minutes of inactivity
  useEffect(() => {
    if (!isAuthenticated) return;
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsAuthenticated(false);
        navigate('/');
        alert('You have been logged out due to inactivity.');
      }, 300000); // 5 minutes
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated, navigate]);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    navigate('/dashboard');
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Layout showNav={false}><Auth onAuthSuccess={handleAuthSuccess} /></Layout>} />
        <Route path="/dashboard" element={isAuthenticated ? <Layout showNav={true} onLogout={handleLogout}><Dashboard files={files} /></Layout> : <Navigate to="/" />} />
        <Route path="/files" element={isAuthenticated ? <Layout showNav={true} onLogout={handleLogout}><Files files={files} setFiles={setFiles} /></Layout> : <Navigate to="/" />} />
        <Route path="/movements" element={isAuthenticated ? <Layout showNav={true} onLogout={handleLogout}><Movements /></Layout> : <Navigate to="/" />} />
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
