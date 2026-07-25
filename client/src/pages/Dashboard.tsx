import { useEffect, useState } from "react";

const CalendarHelper = ({ sessions }: { sessions: any[] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = [];
  // Empty slots for preceding month days
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(<div key={`empty-${i}`} style={{ padding: "0.5rem", textAlign: "center" }}></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const daySessions = sessions.filter((s: any) => s.date === dateStr);
    const hasSessions = daySessions.length > 0;
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
    const isSelected = selectedDate === dateStr;

    days.push(
      <div 
        key={day} 
        onClick={() => setSelectedDate(dateStr)}
        style={{
          padding: "0.5rem",
          textAlign: "center",
          cursor: "pointer",
          borderRadius: "8px",
          position: "relative",
          backgroundColor: isSelected ? "var(--primary)" : isToday ? "rgba(30, 58, 138, 0.1)" : "transparent",
          color: isSelected ? "white" : isToday ? "var(--primary)" : "var(--text-main)",
          fontWeight: isToday || isSelected ? 700 : 400,
          border: isToday ? "1px solid var(--primary)" : "none"
        }}
      >
        {day}
        {hasSessions && (
          <span style={{
            position: "absolute",
            bottom: "3px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "4px",
            height: "4px",
            backgroundColor: isSelected ? "white" : "#f59e0b",
            borderRadius: "50%"
          }}></span>
        )}
      </div>
    );
  }

  const selectedSessions = sessions.filter((s: any) => s.date === selectedDate);

  return (
    <div className="card" style={{ height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h3 style={{ color: "var(--primary)", margin: 0, fontSize: "1.1rem" }}>Monthly Schedule</h3>
        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
          <button className="btn" onClick={prevMonth} style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", background: "none", border: "1px solid var(--surface-border)" }}>&larr;</button>
          <span style={{ fontWeight: 600, fontSize: "0.85rem", minWidth: "90px", textAlign: "center" }}>{monthNames[month]} {year}</span>
          <button className="btn" onClick={nextMonth} style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", background: "none", border: "1px solid var(--surface-border)" }}>&rarr;</button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem", fontSize: "0.8rem", marginBottom: "1rem" }}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <div key={d} style={{ textAlign: "center", fontWeight: 600, color: "var(--text-muted)", paddingBottom: "0.25rem" }}>{d}</div>
        ))}
        {days}
      </div>

      {/* Selected Day Details */}
      {selectedDate ? (
        <div style={{ borderTop: "1px solid var(--surface-border)", paddingTop: "1rem", marginTop: "0.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", color: "var(--primary)", marginBottom: "0.5rem" }}>
            Schedule for {selectedDate}
          </h4>
          {selectedSessions.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>No sessions scheduled for this day.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "150px", overflowY: "auto" }}>
              {selectedSessions.map((s: any) => (
                <div key={s.id} style={{ padding: "0.5rem", background: "var(--bg-color)", borderRadius: "6px", fontSize: "0.8rem", borderLeft: "3px solid #f59e0b" }}>
                  <div style={{ fontWeight: 600 }}>{s.subject}</div>
                  <div style={{ color: "var(--text-muted)" }}>
                    Student: {s.student_name} | {s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", borderTop: "1px solid var(--surface-border)", paddingTop: "1rem", margin: 0 }}>
          Click a date with a dot to see schedule details
        </p>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard.php", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => {
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
        throw new Error("Unauthorized");
      }
      return res.json();
    })
    .then(setData)
    .catch(err => console.error("Error fetching dashboard data:", err));
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
      
      <div className="dashboard-flex-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
        {/* Left Column (Upcoming Week Roster & Students) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Card 1: Upcoming Sessions */}
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

          {/* Card 2: My Students */}
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

        {/* Right Column (Visual Calendar Card) */}
        <div>
          <CalendarHelper sessions={data.calendarSessions || []} />
        </div>
      </div>
    </div>
  );
}
