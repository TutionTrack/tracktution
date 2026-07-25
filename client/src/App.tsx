import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Sessions from "./pages/Sessions";
import LogSession from "./pages/LogSession";
import Reports from "./pages/Reports";
import Admin from "./pages/Admin";
import Donate from "./pages/Donate";
import "./index.css";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    window.location.href = "/";
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <header className="mobile-navbar">
        <button className="menu-toggle-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="mobile-brand">Tuition Tracker</div>
        <div style={{ width: "24px" }}></div>
      </header>

      {/* Menu Overlay Backdrop */}
      {menuOpen && <div className="menu-backdrop" onClick={closeMenu}></div>}

      {/* Sidebar / Mobile Drawer Drawer */}
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-mobile-header">
          <div className="sidebar-brand" style={{ marginBottom: 0, paddingLeft: 0 }}>Tuition Tracker</div>
          <button className="menu-close-btn" onClick={closeMenu}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="sidebar-brand-desktop">Tuition Tracker</div>

        <div className="sidebar-links-container" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Link to="/dashboard" onClick={closeMenu} className={`sidebar-link ${location.pathname === "/dashboard" ? "active" : ""}`}>Dashboard</Link>
          <Link to="/students" onClick={closeMenu} className={`sidebar-link ${location.pathname === "/students" ? "active" : ""}`}>Students</Link>
          <Link to="/sessions" onClick={closeMenu} className={`sidebar-link ${location.pathname === "/sessions" ? "active" : ""}`}>Sessions</Link>
          <Link to="/log-session" onClick={closeMenu} className={`sidebar-link ${location.pathname === "/log-session" ? "active" : ""}`}>Log Session</Link>
          <Link to="/reports" onClick={closeMenu} className={`sidebar-link ${location.pathname === "/reports" ? "active" : ""}`}>Reports</Link>
          {localStorage.getItem("isAdmin") === "1" && (
            <Link to="/admin" onClick={closeMenu} className={`sidebar-link ${location.pathname === "/admin" ? "active" : ""}`}>Admin Panel</Link>
          )}
          <Link to="/donate" onClick={closeMenu} className={`sidebar-link ${location.pathname === "/donate" ? "active" : ""}`} style={{ color: "#f59e0b", fontWeight: "600" }}>💖 Donate</Link>
          <button onClick={handleLogout} className="sidebar-link" style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}>Logout</button>
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
        <Route path="/donate" element={<PrivateRoute><Donate /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
