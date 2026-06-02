import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AddQuestions() {
  const navigate = useNavigate();

  const [subjectsList, setSubjectsList] = useState([]);
  const [chaptersList, setChaptersList] = useState([]);
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch available subjects so the admin picks from a consistent list
  useEffect(() => {
    fetch("http://localhost:5000/api/subjects")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSubjectsList(data);
      })
      .catch(() => {});
  }, []);

  // Fetch chapters dynamically when grade + subject are selected
  useEffect(() => {
    if (!grade || !subject) {
      setChaptersList([]);
      setChapter("");
      return;
    }
    fetch(`http://localhost:5000/api/subjects/chapters?subject=${encodeURIComponent(subject)}&grade=${grade}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setChaptersList(data);
        } else {
          setChaptersList([]);
        }
        setChapter(""); // reset chapter when options change
      })
      .catch(() => setChaptersList([]));
  }, [grade, subject]);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/api/questions/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          grade,
          subject,
          chapter,
          difficulty,
          question,
          options,
          correctAnswerIndex: Number(correctAnswerIndex),
          explanation,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Question added successfully! ✅");
        // Reset form
        setQuestion("");
        setOptions(["", "", "", ""]);
        setCorrectAnswerIndex(0);
        setExplanation("");
      } else {
        setError(data.error || data.message || "Failed to add question");
      }
    } catch (err) {
      setError("Server error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="card" style={{ maxWidth: "700px", textAlign: "left" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        ➕ Add Question
      </h2>

      <form onSubmit={handleSubmit}>
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          required
          style={inputStyle}
        >
          <option value="">-- Select Grade --</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={String(i + 1)}>Grade {i + 1}</option>
          ))}
        </select>

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          style={inputStyle}
        >
          <option value="">-- Select Subject --</option>
          {subjectsList.map(s => (
            <option key={s.subjectId} value={s.title}>{s.title}</option>
          ))}
        </select>

        <select
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          required
          style={inputStyle}
          disabled={chaptersList.length === 0}
        >
          <option value="">
            {!grade || !subject
              ? "-- Select Grade & Subject first --"
              : chaptersList.length === 0
                ? "-- No chapters available --"
                : "-- Select Chapter --"}
          </option>
          {chaptersList.map((ch) => (
            <option key={ch} value={ch}>{ch}</option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          style={inputStyle}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <textarea
          placeholder="Question text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
        />

        <p style={{ fontWeight: "bold", margin: "10px 0 5px" }}>Options:</p>
        {options.map((opt, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <input
              type="radio"
              name="correctAnswer"
              checked={correctAnswerIndex === i}
              onChange={() => setCorrectAnswerIndex(i)}
            />
            <input
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              required
              style={{ ...inputStyle, margin: 0, flex: 1 }}
            />
          </div>
        ))}
        <p style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>
          Select the radio button next to the correct answer
        </p>

        <textarea
          placeholder="Explanation (optional)"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
        />

        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
        {message && <p style={{ color: "green", marginBottom: "10px" }}>{message}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Question"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  margin: "8px 0",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  boxSizing: "border-box",
};

export default AddQuestions;
