import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CLASSES = ['1','2','3','4','5','6','7','8','9','10','11','12'];

export default function WhatsApp() {
  const [tab, setTab]           = useState('connect');
  const [status, setStatus]     = useState(null);
  const [qrData, setQrData]     = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [announce, setAnnounce] = useState({ subject: '', body: '', class: '', section: '' });
  const [individual, setInd]    = useState({ studentId: '', type: 'custom', customMessage: '' });
  const [testPhone, setTestPhone] = useState('');
  const pollRef = useRef(null);

  // Poll status every 4 seconds
  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 4000);
    api.get('/students', { params: { limit: 200 } }).then(({ data }) => setStudents(data.students));
    return () => clearInterval(pollRef.current);
  }, []);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get('/whatsapp/status');
      setStatus(data);
      if (data.ready) {
        setQrData(null);
        clearInterval(pollRef.current);
      } else if (data.qrAvailable && tab === 'connect') {
        fetchQR();
      }
    } catch {}
  };

  const fetchQR = async () => {
    try {
      const { data } = await api.get('/whatsapp/qr');
      if (data.qrImageUrl) setQrData(data);
    } catch {}
  };

  const restart = async () => {
    setLoading(true);
    setQrData(null);
    try {
      await api.post('/whatsapp/restart');
      toast.success('Restarting WhatsApp...');
      setTimeout(() => {
        pollRef.current = setInterval(fetchStatus, 4000);
        setLoading(false);
      }, 3000);
    } catch (err) { toast.error(err.response?.data?.message || 'Restart failed'); setLoading(false); }
  };

  const sendTest = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await api.post('/whatsapp/test', { phone: testPhone });
      toast.success(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const sendAnnounce = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await api.post('/whatsapp/announce', announce);
      toast.success(data.message);
      setAnnounce({ subject: '', body: '', class: '', section: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const sendIndividual = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await api.post('/whatsapp/individual', individual);
      toast.success(data.message);
      setInd({ studentId: '', type: 'custom', customMessage: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const sendFeeReminders = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/whatsapp/fee-reminders', {});
      toast.success(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '10px 13px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 13, boxSizing: 'border-box', outline: 'none' };
  const lbl = { fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 5, letterSpacing: 0.4 };
  const isReady = status?.ready;

  const tabBtn = (id, icon, label) => (
    <button onClick={() => setTab(id)} style={{
      padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
      fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
      background: tab === id ? '#25d366' : 'transparent',
      color: tab === id ? '#fff' : '#64748b'
    }}>{icon} {label}</button>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ color: '#f1f5f9', margin: 0, fontSize: 26, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 34 }}>📱</span> WhatsApp Automation
            <span style={{ fontSize: 12, background: '#064e3b', color: '#34d399', padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>100% FREE</span>
          </h1>
          <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: 13 }}>Uses your school's own WhatsApp — no API key, no payment ever</p>
        </div>

        {/* Live status pill */}
        <div style={{
          padding: '10px 18px', borderRadius: 12,
          background: isReady ? '#064e3b' : status?.status === 'qr' ? '#1e3a5f' : '#450a0a',
          border: `1px solid ${isReady ? '#065f46' : status?.status === 'qr' ? '#1d4ed8' : '#991b1b'}`,
          color: isReady ? '#34d399' : status?.status === 'qr' ? '#93c5fd' : '#fca5a5',
          fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', display: 'inline-block',
            animation: isReady ? 'none' : 'pulse 1.5s infinite' }} />
          {isReady ? '✅ Connected & Ready' : status?.status === 'qr' ? '📱 Scan QR to Connect' : '⏳ Starting up...'}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: '#1e293b', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid #334155', flexWrap: 'wrap' }}>
        {tabBtn('connect',    '🔗', 'Connect')}
        {tabBtn('announce',   '📢', 'Announce')}
        {tabBtn('individual', '🎯', 'Individual')}
        {tabBtn('reminders',  '💰', 'Fee Reminders')}
        {tabBtn('test',       '🧪', 'Test')}
      </div>

      {/* ── CONNECT TAB ── */}
      {tab === 'connect' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 28, alignItems: 'start', flexWrap: 'wrap' }}>

          {/* QR Box */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24, textAlign: 'center', minWidth: 280 }}>
            <div style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 700, marginBottom: 20 }}>Step 1 — Scan QR Code</div>

            {isReady ? (
              <div style={{ padding: '40px 20px' }}>
                <div style={{ fontSize: 64 }}>✅</div>
                <div style={{ color: '#34d399', fontWeight: 700, fontSize: 18, marginTop: 12 }}>WhatsApp Connected!</div>
                <div style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>Messages will be sent from your school phone</div>
              </div>
            ) : qrData?.qrImageUrl ? (
              <>
                <img src={qrData.qrImageUrl} alt="WhatsApp QR" style={{ width: 220, height: 220, borderRadius: 12, border: '4px solid #25d366' }} />
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 12, lineHeight: 1.7 }}>
                  QR refreshes every 60 sec.<br/>Scan quickly!
                </div>
                <button onClick={fetchQR} style={{ marginTop: 12, padding: '7px 16px', background: 'transparent', border: '1px solid #334155', borderRadius: 7, color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>
                  🔄 Refresh QR
                </button>
              </>
            ) : (
              <div style={{ padding: '40px 20px' }}>
                <div style={{ fontSize: 48 }}>⏳</div>
                <div style={{ color: '#94a3b8', marginTop: 12, fontSize: 13 }}>Loading QR code...</div>
                <div style={{ color: '#64748b', fontSize: 11, marginTop: 6 }}>Takes ~15 seconds on first start</div>
                <button onClick={fetchQR} style={{ marginTop: 16, padding: '8px 18px', background: '#25d366', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13 }}>
                  Check for QR
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div>
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24, marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 700, marginBottom: 18 }}>📋 How to Connect (One-Time Setup)</div>
              {[
                { num: '1', icon: '📱', title: 'Open WhatsApp on school phone', desc: 'Use the phone whose number you want to send messages FROM (e.g. school office number)' },
                { num: '2', icon: '⋮', title: 'Tap ⋮ menu → Linked Devices', desc: 'On iPhone: Settings → Linked Devices' },
                { num: '3', icon: '🔗', title: 'Tap "Link a Device"', desc: 'Your phone camera will open to scan a QR code' },
                { num: '4', icon: '📷', title: 'Scan the QR code on the left', desc: 'Point your phone camera at the QR code shown above' },
                { num: '5', icon: '✅', title: 'Done! Stay connected', desc: 'Keep the server running. WhatsApp stays linked — no re-scan needed unless you log out' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: i < 4 ? '1px solid #0f172a' : 'none' }}>
                  <div style={{ width: 28, height: 28, background: '#25d366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 12, flexShrink: 0 }}>{s.num}</div>
                  <div>
                    <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 13 }}>{s.icon} {s.title}</div>
                    <div style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={restart} disabled={loading} style={{ padding: '10px 20px', background: '#1e3a5f', border: '1px solid #1d4ed8', borderRadius: 8, color: '#93c5fd', cursor: 'pointer', fontSize: 13 }}>
                🔄 Restart WhatsApp
              </button>
              <button onClick={fetchQR} style={{ padding: '10px 20px', background: '#064e3b', border: '1px solid #065f46', borderRadius: 8, color: '#34d399', cursor: 'pointer', fontSize: 13 }}>
                📷 Refresh QR
              </button>
            </div>

            {!isReady && (
              <div style={{ marginTop: 14, background: '#1c1a0a', border: '1px solid #78350f', borderRadius: 10, padding: '12px 16px', color: '#fcd34d', fontSize: 12, lineHeight: 1.7 }}>
                ⚠️ <strong>Important:</strong> Keep the backend server running at all times. If you restart the server, WhatsApp reconnects automatically (no QR scan needed again).
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ANNOUNCE TAB ── */}
      {tab === 'announce' && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 28, maxWidth: 600 }}>
          <h2 style={{ color: '#f1f5f9', marginTop: 0, fontSize: 18 }}>📢 Send Announcement to Parents</h2>
          {!isReady && <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 12, marginBottom: 16 }}>⚠️ WhatsApp not connected. Go to Connect tab and scan QR first.</div>}
          <form onSubmit={sendAnnounce}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbl}>CLASS (OPTIONAL — empty = ALL)</label>
                <select value={announce.class} onChange={e => setAnnounce({ ...announce, class: e.target.value })} style={inp}>
                  <option value="">📣 All Classes</option>
                  {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>SECTION (OPTIONAL)</label>
                <select value={announce.section} onChange={e => setAnnounce({ ...announce, section: e.target.value })} style={inp}>
                  <option value="">All Sections</option>
                  {['A','B','C','D'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>SUBJECT / TITLE</label>
              <input value={announce.subject} onChange={e => setAnnounce({ ...announce, subject: e.target.value })}
                placeholder="Holiday Notice / PTM Reminder / Exam Schedule..." style={inp} required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>MESSAGE</label>
              <textarea value={announce.body} onChange={e => setAnnounce({ ...announce, body: e.target.value })}
                placeholder="Type the full message to parents..." rows={5}
                style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} required />
            </div>
            <button type="submit" disabled={loading || !isReady} style={{ padding: '12px 28px', background: loading || !isReady ? '#064e3b88' : '#25d366', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading || !isReady ? 'not-allowed' : 'pointer' }}>
              {loading ? '⏳ Sending...' : '📱 Send WhatsApp to All Selected Parents'}
            </button>
          </form>
        </div>
      )}

      {/* ── INDIVIDUAL TAB ── */}
      {tab === 'individual' && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 28, maxWidth: 540 }}>
          <h2 style={{ color: '#f1f5f9', marginTop: 0, fontSize: 18 }}>🎯 Message One Parent</h2>
          {!isReady && <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 12, marginBottom: 16 }}>⚠️ Connect WhatsApp first.</div>}
          <form onSubmit={sendIndividual}>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>SELECT STUDENT</label>
              <select value={individual.studentId} onChange={e => setInd({ ...individual, studentId: e.target.value })} style={inp} required>
                <option value="">-- Choose Student --</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.name} — Class {s.class} ({s.rollNumber})</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>MESSAGE TYPE</label>
              <select value={individual.type} onChange={e => setInd({ ...individual, type: e.target.value })} style={inp}>
                <option value="custom">💬 Custom Message</option>
                <option value="fee_reminder">💰 Fee Reminder</option>
                <option value="absence">⚠️ Absence Alert</option>
              </select>
            </div>
            {individual.type === 'custom' && (
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>YOUR MESSAGE</label>
                <textarea value={individual.customMessage} onChange={e => setInd({ ...individual, customMessage: e.target.value })}
                  placeholder="Type message..." rows={4} style={{ ...inp, resize: 'vertical' }} required />
              </div>
            )}
            {individual.type !== 'custom' && (
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', marginBottom: 20, color: '#94a3b8', fontSize: 12 }}>
                ℹ️ A pre-written {individual.type === 'fee_reminder' ? 'fee reminder' : 'absence alert'} will be sent with the student's details automatically.
              </div>
            )}
            <button type="submit" disabled={loading || !isReady} style={{ padding: '11px 24px', background: loading || !isReady ? '#064e3b88' : '#25d366', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading || !isReady ? 'not-allowed' : 'pointer' }}>
              {loading ? '⏳ Sending...' : '📱 Send WhatsApp'}
            </button>
          </form>
        </div>
      )}

      {/* ── FEE REMINDERS TAB ── */}
      {tab === 'reminders' && (
        <div style={{ maxWidth: 560 }}>
          <div style={{ background: '#1e293b', border: '1px solid #f59e0b33', borderRadius: 14, padding: 28, marginBottom: 20 }}>
            <h2 style={{ color: '#f1f5f9', marginTop: 0, fontSize: 18 }}>💰 Bulk Fee Reminders</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>
              Send a WhatsApp fee reminder to <strong style={{ color: '#f59e0b' }}>all parents</strong> whose children have pending or overdue fees. Messages are sent with a small delay to avoid spam detection.
            </p>
            {!isReady && <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 12, marginBottom: 16 }}>⚠️ Connect WhatsApp first.</div>}
            <button onClick={sendFeeReminders} disabled={loading || !isReady} style={{ padding: '13px 28px', background: loading || !isReady ? '#78350f66' : '#f59e0b', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading || !isReady ? 'not-allowed' : 'pointer' }}>
              {loading ? '⏳ Sending reminders...' : '📱 Send to All Fee Defaulters'}
            </button>
          </div>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 20 }}>
            <div style={{ color: '#818cf8', fontSize: 12, marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' }}>⏰ Automatic Schedule</div>
            <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.8 }}>
              Fee reminders are also sent <strong style={{ color: '#f1f5f9' }}>automatically every day at 8:30 PM</strong> to all defaulters — no manual action needed. This is handled by the backend cron job.
            </div>
          </div>
        </div>
      )}

      {/* ── TEST TAB ── */}
      {tab === 'test' && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 28, maxWidth: 460 }}>
          <h2 style={{ color: '#f1f5f9', marginTop: 0, fontSize: 18 }}>🧪 Send Test Message</h2>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>Verify WhatsApp is working by sending a test message to any number.</p>
          {!isReady && <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 12, marginBottom: 16 }}>⚠️ Connect WhatsApp first from the Connect tab.</div>}
          <form onSubmit={sendTest}>
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>PHONE NUMBER</label>
              <input type="text" value={testPhone} onChange={e => setTestPhone(e.target.value)}
                placeholder="9876543210 or +919876543210" style={inp} required />
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>Indian numbers: just enter 10 digits. Country code added automatically.</div>
            </div>
            <button type="submit" disabled={loading || !isReady} style={{ padding: '11px 24px', background: loading || !isReady ? '#1e3a5f88' : '#4F46E5', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading || !isReady ? 'not-allowed' : 'pointer' }}>
              {loading ? '⏳ Sending...' : '📤 Send Test Message'}
            </button>
          </form>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
