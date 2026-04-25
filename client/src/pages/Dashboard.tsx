import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({ totalStudents: 0, upcomingSessions: 0, completedWeek: 0, hoursMonth: 0 });

  useEffect(() => {
    // In a real app, fetch these from an API endpoint
    // Example: fetch('/api/dashboard', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    setStats({
      totalStudents: 12,
      upcomingSessions: 5,
      completedWeek: 8,
      hoursMonth: 32
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="subtitle">Welcome back. Here is your overview.</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-title">Total Students</div>
          <div className="stat-value">{stats.totalStudents}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Upcoming Sessions</div>
          <div className="stat-value" style={{ color: "#f59e0b" }}>{stats.upcomingSessions}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Sessions Completed (Week)</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>{stats.completedWeek}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Teaching Hours (Month)</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>{stats.hoursMonth}h</div>
        </div>
      </div>
      
      <div className="card">
        <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Recent Activity Placeholder</h3>
        <p style={{ color: "var(--text-muted)" }}>This area can hold a list of recently logged sessions or upcoming schedule.</p>
      </div>
    </div>
  );
}
