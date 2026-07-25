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
          <div className="stat-title">Upcoming (This Week)</div>
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
          <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Upcoming Sessions (This Week)</h3>
          {data.upcoming.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>No sessions scheduled for this week.</p>
              <a href="/sessions" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", textDecoration: "none" }}>Schedule Session</a>
            </div>
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
                      <td style={{ padding: "0.5rem" }}>{s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>My Students</h3>
          {data.students.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>No students added yet.</p>
              <a href="/students" className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", textDecoration: "none" }}>Add Student</a>
            </div>
          ) : (
            <div className="table-responsive">
              <table style={{ width: "100%", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "0.5rem" }}>Name</th>
                    <th style={{ padding: "0.5rem" }}>Grade</th>
                    <th style={{ padding: "0.5rem" }}>Board</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((st: any) => (
                    <tr key={st.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "0.5rem", fontWeight: 500 }}>{st.name}</td>
                      <td style={{ padding: "0.5rem" }}>{st.grade}</td>
                      <td style={{ padding: "0.5rem" }}>{st.board}</td>
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
