import { useEffect, useState } from "react";

export default function Admin() {
  const [data, setData] = useState<any>(null);
  const [settings, setSettings] = useState({ donation_upi: "", donation_paypal: "", donation_custom: "" });
  const [error, setError] = useState("");

  const checkAuth = (status: number) => {
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("isAdmin");
      window.location.href = "/";
      return true;
    }
    return false;
  };

  const fetchAdminData = async () => {
    try {
      const [adminRes, settingsRes] = await Promise.all([
        fetch("/api/admin.php", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        fetch("/api/settings.php", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      ]);

      if (checkAuth(adminRes.status) || checkAuth(settingsRes.status)) return;

      if (adminRes.ok && settingsRes.ok) {
        setData(await adminRes.json());
        setSettings(await settingsRes.json());
      } else {
        setError("Failed to load admin dashboard settings");
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (userId: number) => {
    setError("");
    try {
      const res = await fetch("/api/admin.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ action: "toggle_active", user_id: userId })
      });
      if (checkAuth(res.status)) return;
      if (res.ok) {
        fetchAdminData();
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to update status");
      }
    } catch (err) {
      setError("Failed to update status");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("WARNING: Are you sure you want to delete this user? This will permanently delete their account, students, scheduled sessions, and teaching logs. This action cannot be undone.")) return;
    setError("");
    try {
      const res = await fetch("/api/admin.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ action: "delete_user", user_id: userId })
      });
      if (checkAuth(res.status)) return;
      if (res.ok) {
        fetchAdminData();
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to delete user");
      }
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/settings.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(settings)
      });
      if (checkAuth(res.status)) return;
      if (res.ok) {
        alert("System settings updated successfully!");
        fetchAdminData();
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to save settings");
      }
    } catch (err) {
      setError("Failed to save settings");
    }
  };

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "var(--danger)", textAlign: "center" }}>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return <div>Loading Admin Panel...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="subtitle">System-wide analytics and user management.</p>
      </div>

      {/* Admin Stats Grid */}
      <div className="dashboard-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-title">Total Teachers</div>
          <div className="stat-value">{data.stats.totalTeachers}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            {data.stats.totalActiveTeachers} Active accounts
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Students</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>{data.stats.totalStudents}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Scheduled Sessions</div>
          <div className="stat-value" style={{ color: "#f59e0b" }}>{data.stats.totalSessions}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Logs Logged</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>{data.stats.totalLogs}</div>
        </div>
      </div>

      {/* Main split grid: User management & Settings */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }} className="dashboard-flex-grid">
        
        {/* Left Side: Users List */}
        <div className="card">
          <h3 style={{ marginBottom: "1.5rem", color: "var(--primary)" }}>Registered Teachers</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.teachers.map((teacher: any) => (
                  <tr key={teacher.id}>
                    <td>{teacher.id}</td>
                    <td style={{ fontWeight: 600 }}>{teacher.name}</td>
                    <td>{teacher.email}</td>
                    <td>
                      <span style={{ 
                        fontSize: "0.75rem", 
                        fontWeight: 600, 
                        padding: "0.2rem 0.5rem", 
                        borderRadius: "4px",
                        background: teacher.is_admin ? "rgba(30, 58, 138, 0.1)" : "rgba(100, 116, 139, 0.1)",
                        color: teacher.is_admin ? "var(--primary)" : "var(--text-muted)"
                      }}>
                        {teacher.is_admin ? "Admin" : "Teacher"}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: "0.75rem", 
                        fontWeight: 600, 
                        padding: "0.2rem 0.5rem", 
                        borderRadius: "4px",
                        background: teacher.is_active ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: teacher.is_active ? "var(--success)" : "var(--danger)"
                      }}>
                        {teacher.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggleStatus(teacher.id)}
                        className="btn"
                        style={{ 
                          padding: "0.25rem 0.5rem", 
                          fontSize: "0.8rem", 
                          color: teacher.is_active ? "var(--danger)" : "var(--success)", 
                          marginRight: "0.5rem",
                          background: "none",
                          border: "1px solid var(--surface-border)"
                        }}
                      >
                        {teacher.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(teacher.id)}
                        className="btn"
                        style={{ 
                          padding: "0.25rem 0.5rem", 
                          fontSize: "0.8rem", 
                          color: "var(--danger)",
                          background: "none",
                          border: "1px solid var(--surface-border)"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Donation & System Settings */}
        <div className="card" style={{ height: "fit-content" }}>
          <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>System Settings</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Configure default settings for payment, donations, and other features. This will be private from Git.
          </p>
          <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>Donation UPI ID (VPA)</label>
              <input 
                placeholder="example@upi" 
                required 
                className="form-input" 
                value={settings.donation_upi} 
                onChange={e => setSettings({...settings, donation_upi: e.target.value})} 
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Used to generate the scan QR and instant app links.</span>
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>PayPal Username</label>
              <input 
                placeholder="sujaykrishna99" 
                required 
                className="form-input" 
                value={settings.donation_paypal} 
                onChange={e => setSettings({...settings, donation_paypal: e.target.value})} 
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Just your username (e.g. paypal.me/USERNAME).</span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: "0.85rem", marginBottom: "0.25rem" }}>Stripe / Custom Donation Link (Apple Pay)</label>
              <input 
                placeholder="https://donate.stripe.com/..." 
                className="form-input" 
                value={settings.donation_custom} 
                onChange={e => setSettings({...settings, donation_custom: e.target.value})} 
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Paste your Stripe Payment Link, Ko-fi, or custom URL here.</span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>Save Settings</button>
          </form>
        </div>

      </div>
    </div>
  );
}
