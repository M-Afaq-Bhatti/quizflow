import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const latest = location.state;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get('/api/result/my');
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const getGrade = (pct) => {
    if (pct >= 90) return { label: 'A+', color: '#10b981' };
    if (pct >= 80) return { label: 'A', color: '#10b981' };
    if (pct >= 70) return { label: 'B', color: '#3b82f6' };
    if (pct >= 60) return { label: 'C', color: '#f59e0b' };
    return { label: 'F', color: '#ef4444' };
  };

  if (loading) return <div className="loading">Loading results...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>My Results 📊</h1>
        <Link to="/dashboard" className="btn btn-secondary">← Back to Quizzes</Link>
      </div>

      {latest && (
        <div className="score-display">
          <div>🎉 Latest Submission: {latest.title}</div>
          <div className="score-number">{latest.percentage}%</div>
          <div className="score-label">
            Score: {latest.score} / {latest.total} correct
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <div className="empty-state">
          <h3>No results yet</h3>
          <p>Attempt a quiz to see your results here.</p>
        </div>
      ) : (
        results.map(result => {
          const grade = getGrade(result.percentage);
          return (
            <div key={result._id} className="result-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ marginBottom: 6 }}>{result.quiz?.title || 'Quiz'}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                    📅 {new Date(result.submittedAt).toLocaleDateString('en-PK', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: grade.color }}>
                    {grade.label}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>{result.percentage}%</div>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                    {result.score}/{result.totalQuestions}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Results;
