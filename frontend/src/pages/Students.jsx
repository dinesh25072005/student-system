/*import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EMPTY = {
  name: '', rollNumber: '', class: '', section: 'A',
  parentName: '', parentEmail: '', parentPhone: '',
  feeAmount: '', feeDueDate: '', gender: 'Male', address: ''
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState('');
  const [filterClass, setFC]    = useState('');
  const [loading, setLoading]   = useState(false);
  const [showModal, setModal]   = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterClass) params.class = filterClass;
      const { data } = await api.get('/students', { params });
      setStudents(data.students);
      setTotal(data.total);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [search, filterClass]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/students/${editId}`, form);
        toast.success('Student updated!');
      } else {
        await api.post('/students', form);
        toast.success('Student added!');
      }
      setModal(false); setForm(EMPTY); setEditId(null);
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving student'); }
  };

  const handleEdit = (s) => {
    setForm({ ...s, feeDueDate: s.feeDueDate?.slice(0, 10) || '' });
    setEditId(s._id); setModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this student?')) return;
    try { await api.delete(`/students/${id}`); toast.success('Removed'); fetchStudents(); }
    catch { toast.error('Delete failed'); }
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', background: '#0f172a',
    border: '1px solid #334155', borderRadius: 7, color: '#f1f5f9',
    fontSize: 13, boxSizing: 'border-box', outline: 'none'
  };
  const labelStyle = { fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 5, letterSpacing: 0.5 };
  const feeColor = (s) => s === 'Paid' ? '#10b981' : s === 'Overdue' ? '#ef4444' : '#f59e0b';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#f1f5f9', margin: 0, fontSize: 26 }}>👨‍🎓 Students</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13 }}>{total} total students</p>
        </div>
        <button onClick={() => { setModal(true); setForm(EMPTY); setEditId(null); }} style={{
          background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 8,
          padding: '10px 20px', fontSize: 14, cursor: 'pointer', fontWeight: 600
        }}>+ Add Student</button>
      </div>

      {/* Filters *//*}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input placeholder="🔍 Search name or roll..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 260 }} />
        <select value={filterClass} onChange={e => setFC(e.target.value)}
          style={{ ...inputStyle, maxWidth: 150 }}>
          <option value="">All Classes</option>
          {['1','2','3','4','5','6','7','8','9','10','11','12'].map(c => (
            <option key={c} value={c}>Class {c}</option>
          ))}
        </select>
      </div>

      {/* Table *//*}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : students.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No students found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                {['Roll No', 'Name', 'Class', 'Parent', 'Parent Email', 'Fee Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s._id} style={{ borderBottom: '1px solid #0f172a', background: i % 2 === 0 ? 'transparent' : '#0f172a22' }}>
                  <td style={{ padding: '12px 16px', color: '#818cf8', fontFamily: 'monospace' }}>{s.rollNumber}</td>
                  <td style={{ padding: '12px 16px', color: '#f1f5f9', fontWeight: 500 }}>{s.name}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{s.class}-{s.section}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{s.parentName}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>{s.parentEmail}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: feeColor(s.feeStatus) + '22', color: feeColor(s.feeStatus), padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
                      {s.feeStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleEdit(s)} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 5, padding: '5px 12px', cursor: 'pointer', fontSize: 12, marginRight: 6 }}>Edit</button>
                    <button onClick={() => handleDelete(s._id)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 5, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal *//*}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#000a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 32, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: '#f1f5f9', marginTop: 0 }}>{editId ? '✏️ Edit Student' : '➕ Add New Student'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  ['name', 'Full Name', 'text', true],
                  ['rollNumber', 'Roll Number', 'text', true],
                  ['parentName', 'Parent Name', 'text', true],
                  ['parentEmail', 'Parent Email', 'email', true],
                  ['parentPhone', 'Parent Phone', 'text', true],
                  ['feeAmount', 'Annual Fee (₹)', 'number', true],
                  ['feeDueDate', 'Fee Due Date', 'date', false],
                  ['address', 'Address', 'text', false],
                ].map(([key, lbl, type, req]) => (
                  <div key={key}>
                    <label style={labelStyle}>{lbl.toUpperCase()}</label>
                    <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      style={inputStyle} required={req} />
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>CLASS</label>
                  <select value={form.class} onChange={e => setForm({ ...form, class: e.target.value })} style={inputStyle} required>
                    <option value="">Select</option>
                    {['1','2','3','4','5','6','7','8','9','10','11','12'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>SECTION</label>
                  <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} style={inputStyle}>
                    {['A','B','C','D'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="submit" style={{ flex: 1, padding: '11px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                  {editId ? 'Update Student' : 'Add Student'}
                </button>
                <button type="button" onClick={() => { setModal(false); setEditId(null); }} style={{ padding: '11px 20px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
*/
//Here is the updated, fully refactored code. The interface has been completely transformed from a dark dashboard into a bright, clean, modern UI featuring soft gradients, subtle shadows, crisp typography, and a polished presentation.

