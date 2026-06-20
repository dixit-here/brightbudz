import { useNavigate } from "react-router-dom";
import SubjectCards from "../components/SubjectCards";

function Home() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";
  const isLoggedIn = !!localStorage.getItem("token");
  const userName = localStorage.getItem("userName");

  return (
    <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", boxSizing: "border-box" }}>

      {/* Hero Section */}
      <div style={{
        textAlign: "center",
        marginBottom: "48px",
        padding: "48px 24px 40px",
        background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(99,102,241,0.08))",
        borderRadius: "24px",
        border: "1px solid rgba(37,99,235,0.12)",
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🎓</div>
        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          background: "linear-gradient(135deg, #2563eb, #6366f1)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontWeight: "900",
          marginBottom: "14px",
          lineHeight: 1.2,
        }}>
          {isLoggedIn ? `Welcome back, ${userName}! 👋` : "Learn Smarter with BrightBudz"}
        </h1>
        <p style={{ fontSize: "1.15rem", color: "#64748b", maxWidth: "560px", margin: "0 auto 28px", lineHeight: 1.6 }}>
          {isLoggedIn
            ? "Pick a subject below and continue your learning journey."
            : "Explore subjects and practice questions — no account needed to get started!"}
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          {isAdmin && (
            <button
              onClick={() => navigate("/add-questions")}
              style={{
                padding: "12px 28px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "white",
                boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(245,158,11,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 14px rgba(245,158,11,0.35)"; }}
            >
              ➕ Add Questions
            </button>
          )}

          {!isLoggedIn && (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: "12px 28px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #2563eb, #1e40af)",
                  color: "white",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.35)"; }}
              >
                🔑 Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                style={{
                  padding: "12px 28px",
                  borderRadius: "12px",
                  border: "2px solid rgba(37,99,235,0.3)",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "700",
                  background: "transparent",
                  color: "#2563eb",
                  transition: "transform 0.2s, border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "rgba(37,99,235,0.06)"; e.currentTarget.style.borderColor = "#2563eb"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(37,99,235,0.3)"; }}
              >
                ✏️ Create Account
              </button>
            </>
          )}
        </div>

        {!isLoggedIn && (
          <p style={{ marginTop: "18px", fontSize: "13px", color: "#94a3b8" }}>
            Or just <strong style={{ color: "#64748b" }}>scroll down</strong> to explore subjects — no login required ↓
          </p>
        )}
      </div>

      {/* Subject Cards */}
      <SubjectCards />
    </div>
  );
}

export default Home;
