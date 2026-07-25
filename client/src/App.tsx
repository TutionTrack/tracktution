import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Sessions from "./pages/Sessions";
import LogSession from "./pages/LogSession";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import "./index.css";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    window.location.href = "/";
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
        {localStorage.getItem("isAdmin") === "1" && (
          <Link to="/admin" className={`sidebar-link ${location.pathname === "/admin" ? "active" : ""}`}>Admin Panel</Link>
        )}
        <button onClick={handleLogout} className="sidebar-link" style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>Logout</button>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  return token ? <AuthLayout>{children}</AuthLayout> : <Navigate to="/" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" /> : <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/students" element={<PrivateRoute><Students /></PrivateRoute>} />
        <Route path="/sessions" element={<PrivateRoute><Sessions /></PrivateRoute>} />
        <Route path="/log-session" element={<PrivateRoute><LogSession /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
