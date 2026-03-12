const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const { protect, adminOnly } = require('../middleware/auth');

// @route GET /api/quiz - Get all published quizzes (students)
router.get('/', protect, async (req, res) => {
  try {
    let quizzes;
    if (req.user.role === 'admin') {
      quizzes = await Quiz.find({ createdBy: req.user._id }).select('-questions.correctAnswer');
    } else {
      quizzes = await Quiz.find({ isPublished: true }).select('-questions.correctAnswer');
    }
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/quiz/:id - Get single quiz
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Students don't see correct answers
    if (req.user.role === 'student') {
      const quizData = quiz.toObject();
      quizData.questions = quizData.questions.map(q => {
        const { correctAnswer, ...rest } = q;
        return rest;
      });
      return res.json(quizData);
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/quiz - Create quiz (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, timeLimit, questions } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Quiz title is required' });
    }

    const quiz = await Quiz.create({
      title,
      description,
      timeLimit: timeLimit || 10,
      questions: questions || [],
      createdBy: req.user._id,
      isPublished: false
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/quiz/:id - Update quiz (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this quiz' });
    }

    const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/quiz/:id - Delete quiz (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PATCH /api/quiz/:id/publish - Publish/Unpublish quiz (admin only)
router.patch('/:id/publish', protect, adminOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (quiz.questions.length === 0) {
      return res.status(400).json({ message: 'Cannot publish a quiz with no questions' });
    }

    quiz.isPublished = !quiz.isPublished;
    await quiz.save();

    res.json({ message: `Quiz ${quiz.isPublished ? 'published' : 'unpublished'}`, quiz });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
