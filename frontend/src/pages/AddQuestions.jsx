import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AddQuestions.css";
import API_BASE from "../api";

const DIFF_COLORS = { easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444" };
const DIFF_BG     = { easy: "#f0fdf4", medium: "#fffbeb", hard: "#fef2f2" };

const emptyForm = {
  grade: "", subject: "", chapter: "", difficulty: "medium",
  question: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: ""
};

/* ─────────────────────────── Preview Panel ──────────────────────────── */
function QuestionPreview({ form }) {
  const [selected, setSelected] = useState(null);

  // reset selection when form changes
  useEffect(() => setSelected(null), [form.question]);

  const optionStyle = (i) => {
    const base = {
      display: "block", width: "100%", padding: "10px 14px",
      marginBottom: "8px", borderRadius: "10px", border: "1.5px solid",
      cursor: "pointer", textAlign: "left", fontSize: "14px",
      fontWeight: "500", transition: "all 0.2s",
    };
    if (selected !== null) {
      if (i === form.correctAnswerIndex)
        return { ...base, background: "#f0fdf4", borderColor: "#22c55e", color: "#15803d" };
      if (i === selected)
        return { ...base, background: "#fef2f2", borderColor: "#ef4444", color: "#b91c1c" };
    }
    return { ...base, background: selected === i ? "#eff6ff" : "#f8fafc", borderColor: "#e2e8f0", color: "#374151" };
  };

  const hasContent = form.question.trim() && form.options.some(o => o.trim());

  return (
    <div className="aq-preview-panel">
      <div className="aq-preview-header">
        <span className="aq-preview-badge">👁 Live Preview</span>
        <span
          className="aq-diff-badge"
          style={{ background: DIFF_BG[form.difficulty], color: DIFF_COLORS[form.difficulty] }}
        >
          {form.difficulty}
        </span>
      </div>

      {!hasContent ? (
        <div className="aq-preview-empty">
          <span>📝</span>
          <p>Fill in the question and options on the left to see a preview here.</p>
        </div>
      ) : (
        <div className="aq-preview-card">
          {/* Meta */}
          {(form.grade || form.subject || form.chapter) && (
            <div className="aq-preview-meta">
              {form.subject && <span>{form.subject}</span>}
              {form.grade   && <span>Class {form.grade}</span>}
              {form.chapter && <span>{form.chapter}</span>}
            </div>
          )}

          {/* Question */}
          <p className="aq-preview-q">{form.question || "Your question will appear here…"}</p>

          {/* Options */}
          <div style={{ marginTop: "12px" }}>
            {form.options.map((opt, i) => (
              opt.trim() ? (
                <button key={i} style={optionStyle(i)} onClick={() => setSelected(i)}>
                  <span className="aq-opt-letter">{String.fromCharCode(65 + i)}.</span> {opt}
                </button>
              ) : null
            ))}
          </div>

          {/* Result feedback */}
          {selected !== null && (
            <div className={`aq-preview-feedback ${selected === form.correctAnswerIndex ? 'correct' : 'wrong'}`}>
              {selected === form.correctAnswerIndex ? "✅ Correct!" : "❌ Incorrect"}
              {form.explanation && <p className="aq-preview-expl">💡 {form.explanation}</p>}
            </div>
          )}

          {selected === null && (
            <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
              Click an option to test the preview
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Question Row ──────────────────────────── */
function QuestionRow({ q, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="aq-q-row">
      <div className="aq-q-row-meta">
        <span
          className="aq-diff-badge sm"
          style={{ background: DIFF_BG[q.difficulty], color: DIFF_COLORS[q.difficulty] }}
        >
          {q.difficulty}
        </span>
        <span className="aq-q-chapter">{q.chapter}</span>
        <span className="aq-q-grade">Gr {q.grade}</span>
      </div>
      <p className="aq-q-text">{q.content?.en?.question}</p>
      <div className="aq-q-actions">
        <button className="aq-btn edit" onClick={() => onEdit(q)}>✏️ Edit</button>
        {!confirming ? (
          <button className="aq-btn delete" onClick={() => setConfirming(true)}>🗑 Delete</button>
        ) : (
          <>
            <button className="aq-btn delete-confirm" onClick={() => onDelete(q._id)}>Confirm</button>
            <button className="aq-btn cancel" onClick={() => setConfirming(false)}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Page ─────────────────────────────── */
export default function AddQuestions() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("role") === "admin";

  // Redirect non-admins immediately
  useEffect(() => { if (!isAdmin) navigate("/"); }, [isAdmin]);

  const [subjectsList, setSubjectsList] = useState([]);
  const [chaptersList, setChaptersList] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null); // null = adding new

  // Filter state (for browsing existing questions)
  const [filterGrade, setFilterGrade]     = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [filterChapters, setFilterChapters] = useState([]);

  const [existingQs, setExistingQs] = useState([]);
  const [loadingQs, setLoadingQs]   = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState(null); // { msg, type }
  const [tab, setTab] = useState("browse"); // "browse" | "form"

  // Load subjects
  useEffect(() => {
    fetch(`${API_BASE}/api/subjects`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSubjectsList(data); })
      .catch(() => {});
  }, []);

  // Load chapters for form (grade+subject)
  useEffect(() => {
    if (!form.grade || !form.subject) { setChaptersList([]); setForm(f => ({ ...f, chapter: "" })); return; }
    fetch(`${API_BASE}/api/subjects/chapters?subject=${encodeURIComponent(form.subject)}&grade=${form.grade}`)
      .then(r => r.json())
      .then(data => { setChaptersList(Array.isArray(data) ? data : []); setForm(f => ({ ...f, chapter: "" })); })
      .catch(() => setChaptersList([]));
  }, [form.grade, form.subject]);

  // Load chapters for filter
  useEffect(() => {
    if (!filterGrade || !filterSubject) { setFilterChapters([]); setFilterChapter(""); return; }
    fetch(`${API_BASE}/api/subjects/chapters?subject=${encodeURIComponent(filterSubject)}&grade=${filterGrade}`)
      .then(r => r.json())
      .then(data => { setFilterChapters(Array.isArray(data) ? data : []); setFilterChapter(""); })
      .catch(() => setFilterChapters([]));
  }, [filterGrade, filterSubject]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch existing questions ──────────────────────────────────────
  const fetchQuestions = () => {
    setLoadingQs(true);
    const p = new URLSearchParams();
    if (filterGrade)   p.set("grade", filterGrade);
    if (filterSubject) p.set("subject", filterSubject);
    if (filterChapter) p.set("chapter", filterChapter);
    fetch(`${API_BASE}/api/questions/admin?${p.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setExistingQs(Array.isArray(data) ? data : []); setLoadingQs(false); })
      .catch(() => { setExistingQs([]); setLoadingQs(false); });
  };

  // ── Edit handler ──────────────────────────────────────────────────
  const handleEdit = (q) => {
    setForm({
      grade:              q.grade,
      subject:            q.subject,
      chapter:            q.chapter,
      difficulty:         q.difficulty,
      question:           q.content?.en?.question || "",
      options:            q.content?.en?.options  || ["","","",""],
      correctAnswerIndex: q.correctAnswerIndex,
      explanation:        q.content?.en?.explanation || ""
    });
    setEditingId(q._id);
    setShowPreview(false);
    setTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Delete handler ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Question deleted ✅");
        setExistingQs(prev => prev.filter(q => q._id !== id));
      } else {
        showToast("Failed to delete", "error");
      }
    } catch {
      showToast("Server error", "error");
    }
  };

  // ── Save (add or update) ──────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      grade: form.grade, subject: form.subject, chapter: form.chapter,
      difficulty: form.difficulty, question: form.question,
      options: form.options, correctAnswerIndex: Number(form.correctAnswerIndex),
      explanation: form.explanation
    };
    try {
      const url    = editingId
        ? `${API_BASE}/api/questions/${editingId}`
        : `${API_BASE}/api/questions/add`;
      const method = editingId ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(editingId ? "Question updated ✅" : "Question added ✅");
        setForm({ ...emptyForm });
        setEditingId(null);
        setShowPreview(false);
        setTab("browse");
        // Refresh list if filters match
        if (filterGrade || filterSubject || filterChapter) fetchQuestions();
      } else {
        showToast(data.error || data.message || "Save failed", "error");
      }
    } catch {
      showToast("Server error", "error");
    }
    setSaving(false);
  };

  const setOpt = (i, v) => setForm(f => { const o = [...f.options]; o[i] = v; return { ...f, options: o }; });

  if (!isAdmin) return null;

  return (
    <div className="aq-page">

      {/* ── Toast ── */}
      {toast && (
        <div className={`aq-toast ${toast.type}`}>{toast.msg}</div>
      )}

      {/* ── Page Header ── */}
      <div className="aq-page-header">
        <div>
          <h1 className="aq-page-title">Question Manager</h1>
          <p className="aq-page-sub">Admin panel · Add, edit and preview questions</p>
        </div>
        <div className="aq-tab-bar">
          <button className={`aq-tab ${tab === "browse" ? "active" : ""}`} onClick={() => setTab("browse")}>
            📋 Browse Questions
          </button>
          <button
            className={`aq-tab ${tab === "form" ? "active" : ""}`}
            onClick={() => { setTab("form"); setEditingId(null); setForm({ ...emptyForm }); }}
          >
            ➕ Add Question
          </button>
        </div>
      </div>

      {/* ══════════ TAB: BROWSE ══════════ */}
      {tab === "browse" && (
        <div className="aq-section">
          <div className="aq-filter-bar">
            <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="aq-select">
              <option value="">All Grades</option>
              {[...Array(12)].map((_,i) => <option key={i+1} value={String(i+1)}>Grade {i+1}</option>)}
            </select>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="aq-select">
              <option value="">All Subjects</option>
              {subjectsList.map(s => <option key={s.subjectId} value={s.title}>{s.title}</option>)}
            </select>
            <select value={filterChapter} onChange={e => setFilterChapter(e.target.value)} className="aq-select" disabled={!filterChapters.length}>
              <option value="">All Chapters</option>
              {filterChapters.map(ch => <option key={ch} value={ch}>{ch}</option>)}
            </select>
            <button className="aq-btn primary" onClick={fetchQuestions}>🔍 Search</button>
          </div>

          {loadingQs ? (
            <div className="aq-loading"><div className="aq-spinner" /><span>Loading…</span></div>
          ) : existingQs.length === 0 ? (
            <div className="aq-empty">
              <span>📭</span>
              <p>Apply filters above and click Search to browse questions.</p>
            </div>
          ) : (
            <div className="aq-q-list">
              <p className="aq-q-count">{existingQs.length} question{existingQs.length !== 1 ? 's' : ''} found</p>
              {existingQs.map(q => (
                <QuestionRow key={q._id} q={q} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ TAB: FORM ══════════ */}
      {tab === "form" && (
        <div className="aq-form-layout">

          {/* ── Left: Form ── */}
          <div className="aq-form-col">
            <div className="aq-section">
              <div className="aq-section-head">
                <h2>{editingId ? "✏️ Edit Question" : "➕ New Question"}</h2>
                {editingId && (
                  <button className="aq-btn cancel" onClick={() => { setEditingId(null); setForm({ ...emptyForm }); }}>
                    × Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="aq-form">
                {/* Row: Grade + Subject */}
                <div className="aq-form-row">
                  <div className="aq-field">
                    <label className="aq-label">Grade *</label>
                    <select value={form.grade} onChange={e => setForm(f=>({...f, grade:e.target.value}))} required className="aq-select">
                      <option value="">Select Grade</option>
                      {[...Array(12)].map((_,i) => <option key={i+1} value={String(i+1)}>Grade {i+1}</option>)}
                    </select>
                  </div>
                  <div className="aq-field">
                    <label className="aq-label">Subject *</label>
                    <select value={form.subject} onChange={e => setForm(f=>({...f, subject:e.target.value}))} required className="aq-select">
                      <option value="">Select Subject</option>
                      {subjectsList.map(s => <option key={s.subjectId} value={s.title}>{s.title}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row: Chapter + Difficulty */}
                <div className="aq-form-row">
                  <div className="aq-field">
                    <label className="aq-label">Chapter *</label>
                    <select value={form.chapter} onChange={e => setForm(f=>({...f, chapter:e.target.value}))} required className="aq-select" disabled={!chaptersList.length}>
                      <option value="">{!form.grade || !form.subject ? "Select grade & subject first" : chaptersList.length ? "Select Chapter" : "No chapters available"}</option>
                      {chaptersList.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                    </select>
                  </div>
                  <div className="aq-field">
                    <label className="aq-label">Difficulty *</label>
                    <div className="aq-diff-toggle">
                      {["easy","medium","hard"].map(d => (
                        <button
                          type="button" key={d}
                          className={`aq-diff-btn ${form.difficulty === d ? 'selected' : ''}`}
                          style={form.difficulty === d ? { background: DIFF_BG[d], color: DIFF_COLORS[d], borderColor: DIFF_COLORS[d] } : {}}
                          onClick={() => setForm(f=>({...f, difficulty:d}))}
                        >
                          {d.charAt(0).toUpperCase()+d.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Question Text */}
                <div className="aq-field">
                  <label className="aq-label">Question *</label>
                  <textarea
                    className="aq-textarea"
                    placeholder="Type the question here…"
                    value={form.question}
                    onChange={e => setForm(f=>({...f, question:e.target.value}))}
                    rows={3}
                    required
                  />
                </div>

                {/* Options */}
                <div className="aq-field">
                  <label className="aq-label">Options <span style={{color:"#94a3b8",fontWeight:400}}>— select the correct answer</span></label>
                  {form.options.map((opt, i) => (
                    <div key={i} className={`aq-option-row ${form.correctAnswerIndex === i ? 'correct' : ''}`}>
                      <button
                        type="button"
                        className={`aq-opt-radio ${form.correctAnswerIndex === i ? 'selected' : ''}`}
                        onClick={() => setForm(f=>({...f, correctAnswerIndex:i}))}
                        title="Mark as correct"
                        aria-label={`Mark option ${String.fromCharCode(65+i)} as correct`}
                      >
                        {form.correctAnswerIndex === i ? "✓" : String.fromCharCode(65+i)}
                      </button>
                      <input
                        className="aq-input"
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65+i)}`}
                        value={opt}
                        onChange={e => setOpt(i, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div className="aq-field">
                  <label className="aq-label">Explanation <span style={{color:"#94a3b8",fontWeight:400}}>(optional)</span></label>
                  <textarea
                    className="aq-textarea"
                    placeholder="Explain why the correct answer is right…"
                    value={form.explanation}
                    onChange={e => setForm(f=>({...f, explanation:e.target.value}))}
                    rows={2}
                  />
                </div>

                {/* Actions */}
                <div className="aq-form-actions">
                  <button
                    type="button"
                    className="aq-btn preview"
                    onClick={() => setShowPreview(p => !p)}
                  >
                    {showPreview ? "🙈 Hide Preview" : "👁 Preview"}
                  </button>
                  <button type="submit" className="aq-btn primary" disabled={saving}>
                    {saving ? "Saving…" : editingId ? "💾 Save Changes" : "✅ Add Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── Right: Preview ── */}
          {showPreview && (
            <div className="aq-preview-col">
              <QuestionPreview form={form} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
