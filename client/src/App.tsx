import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Sessions from "./pages/Sessions";
import LogSession from "./pages/LogSession";
import Reports from "./pages/Reports";
import "./index.css";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand">Tuition Tracker</div>
        <Link to="/dashboard" className={`sidebar-link ${location.pathname === "/dashboard" ? "active" : ""}`}>Dashboard</Link>
        <Link to="/students" className={`sidebar-link ${location.pathname === "/students" ? "active" : ""}`}>Students</Link>
        <Link to="/sessions" className={`sidebar-link ${location.pathname === "/sessions" ? "active" : ""}`}>Sessions</Link>
        <Link to="/log-session" className={`sidebar-link ${location.pathname === "/log-session" ? "active" : ""}`}>Log Session</Link>
        <Link to="/reports" className={`sidebar-link ${location.pathname === "/reports" ? "active" : ""}`}>Reports</Link>
        <div style={{ marginTop: "auto" }}>
          <button onClick={handleLogout} className="sidebar-link" style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  return token ? <AuthLayout>{children}</AuthLayout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/students" element={<PrivateRoute><Students /></PrivateRoute>} />
        <Route path="/sessions" element={<PrivateRoute><Sessions /></PrivateRoute>} />
        <Route path="/log-session" element={<PrivateRoute><LogSession /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
