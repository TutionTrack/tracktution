import { useEffect, useState } from "react";

export default function Sessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newSession, setNewSession] = useState({ student_id: "", subject: "", date: "", start_time: "", end_time: "", recurring_type: "none" });
  const [error, setError] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

  // Board View States
  const [viewTab, setViewTab] = useState<'board' | 'list'>('board');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday of this week
    return new Date(d.setDate(diff));
  });

  // Reschedule Modal State
  const [rescheduleData, setRescheduleData] = useState<any | null>(null);
  const [rescheduleError, setRescheduleError] = useState("");
  const [rescheduleSendEmail, setRescheduleSendEmail] = useState(true);

  const checkAuth = (status: number) => {
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("isAdmin");
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

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRescheduleError("");
    const res = await fetch("/api/sessions.php", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        id: rescheduleData.id,
        date: rescheduleData.date,
        start_time: rescheduleData.start_time,
        end_time: rescheduleData.end_time,
        recurring_type: rescheduleData.recurring_type,
        send_email: rescheduleSendEmail
      })
    });
    if (checkAuth(res.status)) return;
    const data = await res.json();
    if (res.ok) {
      setRescheduleData(null);
      setRescheduleError("");
      fetchData();
    } else {
      setRescheduleError(data.error || "Failed to reschedule session");
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this session? This will notify both teacher and student via email.")) return;
    const res = await fetch(`/api/sessions.php?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    if (checkAuth(res.status)) return;
    if (res.ok) fetchData();
  };

  // Week helper methods
  const changeWeek = (offsetWeeks: number) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (offsetWeeks * 7));
    setCurrentWeekStart(newDate);
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getFormattedDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, session: any) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(session));
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData("text/plain");
    if (!dataStr) return;
    try {
      const session = JSON.parse(dataStr);
      if (session.date === targetDateStr) return; // Same day

      setRescheduleError("");
      setRescheduleData({
        id: session.id,
        subject: session.subject,
        student_id: session.student_id,
        student_name: session.student_name,
        date: targetDateStr,
        start_time: session.start_time,
        end_time: session.end_time,
        recurring_type: session.recurring_type
      });
    } catch (err) {
      console.error("Error parsing drag data", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const weekDates = getWeekDates();
  const weekStartStr = weekDates[0].toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const weekEndStr = weekDates[6].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="page-title">Sessions</h1>
          <p className="subtitle">Schedule and view upcoming tuition sessions.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {/* Tab Selection */}
          <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: "8px", padding: "0.25rem" }}>
            <button 
              className="btn" 
              onClick={() => setViewTab('board')} 
              style={{ 
                padding: "0.4rem 1rem", 
                fontSize: "0.85rem", 
                borderRadius: "6px",
                background: viewTab === 'board' ? 'var(--primary)' : 'transparent',
                color: viewTab === 'board' ? 'white' : 'var(--text-muted)'
              }}
            >
              Weekly Board
            </button>
            <button 
              className="btn" 
              onClick={() => setViewTab('list')} 
              style={{ 
                padding: "0.4rem 1rem", 
                fontSize: "0.85rem", 
                borderRadius: "6px",
                background: viewTab === 'list' ? 'var(--primary)' : 'transparent',
                color: viewTab === 'list' ? 'white' : 'var(--text-muted)'
              }}
            >
              List View
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setError(""); }}>+ Schedule Session</button>
        </div>
      </div>

      {/* Week Navigator (Only for board view) */}
      {viewTab === 'board' && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", background: "var(--surface)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--surface-border)" }}>
          <button className="btn" onClick={() => changeWeek(-1)} style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", background: "none", border: "1px solid var(--surface-border)" }}>&larr; Prev Week</button>
          <span style={{ fontWeight: 700, color: "var(--primary)" }}>{weekStartStr} - {weekEndStr}</span>
          <button className="btn" onClick={() => changeWeek(1)} style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", background: "none", border: "1px solid var(--surface-border)" }}>Next Week &rarr;</button>
        </div>
      )}

      {/* Schedule Create Form Popup */}
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

      {/* Reschedule/Manual-Edit Confirmation Modal */}
      {rescheduleData && (
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
            <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Reschedule Session</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Rescheduling <strong>{rescheduleData.subject}</strong> for <strong>{rescheduleData.student_name}</strong>.
            </p>
            {rescheduleError && <div className="error-text" style={{ marginBottom: "1rem", color: "var(--danger)", fontWeight: 500, fontSize: "0.9rem" }}>{rescheduleError}</div>}
            <form onSubmit={handleRescheduleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>Date</label>
                <input type="date" required className="form-input" value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                  <label className="form-label" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>Start Time</label>
                  <input type="time" required className="form-input" value={rescheduleData.start_time} onChange={e => setRescheduleData({...rescheduleData, start_time: e.target.value})} />
                </div>
                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                  <label className="form-label" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>End Time</label>
                  <input type="time" required className="form-input" value={rescheduleData.end_time} onChange={e => setRescheduleData({...rescheduleData, end_time: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>Recurring Type</label>
                <select className="form-input" value={rescheduleData.recurring_type} onChange={e => setRescheduleData({...rescheduleData, recurring_type: e.target.value})}>
                  <option value="none">One-time</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer", userSelect: "none", margin: "0.25rem 0" }}>
                <input type="checkbox" checked={rescheduleSendEmail} onChange={e => setRescheduleSendEmail(e.target.checked)} style={{ cursor: "pointer" }} />
                <span>Send reschedule notification email</span>
              </label>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm Reschedule</button>
                <button type="button" className="btn btn-danger" style={{ flex: 1, color: "white" }} onClick={() => handleCancel(rescheduleData.id)}>Cancel Session</button>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setRescheduleData(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WEEKLY BOARD VIEW */}
      {viewTab === 'board' && (
        <div className="weekly-board-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1rem", overflowX: "auto" }}>
          {weekDates.map((dayDate) => {
            const dateStr = getFormattedDateString(dayDate);
            const dayName = dayDate.toLocaleDateString(undefined, { weekday: "short" });
            const dayNum = dayDate.getDate();
            const isToday = new Date().toDateString() === dayDate.toDateString();

            // Filter sessions for this day
            const daySessions = sessions.filter(s => s.date === dateStr);

            return (
              <div 
                key={dateStr}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dateStr)}
                style={{
                  background: isToday ? "rgba(30, 58, 138, 0.03)" : "var(--surface)",
                  border: isToday ? "2px solid var(--primary)" : "1px solid var(--surface-border)",
                  borderRadius: "12px",
                  padding: "0.75rem",
                  minHeight: "400px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  transition: "all 0.2s"
                }}
              >
                {/* Column Day Header */}
                <div style={{ 
                  textAlign: "center", 
                  paddingBottom: "0.5rem", 
                  borderBottom: "1px solid var(--surface-border)",
                  color: isToday ? "var(--primary)" : "var(--text-main)",
                  fontWeight: isToday ? 700 : 500
                }}>
                  <div style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)" }}>{dayName}</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{dayNum}</div>
                </div>

                {/* Day Session List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                  {daySessions.map(s => (
                    <div
                      key={s.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, s)}
                      onClick={() => {
                        setRescheduleError("");
                        setRescheduleData(s);
                      }}
                      style={{
                        padding: "0.75rem",
                        background: "var(--bg-color)",
                        borderRadius: "8px",
                        borderLeft: "4px solid var(--accent)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        cursor: "grab",
                        fontSize: "0.85rem",
                        transition: "transform 0.1s"
                      }}
                    >
                      <div style={{ fontWeight: 600, color: "var(--primary)" }}>{s.subject}</div>
                      <div style={{ fontWeight: 500, margin: "0.15rem 0", color: "var(--text-main)" }}>{s.student_name}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        🕒 {s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}
                      </div>
                    </div>
                  ))}
                  {daySessions.length === 0 && (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "0.75rem", fontStyle: "italic", textAlign: "center", border: "1px dashed var(--surface-border)", borderRadius: "8px", padding: "1rem" }}>
                      Drop here to reschedule
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW (Table representation) */}
      {viewTab === 'list' && (
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
                      <td style={{ fontWeight: 600 }}>{s.student_name}</td>
                      <td>{s.subject}</td>
                      <td>{s.date}</td>
                      <td>{s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}</td>
                      <td>{s.recurring_type}</td>
                      <td>
                        <button 
                          onClick={() => {
                            setRescheduleError("");
                            setRescheduleData(s);
                          }} 
                          className="btn" 
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", color: "var(--accent)", marginRight: "0.5rem", background: "none", border: "1px solid var(--surface-border)" }}
                        >
                          Reschedule
                        </button>
                        <button onClick={() => handleCancel(s.id)} className="btn btn-danger" style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", color: "white" }}>Cancel</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
