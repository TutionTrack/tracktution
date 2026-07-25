import { useEffect, useState } from "react";

export default function Sessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newSession, setNewSession] = useState({ student_id: "", subject: "", date: "", start_time: "", end_time: "", recurring_type: "none" });
  const [error, setError] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

  const checkAuth = (status: number) => {
    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
      return true;
    }
    return false;
  };

  const fetchData = async () => {
    const [sRes, stRes] = await Promise.all([
      fetch("/api/sessions.php", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
      fetch("/api/students.php", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
    ]);
    if (checkAuth(sRes.status) || checkAuth(stRes.status)) return;
    if (sRes.ok) setSessions(await sRes.json());
    if (stRes.ok) setStudents(await stRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/sessions.php", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}` 
      },
      body: JSON.stringify({ ...newSession, send_email: sendEmail })
    });
    if (checkAuth(res.status)) return;
    const data = await res.json();
    if (res.ok) {
      setShowForm(false);
      setNewSession({ student_id: "", subject: "", date: "", start_time: "", end_time: "", recurring_type: "none" });
      setError("");
      fetchData();
    } else {
      setError(data.error || "Failed to schedule session");
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this session?")) return;
    const res = await fetch(`/api/sessions.php?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    if (checkAuth(res.status)) return;
    if (res.ok) fetchData();
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Sessions</h1>
          <p className="subtitle">Schedule and view upcoming tuition sessions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setError(""); }}>+ Schedule Session</button>
      </div>

      {showForm && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "500px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "1.5rem", color: "var(--primary)" }}>Schedule Session</h3>
            {error && <div className="error-text" style={{ marginBottom: "1rem", color: "var(--danger)", fontWeight: 500, fontSize: "0.9rem" }}>{error}</div>}
            <form onSubmit={handleSchedule} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <select required className="form-input" value={newSession.student_id} onChange={e => setNewSession({...newSession, student_id: e.target.value})}>
                <option value="">Select Student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input placeholder="Subject" required className="form-input" value={newSession.subject} onChange={e => setNewSession({...newSession, subject: e.target.value})} />
              <input type="date" required className="form-input" value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input type="time" required className="form-input" value={newSession.start_time} onChange={e => setNewSession({...newSession, start_time: e.target.value})} />
                <input type="time" required className="form-input" value={newSession.end_time} onChange={e => setNewSession({...newSession, end_time: e.target.value})} />
              </div>
              <select className="form-input" value={newSession.recurring_type} onChange={e => setNewSession({...newSession, recurring_type: e.target.value})}>
                <option value="none">One-time</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer", userSelect: "none", margin: "0.25rem 0" }}>
                <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} style={{ cursor: "pointer" }} />
                <span>Send email notification to student & teacher</span>
              </label>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Schedule</button>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        {sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No upcoming sessions.</div>
        ) : (
          <div className="table-responsive">
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
                    <td>{s.student_name}</td>
                    <td>{s.subject}</td>
                    <td>{s.date}</td>
                    <td>{s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}</td>
                    <td>{s.recurring_type}</td>
                    <td>
                      <button onClick={() => handleCancel(s.id)} className="btn btn-danger" style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", color: "white" }}>Cancel</button>
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
