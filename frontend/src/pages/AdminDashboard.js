import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get('/api/quiz');
      setQuizzes(res.data);
    } catch (err) {
      toast.error('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await axios.delete(`/api/quiz/${id}`);
      setQuizzes(quizzes.filter(q => q._id !== id));
      toast.success('Quiz deleted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handlePublishToggle = async (id) => {
    try {
      const res = await axios.patch(`/api/quiz/${id}/publish`);
      setQuizzes(quizzes.map(q => q._id === id ? res.data.quiz : q));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const published = quizzes.filter(q => q.isPublished).length;
  const drafts = quizzes.filter(q => !q.isPublished).length;

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard 🛠️</h1>
        <Link to="/admin/create-quiz" className="btn btn-primary">+ Create New Quiz</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{quizzes.length}</div>
          <div className="stat-label">Total Quizzes</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#10b981' }}>{published}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#f59e0b' }}>{drafts}</div>
          <div className="stat-label">Drafts</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Your Quizzes</h3>
        </div>

        {quizzes.length === 0 ? (
          <div className="empty-state">
            <h3>No quizzes created yet</h3>
            <p>Click "Create New Quiz" to get started.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Questions</th>
                  <th>Time Limit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map(quiz => (
                  <tr key={quiz._id}>
                    <td><strong>{quiz.title}</strong></td>
                    <td>{quiz.questions?.length || 0} questions</td>
                    <td>{quiz.timeLimit} min</td>
                    <td>
                      <span className={`badge badge-${quiz.isPublished ? 'published' : 'draft'}`}>
                        {quiz.isPublished ? '✅ Published' : '📝 Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <Link to={`/admin/edit-quiz/${quiz._id}`} className="btn btn-secondary btn-sm">
                          Edit
                        </Link>
                        <button
                          onClick={() => handlePublishToggle(quiz._id)}
                          className={`btn btn-sm ${quiz.isPublished ? 'btn-secondary' : 'btn-success'}`}
                        >
                          {quiz.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleDelete(quiz._id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
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

export default AdminDashboard;
