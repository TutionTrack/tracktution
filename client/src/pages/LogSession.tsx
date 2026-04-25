import { useState, useEffect } from "react";

export default function LogSession() {
  const [students, setStudents] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("completed");
  const [comments, setComments] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}` + "/api/students", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => res.json())
    .then(data => setStudents(data));
  }, []);

  const calculateDuration = () => {
    if (!startTime || !endTime) return "";
    const [h1, m1] = startTime.split(":").map(Number);
    const [h2, m2] = endTime.split(":").map(Number);
    let durationMins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (durationMins < 0) durationMins += 24 * 60; // Cross midnight
    const hrs = Math.floor(durationMins / 60);
    const mins = durationMins % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}` + "/api/logs", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        student_id: studentId,
        date,
        start_time: startTime,
        end_time: endTime,
        duration: calculateDuration(),
        status,
        comments
      })
    });
    if (res.ok) {
      alert("Session logged successfully!");
      setStudentId(""); setDate(""); setStartTime(""); setEndTime(""); setComments("");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Log a Session</h1>
        <p className="subtitle">Record completed, missed, or cancelled sessions.</p>
      </div>

      <div className="card" style={{ maxWidth: "600px" }}>
        <form onSubmit={handleLog}>
          <div className="form-group">
            <label className="form-label">Student</label>
            <select className="form-input" required value={studentId} onChange={e => setStudentId(e.target.value)}>
              <option value="">Select a student...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" required className="form-input" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Start Time</label>
              <input type="time" required className="form-input" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">End Time</label>
              <input type="time" required className="form-input" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
          
          {startTime && endTime && (
            <div style={{ marginBottom: "1.5rem", color: "var(--primary)", fontWeight: 600 }}>
              Calculated Duration: {calculateDuration()}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Comments / Notes</label>
            <textarea className="form-input" rows={4} value={comments} onChange={e => setComments(e.target.value)}></textarea>
          </div>

          <button type="submit" className="btn btn-primary">Log Session</button>
        </form>
      </div>
    </div>
  );
}
