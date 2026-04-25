import { useEffect, useState } from "react";

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await fetch("/api/students", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        setStudents(await res.json());
      }
    };
    fetchStudents();
  }, []);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Students</h1>
          <p className="subtitle">Manage your student roster.</p>
        </div>
        <button className="btn btn-primary">+ Add Student</button>
      </div>

      <div className="card">
        {students.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            No students added yet.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Board</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.board}</td>
                    <td>{s.grade}</td>
                    <td>
                      <button className="btn" style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}>Edit</button>
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
