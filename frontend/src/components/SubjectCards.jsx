import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SubjectCards.css';

const SubjectCards = () => {
  const [subjects, setSubjects] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/subjects')
      .then(res => res.json())
      .then(data => {
        setSubjects(data);
        if (data.length > 0) {
          setActiveId(data[0].subjectId);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching subjects:', error);
        setLoading(false);
      });
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
                  <span className="class-links-label">Select Class:</span>
                  <div className="class-links-grid">
                    {[...Array(10)].map((_, i) => (
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
                    ))}
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
