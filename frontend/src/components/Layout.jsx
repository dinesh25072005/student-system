import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',  icon: '📊' },
  { to: '/students',   label: 'Students',   icon: '👨‍🎓' },
  { to: '/attendance', label: 'Attendance', icon: '✅' },
  { to: '/fees',       label: 'Fees',       icon: '💰' },
  { to: '/whatsapp',   label: 'WhatsApp',   icon: '📱' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#1e293b', borderRight: '1px solid #334155',
        display: 'flex', flexDirection: 'column', padding: '0'
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #334155' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#818cf8' }}>🎓 EduAdmin</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Student Management System</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 14px', borderRadius: 8, marginBottom: 4,
                color: isActive ? '#f1f5f9' : '#94a3b8',
                background: isActive ? '#4F46E5' : 'transparent',
                textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s'
              })}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: '16px', borderTop: '1px solid #334155' }}>
          <div style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10, textTransform: 'capitalize' }}>{user?.role}</div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '8px', background: 'transparent',
            border: '1px solid #334155', color: '#94a3b8', borderRadius: 6,
            cursor: 'pointer', fontSize: 13
          }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '32px', background: '#0f172a' }}>
        <Outlet />
      </main>
    </div>
  );
}
