import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SubjectCards.css';
import API_BASE from '../api';

const FALLBACK_SUBJECTS = [
  { subjectId: 'maths', title: 'Maths', iconName: 'Calculator', color: '#3b82f6', description: 'Master numbers, equations, and logic with our comprehensive Mathematics practice modules.' },
  { subjectId: 'physics', title: 'Physics', iconName: 'Atom', color: '#8b5cf6', description: 'Explore the fundamental principles of the universe, from mechanics to quantum theory.' },
  { subjectId: 'chemistry', title: 'Chemistry', iconName: 'FlaskConical', color: '#f59e0b', description: 'Delve into the composition, structure, and properties of matter.' },
  { subjectId: 'social-science', title: 'Social Science', iconName: 'Globe', color: '#10b981', description: 'Understand human society, history, geography, and political structures.' },
  { subjectId: 'biology', title: 'Biology', iconName: 'Dna', color: '#f43f5e', description: 'Dive into the science of life, from microscopic cells to complex ecosystems.' },
  { subjectId: 'electronics', title: 'Electronics', iconName: 'Cpu', color: '#10b981', description: 'Design and simulate digital logic circuits interactively.' },
];

const SubjectCards = () => {
  const [subjects, setSubjects] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    fetch(`${API_BASE}/api/subjects`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId);
        const list = Array.isArray(data) && data.length > 0 ? data : FALLBACK_SUBJECTS;
        setSubjects(list);
        if (list.length > 0) {
          setActiveId(list[0].subjectId);
        }
        setLoading(false);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        console.warn('Could not reach subjects API, using fallback subjects:', error.message);
        setSubjects(FALLBACK_SUBJECTS);
        setActiveId(FALLBACK_SUBJECTS[0].subjectId);
        setLoading(false);
      });

    return () => { clearTimeout(timeoutId); controller.abort(); };
  }, []);

  if (loading) {
    return <div className="subject-cards-container" style={{ textAlign: 'center', padding: '40px' }}>Loading subjects...</div>;
  }

  if (subjects.length === 0) {
    return (
      <div className="subject-cards-container">
        <h2 className="subject-cards-title">Explore Subjects</h2>
        <p style={{ textAlign: 'center', color: '#64748b' }}>No subjects available yet.</p>
      </div>
    );
  }

  return (
    <div className="subject-cards-container">
      <h2 className="subject-cards-title">Explore Subjects</h2>
      <div className="cards-wrapper">
        {subjects.map((subject) => {
          const isActive = activeId === subject.subjectId;
          const IconComponent = Icons[subject.iconName];
          
          return (
            <div
              key={subject.subjectId}
              className={`subject-card ${isActive ? 'active' : ''}`}
              onClick={() => setActiveId(subject.subjectId)}
              style={{
                '--card-color': subject.color,
                '--card-color-light': `${subject.color}20`
              }}
            >
              <div className="card-icon-wrapper">
                {IconComponent ? <IconComponent size={32} /> : <Icons.Book size={32} />}
              </div>
              <div className="contracted-title">
                {subject.title}
              </div>
              <div className="card-content">
                <h3 className="card-title">{subject.title}</h3>
                <p className="card-description">{subject.description}</p>
                <div className="class-links-section">
                  <span className="class-links-label">
                    {subject.subjectId === 'electronics' ? "Select Gate:" : "Select Class:"}
                  </span>
                  <div className="class-links-grid">
                    {subject.subjectId === 'electronics' ? (
                      ["AND Gate", "OR Gate", "NOT Gate", "NAND Gate", "NOR Gate", "XOR Gate", "XNOR Gate"].map((gate) => (
                        <button
                          key={gate}
                          className="class-link-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/practice?subject=${encodeURIComponent(subject.title)}&chapter=${encodeURIComponent(gate)}`);
                          }}
                          style={{
                            color: subject.color,
                            width: "auto",
                            padding: "0 12px",
                            fontSize: "0.8rem",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {gate.replace(" Gate", "")}
                        </button>
                      ))
                    ) : (
                      [...Array(10)].map((_, i) => (
                        <button
                          key={i + 1}
                          className="class-link-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/practice?subject=${encodeURIComponent(subject.title)}&class=${i + 1}`);
                          }}
                          style={{ color: subject.color }}
                        >
                          {i + 1}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectCards;
