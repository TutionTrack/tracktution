import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth.php?action=register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      setStep(2);
      setMsg(data.message); // Show the "OTP sent (Debug: ...)" message
    } else {
      setMsg(data.error);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth.php?action=verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });
    if (res.ok) {
      alert("Registration successful. Please login.");
      navigate("/login");
    } else {
      const data = await res.json();
      setMsg(data.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="page-title" style={{ textAlign: "center" }}>Create Account</h2>
        {msg && <div style={{ marginBottom: "1rem", textAlign: "center", color: "var(--primary)" }}>{msg}</div>}
        
        {step === 1 ? (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" required className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Register</button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input type="text" required className="form-input" value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Verify OTP</button>
          </form>
        )}
        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Login</Link>
        </div>
      </div>
    </div>
  );
}
