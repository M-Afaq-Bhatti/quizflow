const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Quiz = require('../models/Quiz');
const { protect, adminOnly } = require('../middleware/auth');

// @route POST /api/result/submit - Submit quiz answers
router.post('/submit', protect, async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    // Check if already attempted
    const existing = await Result.findOne({ student: req.user._id, quiz: quizId });
    if (existing) {
      return res.status(400).json({ message: 'You have already attempted this quiz' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Calculate score
    let score = 0;
    quiz.questions.forEach((question, index) => {
      const studentAnswer = answers.find(a => a.questionIndex === index);
      if (studentAnswer && studentAnswer.selectedOption === question.correctAnswer) {
        score++;
      }
    });

    const totalQuestions = quiz.questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    const result = await Result.create({
      student: req.user._id,
      quiz: quizId,
      answers,
      score,
      totalQuestions,
      percentage
    });

    await result.populate('quiz', 'title');

    res.status(201).json({
      message: 'Quiz submitted successfully',
      score,
      totalQuestions,
      percentage,
      quizTitle: result.quiz.title
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/result/my - Get student's results
router.get('/my', protect, async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('quiz', 'title description')
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/result/all - Get all results (admin only)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const results = await Result.find()
      .populate('student', 'name email')
      .populate('quiz', 'title')
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/result/check/:quizId - Check if student already attempted
router.get('/check/:quizId', protect, async (req, res) => {
  try {
    const result = await Result.findOne({
      student: req.user._id,
      quiz: req.params.quizId
    });
    res.json({ attempted: !!result, result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
