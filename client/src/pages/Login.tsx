import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}` + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="page-title" style={{ textAlign: "center" }}>Welcome Back</h2>
        <p className="subtitle" style={{ textAlign: "center", marginBottom: "2rem" }}>Login to your account</p>
        
        {error && <div className="error-text" style={{ marginBottom: "1rem", textAlign: "center" }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" required className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Login</button>
        </form>
        
        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Register</Link>
        </div>
      </div>
    </div>
  );
}
