import { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard.php", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => res.json())
    .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="subtitle">Welcome back. Here is your overview.</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-title">Total Students</div>
          <div className="stat-value">{data.stats.totalStudents}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Upcoming Sessions</div>
          <div className="stat-value" style={{ color: "#f59e0b" }}>{data.upcoming.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Sessions Logged</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>{data.stats.totalSessions}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Teaching Hours</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>{data.stats.totalHours}h</div>
        </div>
      </div>
      
      <div className="dashboard-flex-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Upcoming Sessions</h3>
          {data.upcoming.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No upcoming sessions scheduled.</p>
          ) : (
            <div className="table-responsive">
              <table style={{ width: "100%", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "0.5rem" }}>Student</th>
                    <th style={{ padding: "0.5rem" }}>Date</th>
                    <th style={{ padding: "0.5rem" }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.upcoming.map((s: any) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "0.5rem" }}>{s.student_name}</td>
                      <td style={{ padding: "0.5rem" }}>{s.date}</td>
                      <td style={{ padding: "0.5rem" }}>{s.start_time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Recent Logs</h3>
          {data.recent.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No sessions logged yet.</p>
          ) : (
            <div className="table-responsive">
              <table style={{ width: "100%", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "0.5rem" }}>Student</th>
                    <th style={{ padding: "0.5rem" }}>Duration</th>
                    <th style={{ padding: "0.5rem" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((l: any) => (
                    <tr key={l.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "0.5rem" }}>{l.student_name}</td>
                      <td style={{ padding: "0.5rem" }}>{l.duration}</td>
                      <td style={{ padding: "0.5rem" }}>
                        <span style={{ 
                          color: l.status === 'completed' ? 'var(--success)' : 'var(--danger)',
                          fontSize: "0.8rem",
                          fontWeight: 600
                        }}>{l.status.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
