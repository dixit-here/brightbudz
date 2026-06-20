import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import './PracticeSidebar.css';
import API_BASE from '../api';

const FALLBACK_SUBJECTS = [
  { subjectId: 'maths', title: 'Maths', iconName: 'Calculator', color: '#3b82f6' },
  { subjectId: 'physics', title: 'Physics', iconName: 'Atom', color: '#8b5cf6' },
  { subjectId: 'chemistry', title: 'Chemistry', iconName: 'FlaskConical', color: '#f59e0b' },
  { subjectId: 'social-science', title: 'Social Science', iconName: 'Globe', color: '#10b981' },
  { subjectId: 'biology', title: 'Biology', iconName: 'Dna', color: '#f43f5e' },
];

function PracticeSidebar({ currentSubject, currentClass, currentChapter }) {
  const [subjects, setSubjects] = useState([]);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [expandedClass, setExpandedClass] = useState(null);
  const [chapters, setChapters] = useState({}); // { "Maths-6": [...chapters] }
  const [loadingChapters, setLoadingChapters] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // Load subjects
  useEffect(() => {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), 5000);
    fetch(`${API_BASE}/api/subjects`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        clearTimeout(timerId);
        setSubjects(Array.isArray(data) && data.length > 0 ? data : FALLBACK_SUBJECTS);
      })
      .catch(() => {
        clearTimeout(timerId);
        setSubjects(FALLBACK_SUBJECTS);
      });
    return () => { clearTimeout(timerId); controller.abort(); };
  }, []);

  // Auto-expand active subject + class
  useEffect(() => {
    if (currentSubject && subjects.length > 0) {
      const match = subjects.find(
        s => s.title.toLowerCase() === currentSubject.toLowerCase()
      );
      if (match) {
        setExpandedSubject(match.subjectId);
        if (currentClass) {
          setExpandedClass(`${match.subjectId}-${currentClass}`);
          fetchChapters(match.title, currentClass, match.subjectId);
        }
      }
    }
  }, [currentSubject, currentClass, subjects]);

  const fetchChapters = (subjectTitle, classNum, subjectId) => {
    const key = `${subjectId}-${classNum}`;
    if (chapters[key] !== undefined) return; // already loaded
    setLoadingChapters(prev => ({ ...prev, [key]: true }));
    fetch(`${API_BASE}/api/subjects/chapters?subject=${encodeURIComponent(subjectTitle)}&grade=${classNum}`)
      .then(r => r.json())
      .then(data => {
        setChapters(prev => ({ ...prev, [key]: Array.isArray(data) ? data : [] }));
        setLoadingChapters(prev => ({ ...prev, [key]: false }));
      })
      .catch(() => {
        setChapters(prev => ({ ...prev, [key]: [] }));
        setLoadingChapters(prev => ({ ...prev, [key]: false }));
      });
  };

  // Load classless chapters when subject is expanded
  useEffect(() => {
    if (expandedSubject && subjects.length > 0) {
      const subject = subjects.find(s => s.subjectId === expandedSubject);
      if (subject) {
        fetchChapters(subject.title, "", subject.subjectId);
      }
    }
  }, [expandedSubject, subjects]);

  const toggleSubject = (subject) => {
    setExpandedSubject(prev => prev === subject.subjectId ? null : subject.subjectId);
  };

  const toggleClass = (subject, classNum) => {
    const key = `${subject.subjectId}-${classNum}`;
    if (expandedClass === key) {
      setExpandedClass(null);
    } else {
      setExpandedClass(key);
      fetchChapters(subject.title, classNum, subject.subjectId);
    }
  };

  const goToChapter = (subjectTitle, classNum, chapter) => {
    navigate(`/practice?subject=${encodeURIComponent(subjectTitle)}&class=${classNum}&chapter=${encodeURIComponent(chapter)}`);
  };

  return (
    <aside className={`practice-sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Collapse toggle */}
      <button
        className="sidebar-collapse-btn"
        onClick={() => setCollapsed(p => !p)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? <Icons.ChevronRight size={18} /> : <Icons.ChevronLeft size={18} />}
      </button>

      {!collapsed && (
        <>
          <div className="sidebar-header">
            <Icons.BookOpen size={16} />
            <span>Navigate</span>
          </div>

          <nav className="sidebar-nav">
            {subjects.map(subject => {
              const IconComp = Icons[subject.iconName] || Icons.Book;
              const isSubjectActive = currentSubject &&
                subject.title.toLowerCase() === currentSubject.toLowerCase();
              const isSubjectExpanded = expandedSubject === subject.subjectId;

              return (
                <div key={subject.subjectId} className="sidebar-subject-group">
                  {/* Subject row */}
                  <button
                    className={`sidebar-subject-btn${isSubjectActive ? ' active' : ''}`}
                    style={{ '--subject-color': subject.color }}
                    onClick={() => toggleSubject(subject)}
                  >
                    <span className="sidebar-icon-wrap" style={{ color: subject.color }}>
                      <IconComp size={16} />
                    </span>
                    <span className="sidebar-subject-title">{subject.title}</span>
                    <span className={`sidebar-chevron${isSubjectExpanded ? ' open' : ''}`}>
                      <Icons.ChevronDown size={13} />
                    </span>
                  </button>

                  {/* Class rows or direct chapters */}
                  <div className={`sidebar-classes${isSubjectExpanded ? ' expanded' : ''}`}
                    style={{ maxHeight: isSubjectExpanded ? '2000px' : '0' }}>
                    {loadingChapters[`${subject.subjectId}-`] ? (
                      <div className="chapter-loading" style={{ padding: '8px 24px' }}>
                        <Icons.Loader2 size={12} className="spin-icon" />
                        Loading…
                      </div>
                    ) : (chapters[`${subject.subjectId}-`] && chapters[`${subject.subjectId}-`].length > 0) ? (
                      /* Classless chapters render directly */
                      <div className="sidebar-chapter-list expanded" style={{ display: 'block', paddingLeft: '16px', maxHeight: 'none', opacity: 1 }}>
                        {chapters[`${subject.subjectId}-`].map((ch, idx) => {
                          const isChapterActive = isSubjectActive && currentChapter === ch;
                          return (
                            <button
                              key={idx}
                              className={`sidebar-chapter-btn${isChapterActive ? ' active' : ''}`}
                              style={isChapterActive ? { '--subject-color': subject.color } : {}}
                              onClick={() => navigate(`/practice?subject=${encodeURIComponent(subject.title)}&chapter=${encodeURIComponent(ch)}`)}
                              title={ch}
                            >
                              <Icons.FileText size={11} className="chapter-icon" />
                              <span className="chapter-name">{ch}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Standard class list */
                      [...Array(10)].map((_, i) => {
                        const classNum = String(i + 1);
                        const classKey = `${subject.subjectId}-${classNum}`;
                        const isClassActive = isSubjectActive && currentClass === classNum;
                        const isClassExpanded = expandedClass === classKey;
                        const classChapters = chapters[classKey] || [];
                        const isLoadingC = loadingChapters[classKey];

                        return (
                          <div key={classNum} className="sidebar-class-group">
                            <button
                              className={`sidebar-class-btn${isClassActive ? ' active' : ''}`}
                              style={isClassActive ? { '--subject-color': subject.color } : {}}
                              onClick={() => toggleClass(subject, classNum)}
                            >
                              <span className="class-dot" />
                              <span>Class {classNum}</span>
                              <span className={`sidebar-chevron-sm${isClassExpanded ? ' open' : ''}`}>
                                <Icons.ChevronDown size={11} />
                              </span>
                            </button>

                            <div className={`sidebar-chapter-list${isClassExpanded ? ' expanded' : ''}`}>
                              {isLoadingC ? (
                                <div className="chapter-loading">
                                  <Icons.Loader2 size={12} className="spin-icon" />
                                  Loading…
                                </div>
                              ) : classChapters.length === 0 ? (
                                <div className="chapter-empty">No chapters</div>
                              ) : (
                                classChapters.map((ch, idx) => {
                                  const isChapterActive = isClassActive && currentChapter === ch;
                                  return (
                                    <button
                                      key={idx}
                                      className={`sidebar-chapter-btn${isChapterActive ? ' active' : ''}`}
                                      style={isChapterActive ? { '--subject-color': subject.color } : {}}
                                      onClick={() => goToChapter(subject.title, classNum, ch)}
                                      title={ch}
                                    >
                                      <Icons.FileText size={11} className="chapter-icon" />
                                      <span className="chapter-name">{ch}</span>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <button className="sidebar-home-btn" onClick={() => navigate('/')}>
              <Icons.Home size={14} />
              Back to Home
            </button>
          </div>
        </>
      )}

      {/* Collapsed: icon-only */}
      {collapsed && (
        <nav className="sidebar-nav-collapsed">
          {subjects.map(subject => {
            const IconComp = Icons[subject.iconName] || Icons.Book;
            const isActive = currentSubject &&
              subject.title.toLowerCase() === currentSubject.toLowerCase();
            return (
              <button
                key={subject.subjectId}
                className={`sidebar-icon-btn${isActive ? ' active' : ''}`}
                style={{ '--subject-color': subject.color }}
                title={subject.title}
                onClick={() => {
                  setCollapsed(false);
                  setExpandedSubject(subject.subjectId);
                }}
              >
                <IconComp size={20} />
              </button>
            );
          })}
          <button className="sidebar-icon-btn home-icon" title="Home" onClick={() => navigate('/')}>
            <Icons.Home size={18} />
          </button>
        </nav>
      )}
    </aside>
  );
}

export default PracticeSidebar;
