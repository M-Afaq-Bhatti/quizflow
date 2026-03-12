import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizInfo, setQuizInfo] = useState({ title: '', description: '', timeLimit: 10 });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`/api/quiz/${id}`);
        const { title, description, timeLimit, questions } = res.data;
        setQuizInfo({ title, description: description || '', timeLimit });
        setQuestions(questions || []);
      } catch (err) {
        toast.error('Failed to load quiz');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, navigate]);

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
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
    setSaving(true);
    try {
      await axios.put(`/api/quiz/${id}`, { ...quizInfo, questions });
      toast.success('Quiz updated successfully!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading quiz...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Edit Quiz ✏️</h1>
        <button onClick={() => navigate('/admin')} className="btn btn-secondary">← Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Quiz Details</h3>
          <div className="form-group">
            <label>Quiz Title *</label>
            <input type="text" value={quizInfo.title} onChange={e => setQuizInfo({ ...quizInfo, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={3} value={quizInfo.description} onChange={e => setQuizInfo({ ...quizInfo, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Time Limit (minutes)</label>
            <input type="number" min={1} max={180} value={quizInfo.timeLimit} onChange={e => setQuizInfo({ ...quizInfo, timeLimit: parseInt(e.target.value) })} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.3rem' }}>Questions ({questions.length})</h2>
            <button type="button" className="btn btn-primary" onClick={addQuestion}>+ Add Question</button>
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="question-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <h4>Question {qIndex + 1}</h4>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(qIndex)}>Remove</button>
              </div>
              <div className="form-group">
                <label>Question Text</label>
                <textarea rows={2} value={q.questionText} onChange={e => updateQuestion(qIndex, 'questionText', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Options</label>
                <div className="options-grid">
                  {q.options.map((opt, oIndex) => (
                    <input key={oIndex} type="text" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={e => updateOption(qIndex, oIndex, e.target.value)} required />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Correct Answer</label>
                <select value={q.correctAnswer} onChange={e => updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))}>
                  {q.options.map((opt, oIndex) => (
                    <option key={oIndex} value={oIndex}>Option {oIndex + 1}: {opt || '(empty)'}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="btn-group">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : '💾 Save Changes'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditQuiz;
