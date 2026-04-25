import { useState } from "react";

export default function Reports() {
  const [reportText, setReportText] = useState("");

  const generateReport = async () => {
    const res = await fetch("http://localhost:3000/api/reports", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) {
      const data = await res.json();
      setReportText(data.text);
    }
  };

  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const file = new Blob([reportText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "tuition_report.txt";
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
        <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
          <button className="btn btn-primary" onClick={generateReport}>Generate Full Report</button>
          {reportText && (
            <button className="btn" onClick={downloadTxtFile} style={{ border: "1px solid var(--primary)", color: "var(--primary)" }}>
              Download .txt
            </button>
          )}
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
