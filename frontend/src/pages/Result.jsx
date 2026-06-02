import { useLocation, useNavigate } from "react-router-dom"

function Result() {
  const location = useLocation()
  const navigate = useNavigate()

  const score = location.state?.score ?? 0

  return (
    <div>
      <h2>Quiz Completed 🎉</h2>
      <h3>Your Score: {score}</h3>
      <button onClick={() => navigate("/")}>
        Go Home
      </button>
    </div>
  )
}

export default Result