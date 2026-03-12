import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);

  const submitExam = useCallback(async (autoSubmit = false) => {
    if (submitting) return;
    setSubmitting(true);

    const formattedAnswers = Object.entries(answers).map(([qIndex, selectedOption]) => ({
      questionIndex: parseInt(qIndex),
      selectedOption
    }));

    try {
      const res = await axios.post('/api/result/submit', {
        quizId: id,
        answers: formattedAnswers
      });

      if (autoSubmit) toast.warning('⏰ Time up! Quiz auto-submitted.');
      else toast.success('Quiz submitted successfully!');

      navigate('/results', {
        state: {
          score: res.data.score,
          total: res.data.totalQuestions,
          percentage: res.data.percentage,
          title: res.data.quizTitle
        }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  }, [answers, id, navigate, submitting]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const checkRes = await axios.get(`/api/result/check/${id}`);
        if (checkRes.data.attempted) {
          setAlreadyAttempted(true);
          setLoading(false);
          return;
        }
        const res = await axios.get(`/api/quiz/${id}`);
        setQuiz(res.data);
        setTimeLeft(res.data.timeLimit * 60);
      } catch (err) {
        toast.error('Failed to load quiz');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, navigate]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    if (timeLeft === 0) {
      submitExam(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, submitExam]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelect = (qIndex, oIndex) => {
    setAnswers({ ...answers, [qIndex]: oIndex });
  };

  const handleSubmit = () => {
    const unanswered = quiz.questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }
    submitExam(false);
  };

  if (loading) return <div className="loading">Loading exam...</div>;

  if (alreadyAttempted) {
    return (
      <div className="exam-container">
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <h2 style={{ color: '#ef4444', marginBottom: 16 }}>⚠️ Already Attempted</h2>
          <p>You have already taken this quiz. Each quiz can only be attempted once.</p>
          <button onClick={() => navigate('/results')} className="btn btn-primary" style={{ marginTop: 20 }}>
            View My Results
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const answered = Object.keys(answers).length;
  const isWarning = timeLeft <= 60;

  return (
    <div className="exam-container">
      <div className="exam-header">
        <div>
          <h2>{quiz.title}</h2>
          <p style={{ opacity: 0.8, marginTop: 4 }}>{answered}/{quiz.questions.length} answered</p>
        </div>
        <div className={`timer ${isWarning ? 'warning' : ''}`}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      {quiz.questions.map((q, qIndex) => (
        <div key={qIndex} className="question-card">
          <h4>Q{qIndex + 1}. {q.questionText}</h4>
          {q.options.map((opt, oIndex) => (
            <div
              key={oIndex}
              className={`option-item ${answers[qIndex] === oIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(qIndex, oIndex)}
            >
              <input
                type="radio"
                name={`q${qIndex}`}
                checked={answers[qIndex] === oIndex}
                onChange={() => handleSelect(qIndex, oIndex)}
              />
              <span>{opt}</span>
            </div>
          ))}
        </div>
      ))}

      <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 40 }}>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting}
          style={{ padding: '14px 40px', fontSize: '1rem' }}
        >
          {submitting ? 'Submitting...' : '✅ Submit Exam'}
        </button>
      </div>
    </div>
  );
};

export default TakeExam;
