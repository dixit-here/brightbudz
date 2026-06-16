import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import QuestionCard from "../components/QuestionCard"
import PracticeSidebar from "../components/PracticeSidebar"
import "./Practice.css"
import API_BASE from "../api"

const renderFormattedText = (text) => {
  if (!text) return "";
  const regex = /\^(\(([^)]+)\)|([a-zA-Z0-9+-]+))/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    const exponent = match[2] || match[3];
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }
    parts.push(<sup key={matchIndex}>{exponent}</sup>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts;
};

function Practice() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [chapters, setChapters] = useState([])
  const [loadingChapters, setLoadingChapters] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const subjectFilter = searchParams.get('subject')
  const gradeFilter   = searchParams.get('class')
  const chapterFilter = searchParams.get('chapter')

  const answeredCount = Object.keys(answers).length
  const correctCount  = Object.values(answers).filter(a => a.isCorrect).length
  const progressPct   = questions.length > 0
    ? Math.round((answeredCount / questions.length) * 100)
    : 0

  // When subject+class chosen but no chapter → load chapter list
  useEffect(() => {
    if (subjectFilter && gradeFilter && !chapterFilter) {
      setLoadingChapters(true)
      fetch(`${API_BASE}/api/subjects/chapters?subject=${encodeURIComponent(subjectFilter)}&grade=${gradeFilter}`)
        .then(r => r.json())
        .then(data => {
          setChapters(Array.isArray(data) ? data : [])
          setLoadingChapters(false)
        })
        .catch(() => { setChapters([]); setLoadingChapters(false) })
    }
  }, [subjectFilter, gradeFilter, chapterFilter])

  // When chapter chosen → load questions
  useEffect(() => {
    if (!chapterFilter) { setLoading(false); return }
    setLoading(true)
    setAnswers({})
    const params = new URLSearchParams()
    if (subjectFilter) params.set('subject', subjectFilter)
    if (gradeFilter)   params.set('grade', gradeFilter)
    if (chapterFilter) params.set('chapter', chapterFilter)
    const url = `${API_BASE}/api/questions/practice?${params.toString()}`

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setQuestions(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => { setQuestions([]); setLoading(false) })
  }, [subjectFilter, gradeFilter, chapterFilter])

  const handleOptionClick = async (index, option) => {
    if (answers[index]) return
    const selectedIndex = questions[index].options.indexOf(option)
    try {
      const res = await fetch(`${API_BASE}/api/questions/practice/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: questions[index].id, selectedIndex })
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

  const goToChapter = (ch) => {
    navigate(`/practice?subject=${encodeURIComponent(subjectFilter)}&class=${gradeFilter}&chapter=${encodeURIComponent(ch)}`)
  }

  return (
    <div className="practice-page">

      {/* ── Left Sidebar ── */}
      <PracticeSidebar
        currentSubject={subjectFilter}
        currentClass={gradeFilter}
        currentChapter={chapterFilter}
      />

      {/* ── Main Content ── */}
      <div className="practice-main">

        {/* ── Top Bar: Breadcrumb + Stats ── */}
        <div className="practice-topbar">
          <nav className="practice-breadcrumb" aria-label="breadcrumb">
            <button className="breadcrumb-btn" onClick={() => navigate('/')}>🏠 Home</button>
            <span className="breadcrumb-sep">›</span>
            <button className="breadcrumb-btn" onClick={() => navigate('/')}>📚 Subjects</button>
            {subjectFilter && (
              <>
                <span className="breadcrumb-sep">›</span>
                <button
                  className="breadcrumb-btn"
                  onClick={() => navigate(`/practice?subject=${encodeURIComponent(subjectFilter)}&class=${gradeFilter}`)}
                >
                  {subjectFilter}
                </button>
              </>
            )}
            {gradeFilter && (
              <>
                <span className="breadcrumb-sep">›</span>
                <button
                  className="breadcrumb-btn"
                  onClick={() => navigate(`/practice?subject=${encodeURIComponent(subjectFilter)}&class=${gradeFilter}`)}
                >
                  Class {gradeFilter}
                </button>
              </>
            )}
            {chapterFilter && (
              <>
                <span className="breadcrumb-sep">›</span>
                <span className="breadcrumb-current">{chapterFilter}</span>
              </>
            )}
          </nav>

          {/* Stats */}
          {chapterFilter && !loading && questions.length > 0 && (
            <div className="practice-stats">
              <span className="stat-chip total">📝 {questions.length} Qs</span>
              <span className="stat-chip answered">✅ {answeredCount} Done</span>
              {answeredCount > 0 && (
                <span className="stat-chip correct">🎯 {correctCount}/{answeredCount} Correct</span>
              )}
            </div>
          )}
        </div>

        {/* ── Progress Bar ── */}
        {chapterFilter && !loading && questions.length > 0 && (
          <div className="practice-progress-track">
            <div className="practice-progress-fill" style={{ width: `${progressPct}%` }} />
            {progressPct > 0 && <span className="progress-label">{progressPct}%</span>}
          </div>
        )}

        {/* ── Content ── */}
        <div className="practice-content">

          {/* No subject selected */}
          {!subjectFilter && (
            <div className="practice-empty">
              <span className="empty-icon">📚</span>
              <h3>Choose a Subject</h3>
              <p>Select a subject from the left sidebar to get started.</p>
              <button className="go-home-btn" onClick={() => navigate('/')}>← Go to Home</button>
            </div>
          )}

          {/* Subject + Class chosen, no chapter → Chapter Picker */}
          {subjectFilter && gradeFilter && !chapterFilter && (
            <div className="chapter-picker">
              <div className="chapter-picker-header">
                <span className="chapter-picker-emoji">📖</span>
                <div>
                  <h2 className="chapter-picker-title">{subjectFilter} — Class {gradeFilter}</h2>
                  <p className="chapter-picker-sub">Choose a chapter to start practising</p>
                </div>
              </div>

              {loadingChapters ? (
                <div className="practice-loading">
                  <div className="loading-spinner" />
                  <p>Loading chapters…</p>
                </div>
              ) : chapters.length === 0 ? (
                <div className="practice-empty">
                  <span className="empty-icon">📭</span>
                  <h3>No chapters available</h3>
                  <p>Chapters for {subjectFilter} Class {gradeFilter} are not listed yet.</p>
                </div>
              ) : (
                <div className="chapter-grid">
                  {chapters.map((ch, idx) => (
                    <button
                      key={idx}
                      className="chapter-card"
                      onClick={() => goToChapter(ch)}
                    >
                      <span className="chapter-card-num">{idx + 1}</span>
                      <span className="chapter-card-name">{ch}</span>
                      <span className="chapter-card-arrow">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chapter selected → Questions */}
          {chapterFilter && (
            <>
              {loading ? (
                <div className="practice-loading">
                  <div className="loading-spinner" />
                  <p>Loading questions…</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="practice-empty">
                  <span className="empty-icon">📭</span>
                  <h3>No questions yet</h3>
                  <p>No questions found for <strong>{chapterFilter}</strong>.</p>
                  <button
                    className="go-home-btn"
                    onClick={() => navigate(`/practice?subject=${encodeURIComponent(subjectFilter)}&class=${gradeFilter}`)}
                  >
                    ← Back to Chapters
                  </button>
                </div>
              ) : (
                questions.map((q, index) => {
                  const answer = answers[index]
                  return (
                    <div key={q.id} className="question-wrapper">
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
                        <div className={`answer-feedback ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                          <span className="feedback-icon">{answer.isCorrect ? '✅' : '❌'}</span>
                          <span className="feedback-text">{answer.isCorrect ? 'Correct!' : 'Incorrect'}</span>
                          {answer.explanation && (
                            <span className="feedback-explanation">💡 {renderFormattedText(answer.explanation)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default Practice