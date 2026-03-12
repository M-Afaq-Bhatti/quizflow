import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [quizInfo, setQuizInfo] = useState({ title: '', description: '', timeLimit: 10 });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quizInfo.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/quiz', {
        ...quizInfo,
        questions
      });
      toast.success('Quiz created successfully!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Create New Quiz ✏️</h1>
        <button onClick={() => navigate('/admin')} className="btn btn-secondary">← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Quiz Details</h3>
          <div className="form-group">
            <label>Quiz Title *</label>
            <input
              type="text"
              placeholder="e.g., JavaScript Fundamentals Quiz"
              value={quizInfo.title}
              onChange={e => setQuizInfo({ ...quizInfo, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              placeholder="Brief description of this quiz..."
              value={quizInfo.description}
              onChange={e => setQuizInfo({ ...quizInfo, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Time Limit (minutes)</label>
            <input
              type="number"
              min={1}
              max={180}
              value={quizInfo.timeLimit}
              onChange={e => setQuizInfo({ ...quizInfo, timeLimit: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.3rem', color: '#1f2937' }}>Questions ({questions.length})</h2>
            <button type="button" className="btn btn-primary" onClick={addQuestion}>
              + Add Question
            </button>
          </div>

          {questions.length === 0 && (
            <div className="empty-state" style={{ background: 'white', borderRadius: 12, padding: 30 }}>
              <h3>No questions yet</h3>
              <p>Click "Add Question" to start building your quiz.</p>
            </div>
          )}

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="question-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <h4>Question {qIndex + 1}</h4>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(qIndex)}>
                  Remove
                </button>
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  rows={2}
                  placeholder="Enter your question here..."
                  value={q.questionText}
                  onChange={e => updateQuestion(qIndex, 'questionText', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Answer Options (enter all 4 options)</label>
                <div className="options-grid">
                  {q.options.map((opt, oIndex) => (
                    <input
                      key={oIndex}
                      type="text"
                      placeholder={`Option ${oIndex + 1}`}
                      value={opt}
                      onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                      required
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Correct Answer</label>
                <select
                  value={q.correctAnswer}
                  onChange={e => updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))}
                >
                  {q.options.map((opt, oIndex) => (
                    <option key={oIndex} value={oIndex}>
                      Option {oIndex + 1}: {opt || '(empty)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="btn-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : '💾 Save Quiz'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
