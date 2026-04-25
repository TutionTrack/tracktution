import { useEffect, useState } from "react";

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", email: "", phone: "", board: "", grade: "" });

  const fetchStudents = async () => {
    const res = await fetch("/api/students.php", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) {
      setStudents(await res.json());
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/students.php", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}` 
      },
      body: JSON.stringify(newStudent)
    });
    if (res.ok) {
      setShowForm(false);
      setNewStudent({ name: "", email: "", phone: "", board: "", grade: "" });
      fetchStudents();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    const res = await fetch(`/api/students.php?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) fetchStudents();
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Students</h1>
          <p className="subtitle">Manage your student roster.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Student</button>
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
            <h3 style={{ marginBottom: "1.5rem", color: "var(--primary)" }}>Add New Student</h3>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input placeholder="Name" required className="form-input" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
              <input placeholder="Email" className="form-input" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
              <input placeholder="Phone" className="form-input" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} />
              <input placeholder="Board (e.g. CBSE)" className="form-input" value={newStudent.board} onChange={e => setNewStudent({...newStudent, board: e.target.value})} />
              <input placeholder="Grade" className="form-input" value={newStudent.grade} onChange={e => setNewStudent({...newStudent, grade: e.target.value})} />
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Student</button>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        {students.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            No students added yet.
          </div>
        ) : (
          <div className="table-responsive">
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
                      <button 
                        onClick={() => handleDelete(s.id)} 
                        className="btn" 
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", color: "var(--danger)" }}
                      >Delete</button>
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
