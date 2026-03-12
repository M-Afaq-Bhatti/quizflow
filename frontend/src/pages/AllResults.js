import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AllResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get('/api/result/all');
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <div className="loading">Loading results...</div>;

  const avgScore = results.length > 0
    ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)
    : 0;

  return (
    <div>
      <div className="page-header">
        <h1>All Student Results 📊</h1>
        <Link to="/admin" className="btn btn-secondary">← Back</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{results.length}</div>
          <div className="stat-label">Total Attempts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{avgScore}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{results.filter(r => r.percentage >= 60).length}</div>
          <div className="stat-label">Passed (≥60%)</div>
        </div>
      </div>

      <div className="card">
        {results.length === 0 ? (
          <div className="empty-state">
            <h3>No results yet</h3>
            <p>Students haven't attempted any quizzes yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map(result => (
                  <tr key={result._id}>
                    <td>
                      <strong>{result.student?.name || 'N/A'}</strong>
                      <br />
                      <small style={{ color: '#9ca3af' }}>{result.student?.email}</small>
                    </td>
                    <td>{result.quiz?.title || 'N/A'}</td>
                    <td>{result.score}/{result.totalQuestions}</td>
                    <td>
                      <span style={{
                        color: result.percentage >= 60 ? '#10b981' : '#ef4444',
                        fontWeight: 700
                      }}>
                        {result.percentage}%
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      {new Date(result.submittedAt).toLocaleDateString('en-PK')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllResults;
