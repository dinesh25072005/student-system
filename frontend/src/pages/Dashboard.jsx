/*import { useState, useEffect } from 'react';
import api from '../api/axios';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div style={{
    background: '#1e293b', border: `1px solid ${color}33`, borderRadius: 14,
    padding: '24px', borderLeft: `4px solid ${color}`
  }}>
    <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>{value ?? '—'}</div>
    <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: color, marginTop: 6 }}>{sub}</div>}
  </div>
);

export default function Dashboard() {
  const [stats, setStats]             = useState(null);
  const [recentPayments, setRecent]   = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(({ data }) => { setStats(data.stats); setRecent(data.recentPayments); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#818cf8', fontSize: 18 }}>Loading dashboard...</div>;

  return (
    <div>
      <h1 style={{ color: '#f1f5f9', marginBottom: 6, fontSize: 26 }}>📊 Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: 32, fontSize: 14 }}>
        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {/* Stat Cards *//*}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 36 }}>
        <StatCard icon="👨‍🎓" label="Total Students" value={stats?.totalStudents} color="#4F46E5" />
        <StatCard icon="✅" label="Present Today"  value={stats?.todayPresent}  color="#10b981" />
        <StatCard icon="❌" label="Absent Today"   value={stats?.todayAbsent}   color="#ef4444" />
        <StatCard icon="💰" label="Total Collected" value={`₹${(stats?.totalFeePaid || 0).toLocaleString('en-IN')}`} color="#f59e0b" />
        <StatCard icon="⚠️" label="Fee Defaulters" value={stats?.pendingFees}   color="#f97316" sub="Pending/Overdue" />
      </div>

      {/* Recent Payments *//*}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: '24px' }}>
        <h2 style={{ color: '#f1f5f9', marginTop: 0, marginBottom: 20, fontSize: 16 }}>💳 Recent Fee Payments</h2>
        {recentPayments.length === 0
          ? <p style={{ color: '#64748b' }}>No payments recorded yet.</p>
          : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Student', 'Class', 'Amount', 'Receipt', 'Date'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPayments.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '12px', color: '#e2e8f0' }}>{p.student?.name}</td>
                  <td style={{ padding: '12px', color: '#94a3b8' }}>{p.student?.class}</td>
                  <td style={{ padding: '12px', color: '#10b981', fontWeight: 600 }}>₹{p.amount}</td>
                  <td style={{ padding: '12px', color: '#818cf8', fontFamily: 'monospace', fontSize: 12 }}>{p.receiptNumber}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
*/
import { useState, useEffect } from "react";
import api from "../api/axios";

const StatCard = ({ icon, label, value, color, sub }) => {
  return (
    <div
      style={{
        background: "#ffffff",
        backdropFilter: "blur(12px)",
        borderRadius: 20,
        padding: 24,
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${color}30`,
        boxShadow: `0 10px 30px ${color}15`,
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow = `0 20px 40px ${color}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = `0 10px 30px ${color}15`;
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -30,
          top: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: `${color}15`,
        }}
      />

      <div style={{ fontSize: 42, marginBottom: 15 }}>{icon}</div>

      <div
        style={{
          fontSize: 34,
          fontWeight: 800,
          color: "#0f172a",
        }}
      >
        {value ?? "—"}
      </div>

      <div
        style={{
          color: "#64748b",
          marginTop: 8,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {label}
      </div>

      {sub && (
        <div
          style={{
            marginTop: 10,
            display: "inline-block",
            padding: "5px 12px",
            borderRadius: 30,
            background: `${color}15`,
            color,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then(({ data }) => {
        setStats(data.stats);
        setRecentPayments(data.recentPayments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg,#eff6ff,#eef2ff,#fdf4ff)",
          color: "#6366f1",
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        ⏳ Loading Dashboard...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 30,
        background:
          "linear-gradient(135deg,#eff6ff,#eef2ff,#fdf4ff)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          border: "1px solid #dbeafe",
          borderRadius: 24,
          padding: 30,
          marginBottom: 35,
          boxShadow: "0 10px 30px rgba(99,102,241,0.08)",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 38,
            fontWeight: 800,
            background:
              "linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          📊 Dashboard Overview
        </h1>

        <p
          style={{
            color: "#64748b",
            marginTop: 12,
            fontSize: 15,
          }}
        >
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(240px,1fr))",
          gap: 24,
          marginBottom: 35,
        }}
      >
        <StatCard
          icon="👨‍🎓"
          label="Total Students"
          value={stats?.totalStudents}
          color="#4F46E5"
        />

        <StatCard
          icon="✅"
          label="Present Today"
          value={stats?.todayPresent}
          color="#10B981"
        />

        <StatCard
          icon="❌"
          label="Absent Today"
          value={stats?.todayAbsent}
          color="#EF4444"
        />

        <StatCard
          icon="💰"
          label="Total Collected"
          value={`₹${(
            stats?.totalFeePaid || 0
          ).toLocaleString("en-IN")}`}
          color="#F59E0B"
        />

        <StatCard
          icon="⚠️"
          label="Fee Defaulters"
          value={stats?.pendingFees}
          color="#F97316"
          sub="Pending / Overdue"
        />
      </div>

      {/* Recent Payments */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 24,
          padding: 28,
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 25,
            color: "#0f172a",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          💳 Recent Fee Payments
        </h2>

        {recentPayments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#64748b",
              padding: 50,
              fontSize: 15,
            }}
          >
            No payments recorded yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0 10px",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Student",
                    "Class",
                    "Amount",
                    "Receipt",
                    "Date",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: 14,
                        color: "#475569",
                        fontWeight: 700,
                        fontSize: 13,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {recentPayments.map((p) => (
                  <tr
                    key={p._id}
                    style={{
                      background: "#f8fafc",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <td
                      style={{
                        padding: 16,
                        color: "#0f172a",
                        fontWeight: 600,
                        borderTopLeftRadius: 12,
                        borderBottomLeftRadius: 12,
                      }}
                    >
                      {p.student?.name}
                    </td>

                    <td
                      style={{
                        padding: 16,
                        color: "#64748b",
                      }}
                    >
                      {p.student?.class}
                    </td>

                    <td
                      style={{
                        padding: 16,
                        color: "#10b981",
                        fontWeight: 700,
                      }}
                    >
                      ₹{p.amount}
                    </td>

                    <td
                      style={{
                        padding: 16,
                        color: "#6366f1",
                        fontFamily: "monospace",
                        fontWeight: 600,
                      }}
                    >
                      {p.receiptNumber}
                    </td>

                    <td
                      style={{
                        padding: 16,
                        color: "#64748b",
                        borderTopRightRadius: 12,
                        borderBottomRightRadius: 12,
                      }}
                    >
                      {new Date(
                        p.paymentDate
                      ).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}