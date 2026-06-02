import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import QuestionCard from "../components/QuestionCard"

function Quiz() {
  const navigate = useNavigate()

  const questions = [
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      answer: "4"
    },
    {
      question: "Capital of France?",
      options: ["Berlin", "Madrid", "Paris", "Rome"],
      answer: "Paris"
    }
  ]

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [timeLeft, setTimeLeft] = useState(10)

  useEffect(() => {
    if (timeLeft === 0) {
      handleNext()
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft])

  const handleOptionClick = (option) => {
    if (selectedOption) return
    setSelectedOption(option)
  }

  const handleNext = () => {
    let updatedScore = score

    if (selectedOption === questions[currentQuestion].answer) {
      updatedScore = score + 1
      setScore(updatedScore)
    }

    const nextQuestion = currentQuestion + 1

    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion)
      setSelectedOption(null)
      setTimeLeft(10)
    } else {
      navigate("/result", { state: { score: updatedScore } })
    }
  }

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Quiz Mode ⏳ {timeLeft}s</h2>

      <QuestionCard
        questionData={questions[currentQuestion]}
        questionNumber={currentQuestion + 1}
        totalQuestions={questions.length}
        selectedOption={selectedOption}
        onOptionClick={handleOptionClick}
        showResult={selectedOption !== null}
      />

      {selectedOption && (
        <div style={{ textAlign: "center" }}>
          <button onClick={handleNext} className="primary-button">
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default Quiz