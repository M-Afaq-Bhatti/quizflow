import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [attempted, setAttempted] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get('/api/quiz');
      setQuizzes(res.data);

      // Check which ones are attempted
      const checks = {};
      for (const quiz of res.data) {
        const check = await axios.get(`/api/result/check/${quiz._id}`);
        checks[quiz._id] = check.data.attempted;
      }
      setAttempted(checks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading quizzes...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Available Quizzes 📚</h1>
          <p style={{ color: '#6b7280', marginTop: 4 }}>Hello, {user.name}! Choose a quiz to attempt.</p>
        </div>
        <Link to="/results" className="btn btn-secondary">📊 My Results</Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <h3>No quizzes available yet</h3>
          <p>Check back later when your teacher publishes quizzes.</p>
        </div>
      ) : (
        <div className="grid-2">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p>{quiz.description || 'No description provided'}</p>
              <div className="quiz-meta">
                <span>⏱️ {quiz.timeLimit} minutes</span>
                <span>❓ {quiz.questions?.length || 0} questions</span>
              </div>
              {attempted[quiz._id] ? (
                <div>
                  <span className="badge badge-published">✅ Completed</span>
                  <Link to="/results" className="btn btn-secondary btn-sm" style={{ marginLeft: 10 }}>
                    View Result
                  </Link>
                </div>
              ) : (
                <Link to={`/exam/${quiz._id}`} className="btn btn-primary btn-sm">
                  Start Exam →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
