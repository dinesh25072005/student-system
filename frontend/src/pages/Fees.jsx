import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Fees() {
  const [tab, setTab]               = useState('collect');
  const [students, setStudents]     = useState([]);
  const [fees, setFees]             = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [form, setForm]             = useState({ studentId: '', amount: '', paymentMethod: 'Cash', month: '', remarks: '' });
  const [loading, setLoading]       = useState(false);
  const [submitting, setSub]        = useState(false);

  useEffect(() => {
    api.get('/students', { params: { limit: 200 } }).then(({ data }) => setStudents(data.students));
    api.get('/fees').then(({ data }) => setFees(data.fees));
    api.get('/fees/defaulters').then(({ data }) => setDefaulters(data.defaulters));
  }, []);

  const handleCollect = async (e) => {
    e.preventDefault();
    setSub(true);
    try {
      const { data } = await api.post('/fees/collect', form);
      toast.success(`✅ ₹${form.amount} collected! Receipt: ${data.receipt}`);
      setForm({ studentId: '', amount: '', paymentMethod: 'Cash', month: '', remarks: '' });
      // refresh
      const [feesRes, defRes] = await Promise.all([api.get('/fees'), api.get('/fees/defaulters')]);
      setFees(feesRes.data.fees);
      setDefaulters(defRes.data.defaulters);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error collecting fee');
    } finally { setSub(false); }
  };

  const sendReminders = async () => {
    try {
      const { data } = await api.post('/fees/send-reminders', {});
      toast.success(data.message);
    } catch { toast.error('Failed to send reminders'); }
  };

  const inputStyle = { width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 7, color: '#f1f5f9', fontSize: 13, boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 5 };
  const feeColor   = s => s === 'Paid' ? '#10b981' : s === 'Overdue' ? '#ef4444' : '#f59e0b';

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
      background: tab === id ? '#4F46E5' : 'transparent', color: tab === id ? '#fff' : '#64748b'
    }}>{label}</button>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ color: '#f1f5f9', margin: 0, fontSize: 26 }}>💰 Fee Management</h1>
        <button onClick={sendReminders} style={{ padding: '9px 18px', background: '#78350f', color: '#fcd34d', border: '1px solid #92400e', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
          📧 Send Reminders to All Defaulters
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#1e293b', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid #334155' }}>
        {tabBtn('collect', '💳 Collect Fee')}
        {tabBtn('history', '📜 Payment History')}
        {tabBtn('defaulters', '⚠️ Defaulters')}
      </div>

      {/* ── Collect Fee ── */}
      {tab === 'collect' && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 28, maxWidth: 560 }}>
          <h2 style={{ color: '#f1f5f9', marginTop: 0, fontSize: 18 }}>Record Fee Payment</h2>
          <form onSubmit={handleCollect}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>SELECT STUDENT</label>
                <select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} style={inputStyle} required>
                  <option value="">-- Choose Student --</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} — {s.rollNumber} (Class {s.class})</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>AMOUNT (₹)</label>
                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={inputStyle} required min="1" />
              </div>
              <div>
                <label style={labelStyle}>PAYMENT METHOD</label>
                <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} style={inputStyle}>
                  {['Cash', 'UPI', 'Bank Transfer', 'Cheque'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>MONTH</label>
                <input type="text" placeholder="e.g. June 2025" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>REMARKS (OPTIONAL)</label>
                <input type="text" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <button type="submit" disabled={submitting} style={{ marginTop: 20, width: '100%', padding: '12px', background: submitting ? '#3730a3' : '#4F46E5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              {submitting ? '⏳ Processing...' : '✅ Collect & Send Receipt Email'}
            </button>
          </form>
        </div>
      )}

      {/* ── Payment History ── */}
      {tab === 'history' && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#0f172a' }}>
                {['Receipt', 'Student', 'Class', 'Amount', 'Method', 'Month', 'Date'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fees.map((f, i) => (
                <tr key={f._id} style={{ borderBottom: '1px solid #0f172a22', background: i % 2 === 0 ? 'transparent' : '#ffffff04' }}>
                  <td style={{ padding: '11px 16px', color: '#818cf8', fontFamily: 'monospace', fontSize: 11 }}>{f.receiptNumber}</td>
                  <td style={{ padding: '11px 16px', color: '#f1f5f9' }}>{f.student?.name}</td>
                  <td style={{ padding: '11px 16px', color: '#94a3b8' }}>{f.student?.class}</td>
                  <td style={{ padding: '11px 16px', color: '#10b981', fontWeight: 600 }}>₹{f.amount}</td>
                  <td style={{ padding: '11px 16px', color: '#94a3b8' }}>{f.paymentMethod}</td>
                  <td style={{ padding: '11px 16px', color: '#94a3b8' }}>{f.month}</td>
                  <td style={{ padding: '11px 16px', color: '#64748b' }}>{new Date(f.paymentDate).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {fees.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No payments recorded yet.</div>}
        </div>
      )}

      {/* ── Defaulters ── */}
      {tab === 'defaulters' && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', color: '#fca5a5', fontSize: 14 }}>
            ⚠️ {defaulters.length} student(s) with pending/overdue fees
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#0f172a' }}>
                {['Name', 'Class', 'Parent Email', 'Due Amount', 'Due Date', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {defaulters.map((s, i) => (
                <tr key={s._id} style={{ borderBottom: '1px solid #0f172a11' }}>
                  <td style={{ padding: '11px 16px', color: '#f1f5f9' }}>{s.name}</td>
                  <td style={{ padding: '11px 16px', color: '#94a3b8' }}>{s.class}</td>
                  <td style={{ padding: '11px 16px', color: '#64748b', fontSize: 11 }}>{s.parentEmail}</td>
                  <td style={{ padding: '11px 16px', color: '#f59e0b', fontWeight: 600 }}>₹{s.feeAmount - s.feePaid}</td>
                  <td style={{ padding: '11px 16px', color: '#94a3b8' }}>{s.feeDueDate ? new Date(s.feeDueDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ background: feeColor(s.feeStatus) + '22', color: feeColor(s.feeStatus), padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
                      {s.feeStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {defaulters.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#10b981' }}>🎉 No defaulters! All fees paid.</div>}
        </div>
      )}
    </div>
  );
}
