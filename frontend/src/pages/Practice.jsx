import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import QuestionCard from "../components/QuestionCard"

function Practice() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})    // { index: { selectedOption, result } }
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const subjectFilter = searchParams.get('subject')
  const gradeFilter = searchParams.get('class')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (subjectFilter) params.set('subject', subjectFilter)
    if (gradeFilter) params.set('grade', gradeFilter)

    const url = params.toString()
      ? `http://localhost:5000/api/questions/practice?${params.toString()}`
      : "http://localhost:5000/api/questions/practice"

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setQuestions(data)
        } else {
          setQuestions([])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [subjectFilter, gradeFilter])

  const handleOptionClick = async (index, option) => {
    if (answers[index]) return // already answered

    const selectedIndex = questions[index].options.indexOf(option)

    try {
      const res = await fetch("http://localhost:5000/api/questions/practice/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: questions[index].id,
          selectedIndex
        })
      })
      const data = await res.json()
      setAnswers(prev => ({
        ...prev,
        [index]: {
          selectedOption: option,
          isCorrect: data.isCorrect,
          correctAnswerIndex: data.correctAnswerIndex,
          explanation: data.explanation
        }
      }))
    } catch {
      setAnswers(prev => ({
        ...prev,
        [index]: { selectedOption: option, isCorrect: false, correctAnswerIndex: 0 }
      }))
    }
  }

  if (loading) {
    return <div className="card"><p>Loading questions...</p></div>
  }

  if (questions.length === 0) {
    return (
      <div className="card">
        <h2>Practice Mode 📘</h2>
        <p style={{ marginTop: "15px" }}>No questions available yet. Add some questions first!</p>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ textAlign: "center", textTransform: "capitalize" }}>
        {subjectFilter ? `${subjectFilter.replace('-', ' ')} Practice 📘` : "Practice Mode 📘"}
      </h2>
      <p style={{ textAlign: "center", marginBottom: "20px", color: "#888" }}>
        {questions.length} questions available
      </p>

      {questions.map((q, index) => {
        const answer = answers[index]
        return (
          <div key={q.id} style={{ marginBottom: "20px" }}>
            <QuestionCard
              questionData={{
                question: q.question,
                options: q.options,
                correctAnswerIndex: answer ? answer.correctAnswerIndex : null
              }}
              questionNumber={index + 1}
              totalQuestions={questions.length}
              selectedOption={answer ? answer.selectedOption : null}
              onOptionClick={(option) => handleOptionClick(index, option)}
              showResult={!!answer}
            />

            {answer && (
              <div style={{
                maxWidth: "600px",
                margin: "5px auto 0",
                padding: "12px 20px",
                borderRadius: "0 0 12px 12px",
                background: answer.isCorrect ? "#f0fdf4" : "#fef2f2",
                textAlign: "center"
              }}>
                <p style={{ fontWeight: "bold", color: answer.isCorrect ? "green" : "red" }}>
                  {answer.isCorrect ? "✅ Correct!" : "❌ Incorrect"}
                </p>
                {answer.explanation && (
                  <p style={{ marginTop: "5px", fontSize: "14px" }}>
                    💡 {answer.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Practice