function QuestionCard({
  questionData,
  questionNumber,
  totalQuestions,
  selectedOption,
  onOptionClick,
  showResult
}) {
  return (
    <div className="card">
      <h3>Question {questionNumber} / {totalQuestions}</h3>

      <p style={{ fontSize: "18px", fontWeight: "bold" }}>
        {questionData.question}
      </p>

      {questionData.options.map((option, index) => {
        let backgroundColor = "#f4f4f4"

        if (showResult) {
          if (index === questionData.correctAnswerIndex) {
            backgroundColor = "#90ee90"
          } else if (option === selectedOption) {
            backgroundColor = "#ff7f7f"
          }
        } else if (selectedOption === option) {
          backgroundColor = "#d3d3d3"
        }

        return (
          <button
            key={index}
            onClick={() => onOptionClick(option)}
            className="button"
            style={{ backgroundColor }}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

export default QuestionCard