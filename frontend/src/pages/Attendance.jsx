import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [students, setStudents]       = useState([]);
  const [date, setDate]               = useState(new Date().toISOString().slice(0, 10));
  const [filterClass, setFC]          = useState('10');
  const [attendance, setAttendance]   = useState({});  // { studentId: 'Present' | 'Absent' | 'Late' }
  const [existing, setExisting]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [submitting, setSubmitting]   = useState(false);

  // Load students for the selected class
  useEffect(() => {
    if (!filterClass) return;
    api.get('/students', { params: { class: filterClass, limit: 100 } })
      .then(({ data }) => {
        setStudents(data.students);
        const init = {};
        data.students.forEach(s => { init[s._id] = 'Present'; });
        setAttendance(init);
      });
  }, [filterClass]);

  // Load existing attendance for selected date+class
  useEffect(() => {
    if (!filterClass || !date) return;
    api.get('/attendance', { params: { class: filterClass, date } })
      .then(({ data }) => {
        setExisting(data.records);
        if (data.records.length > 0) {
          const map = {};
          data.records.forEach(r => { if (r.student) map[r.student._id] = r.status; });
          setAttendance(prev => ({ ...prev, ...map }));
        }
      });
  }, [date, filterClass]);

  const handleMark = async () => {
    setSubmitting(true);
    try {
      const records = students.map(s => ({
        studentId: s._id,
        status: attendance[s._id] || 'Present'
      }));
      const { data } = await api.post('/attendance/mark', { records, date });
      const absentCount = records.filter(r => r.status === 'Absent').length;
      toast.success(`Attendance saved! ${absentCount > 0 ? `📧 ${absentCount} absence alert(s) sent.` : 'All present!'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving attendance');
    } finally { setSubmitting(false); }
  };

  const statusColor = (s) => s === 'Present' ? '#10b981' : s === 'Absent' ? '#ef4444' : '#f59e0b';
  const btnStyle = (val, current) => ({
    padding: '5px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
    background: current === val ? statusColor(val) : 'transparent',
    color: current === val ? '#fff' : '#64748b',
    outline: current === val ? 'none' : `1px solid #334155`
  });

  const presentCount = Object.values(attendance).filter(s => s === 'Present').length;
  const absentCount  = Object.values(attendance).filter(s => s === 'Absent').length;

  return (
    <div>
      <h1 style={{ color: '#f1f5f9', marginBottom: 24, fontSize: 26 }}>✅ Attendance</h1>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 5 }}>DATE</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{
            padding: '9px 12px', background: '#1e293b', border: '1px solid #334155',
            borderRadius: 7, color: '#f1f5f9', fontSize: 13, outline: 'none'
          }} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 5 }}>CLASS</label>
          <select value={filterClass} onChange={e => setFC(e.target.value)} style={{
            padding: '9px 12px', background: '#1e293b', border: '1px solid #334155',
            borderRadius: 7, color: '#f1f5f9', fontSize: 13, outline: 'none'
          }}>
            {['1','2','3','4','5','6','7','8','9','10','11','12'].map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>
        {/* Quick select all */}
        <div style={{ alignSelf: 'flex-end', display: 'flex', gap: 8 }}>
          <button onClick={() => { const all = {}; students.forEach(s => all[s._id] = 'Present'); setAttendance(all); }}
            style={{ padding: '9px 16px', background: '#064e3b', color: '#34d399', border: '1px solid #065f46', borderRadius: 7, cursor: 'pointer', fontSize: 13 }}>
            ✅ All Present
          </button>
          <button onClick={() => { const all = {}; students.forEach(s => all[s._id] = 'Absent'); setAttendance(all); }}
            style={{ padding: '9px 16px', background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b', borderRadius: 7, cursor: 'pointer', fontSize: 13 }}>
            ❌ All Absent
          </button>
        </div>
      </div>

      {/* Summary bar */}
      {students.length > 0 && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div style={{ background: '#064e3b', padding: '10px 20px', borderRadius: 8, color: '#34d399', fontSize: 14 }}>✅ Present: {presentCount}</div>
          <div style={{ background: '#7f1d1d', padding: '10px 20px', borderRadius: 8, color: '#fca5a5', fontSize: 14 }}>❌ Absent: {absentCount}</div>
          <div style={{ background: '#78350f', padding: '10px 20px', borderRadius: 8, color: '#fcd34d', fontSize: 14 }}>⏰ Late: {Object.values(attendance).filter(s => s === 'Late').length}</div>
        </div>
      )}

      {/* Student list */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
        {students.length === 0
          ? <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No students in Class {filterClass}. Add students first.</div>
          : students.map((s, i) => (
          <div key={s._id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderBottom: '1px solid #0f172a',
            background: i % 2 === 0 ? 'transparent' : '#ffffff05'
          }}>
            <div>
              <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: 14 }}>{s.name}</span>
              <span style={{ color: '#64748b', fontSize: 12, marginLeft: 10, fontFamily: 'monospace' }}>{s.rollNumber}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Present', 'Absent', 'Late'].map(status => (
                <button key={status} onClick={() => setAttendance(prev => ({ ...prev, [s._id]: status }))}
                  style={btnStyle(status, attendance[s._id])}>
                  {status === 'Present' ? '✅' : status === 'Absent' ? '❌' : '⏰'} {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {students.length > 0 && (
        <button onClick={handleMark} disabled={submitting} style={{
          padding: '13px 32px', background: submitting ? '#3730a3' : '#4F46E5',
          color: '#fff', border: 'none', borderRadius: 8, fontSize: 15,
          fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer'
        }}>
          {submitting ? '⏳ Saving & Sending Alerts...' : '💾 Save Attendance'}
        </button>
      )}
      <p style={{ color: '#64748b', fontSize: 12, marginTop: 10 }}>
        📧 Absent students' parents will automatically receive an email alert.
      </p>
    </div>
  );
}
