import { useEffect, useState } from "react";

export default function Sessions() {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      const res = await fetch("/api/sessions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        setSessions(await res.json());
      }
    };
    fetchSessions();
  }, []);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Sessions</h1>
          <p className="subtitle">Schedule and view upcoming tuition sessions.</p>
        </div>
        <button className="btn btn-primary">+ Schedule Session</button>
      </div>

      <div className="card">
        {sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            No upcoming sessions.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Recurring</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td>{s.Student?.name}</td>
                    <td>{s.subject}</td>
                    <td>{s.date}</td>
                    <td>{s.start_time} - {s.end_time}</td>
                    <td>{s.recurring_type}</td>
                    <td>
                      <button className="btn btn-danger" style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}>Cancel</button>
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
