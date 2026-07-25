import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  // Views: 'login' | 'forgot' | 'reset'
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
  
  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth.php?action=login", {
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth.php?action=forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setView('reset');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to send reset request");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      const res = await fetch("/api/auth.php?action=reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp, password: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Password updated successfully. Please login.");
        setView('login');
        setPassword("");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to reset password");
    }
  };

  return (
    <div className="landing-container">
      {/* Informative Left Panel */}
      <div className="landing-info-side">
        <div className="landing-info-content">
          <div className="landing-logo">Tuition Tracker</div>
          <p className="landing-tagline">
            The smart way for independent educators to manage students, schedule lessons, track hours, and generate invoices effortlessly.
          </p>
          
          <div className="landing-features">
            <div className="landing-feature-item">
              <div className="landing-feature-icon">📅</div>
              <div>
                <h4 className="landing-feature-title">Overlap-Free Scheduling</h4>
                <p className="landing-feature-desc">Schedule classes without worries. The system automatically prevents double-bookings.</p>
              </div>
            </div>
            
            <div className="landing-feature-item">
              <div className="landing-feature-icon">✉️</div>
              <div>
                <h4 className="landing-feature-title">Smart Email Notifications</h4>
                <p className="landing-feature-desc">Sends automatic daily digests and calendar updates to you and your students.</p>
              </div>
            </div>
            
            <div className="landing-feature-item">
              <div className="landing-feature-icon">📊</div>
              <div>
                <h4 className="landing-feature-title">Teaching Dashboard</h4>
                <p className="landing-feature-desc">See your hours, active students, and logged details updated in real time.</p>
              </div>
            </div>

            <div className="landing-feature-item">
              <div className="landing-feature-icon">📑</div>
              <div>
                <h4 className="landing-feature-title">Flexible Reports</h4>
                <p className="landing-feature-desc">Pick custom date ranges to generate and download tuition logs for quick billing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Right Auth Panel */}
      <div className="landing-auth-side">
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div className="mobile-logo-header" style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 style={{ color: "var(--primary)", fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.05em" }}>Tuition Tracker</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>Independent Educator Platform</p>
          </div>
          
          <div className="auth-box" style={{ boxShadow: 'none', border: '1px solid var(--surface-border)', maxWidth: 'none' }}>
          {view === 'login' && (
            <>
              <h2 className="page-title" style={{ textAlign: "center", marginBottom: "0.5rem" }}>Welcome Back</h2>
              <p className="subtitle" style={{ textAlign: "center", marginBottom: "2rem" }}>Login to your account</p>
              
              {error && <div className="error-text" style={{ marginBottom: "1rem", textAlign: "center" }}>{error}</div>}
              {message && <div className="success-text" style={{ marginBottom: "1rem", textAlign: "center" }}>{message}</div>}
              
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <label className="form-label" style={{ margin: 0 }}>Password</label>
                    <button 
                      type="button" 
                      onClick={() => { setView('forgot'); setError(""); setMessage(""); }}
                      style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.85rem", cursor: "pointer", fontWeight: 500 }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      className="form-input" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 600
                      }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Login</button>
              </form>
              
              <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
                Don't have an account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Register</Link>
              </div>
            </>
          )}

          {view === 'forgot' && (
            <>
              <h2 className="page-title" style={{ textAlign: "center", marginBottom: "0.5rem" }}>Reset Password</h2>
              <p className="subtitle" style={{ textAlign: "center", marginBottom: "2rem" }}>Enter your email to receive a recovery code</p>
              
              {error && <div className="error-text" style={{ marginBottom: "1rem", textAlign: "center" }}>{error}</div>}
              
              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className="form-input" 
                    value={forgotEmail} 
                    onChange={(e) => setForgotEmail(e.target.value)} 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginBottom: "1rem" }}>Send Code</button>
                <button 
                  type="button" 
                  onClick={() => { setView('login'); setError(""); }} 
                  className="btn" 
                  style={{ width: "100%", background: "none", border: "1px solid var(--surface-border)", color: "var(--text-muted)" }}
                >
                  Back to Login
                </button>
              </form>
            </>
          )}

          {view === 'reset' && (
            <>
              <h2 className="page-title" style={{ textAlign: "center", marginBottom: "0.5rem" }}>New Password</h2>
              <p className="subtitle" style={{ textAlign: "center", marginBottom: "2rem" }}>Enter the code sent to your inbox and choose a new password</p>
              
              {error && <div className="error-text" style={{ marginBottom: "1rem", textAlign: "center" }}>{error}</div>}
              {message && <div className="success-text" style={{ marginBottom: "1rem", textAlign: "center", color: "var(--success)" }}>{message}</div>}
              
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label className="form-label">Reset Code (OTP)</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    placeholder="Enter 6-digit code"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input 
                    type="password" 
                    required 
                    className="form-input" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input 
                    type="password" 
                    required 
                    className="form-input" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginBottom: "1rem" }}>Reset Password</button>
                <button 
                  type="button" 
                  onClick={() => { setView('login'); setError(""); setMessage(""); }} 
                  className="btn" 
                  style={{ width: "100%", background: "none", border: "1px solid var(--surface-border)", color: "var(--text-muted)" }}
                >
                  Cancel
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