//```jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EMPTY = {
  name: '', rollNumber: '', class: '', section: 'A',
  parentName: '', parentEmail: '', parentPhone: '',
  feeAmount: '', feeDueDate: '', gender: 'Male', address: ''
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterClass, setFC] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterClass) params.class = filterClass;
      const { data } = await api.get('/students', { params });
      setStudents(data.students);
      setTotal(data.total);
    } catch { 
      toast.error('Failed to load students'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchStudents(); }, [search, filterClass]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put('/students/${editId}', form);
        toast.success('Student updated successfully!');
      } else {
        await api.post('/students', form);
        toast.success('Student added successfully!');
      }
      setModal(false); setForm(EMPTY); setEditId(null);
      fetchStudents();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Error saving student'); 
    }
  };

  const handleEdit = (s) => {
    setForm({ ...s, feeDueDate: s.feeDueDate?.slice(0, 10) || '' });
    setEditId(s._id); setModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    try { 
      await api.delete('/students/${id}'); 
      toast.success('Student removed'); 
      fetchStudents(); 
    } catch { 
      toast.error('Delete failed'); 
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: '#ffffff',
    border: '1px solid #e2e8f0', borderRadius: 8, color: '#1e293b',
    fontSize: 14, boxSizing: 'border-box', outline: 'none',
    transition: 'all 0.2s ease', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  };
  
  const labelStyle = { 
    fontSize: 12, color: '#475569', display: 'block', 
    marginBottom: 6, letterSpacing: '0.3px', fontWeight: 600 
  };
  
  const feeStyles = (status) => {
    if (status === 'Paid') return { bg: '#f0fdf4', color: '#16a34a' };
    if (status === 'Overdue') return { bg: '#fef2f2', color: '#dc2626' };
    return { bg: '#fffbeb', color: '#d97706' };
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#0f172a', margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }}>Students</h1>
          <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: 14, fontWeight: 500 }}>
            Manage your dashboard details • <span style={{ color: '#4f46e5', fontWeight: 600 }}>{total} records</span>
          </p>
        </div>
        <button onClick={() => { setModal(true); setForm(EMPTY); setEditId(null); }} style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', color: '#fff', border: 'none', borderRadius: 8,
          padding: '12px 22px', fontSize: 14, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1)'
        }}>+ Add New Student</button>
      </div>

      {/* Filters Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, padding: 16, background: '#ffffff', borderRadius: 12, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
        <div style={{ position: 'relative', maxWidth: 320, width: '100%' }}>
          <input placeholder="Search name or roll number..." value={search} onChange={e => setSearch(e.target.value)}
            style={inputStyle} />
        </div>
        <select value={filterClass} onChange={e => setFC(e.target.value)}
          style={{ ...inputStyle, maxWidth: 160 }}>
          <option value="">All Classes</option>
          {['1','2','3','4','5','6','7','8','9','10','11','12'].map(c => (
            <option key={c} value={c}>Class {c}</option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b', fontSize: 15, fontWeight: 500 }}>
            <span style={{ display: 'inline-block', marginBottom: 8 }}>🔄</span> Fetching student ledger...
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b', fontSize: 15 }}>
            <span style={{ display: 'inline-block', fontSize: 24, marginBottom: 8 }}>📁</span> <br /> No data matches the current criteria.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Roll No', 'Name', 'Class & Sec', 'Parent / Guardian', 'Contact Email', 'Fee Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', color: '#475569', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const badge = feeStyles(s.feeStatus);
                return (
                  <tr key={s._id} style={{ 
                    borderBottom: '1px solid #f1f5f9', 
                    background: i % 2 === 0 ? 'transparent' : '#f8fafc55',
                    transition: 'background 0.15s ease'
                  }}>
                    <td style={{ padding: '14px 20px', color: '#4f46e5', fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>{s.rollNumber}</td>
                    <td style={{ padding: '14px 20px', color: '#1e293b', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: '14px 20px', color: '#334155' }}>
                      <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>{s.class}-{s.section}</span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#334155', fontWeight: 500 }}>{s.parentName}</td>
                    <td style={{ padding: '14px 20px', color: '#64748b' }}>{s.parentEmail}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: badge.bg, color: badge.color, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, display: 'inline-block' }}>
                        {s.feeStatus}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button onClick={() => handleEdit(s)} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, marginRight: 8, fontWeight: 500, transition: 'all 0.2s' }}>Edit</button>
                      <button onClick={() => handleDelete(s._id)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.2s' }}>Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 36, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}>
            <h2 style={{ color: '#0f172a', marginTop: 0, marginBottom: 24, fontSize: 22, fontWeight: 700 }}>{editId ? '✏️ Modify Student File' : '➕ Register New Student'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {[
                  ['name', 'Full Name', 'text', true],
                  ['rollNumber', 'Roll Number', 'text', true],
                  ['parentName', 'Parent Name', 'text', true],
                  ['parentEmail', 'Parent Email', 'email', true],
                  ['parentPhone', 'Parent Phone', 'text', true],
                  ['feeAmount', 'Annual Fee (₹)', 'number', true],
                  ['feeDueDate', 'Fee Due Date', 'date', false],
                  ['address', 'Address', 'text', false],
                ].map(([key, lbl, type, req]) => (
                  <div key={key}>
                    <label style={labelStyle}>{lbl}</label>
                    <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                      style={inputStyle} required={req} />
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>Class</label>
                  <select value={form.class} onChange={e => setForm({ ...form, class: e.target.value })} style={inputStyle} required>
                    <option value="">Select Class</option>
                    {['1','2','3','4','5','6','7','8','9','10','11','12'].map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Section</label>
                  <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} style={inputStyle}>
                    {['A','B','C','D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setModal(false); setEditId(null); }} style={{ padding: '11px 24px', background: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '11px 28px', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.15)' }}>
                  {editId ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

//```