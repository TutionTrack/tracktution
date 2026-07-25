import { useEffect, useState } from "react";

export default function Reports() {
  const [reportText, setReportText] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("all");

  const checkAuth = (status: number) => {
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("isAdmin");
      window.location.href = "/";
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetch("/api/students.php", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => {
      if (checkAuth(res.status)) return;
      return res.json();
    })
    .then(data => {
      if (data) setStudents(data);
    })
    .catch(err => console.error("Error fetching students:", err));
  }, []);

  const generateReport = async () => {
    const params = new URLSearchParams();
    if (startDate && endDate) {
      params.append("start_date", startDate);
      params.append("end_date", endDate);
    }
    if (selectedStudent && selectedStudent !== "all") {
      params.append("student_id", selectedStudent);
    }
    
    const url = `/api/reports.php?${params.toString()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    if (checkAuth(res.status)) return;
    if (res.ok) {
      const data = await res.json();
      setReportText(data.text);
    }
  };

  const downloadTxtFile = () => {
    const studentObj = students.find(s => s.id.toString() === selectedStudent);
    const studentLabel = studentObj ? studentObj.name.replace(/\s+/g, '_') : "all_students";
    const element = document.createElement("a");
    const file = new Blob([reportText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `tuition_report_${studentLabel}_${startDate || "all"}_to_${endDate || "all"}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="subtitle">Generate and download session reports.</p>
      </div>

      <div className="card">
        <div style={{ marginBottom: "1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
          <div className="form-group" style={{ margin: 0, minWidth: "180px" }}>
            <label className="form-label" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>Student</label>
            <select className="form-input" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
              <option value="all">All Students</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0, minWidth: "150px" }}>
            <label className="form-label" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>Start Date</label>
            <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0, minWidth: "150px" }}>
            <label className="form-label" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>End Date</label>
            <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="btn btn-primary" onClick={generateReport}>Generate Report</button>
            {reportText && (
              <button className="btn" onClick={downloadTxtFile} style={{ border: "1px solid var(--primary)", color: "var(--primary)" }}>
                Download .txt
              </button>
            )}
          </div>
        </div>

        {reportText && (
          <pre style={{ background: "#f1f5f9", padding: "1rem", borderRadius: "8px", overflowX: "auto" }}>
            {reportText}
          </pre>
        )}
      </div>
    </div>
  );
}
