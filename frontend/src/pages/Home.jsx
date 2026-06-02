import { useNavigate } from "react-router-dom";
import SubjectCards from "../components/SubjectCards";

function Home() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto", boxSizing: "border-box" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", color: "#1e293b", marginBottom: "10px", fontWeight: "800" }}>Welcome to BrightBudz</h1>
        <p style={{ fontSize: "1.2rem", color: "#64748b" }}>Master your subjects with interactive practice and quizzes.</p>
        
        <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center" }}>
          {isAdmin && (
            <button
              className="primary-button"
              onClick={() => navigate("/add-questions")}
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            >
              ➕ Add Questions
            </button>
          )}
        </div>
      </div>

      <SubjectCards />

    </div>
  );
}

export default Home;
