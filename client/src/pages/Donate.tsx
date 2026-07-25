import { useEffect, useState } from "react";

export default function Donate() {
  const [settings, setSettings] = useState<any>(null);
  const [error, setError] = useState("");
  const [donateAmount, setDonateAmount] = useState("100");
  const [isMobile, setIsMobile] = useState(false);

  const checkAuth = (status: number) => {
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("isAdmin");
      window.location.href = "/";
      return true;
    }
    return false;
  };

  useEffect(() => {
    // Detect mobile device
    const mobileCheck = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);

    fetch("/api/settings.php", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => {
      if (checkAuth(res.status)) return;
      return res.json();
    })
    .then(setSettings)
    .catch(err => {
      console.error(err);
      setError("Failed to load donation details");
    });
  }, []);

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "var(--danger)", textAlign: "center" }}>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!settings) return <div>Loading support panel...</div>;

  const upiUrl = `upi://pay?pa=${settings.donation_upi}&pn=Tuition%20Tracker%20Support&am=${donateAmount}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    `upi://pay?pa=${settings.donation_upi}&pn=Tuition%20Tracker%20Support&cu=INR`
  )}`;

  const handleUpiClick = () => {
    window.location.href = upiUrl;
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 120px)", padding: "1rem" }}>
      <div className="card" style={{ width: "100%", maxWidth: "550px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", border: "1px solid var(--surface-border)" }}>
        
        {/* Support Badge Icon */}
        <div style={{ 
          width: "70px", 
          height: "70px", 
          background: "linear-gradient(135deg, #f59e0b, #d97706)", 
          borderRadius: "50%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          margin: "0 auto 1.5rem auto",
          boxShadow: "0 8px 16px rgba(217, 119, 6, 0.2)",
          color: "white",
          fontSize: "1.75rem"
        }}>
          💖
        </div>

        <h2 style={{ color: "var(--primary)", marginBottom: "0.5rem" }}>Support Tuition Tracker</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "1.5rem" }}>
          Enjoying this app? If this tool has made managing your classes and billing easier, feel free to buy me a coffee! Any donation helps keep the project running and supports future updates.
        </p>

        {/* Amount Picker Selector */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            {["50", "100", "200", "500"].map((amt) => (
              <button
                key={amt}
                onClick={() => setDonateAmount(amt)}
                className="btn"
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                  background: donateAmount === amt ? "var(--primary)" : "var(--surface)",
                  color: donateAmount === amt ? "white" : "var(--text-main)",
                  border: "1px solid var(--surface-border)",
                  transition: "all 0.2s"
                }}
              >
                ₹{amt}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>Custom Amount (₹):</span>
            <input
              type="number"
              className="form-input"
              style={{ width: "100px", padding: "0.4rem 0.6rem", textAlign: "center", fontSize: "0.9rem" }}
              value={donateAmount}
              onChange={e => setDonateAmount(e.target.value)}
              placeholder="100"
            />
          </div>
        </div>

        {/* Dynamic Payment Split Options */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", borderTop: "1px solid var(--surface-border)", paddingTop: "1.5rem" }} className="dashboard-flex-grid">
          
          {/* Option A: Scan UPI (Best for desktop) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h4 style={{ color: "var(--primary)", fontSize: "0.9rem", marginBottom: "0.75rem" }}>Option A: Scan UPI QR</h4>
            <div style={{ padding: "0.5rem", background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", display: "inline-block", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <img src={qrCodeUrl} alt="UPI Payment QR Code" style={{ display: "block" }} />
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Scan with GPay, PhonePe, or Paytm</span>
          </div>

          {/* Option B: Mobile UPI Intent / Paypal / Card links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", justifyContent: "center", alignItems: "center" }}>
            <h4 style={{ color: "var(--primary)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>Option B: Pay Online</h4>
            
            {/* UPI Mobile Intent link (Only shown on mobile devices since it won't work on laptops) */}
            {isMobile ? (
              <button
                onClick={handleUpiClick}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  maxWidth: "220px",
                  padding: "0.75rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  borderColor: "transparent",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                📱 Open UPI App (GPay/PhonePe)
              </button>
            ) : (
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center" }}>
                Use GPay/PhonePe on your phone to scan the QR code.
              </span>
            )}

            {/* Paypal Button */}
            <a
              href={`https://paypal.me/${settings.donation_paypal}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                width: "100%",
                maxWidth: "220px",
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                textDecoration: "none",
                fontWeight: 600,
                border: "1px solid var(--surface-border)"
              }}
            >
              💳 Pay with PayPal
            </a>

            {/* Universal custom link (e.g. Stripe / Razorpay link) */}
            {settings.donation_custom && settings.donation_custom !== 'your-custom-link' && settings.donation_custom !== '' && (
              <a
                href={settings.donation_custom}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  width: "100%",
                  maxWidth: "220px",
                  padding: "0.75rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  textDecoration: "none",
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  borderColor: "transparent",
                  fontWeight: 600
                }}
              >
                🌐 Credit Card / NetBanking
              </a>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
