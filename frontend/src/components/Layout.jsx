import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

function Layout({ children }) {
  const [darkMode, setDarkMode] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"))
  const navigate = useNavigate()
  const menuRef = useRef(null)

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light"
  }, [darkMode])

  // Stay in sync if another tab logs in/out
  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(!!localStorage.getItem("token"))
    window.addEventListener("storage", syncAuth)
    return () => window.removeEventListener("storage", syncAuth)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("userName")
    setIsLoggedIn(false)
    setMenuOpen(false)
    navigate("/")
  }

  const go = (path) => {
    navigate(path)
    setMenuOpen(false)
  }

  return (
    <div className="container">

      <header className="header">
        <div className="header-top">
          <h1 onClick={() => go("/")} style={{ cursor: "pointer" }}>BrightBudz</h1>

          {/* User badge – always visible when logged in; Login pill for guests */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isLoggedIn ? (
              <span className="user-badge">
                👤 {localStorage.getItem("userName")}
                <span className="role-tag" style={{
                  background: localStorage.getItem("role") === "admin" ? "#f59e0b" : "#22c55e"
                }}>
                  {localStorage.getItem("role")}
                </span>
              </span>
            ) : (
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: "7px 18px",
                  borderRadius: "20px",
                  border: "1.5px solid rgba(255,255,255,0.6)",
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  transition: "background 0.2s, border-color 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.28)"; e.currentTarget.style.borderColor = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; }}
                aria-label="Login"
              >
                🔑 Login
              </button>
            )}

            {/* Hamburger button */}
            <div className="hamburger-wrapper" ref={menuRef}>
              <button
                className="hamburger-button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Menu"
              >
                <span className={`hamburger-icon ${menuOpen ? "open" : ""}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>

              {/* Dropdown menu */}
              <div className={`hamburger-menu ${menuOpen ? "show" : ""}`}>
                <button className="menu-item" onClick={() => go("/")}>
                  🏠 Home
                </button>

                {!isLoggedIn ? (
                  <>
                    <button className="menu-item" onClick={() => go("/login")}>
                      🔑 Login
                    </button>
                    <button className="menu-item" onClick={() => go("/signup")}>
                      ✏️ Signup
                    </button>
                  </>
                ) : (
                  <button className="menu-item logout" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                )}

                {isLoggedIn && localStorage.getItem("role") === "admin" && (
                  <button className="menu-item" onClick={() => go("/add-questions")}>
                    ➕ Add Questions
                  </button>
                )}

                <div className="menu-divider"></div>

                <button
                  className="menu-item toggle"
                  onClick={() => { setDarkMode(!darkMode); setMenuOpen(false) }}
                >
                  {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Top Ad */}
      <div className="ad-banner">
        Top Ad Space (728x90)
      </div>

      <div className="layout-row">

        {/* Left Side Ad (Desktop only) */}
        <div className="side-ad">
          Side Ad
        </div>

        <main className="main-content">
          {children}
        </main>

        {/* Right Side Ad */}
        <div className="side-ad">
          Side Ad
        </div>

      </div>

      {/* Sticky Bottom Ad */}
      <div className="ad-banner sticky-ad">
        Sticky Bottom Ad
      </div>

    </div>
  )
}

export default Layout
